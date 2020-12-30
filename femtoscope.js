// Oscar Saharoy 2020

const connectButton = document.getElementById("connect");

var serialPort   = null;
var serialReader = null;
 
async function connectToSerial( event ) {

    // temporarily disable button and change message on it
    connectButton.onclick   = null;
    connectButton.innerHTML = "connecting 🤔";

    // try to get a serial port to connect to
    try {

        serialPort = await navigator.serial.requestPort();

        console.log("got port!");

        await serialPort.open({ baudRate: 57600 });

        console.log("opened port!");

        serialReader = serialPort.readable.getReader();

        console.log("got reader!");

        connectButton.innerHTML = "connected 😄 click to disconnect";
        connectButton.onclick   = disconnectFromSerial;
    }
    catch {

        // error occurs when user doesn't select a serial port

        console.log("failed to connect :(");

        // reset button and exit function

        connectButton.innerHTML = "connect to serial 🔌";
        connectButton.onclick   = connectToSerial;
        return;
    }

    await collectData(serialReader);
};

async function disconnectFromSerial( event ) {

    await serialReader.cancel();
    await serialPort.close();

    console.log("disconnected successfully!");
    
    connectButton.innerHTML = "connect to serial 🔌";
    connectButton.onclick   = connectToSerial;
}

connectButton.onclick = connectToSerial;


var dofft = false;
const fftButton = document.getElementById("fft");
fftButton.onclick = togglefft;

function togglefft( event ) {

    dofft = !dofft;
    fftButton.innerHTML = dofft ? "show waveform" : "show frequency spectrum";

    updateGraphPoints();
}

const maxStat        = document.getElementById("max-stat");
const minStat        = document.getElementById("min-stat");
const peakToPeakStat = document.getElementById("peak-to-peak-stat");
const rmsStat        = document.getElementById("rms-stat");
const dcAverageStat  = document.getElementById("dc-average-stat");
const frequencyStat  = document.getElementById("frequency-stat");

const indexOfMaxFreq = arr =>   arr.reduce( (best, x, i) => (x > best.val && i > 10) ? {val: x, ind: i} : best, {val:0, ind:0} ).ind;
const getRMS         = arr => ( arr.reduce( (Sx2, x)     => Sx2 + x*x, 0 ) / arr.length ) ** 0.5
const getDCAverage   = arr =>   arr.reduce( (Sx, x)      => Sx + x,    0 ) / arr.length

function updateStats() {

    const maxValue   = Math.max( ...points );
    const minValue   = Math.min( ...points );
    const p2pValue   = maxValue - minValue;
    const rmsValue   = getRMS( points );
    const dcAvgValue = getDCAverage( points );
    const freqValue  = indexOfMaxFreq( pointsfft );

    maxStat.innerHTML        = maxValue.toPrecision(3)   + "v";
    minStat.innerHTML        = minValue.toPrecision(3)   + "v";
    peakToPeakStat.innerHTML = p2pValue.toPrecision(3)   + "v";
    rmsStat.innerHTML        = rmsValue.toPrecision(3)   + "v";
    dcAverageStat.innerHTML  = dcAvgValue.toPrecision(3) + "v";
    frequencyStat.innerHTML  = freqValue.toString()      + "Hz";
}

function updateGraphPoints() {

    const pointsToUse = dofft ? pointsfft : points;

    var n = 0;
    graphjs.points = pointsToUse.map( x => new vec2(n++, x) );
}



const divider = document.getElementById("divider");
var dividerClicked = false;

divider.addEventListener(  "mousedown",  (e) => { dividerClicked = true;  } );
document.addEventListener( "mouseup",    (e) => { dividerClicked = false; } );
document.addEventListener( "mouseleave", (e) => { dividerClicked = false; } );
document.addEventListener( "mousemove", windowMousemove );

function windowMousemove( event ) {

    if( !dividerClicked ) return;

    document.body.style.gridTemplateColumns = event.clientX.toString() + "px 1rem auto";

    graphjs.resize();
}




const graphjs = new Graph("graphjs");
graphjs.pointDrawingFunction = () => {};

graphjs.setXRange(-400, 9000);
graphjs.setYRange(-1,   5);

const SAMPLERATE   = 10000; // Hz
const N_SAMPLES    = 8192;

//const button = document.getElementById("button");
//button.style.display = "grid";

var points    = [];
var pointsfft = [];

const windowFunction = (n, N) => 0.53836 - 0.46164 * Math.cos( 6.28318 * n / N );

function padZeros( inputSignal, N = null ) {

    // pad a copy of inputSignal with zeros up to the next power of 2, returning the new array

    const nextPowerOf2  = N ? N : 2 ** Math.ceil( Math.log2( inputSignal.length ) );
    const numberOfZeros = nextPowerOf2 - inputSignal.length;

    return [ ...inputSignal ].concat( new Array( numberOfZeros ).fill(0) );
}

var pointsCollected = 0;

async function collectData(reader) {
    
    var halfstring = null;

    // listen to data coming from the serial device
    while (true) {

        const { value, done } = await serialReader.read();

        if (done) {

            // allow the serial port to be closed
            serialReader.releaseLock();
            console.log("serial port lost...");

            break;
        }

        var newPoints = Array.from(value).map( x => x/256.0 );
        points = points.concat( newPoints );

        if(points.length > N_SAMPLES) points = points.splice( points.length - N_SAMPLES );

        pointsCollected += newPoints.length;

        if(pointsCollected >= N_SAMPLES) {

            pointsCollected = 0;
            processData();
        }
    }
}

function processData() {

    console.log("processing data...");

    const windowedPoints = points.map( (x, i, arr) => x * windowFunction(i, arr.length) );
    pointsfft = fft( windowedPoints );

    updateStats();
    updateGraphPoints();
}