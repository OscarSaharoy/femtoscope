// Oscar Saharoy 2021

class Femtoscope {

    constructor( graph ) {

        this.graph            = graph;
        this.serialConnection = new SerialConnection( this );
        this.buttons          = new Buttons( this );
        this.ruler            = new Ruler( this, graph );
        this.triggering       = new Triggering( this, graph );
        this.rightClickMenu   = new RightClickMenu( this );

        // variable that decides if we show the fft or normal waveform
        this.showfft     = false;

        // data points array and the frequency spectrum of it
        this.points      = [];
        this.pointsfft   = [];

        // time per sample and bool true when paused
        this.sampleTime  = null;
        this.paused      = false;

        // vars to hold info about the sampling
        this.sampleCount = 2048;
        this.voltageMin  = 0;
        this.voltageMax  = 5;

        // set the cursor to what we want when the mouse is moved
        this.graph.canvas.addEventListener( "mousemove",   event => this.setCursor(event)           );
        this.graph.canvas.addEventListener( 'contextmenu', event => this.rightClickMenu.show(event) );

        // button that toggles the graph between showing the fft of the signal or the original
        this.fftButton = document.getElementById("fft");
        this.fftButton.onclick = () => this.togglefft();

        // the button that fits data to graph
        this.fitDataButton = document.getElementById("fit-data");
        this.fitDataButton.onclick = () => this.fitToData();

        // get all the inputs that control sampling settings
        this.samplingSettings = ["sample-rate", "sample-count", "voltage-range-min", "voltage-range-max"].map( id => document.getElementById(id) );
        [this.sampleRateInput, this.sampleCountInput, this.minVoltageInput, this.maxVoltageInput] = this.samplingSettings;

        this.samplingSettings.forEach( x => x.addEventListener( "input", () => this.updateSamplingSettings() ) );

        // the windowing function that femtoscope uses (hamming)
        this.windowFunction = (n, N) => 0.53836 - 0.46164 * Math.cos( 6.28318 * n / N );

        // utility functions
        this.trimToPowerOf2 = arr    => arr.slice(0, 2 ** (Math.log2( arr.length ) | 0) );
        this.uInt8ToVoltage = char   => char / 256.0 * (this.voltageMax - this.voltageMin) + this.voltageMin;

        // some helper functions that find some of the stats
        const getMaxIndex  = arr =>   arr.reduce( (best, x, i) => (x > best.val && i > 1) ? {val: x, ind: i} : best, {val:0, ind:0} ).ind;
        const getRMS       = arr => ( arr.reduce( (Sx2,  x   ) => Sx2 + x*x, 0 ) / arr.length ) ** 0.5;
        const getDCAverage = arr =>   arr.reduce( (Sx,   x   ) => Sx  + x,   0 ) / arr.length;

        // stats about the waveform displayed on the left
        this.waveformStats = [

            new Stat("max-stat",          () => Stat.numberAndSuffix( Math.max(...this.points)                            , "v"  ) ),
            new Stat("min-stat",          () => Stat.numberAndSuffix( Math.min(...this.points)                            , "v"  ) ),
            new Stat("peak-to-peak-stat", () => Stat.numberAndSuffix( Math.max(...this.points) - Math.min(...this.points) , "v"  ) ),
            new Stat("rms-stat",          () => Stat.numberAndSuffix( getRMS(this.points)                                 , "v"  ) ),
            new Stat("dc-average-stat",   () => Stat.numberAndSuffix( getDCAverage(this.points)                           , "v"  ) ),
            new Stat("frequency-stat",    () => Stat.numberAndSuffix( getMaxIndex(this.pointsfft) / (this.sampleTime * this.pointsfft.length * 2), "hz" ) )
        ];
    }

    async collectData(reader) {

        // listen to data coming from the serial device

        this.unpause();

        // number of points collected since last update
        var pointsCollected = 0;
        var startTime = performance.now();

        while( true ) {

            // wait for serial API to give us the data
            const { value, done } = await reader.read();

            // if the reader is lost then handle this
            if( done ) return this.serialConnection.readerLost();

            if( this.paused ) {

                pointsCollected = 0;
                startTime = performance.now();
                continue;
            }

            // make a new array of voltage datapoints from the values array
            var newPoints = Array.from( value ).map( this.uInt8ToVoltage );
            
            // add the points onto the existing array
            this.points = this.points.concat( newPoints );

            // update the number of collected points
            pointsCollected += newPoints.length;

            // trim old points from start of array
            if(this.points.length > this.sampleCount) this.points = this.points.splice( this.points.length - this.sampleCount );

            // if we're on continuous triggering we want to update the graph points every time we get them
            if( this.triggering.mode == TriggerModes.CONTINUOUS ) this.updateGraphPoints();
        
            // processData when we've collected enough points
            if(pointsCollected >= this.sampleCount) {

                // calculate and set sample rate
                const nowTime = performance.now();
                var timeTaken = (nowTime - startTime) / 1000;
                this.sampleTime = timeTaken / pointsCollected * 0.05 + (this.sampleTime ?? timeTaken / pointsCollected) * 0.95;

                // call data processing and graph updating functions
                this.processData();
                this.updateGraphPoints();
                this.triggerAdjust();

                // reset collection metrics
                pointsCollected = 0;
                startTime = performance.now();
            }
        }
    }

