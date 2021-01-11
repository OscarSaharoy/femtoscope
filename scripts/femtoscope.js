// Oscar Saharoy 2021


// get the graph
const graphjs = new Graph("graphjs");

var drawingFunctions = [];
graphjs.userFunction = () => drawingFunctions.forEach( f => f() );


// variable that decides if we show the fft or normal waveform
var showfft = false;

// data points array and the frequency spectrum of it
var points    = [];
var pointsfft = [];

// code for custom right click
graphjs.canvas.addEventListener( 'contextmenu', e => { e.preventDefault(); } );

var sampleTime = null;

var paused = false;

async function collectData(reader) {

    // listen to data coming from the serial device

    // number of points collected since last update
    var pointsCollected = 0;
    var startTime = performance.now();

    while (true) {

        // wait for serial API to give us the data
        const { value, done } = await serialReader.read();

        if( paused ) continue;

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
        points = points.concat( newPoints );

        // trim old points from start of array
        if(points.length > sampleCount) points = points.splice( points.length - sampleCount );
    
        // update the number of collected points
        pointsCollected += newPoints.length;

        // processData when we've collected enougth points
        if(pointsCollected >= sampleCount) {

            // calculate and set sample rate
            const nowTime = performance.now();
            var timeTaken = (nowTime - startTime) / 1000;
            sampleTime    = timeTaken / pointsCollected * 0.05 + (sampleTime ?? timeTaken / pointsCollected) * 0.95;

            pointsCollected = 0;
            processData();

            // pause if we're in triggering mode single
            paused = triggeringMode == Triggering.SINGLE;

            startTime = performance.now();
        }
    }
}

// the windowing function that femtoscope uses (hamming)
const windowFunction = (n, N) => 0.53836 - 0.46164 * Math.cos( 6.28318 * n / N );
const trimToPowerOf2 = arr => arr.slice(0, 2 ** (Math.log2( arr.length ) | 0) );

function processData() {

    console.log("processing data...");

    // pass points through window function and then fft
    const trimmedPoints  = trimToPowerOf2( points );
    const windowedPoints = trimmedPoints.map( (x, i, arr) => x * windowFunction(i, arr.length) );

    pointsfft = fft( windowedPoints );

    waveformStats.update();
    updateGraphPoints();
}

function updateGraphPoints() {

    if(showfft) {
        
        // plot the frequencies on the graph
        var n = 0;
        graphjs.points = pointsfft.map( x => new vec2(n++/(sampleTime*sampleCount), x) );   
    }
    else {

        // plot the points on the graph
        var n = 0;
        var xyPoints = points.map( x => new vec2(n+=sampleTime, x) );

        if( triggeringMode == Triggering.NONE ) {

            graphjs.points = xyPoints;
            return;
        }

        var triggerPoints        = xyPoints.filter( (p,i) => Math.abs(p.y - triggerPos.y) < 0.01 && i>10 && xyPoints[i-10].y < p.y && xyPoints[i-5].y < p.y );

        if( !triggerPoints.length ) {

            triggerColour = "#FF0000";
            graphjs.points = xyPoints;
            return;
        }

        triggerColour = "#FFAB21";
        var triggerCrossingPoint = triggerPoints.reduce( (acc, cur) => Math.abs(triggerPos.x - cur.x) < Math.abs(acc.x - cur.x) ? cur : acc, triggerPoints[0] );
        var shiftedPoints        = xyPoints.map( v => vec2.add(v, new vec2(triggerPos.x - triggerCrossingPoint.x, 0) ) );

        graphjs.points = shiftedPoints;
    }
}

// set the cursor to what we want when the mouse is moved
graphjs.canvas.addEventListener( "mousemove", setCursor );

function setCursor() {

    if( graphjs.mouseClicked ) return;

    // prevent panning the graph if needed and set the cursor
    graphjs.preventPanning      = nearRuler || triggering.nearDiamond;     
    graphjs.canvas.style.cursor = nearRuler || triggering.nearDiamond ? "move" : "auto";
}

function drawCrosshairAtCursor( ctx ) {

    // draw a pair of dotted lines across the canvas centered on the mouse
    ctx.strokeStyle = "#888888";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);

    graphjs.drawVerticalLine(   graphjs.mousePosOnCanvas.x );
    graphjs.drawHorizontalLine( graphjs.mousePosOnCanvas.y );

    ctx.setLineDash([]);
}