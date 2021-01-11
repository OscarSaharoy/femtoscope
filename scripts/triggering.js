// Oscar Saharoy 2020

const TriggerModes = { NONE: 0, SINGLE: 1, REPEAT: 2 };

class Triggering {

	constructor() {

		// reference to the graph
		this.graph = graphjs;

		// select element that controls the triggering setting
		this.select = document.getElementById("triggering");
		this.select.onchange = () => this.setTriggering();

		this.mode        = TriggerModes.NONE;
		this.diamondPos  = vec2.zero;
		this.showDiamond = false;
		this.nearDiamond = false;
		this.dragging    = false;

		// colour that the triggering diamond will be drawn in
		this.diamondColour = "#FFAB21"

		// register the drawDiamond function
		this.graph.userDrawFunctions.push( graph => this.drawDiamond(graph) );

		// sets the neadDiamond flag
		this.graph.canvas.addEventListener( "mousemove", e => this.onMousemove(e) );
	}

	setTriggering() {

	    // update the triggering mode
		this.mode        = parseInt( this.select.value );
		this.showDiamond = this.mode == TriggerModes.SINGLE || this.mode == TriggerModes.REPEAT;
		this.diamondPos  = this.graph.getCentre();
	}

	drawDiamond( graph ) {

		if( !this.showDiamond || showfft ) return;

		const ctx = graph.ctx;
		const diamondPosOnCanvas = graph.graphToCanvas( this.diamondPos );

	    // if we're currently dragging the diamond, draw dotted horizontal and vertical lines
	    // at the mouse position to help alignment
		if( this.dragging ) drawCrosshairAtCursor( ctx );

		ctx.strokeStyle = this.diamondColour;
		ctx.fillStyle   = "white";
		ctx.lineWidth   = 4.5;
		ctx.beginPath();

		// draw a diamond at diamondPosOnCanvas
		ctx.moveTo( diamondPosOnCanvas.x,      diamondPosOnCanvas.y + 10 );
		ctx.lineTo( diamondPosOnCanvas.x + 10, diamondPosOnCanvas.y      );
		ctx.lineTo( diamondPosOnCanvas.x,      diamondPosOnCanvas.y - 10 );
		ctx.lineTo( diamondPosOnCanvas.x - 10, diamondPosOnCanvas.y      );
		ctx.lineTo( diamondPosOnCanvas.x,      diamondPosOnCanvas.y + 10 );
		ctx.lineTo( diamondPosOnCanvas.x + 10, diamondPosOnCanvas.y      );

		ctx.fill();
		ctx.stroke();
	}

	onMousemove( event ) {

		if( !this.showDiamond || showfft ) return;

		// condition to check if we're draging the diamond
		this.dragging = this.graph.mouseClicked && this.nearDiamond;

		// set the diamond pos if we're dragging it
		if( this.dragging ) this.diamondPos.setv( this.graph.mousePos );

		// if the mouse is clicked then don't need to update the this.nearDiamond flag
		if( this.graph.mouseClicked ) return;

		// set to true if mouse is less than 11 pixels away from the diamond
		this.nearDiamond = vec2.sqrDist( this.graph.mousePosOnCanvas, this.graph.graphToCanvas( this.diamondPos ) ) < 120;
	}
}

const triggering = new Triggering();