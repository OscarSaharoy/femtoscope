// Oscar Saharoy 2021

class DividerManager {

	constructor( dividerId, graph ) {

		// the divider between the graph and UI
		this.divider = document.getElementById( dividerId );
		this.dividerClicked = false;

		this.graph = graph;

		// event listeners to enable dragging of the divider
		divider.addEventListener(  "mousedown",  e => { this.dividerClicked = true;  } );
		document.addEventListener( "mouseup",    e => { this.dividerClicked = false; } );
		document.addEventListener( "mouseleave", e => { this.dividerClicked = false; } );
		document.addEventListener( "mousemove",  e =>   this.dividerMouseMove(e)       );
	}

	dividerMouseMove( e ) {

	    if( !this.dividerClicked ) return;

	    // change the body's column template - change amount of screen that is graph/UI
	    document.body.style.gridTemplateColumns = ( e.clientX-10 ).toString() + "px 1.5rem auto";

	    this.graph.resize();
	}
}