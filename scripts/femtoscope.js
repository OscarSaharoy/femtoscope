// Oscar Saharoy 2021

class Femtoscope {

    constructor() {

        // variable that decides if we show the fft or normal waveform
        this.showfft = false;

        // data points array and the frequency spectrum of it
        this.points    = [];
        this.pointsfft = [];

        // code for custom right click
        graphjs.canvas.addEventListener( 'contextmenu', e => { e.preventDefault(); } );

        this.sampleTime = null;
        this.paused     = false;

        // the windowing function that femtoscope uses (hamming)
        this.windowFunction = (n, N) => 0.53836 - 0.46164 * Math.cos( 6.28318 * n / N );
        this.trimToPowerOf2 = arr => arr.slice(0, 2 ** (Math.log2( arr.length ) | 0) );

        // set the cursor to what we want when the mouse is moved
        graphjs.canvas.addEventListener( "mousemove", e => this.setCursor(e) );

        // button that toggles the graph between showing the fft of the signal or the original
        this.fftButton = document.getElementById("fft");
        this.fftButton.onclick = () => this.togglefft();

        // the button that fits data to graph
        this.fitDataButton = document.getElementById("fit-data");
        this.fitDataButton.onclick = () => this.fitToData();

        // get all the inputs that control sampling settings
        this.samplingSettings = ["sample-count", "voltage-range-min", "voltage-range-max"].map( id => document.getElementById(id) );
        [this.sampleCountInput, this.minVoltageInput, this.maxVoltageInput] = this.samplingSettings;

        this.samplingSettings.forEach( x => x.addEventListener("input", () => this.updateSamplingSettings() ) );

        // vars to hold info about the sampling
        this.sampleCount = 2048;
        this.voltageMin  = 0;
        this.voltageMax  = 3.3;

        // some helper functions that find some of the stats
        const getMaxIndex  = arr =>   arr.reduce( (best, x, i) => (x > best.val && i > 1) ? {val: x, ind: i} : best, {val:0, ind:0} ).ind;
        const getRMS       = arr => ( arr.reduce( (Sx2,  x   ) => Sx2 + x*x, 0 ) / arr.length ) ** 0.5;
        const getDCAverage = arr =>   arr.reduce( (Sx,   x   ) => Sx  + x,   0 ) / arr.length;

        // stats about the waveform displayed on the left
        this.waveformStats = [

            new Stat("max-stat",          () => Stat.numberAndSuffix( Math.max(...this.points)                                          , "v"  ) ),
            new Stat("min-stat",          () => Stat.numberAndSuffix( Math.min(...this.points)                                          , "v"  ) ),
            new Stat("peak-to-peak-stat", () => Stat.numberAndSuffix( Math.max(...this.points) - Math.min(...this.points)               , "v"  ) ),
            new Stat("rms-stat",          () => Stat.numberAndSuffix( getRMS(this.points)                                               , "v"  ) ),
            new Stat("dc-average-stat",   () => Stat.numberAndSuffix( getDCAverage(this.points)                                         , "v"  ) ),
            new Stat("frequency-stat",    () => Stat.numberAndSuffix( getMaxIndex(this.pointsfft) / (this.sampleTime * this.sampleCount), "hz" ) )
        ];
    }

    async collectData(reader) {

        // listen to data coming from the serial device

        // number of points collected since last update
        var pointsCollected = 0;
        var startTime = performance.now();

        while (true) {

            // wait for serial API to give us the data
            const { value, done } = await reader.read();

            //if( this.paused ) continue;

            // close the serial port
            if (done) {

                // allow the serial port to be closed
                reader.releaseLock();
                console.log("serial port lost...");

                break;
            }

            // make a new array of floats from the collects UInt8Array
            var newPoints = Array.from(value).map( x => x / 256.0 * (this.voltageMax - this.voltageMin) + this.voltageMin );
            
            // add the points onto the existing array
            this.points = this.points.concat( newPoints );

            // trim old points from start of array
            if(this.points.length > this.sampleCount) this.points = this.points.splice( this.points.length - this.sampleCount );
        
            // update the number of collected points
            pointsCollected += newPoints.length;

            // processData when we've collected enougth points
            if(pointsCollected >= this.sampleCount) {

                // calculate and set sample rate
                const nowTime = performance.now();
                var timeTaken = (nowTime - startTime) / 1000;
                this.sampleTime = timeTaken / pointsCollected * 0.05 + (this.sampleTime ?? timeTaken / pointsCollected) * 0.95;

                pointsCollected = 0;
                this.processData();

                // pause if we're in triggering mode single
                this.paused = triggering.mode == TriggerModes.SINGLE;

                startTime = performance.now();
            }
        }
    }

