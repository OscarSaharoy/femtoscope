// Oscar Saharoy 2020



// big div that holds the warning message when Serial API is not enabled
const noSerialWarning = document.getElementById("no-serial");

// button that hides that div
const noSerialButton  = document.getElementById("no-serial-continue");
noSerialButton.onclick = e => { noSerialWarning.style.display = "none" }

if( "serial" in navigator ) {

    console.log("serial api enabled :)");

    // hide the message that is show when serial API is diabled
    noSerialWarning.style.display = "none";
}




// the connect to serial button
const connectButton = document.getElementById("connect");
connectButton.onclick = connectToSerial;

// varaibles that hold the serial port objects
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

        // change button to success message
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

    // start the data collection loop
    await collectData(serialReader);
};

async function disconnectFromSerial( event ) {

    // try to cancel the serial connection
    await serialReader.cancel();
    await serialPort.close();

    console.log("disconnected successfully!");
    
    // put connect button back to its original state
    connectButton.innerHTML = "connect to serial 🔌";
    connectButton.onclick   = connectToSerial;
}



// button that toggles the graph between showing the fft of the signal or the original
const fftButton = document.getElementById("fft");
fftButton.onclick = togglefft;

var showfft = false;

function togglefft( event ) {

    // toggles whether we show the fft
    showfft = !showfft;

    // set the fft button to show the correct value
    fftButton.innerHTML = showfft ? "show waveform 🌊" : "show frequency spectrum 🎵";

    updateGraphPoints();
    fitToData();
}



// html elements that have the numeric values for the stats
const maxStat        = document.getElementById("max-stat");
const minStat        = document.getElementById("min-stat");
const peakToPeakStat = document.getElementById("peak-to-peak-stat");
const rmsStat        = document.getElementById("rms-stat");
const dcAverageStat  = document.getElementById("dc-average-stat");
const frequencyStat  = document.getElementById("frequency-stat");

// some helper functions that find some of the stats
const indexOfMaxFreq = arr =>   arr.reduce( (best, x, i) => (x > best.val && i > 4) ? {val: x, ind: i} : best, {val:0, ind:0} ).ind;
const getRMS         = arr => ( arr.reduce( (Sx2, x)     => Sx2 + x*x, 0 ) / arr.length ) ** 0.5
const getDCAverage   = arr =>   arr.reduce( (Sx, x)      => Sx + x,    0 ) / arr.length

function updateStats() {

    // get all the stats from the points arrays
    const maxValue   = Math.max( ...points );
    const minValue   = Math.min( ...points );
    const p2pValue   = maxValue - minValue;
    const rmsValue   = getRMS( points );
    const dcAvgValue = getDCAverage( points );
    const freqValue  = indexOfMaxFreq( pointsfft );

    // add the values into the html
    maxStat.innerHTML        = maxValue.toPrecision(3)   + "v";
    minStat.innerHTML        = minValue.toPrecision(3)   + "v";
    peakToPeakStat.innerHTML = p2pValue.toPrecision(3)   + "v";
    rmsStat.innerHTML        = rmsValue.toPrecision(3)   + "v";
    dcAverageStat.innerHTML  = dcAvgValue.toPrecision(3) + "v";
    frequencyStat.innerHTML  = freqValue.toString()      + "Hz";
}

function updateGraphPoints() {

    // decide whether to use the ffted points or normal ones
    const pointsToUse = showfft ? pointsfft : points;

    // plot the points on the graph
    var n = 0;
    graphjs.points = pointsToUse.map( x => new vec2(n++, x) );
}


// button that adds a ruler to the graph
const addRulerButton   = document.getElementById("add-ruler");
addRulerButton.onclick = addRuler;

const cancelOnEsc = e => { if(e.key == "Escape") cancelRuler() };

function addRuler() {

    // toggle the add ruler button to cancel adding the ruler
    addRulerButton.innerHTML = "adding a ruler... (click and drag on graph)";
    addRulerButton.onclick   = cancelRuler;

    // event listener to call cancelruler on pressing esc
    window.addEventListener( "keydown", cancelOnEsc );
}

