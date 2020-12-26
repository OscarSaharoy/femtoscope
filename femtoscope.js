
const graphjs = new Graph("graphjs");
graphjs.pointDrawingFunction = () => {};

graphjs.setXRange(-400, 9000);
graphjs.setYRange(-1,   5);

const isWellFormed = stri => /end|(\d\.\d+)/.test(stri)
const SAMPLERATE   = 1000; // Hz
const N_SAMPLES    = 8192;

const button = document.getElementById("button");
button.style.display = "grid";

var points = [];

const windowFunction = (n, N) => 0.53836 - 0.46164 * Math.cos( 6.28318 * n / N );

function padZeros( inputSignal, N = null ) {

    // pad a copy of inputSignal with zeros up to the next power of 2, returning the new array

    const nextPowerOf2  = N ? N : 2 ** Math.ceil( Math.log2( inputSignal.length ) );
    const numberOfZeros = nextPowerOf2 - inputSignal.length;

    return [ ...inputSignal ].concat( new Array( numberOfZeros ).fill(0) );
}
 
button.onclick = async event => {

    button.onclick = null;
    button.style.display = "none";

    port = await navigator.serial.requestPort();

    console.log("got port!")

    await port.open({ baudRate: 460800 });

    console.log("opened port!");

    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();

    console.log("got reader!");

    await collectData(reader);
};

function drawFreqSpectrum() {

    const pointsfft = fft( padZeros(points, N_SAMPLES).map( (x, i, arr) => x * windowFunction(i, arr.length) ) );

    var n = 0;
    graphjs.points = pointsfft.map( x => new vec2(n++ * 6.283185 * SAMPLERATE / points.length, x / 0.53836) );

    points = [];

    graphjs.redraw();
}

async function collectData(reader) {
    
    var halfstring = null;

    // listen to data coming from the serial device
    while (true) {

        const { value, done } = await reader.read();
        var strings = value.split("\n");

        if( !strings ) continue;

        if(halfstring) strings = [halfstring + strings[0], ...strings];

        halfstring = !isWellFormed( strings[strings.length-1] ) ? strings.pop() : null;

        const newPoints = strings.filter( isWellFormed ).map( parseFloat );
        //graphjs.addPoints( newPoints.map( x => new vec2(n++ / SAMPLERATE, x) ) );
        points = points.concat( newPoints );

        if(points.length > N_SAMPLES) points = points.splice( points.length - N_SAMPLES );

        var n = 0;
        graphjs.points = points.map( x => new vec2(n++, x) );

        graphjs.redraw();

        if( strings[strings.length-1][0] === "F" ) drawFreqSpectrum();
    }
}

var currentTime = null;

async function scroll( time ) {
    
    if(currentTime)
        graphjs.originOffset.x -= ( time - currentTime ) / 1000;
    
    currentTime = time;
    graphjs.redraw();

    requestAnimationFrame( scroll );
}

//requestAnimationFrame( scroll );