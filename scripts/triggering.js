// Oscar Saharoy 2020

// select element that controls the triggering setting
const triggeringSelect = document.getElementById("triggering");
triggeringSelect.onchange = setTriggering;

function setTriggering(event) {

	console.log( triggeringSelect.value );
}