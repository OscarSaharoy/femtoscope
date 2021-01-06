// Oscar Saharoy 2021

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

    try {
        // start the data collection loop
        await collectData(serialReader);
    }
    catch(err) {

        console.log("data collection error:");
        console.log(err);

        await disconnectFromSerial(event);

        connectButton.innerHTML = "lost connection 😞 click to reconnect"
        connectButton.onclick   = connectToSerial;
    }
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