// Oscar Saharoy 2021


// get the graph
const graphjs = new Graph("graphjs");


// variable that decides if we show the fft or normal waveform
var showfft = false;

// data points array and the frequency spectrum of it
var points    = [];
var pointsfft = [];

// code for custom right click
graphjs.canvas.addEventListener( 'contextmenu', e => { e.preventDefault(); } );

// number of points collected since last update
var pointsCollected = 0;

var sampleTime = 0;

const trimToPowerOf2 = arr => arr.slice(0, 2 ** (Math.log2( arr.length ) | 0) );

async function collectData(reader) {

    // listen to data coming from the serial device

    var time = performance.now();

    while (true) {

        const { value, done } = await serialReader.read();

        if (done) {

            // allow the serial port to be closed
            serialReader.releaseLock();
            console.log("serial port lost...");

            break;
        }

        // calculate and set sample rate
        const timeNow = performance.now();
        var dt = (performance.now() - time) / 1000;
        sampleTime = dt / value.length * 0.05 + sampleTime * 0.95;

        time = timeNow;

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

            pointsCollected = 0;
            processData();
        }
    }
}

// the windowing function that femtoscope uses (hamming)
const windowFunction = (n, N) => 0.53836 - 0.46164 * Math.cos( 6.28318 * n / N );

function processData() {

    console.log("processing data...");

    // pass points through window function and then fft
    const trimmedPoints  = trimToPowerOf2( points );
    const windowedPoints = trimmedPoints.map( (x, i, arr) => x * windowFunction(i, arr.length) );

    pointsfft = fft( windowedPoints );

    updateStats();
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
        graphjs.points = points.map( x => new vec2(n+=sampleTime, x) );        
    }
}