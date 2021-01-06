// Oscar Saharoy 2020

// define triggering modes
const Triggering      = { NONE: 0, SINGLE: 1, REPEAT: 2 };
const triggeringModes = [ Triggering.NONE, Triggering.SINGLE, Triggering.REPEAT ];
var   triggeringMode  = Triggering.NONE;

// select element that controls the triggering setting
const triggeringSelect = document.getElementById("triggering");
triggeringSelect.onchange = setTriggering;

function setTriggering(event) {

    // update the triggering mode
	triggeringMode = triggeringModes[ triggeringSelect.value ];
}