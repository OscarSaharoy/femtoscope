// Oscar Saharoy 2020

// define triggering modes
const Triggering      = { NONE: 0, SINGLE: 1, REPEAT: 2 };
const triggeringModes = [ Triggering.NONE, Triggering.SINGLE, Triggering.REPEAT ];
var   triggeringMode  = Triggering.NONE;

// select element that controls the triggering setting
const triggeringSelect = document.getElementById("triggering");
triggeringSelect.onchange = setTriggering;

var triggeringMode  = Triggering.NONE;
var triggerPos      = vec2.zero();
var showTrigger     = false;
var nearTrigger     = false;
var draggingTrigger = false;

// register the drawTriggerPoint function
graphjs.userDrawFunctions.push( drawTriggerPoint );

function setTriggering(event) {

    // update the triggering mode
	triggeringMode = triggeringModes[ triggeringSelect.value ];

	showTrigger = triggeringMode == Triggering.SINGLE || triggeringMode == Triggering.REPEAT;
	triggerPos = vec2.zero();
}

function drawTriggerPoint( graph ) {

	if( !showTrigger ) return;

	const ctx = graph.ctx;
	const triggerPosOnCanvas = graph.graphToCanvas( triggerPos );

    // if we're currently dragging the trigger, draw dotted horizontal and vertical lines
    // at the mouse position to help alignment
	if( draggingTrigger ) drawCrosshairAtCursor( ctx );

	ctx.strokeStyle = "#FFAB21";
	ctx.fillStyle   = "white";
	ctx.lineWidth   = 4.5;
    ctx.setLineDash([]);
	ctx.beginPath();

	// draw a diamond at triggerPosOnCanvas
	ctx.moveTo( triggerPosOnCanvas.x,      triggerPosOnCanvas.y + 10 );
	ctx.lineTo( triggerPosOnCanvas.x + 10, triggerPosOnCanvas.y      );
	ctx.lineTo( triggerPosOnCanvas.x,      triggerPosOnCanvas.y - 10 );
	ctx.lineTo( triggerPosOnCanvas.x - 10, triggerPosOnCanvas.y      );
	ctx.lineTo( triggerPosOnCanvas.x,      triggerPosOnCanvas.y + 10 );
	ctx.lineTo( triggerPosOnCanvas.x + 10, triggerPosOnCanvas.y      );

	ctx.fill();
	ctx.stroke();
}

// set the nearTrigger flag
graphjs.canvas.addEventListener( "mousemove", triggerMousemove );

function triggerMousemove( event ) {

	if( !showTrigger ) return;

	// condition to check if we're draging the trigger
	draggingTrigger = graphjs.mouseClicked && nearTrigger;

	// set the trigger pos
	if( draggingTrigger ) triggerPos.setv( graphjs.mousePos );

	// if the mouse is clicked then don't need to update the nearTrigger flag
	if( !graphjs.mouseClicked )

		// set to true if mouse is less than 11 pixels away from the trigger
	    nearTrigger = vec2.sqrDist( graphjs.mousePosOnCanvas, graphjs.graphToCanvas( triggerPos ) ) < 120;
}