function cancelRuler() {

    // reset the add ruler button to normal so it adds a ruler
    addRulerButton.innerHTML = "add a ruler 📏";
    addRulerButton.onclick   = addRuler;

    // remove the event listener that calls this function on pressing esc
    window.removeEventListener( "keydown", cancelOnEsc );
}



// the divider between the graph and UI
const divider = document.getElementById("divider");
var dividerClicked = false;

// event listeners to enable dragging of the divider
divider.addEventListener(  "mousedown",  (e) => { dividerClicked = true;  } );
document.addEventListener( "mouseup",    (e) => { dividerClicked = false; } );
document.addEventListener( "mouseleave", (e) => { dividerClicked = false; } );
document.addEventListener( "mousemove", windowMousemove );

function windowMousemove( event ) {

    if( !dividerClicked ) return;

    // change the body's column template - change amount of screen that is graph/UI
    document.body.style.gridTemplateColumns = event.clientX.toString() + "px 1rem auto";

    graphjs.resize();
}




// get max and min in x and y
function compareExtents( extents, p ) {

    return { top:    Math.max( p.y, extents.top    ), 
             right:  Math.max( p.x, extents.right  ), 
             bottom: Math.min( p.y, extents.bottom ), 
             left:   Math.min( p.x, extents.left   ) };
}

// apply compareExtents across arr to get the max and min values
const getExtents = arr => arr.reduce( compareExtents, { top:   -Infinity, 
                                                        right: -Infinity, 
                                                        bottom: Infinity, 
                                                        left:   Infinity } );

function fitToData() {

    // get the extents of the graph data
    const extents    = getExtents( graphjs.points );

    // some conditions that mean we shouldn't try to resize the graph
    const badResult  = graphjs.points.length < 2 || extents.bottom == Infinity || extents.left == Infinity || extents.top == extents.bottom || extents.right == extents.left;
    if(badResult) return;
 
    // get centre, topright and bottomleft points
    const centre     = new vec2( (extents.right + extents.left) / 2, (extents.top + extents.bottom) / 2 );
    const topRight   = new vec2( extents.right, extents.top    );
    const bottomLeft = new vec2( extents.left,  extents.bottom );

    // set the graph range with these, calling vec2.lerp to give some padding to the data on the graph
    graphjs.setRange( vec2.lerp( centre, bottomLeft, 1.2 ), vec2.lerp( centre, topRight, 1.2 ) );
}




// get the graph
const graphjs = new Graph("graphjs");

// constants to do with data collection
const SAMPLERATE = 10000; // Hz
const N_SAMPLES  = 2048;

// data points array and the frequency spectrum of it
var points    = [];
var pointsfft = [];

// the windowing function that femtoscope uses (hamming)
const windowFunction = (n, N) => 0.53836 - 0.46164 * Math.cos( 6.28318 * n / N );

// code for custom right click
graphjs.canvas.addEventListener( 'contextmenu', e => { e.preventDefault(); } );

// number of points collected since last update
var pointsCollected = 0;

async function collectData(reader) {

    // listen to data coming from the serial device

    while (true) {

        const { value, done } = await serialReader.read();

        if (done) {

            // allow the serial port to be closed
            serialReader.releaseLock();
            console.log("serial port lost...");

            break;
        }

        // make a new array of floats from the collects UInt8Array
        var newPoints = Array.from(value).map( x => x/256.0 );
        
        // add the points onto the existing array
        points = points.concat( newPoints );

        // trim old points from start of array
        if(points.length > N_SAMPLES) points = points.splice( points.length - N_SAMPLES );
    
        updateGraphPoints();

        // update the number of collected points
        pointsCollected += newPoints.length;

        // processData when we've collected enougth points
        if(pointsCollected >= N_SAMPLES) {

            pointsCollected = 0;
            processData();
        }
    }
}

function processData() {

    console.log("processing data...");

    // pass points through window function and then fft
    const windowedPoints = points.map( (x, i, arr) => x * windowFunction(i, arr.length) );
    pointsfft = fft( windowedPoints );

    updateStats();
    updateGraphPoints();
}