    pause() {

        this.paused = true;
        this.buttons.pause();
    }

    unpause() {

        this.paused = false;
        this.buttons.unpause();
    }

    togglePause() {

        this.paused ? this.unpause() : this.pause();
    }

    processData( startTime, endTime ) {

        console.log("processing data...");

        // pass points through window function and then fft
        const trimmedPoints  = this.trimToPowerOf2( this.points );
        const windowedPoints = trimmedPoints.map( (x, i, arr) => x * this.windowFunction(i, arr.length) );

        this.pointsfft = fft( windowedPoints );

        this.waveformStats.forEach( stat => stat.update() );
    }

    updateGraphPoints() {

        // select value of dn and which points to use based on whether we want fft or normal
        var dn            = this.showfft ? 1 / (this.sampleTime * this.pointsfft.length * 2) : this.sampleTime;
        var pointsToUse   = this.showfft ? this.pointsfft : this.points;

        // update the graph points
        var n = -dn;
        this.graph.points = pointsToUse.map( x => new vec2(n+=dn, x) );  
    }

    triggerAdjust() {

        // do nothing if the trigger mode is none or we're showing the fft
        if( this.triggering.mode == TriggerModes.NONE || this.triggering.mode == TriggerModes.CONTINUOUS || this.showfft ) return;

        // find points where the line crosses the trigger point
        var triggerPoints = this.graph.points.filter( (p, i, arr) => i>10 && p.y > this.triggering.diamondPos.y && arr[i-1].y < this.triggering.diamondPos.y && arr[i-5].y < p.y );

        // set the trigger diamond colour to yellow if we found suitable points or red if not
        this.triggering.diamondColour = triggerPoints.length ? "#FFAB21" : "#FF0000";

        // if no suitable points are found, return
        if( !triggerPoints.length ) return;

        // pause if we're in triggering mode single
        if(this.triggering.mode == TriggerModes.SINGLE) this.pause();

        var triggerCrossingPoint = triggerPoints.reduce( (acc, cur) => Math.abs(this.triggering.diamondPos.x - cur.x) < Math.abs(acc.x - cur.x) ? cur : acc, triggerPoints[0] );
        this.graph.points = this.graph.points.map( v => vec2.add( v, new vec2(this.triggering.diamondPos.x - triggerCrossingPoint.x, 0) ) );
    }

    setCursor() {

        if( this.graph.mouseClicked ) return;

        // prevent panning the graph if needed and set the cursor
        this.graph.preventPanning      = this.ruler.nearRuler || this.triggering.nearDiamond;     
        this.graph.canvas.style.cursor = this.ruler.nearRuler || this.triggering.nearDiamond ? "move" : "auto";
    }

    drawCrosshairAtCursor( ctx ) {

        // draw a pair of dotted lines across the canvas centered on the mouse
        ctx.strokeStyle = "#888888";
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 6]);

        this.graph.drawVerticalLine(   this.graph.mousePosOnCanvas.x );
        this.graph.drawHorizontalLine( this.graph.mousePosOnCanvas.y );

        ctx.setLineDash([]);
    }

    togglefft() {

        // toggles whether we show the fft
        this.showfft ^= 1;

        // set the fft button to show the correct value
        this.fftButton.innerHTML = this.showfft ? "show waveform 🌊" : "show frequency spectrum 🎵";

        // update the graph display and remove the ruler
        this.updateGraphPoints();
        this.fitToData();
        this.ruler.remove();
    }

    fitToData() {

        // if there's too few points then return
        if( this.graph.points.length < 2 ) return;

        const topRight   = vec2.minusInfinity;
        const bottomLeft = vec2.infinity;

        // find the topright and bottomleft points that contain all the data
        for( point of this.graph.points ) {

            topRight.setIfGreater( point );
            bottomLeft.setIfLess(  point );
        }

        // if data all falls in a line then return
        if( topRight.x == bottomLeft.x || topRight.y == bottomLeft.y ) return;

        // get centre point
        const centre = vec2.add( topRight, bottomLeft ).scaleBy( 0.5 );

        // set the graph range with these, calling vec2.lerp to give some padding to the data on the graph
        this.graph.setRange( vec2.lerp( centre, bottomLeft, 1.2 ), vec2.lerp( centre, topRight, 1.2 ) );
    }

    updateSamplingSettings() {

        // just update the properties with the values of the inputs
        this.sampleCount  = Math.max( parseInt( this.sampleCountInput.value ), 8 );

        const voltage1    = parseFloat( this.minVoltageInput.value );
        const voltage2    = parseFloat( this.maxVoltageInput.value );

        this.voltageMin   = Math.min( voltage1, voltage2 );
        this.voltageMax   = Math.max( voltage1, voltage2 );

        // send a request to the arduino to change the sampling rate
        var newSampleRate = Math.max( parseInt( this.sampleRateInput.value  ), 0 );
    }
}

// make the application objects
const graphjs          = new Graph("graphjs");
const femtoscope       = new Femtoscope( graphjs );
const dividerManager   = new DividerManager( "divider", graphjs );
const noSerialWarning  = new NoSerialWarning();