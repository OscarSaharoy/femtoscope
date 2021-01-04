// Oscar Saharoy 2020

// define triggering modes
const Triggering = { NONE: 0, SINGLE: 1, REPEAT: 2 };
const triggeringModes = [ Triggering.NONE, Triggering.SINGLE, Triggering.REPEAT ];

// select element that controls the triggering setting
const triggeringSelect = document.getElementById("triggering");
triggeringSelect.onchange = setTriggering;

var triggeringMode = Triggering.NONE;

function setTriggering(event) {

	triggeringMode = triggeringModes[triggeringSelect.value];
	console.log(triggeringMode);
}