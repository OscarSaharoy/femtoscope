// Oscar Saharoy 2020

// define triggering modes
const Triggering      = { NONE: 0, SINGLE: 1, REPEAT: 2 };
const triggeringModes = [ Triggering.NONE, Triggering.SINGLE, Triggering.REPEAT ];
var   triggeringMode  = Triggering.NONE;

// select element that controls the triggering setting
const triggeringSelect = document.getElementById("triggering");
triggeringSelect.onchange = setTriggering;

var triggeringMode = Triggering.NONE;
var triggerPos     = vec2.zero();

graphjs.userDrawFunctions.push( drawTriggerPoint );

function setTriggering(event) {

    // update the triggering mode
	triggeringMode = triggeringModes[ triggeringSelect.value ];
}

function drawTriggerPoint( graph ) {

	const ctx = graph.ctx;
	const triggerPosOnCanvas = graph.graphToCanvas( triggerPos );

	ctx.strokeStyle = "#FFAB21";
	ctx.fillStyle   = "white";
	ctx.lineWidth   = 6;
	ctx.beginPath();

	// draw a diamond at triggerPosOnCanvas
	ctx.moveTo( triggerPosOnCanvas.x,      triggerPosOnCanvas.y + 10 );
	ctx.lineTo( triggerPosOnCanvas.x + 10, triggerPosOnCanvas.y      );
	ctx.lineTo( triggerPosOnCanvas.x,      triggerPosOnCanvas.y - 10 );
	ctx.lineTo( triggerPosOnCanvas.x - 10, triggerPosOnCanvas.y      );
	ctx.lineTo( triggerPosOnCanvas.x,      triggerPosOnCanvas.y + 10 );

	ctx.fill();
	ctx.stroke();
}