// Oscar Saharoy 2021

class SerialConnection {
        
    constructor( femtoscope ) {

        this.femtoscope = femtoscope;

        // the connect to serial button
        this.button = document.getElementById("connect");
        this.button.onclick = () => this.connectToSerial();

        // varaibles that hold the serial port and reader objects
        this.port   = null;
        this.reader = null;
        this.writer = null;
    }

    async connectToSerial() {

        // temporarily disable button and change message on it
        this.setButton( "connecting 🤔", null );

        // try to get a serial port to connect to
        try {

            // ask user to select a serial port
            this.port = await navigator.serial.requestPort();
            console.log("got port!");

            // open the port and get the reader object
            await this.port.open({ baudRate: 500000 });
            console.log("opened port!");

            this.reader = this.port.readable.getReader();
            this.writer = this.port.writable.getWriter();
            console.log("got reader & writer!");

            // change button to success message
            this.setButton( "connected 😄 click to disconnect", () => this.disconnectFromSerial() );
        }
        catch(err) {
            
            // error occurs when user doesn't select a serial port
            console.log("failed to connect :(", err);

            // reset button and exit function
            this.setButton( "connect to serial 🔌", () => this.connectToSerial() );

            return;
        }

        try {

            // start the data collection loop
            await this.femtoscope.collectData( this.reader );
        }
        catch(err) {

            console.log("oops :( data collection error:");
            console.log(err);

            await this.disconnectFromSerial();

            this.setButton( "lost connection 😞 click to reconnect", () => this.connectToSerial() );
        }
    }

    sendSamplingRate( rate ) {

        // get the 4 bytes of the new sampling rate as a float
        const buffer = new ArrayBuffer(4);
        ( new Float32Array(buffer) )[0] = rate;
        const bytes = new Uint8Array( buffer );

        // write those 4 bytes to the serial connection
        this.writer.write( bytes );
    }

    readerLost() {

        this.reader.releaseLock();
        this.writer.releaseLock();
        this.port = null;
        
        console.log("serial port lost...");
    }

    async disconnectFromSerial() {

        // try to cancel the serial connection
        await this.reader.cancel();
        await this.port.close();
        this.port = null;

        console.log("disconnected successfully!");
        
        // put connect button back to its original state
        this.setButton( "connect to serial 🔌", () => this.connectToSerial() );
    }

    setButton( text, func ) {

        // change the text and onclick function of the button
        this.button.innerHTML = text;
        this.button.onclick   = func; 
    }
}