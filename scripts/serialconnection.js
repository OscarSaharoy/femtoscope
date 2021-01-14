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
            await this.port.open({ baudRate: 57600 });
            console.log("opened port!");

            this.reader = this.port.readable.getReader();
            console.log("got reader!");

            // change button to success message
            this.setButton( "connected 😄 click to disconnect", () => this.disconnectFromSerial() );
        }
        catch {
            
            // error occurs when user doesn't select a serial port
            console.log("failed to connect :(");

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
    };

    async disconnectFromSerial() {

        // try to cancel the serial connection
        await this.reader.cancel();
        await this.port.close();

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