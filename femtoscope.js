
const graphjs = new Graph("graphjs");
graphjs.pointDrawingFunction = () => {};

const isWellFormed = stri => /\d\.\d+/.test(stri)
const SAMPLERATE   = 100; // Hz

const button = document.getElementById("button");
button.style.display = "grid";
 
button.onclick = async event => {

    button.onclick = null;
    button.style.display = "none";

    port = await navigator.serial.requestPort();

    console.log("got port!")

    await port.open({ baudRate: 115200 });

    console.log("opened port!");

    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();

    console.log("got reader!");

    await collectData(reader);
};

async function collectData(reader) {
    
    var n = 0;
    var halfstring = null;

    // listen to data coming from the serial device
    while (true) {

        const { value, done } = await reader.read();
        var strings = value.split("\n");

        if(halfstring) strings = [halfstring + strings[0], ...strings];

        halfstring = !isWellFormed( strings[strings.length-1] ) ? strings.pop() : null;

        const newPoints = strings.filter( isWellFormed ).map( parseFloat ).map( x => new vec2(n++ / SAMPLERATE, x) );
        graphjs.addPoints( newPoints );

        if (n > SAMPLERATE * 15) graphjs.points.splice(0, newPoints.length); // only keep 15 seconds of history
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

requestAnimationFrame( scroll );