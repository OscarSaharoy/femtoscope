// Oscar Saharoy 2021

// the divider between the graph and UI
const divider = document.getElementById("divider");
var dividerClicked = false;

// event listeners to enable dragging of the divider
divider.addEventListener(  "mousedown",  e => { dividerClicked = true;  } );
document.addEventListener( "mouseup",    e => { dividerClicked = false; } );
document.addEventListener( "mouseleave", e => { dividerClicked = false; } );
document.addEventListener( "mousemove", dividerMouseMove );

function dividerMouseMove( event ) {

    if( !dividerClicked ) return;

    // change the body's column template - change amount of screen that is graph/UI
    document.body.style.gridTemplateColumns = (event.clientX-10).toString() + "px 1rem auto";

    graphjs.resize();
}