    processData() {

        console.log("processing data...");

        // pass points through window function and then fft
        const trimmedPoints  = this.trimToPowerOf2( this.points );
        const windowedPoints = trimmedPoints.map( (x, i, arr) => x * this.windowFunction(i, arr.length) );

        this.pointsfft = fft( windowedPoints );

        this.waveformStats.forEach( stat => stat.update() );
        this.updateGraphPoints();
    }

    updateGraphPoints() {

        if(this.showfft) {
            
            // plot the frequencies on the graph
            var n = 0;
            graphjs.points = this.pointsfft.map( x => new vec2(n++ / (this.sampleTime * this.sampleCount), x) );   
        }
        else {

            // plot the points on the graph
            var n = 0;
            var xyPoints = this.points.map( x => new vec2(n+=this.sampleTime, x) );

            if( triggering.mode == TriggerModes.NONE ) {

                graphjs.points = xyPoints;
                return;
            }

            var triggerPoints = xyPoints.filter( (p,i) => Math.abs(p.y - triggering.diamondPos.y) < 0.01 && i>10 && xyPoints[i-10].y < p.y && xyPoints[i-5].y < p.y );

            if( !triggerPoints.length ) {

                triggering.diamondColour = "#FF0000";
                graphjs.points = xyPoints;
                return;
            }

            triggering.diamondColour = "#FFAB21";
            var triggerCrossingPoint = triggerPoints.reduce( (acc, cur) => Math.abs(triggering.diamondPos.x - cur.x) < Math.abs(acc.x - cur.x) ? cur : acc, triggerPoints[0] );
            var shiftedPoints        = xyPoints.map( v => vec2.add(v, new vec2(triggering.diamondPos.x - triggerCrossingPoint.x, 0) ) );

            graphjs.points = shiftedPoints;
        }
    }

    setCursor() {

        if( graphjs.mouseClicked ) return;

        // prevent panning the graph if needed and set the cursor
        graphjs.preventPanning      = ruler.nearRuler || triggering.nearDiamond;     
        graphjs.canvas.style.cursor = ruler.nearRuler || triggering.nearDiamond ? "move" : "auto";
    }

    drawCrosshairAtCursor( ctx ) {

        // draw a pair of dotted lines across the canvas centered on the mouse
        ctx.strokeStyle = "#888888";
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 6]);

        graphjs.drawVerticalLine(   graphjs.mousePosOnCanvas.x );
        graphjs.drawHorizontalLine( graphjs.mousePosOnCanvas.y );

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
        ruler.remove();
    }

    fitToData() {

        // if there's too few points then return
        if( graphjs.points.length < 2 ) return;

        const topRight   = vec2.minusInfinity;
        const bottomLeft = vec2.infinity;

        // find the topright and bottomleft points that contain all the data
        for( point of graphjs.points ) {

            topRight.setIfGreater( point );
            bottomLeft.setIfLess(  point );
        }

        // if data all falls in a line then return
        if( topRight.x == bottomLeft.x || topRight.y == bottomLeft.y ) return;

        // get centre point
        const centre = vec2.add( topRight, bottomLeft ).scaleBy( 0.5 );

        // set the graph range with these, calling vec2.lerp to give some padding to the data on the graph
        graphjs.setRange( vec2.lerp( centre, bottomLeft, 1.2 ), vec2.lerp( centre, topRight, 1.2 ) );
    }

    updateSamplingSettings() {

        // just update the properties with the values of the inputs
        this.sampleCount = parseInt( this.sampleCountInput.value );

        const voltage1   = parseFloat( this.minVoltageInput.value );
        const voltage2   = parseFloat( this.maxVoltageInput.value );

        this.voltageMin  = Math.min( voltage1, voltage2 );
        this.voltageMax  = Math.max( voltage1, voltage2 );
    }
}


// all of these are global consts
const graphjs          = new Graph("graphjs");
const femtoscope       = new Femtoscope();
const serialConnection = new SerialConnection();
const ruler            = new Ruler();
const dividerManager   = new DividerManager();
const noSerialWarning  = new NoSerialWarning();
const triggering       = new Triggering();