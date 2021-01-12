// Oscar Saharoy 2021


class Femtoscope {

    constructor() {

        // get the graph
        this.graph = graphjs;

        // variable that decides if we show the fft or normal waveform
        this.showfft = false;

        // data points array and the frequency spectrum of it
        this.points    = [];
        this.pointsfft = [];

        // code for custom right click
        this.graph.canvas.addEventListener( 'contextmenu', e => { e.preventDefault(); } );

        this.sampleTime = null;
        this.paused = false;

        // the windowing function that femtoscope uses (hamming)
        this.windowFunction = (n, N) => 0.53836 - 0.46164 * Math.cos( 6.28318 * n / N );
        this.trimToPowerOf2 = arr => arr.slice(0, 2 ** (Math.log2( arr.length ) | 0) );

        // set the cursor to what we want when the mouse is moved
        this.graph.canvas.addEventListener( "mousemove", e => this.setCursor(e) );
    }

    async collectData(reader) {

        // listen to data coming from the serial device

        // number of points collected since last update
        var pointsCollected = 0;
        var startTime = performance.now();

        while (true) {

            // wait for serial API to give us the data
            const { value, done } = await serialReader.read();

            if( this.paused ) continue;

            // close the serial port
            if (done) {

                // allow the serial port to be closed
                serialReader.releaseLock();
                console.log("serial port lost...");

                break;
            }

            // make a new array of floats from the collects UInt8Array
            var newPoints = Array.from(value).map( x => x / 256.0 * (voltageMax - voltageMin) + voltageMin );
            
            // add the points onto the existing array
            this.points = this.points.concat( newPoints );

            // trim old points from start of array
            if(this.points.length > sampleCount) this.points = this.points.splice( this.points.length - sampleCount );
        
            // update the number of collected points
            pointsCollected += newPoints.length;

            // processData when we've collected enougth points
            if(pointsCollected >= sampleCount) {

                // calculate and set sample rate
                const nowTime = performance.now();
                var timeTaken = (nowTime - startTime) / 1000;
                this.sampleTime = timeTaken / pointsCollected * 0.05 + (sampleTime ?? timeTaken / pointsCollected) * 0.95;

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
        const trimmedPoints  = trimToPowerOf2( this.points );
        const windowedPoints = trimmedPoints.map( (x, i, arr) => x * this.windowFunction(i, arr.length) );

        this.pointsfft = fft( windowedPoints );

        //waveformStats.update();
        this.updateGraphPoints();
    }

    updateGraphPoints() {

        if(this.showfft) {
            
            // plot the frequencies on the graph
            var n = 0;
            this.graph.points = this.pointsfft.map( x => new vec2(n++/(sampleTime*sampleCount), x) );   
        }
        else {

            // plot the points on the graph
            var n = 0;
            var xyPoints = this.points.map( x => new vec2(n+=sampleTime, x) );

            if( triggering.mode == TriggerModes.NONE ) {

                this.graph.points = xyPoints;
                return;
            }

            var triggerPoints = xyPoints.filter( (p,i) => Math.abs(p.y - triggering.diamondPos.y) < 0.01 && i>10 && xyPoints[i-10].y < p.y && xyPoints[i-5].y < p.y );

            if( !triggerPoints.length ) {

                triggering.diamondColour = "#FF0000";
                this.graph.points = xyPoints;
                return;
            }

            triggering.diamondColour = "#FFAB21";
            var triggerCrossingPoint = triggerPoints.reduce( (acc, cur) => Math.abs(triggering.diamondPos.x - cur.x) < Math.abs(acc.x - cur.x) ? cur : acc, triggerPoints[0] );
            var shiftedPoints        = xyPoints.map( v => vec2.add(v, new vec2(triggering.diamondPos.x - triggerCrossingPoint.x, 0) ) );

            this.graph.points = shiftedPoints;
        }
    }

    setCursor() {

        if( this.graph.mouseClicked ) return;

        // prevent panning the graph if needed and set the cursor
        this.graph.preventPanning      = ruler.nearRuler || triggering.nearDiamond;     
        this.graph.canvas.style.cursor = ruler.nearRuler || triggering.nearDiamond ? "move" : "auto";
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
}

const graphjs    = new Graph("graphjs");
const femtoscope = new Femtoscope();