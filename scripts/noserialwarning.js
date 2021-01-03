// Oscar Saharoy 2021

// big div that holds the warning message when Serial API is not enabled
const noSerialWarning = document.getElementById("no-serial");

// button that hides that div
const noSerialButton  = document.getElementById("no-serial-continue");
noSerialButton.onclick = e => { noSerialWarning.style.display = "none" }

// check if serial API exists
if( "serial" in navigator ) {

    // hide the message that is show when serial API is diabled
    noSerialWarning.style.display = "none";

    console.log("serial api enabled :)");
}