// Oscar Saharoy 2021

// button that adds a ruler to the graph
const addRulerButton   = document.getElementById("add-ruler");
addRulerButton.onclick = addRuler;

// 2 vec2s that hold the start and end of the ruler
var rulerStart = new vec2(0, 0);
var rulerEnd   = new vec2(0, 0);

// true while the ruler is being added
var addingRuler = false;
var rulerAdded  = false;

// flags to tell if the mouse is near the ruler
var nearRuler      = false;
var nearRulerStart = false;
var nearRulerEnd   = false;
var draggingRuler  = false;

// html elements that have the numeric values for the ruler stats
const startStat    = document.getElementById("start-stat");
const endStat      = document.getElementById("end-stat");
const dxStat       = document.getElementById("dx-stat");
const dyStat       = document.getElementById("dy-stat");
const lengthStat   = document.getElementById("length-stat");
const gradientStat = document.getElementById("gradient-stat");

const rulerStats   = [startStat, endStat, dxStat, dyStat, lengthStat, gradientStat];

graphjs.canvas.addEventListener("contextmenu", cancelRuler);

function cancelRulerOnEsc(event) {
    
    if( event.key == "Escape" ) cancelRuler();
}

function addRuler() {

    // toggle the add ruler button to cancel adding the ruler
    addRulerButton.innerHTML = "adding a ruler 🤔";
    addRulerButton.onclick   = cancelRuler;

    // event listener to call endRuler on pressing esc
    window.addEventListener( "keydown", cancelRulerOnEsc );

    rulerStart = graphjs.mousePos;
    rulerEnd   = vec2.notANumber();
    graphjs.canvas.addEventListener( "click", setFirstRulerPoint );

    // prevent graph panning
    graphjs.preventPanning = true;

    // add the drawruler function in to be called each frame
    graphjs.userDrawFunctions.push( drawRuler );

    addingRuler = true;
}

function cancelRuler(event) {

    // unset all the ruler stats
    for(rulerStat of rulerStats) rulerStat.innerHTML = "-";

    // unset the rulerAdded flag and call endRuler
    rulerAdded = false;
    endRuler();
}

function endRuler() {

    // reset the add ruler button to normal so it adds a ruler
    addRulerButton.innerHTML = "add a ruler 📏";
    addRulerButton.onclick   = addRuler;

    // remove the event listener that calls this function on pressing esc
    window.removeEventListener( "keydown", cancelRulerOnEsc );
    graphjs.canvas.removeEventListener( "click", setFirstRulerPoint  );
    graphjs.canvas.removeEventListener( "click", setSecondRulerPoint );

    // re enable graph panning and set addingRuler flag
    graphjs.preventPanning = false;
    addingRuler = false;
}

function dragRuler(event) {

    if( nearRulerStart )
        rulerStart.setv( graphjs.mousePos );

    else if( nearRulerEnd )
        rulerEnd.setv( graphjs.mousePos );

    else {
        rulerStart.incBy( graphjs.mouseMove );
        rulerEnd.incBy(   graphjs.mouseMove );

        updateRulerStats();
    }
}

graphjs.canvas.addEventListener( "mousemove", rulerMouseMove );

function rulerMouseMove(event) {

    // flag to tell the drawing routine if we need to draw the dotted crosshair
    draggingRulerEnd = graphjs.mouseClicked && ( nearRulerStart || nearRulerEnd );

    // if clicked, moving mouse and near the ruler then we must be dragging the ruler
    if( graphjs.mouseClicked && nearRuler ) dragRuler(event);

    // only update cursor and closeness flags if mouse is not clicked
    if( !graphjs.mouseClicked ) {

        // sets the nearRulerStart, nearRulerEnd, and nearRuler flags
        checkIfNearRuler();
    }
}

function checkIfNearRuler() {

    const rulerStartOnCanvas = graphjs.graphToCanvas( rulerStart );
    const rulerEndOnCanvas   = graphjs.graphToCanvas( rulerEnd   );

    // check if mouse is near to either ruler end
    nearRulerStart = vec2.sqrDist( graphjs.mousePosOnCanvas, rulerStartOnCanvas ) < 120;
    nearRulerEnd   = vec2.sqrDist( graphjs.mousePosOnCanvas, rulerEndOnCanvas   ) < 120;

    // fraction of the distance along the line that is closest to the mouse
    var lambda = vec2.dot( vec2.sub(graphjs.mousePosOnCanvas, rulerStartOnCanvas), vec2.sub(rulerEndOnCanvas, rulerStartOnCanvas) ) 
               / vec2.dot( vec2.sub(rulerEndOnCanvas,         rulerStartOnCanvas), vec2.sub(rulerEndOnCanvas, rulerStartOnCanvas) );

    // limit the fraction along the line between 0 and 1
    lambda = lambda < 0 ? 0 : lambda > 1 ? 1 : lambda;

    const closestPointOnRuler = vec2.lerp( rulerStartOnCanvas, rulerEndOnCanvas, lambda );
    nearRuler = vec2.sqrDist( graphjs.mousePosOnCanvas, closestPointOnRuler ) < 120;
}

function updateRulerStats() {

    // this is true if rulerEnd is not set yet
    if( isNaN(rulerEnd.x) ) {

        // only set the start position, all others are "-"
        for(rulerStat of rulerStats) rulerStat.innerHTML = "-";

        startStat.innerHTML = rulerStart.x.toPrecision(3)  + "s, " + rulerStart.y.toPrecision(3) + "v";

        return;
    }

    // get all the stats from the ruler endpoints
    const dxValue       = rulerEnd.x - rulerStart.x;
    const dyValue       = rulerEnd.y - rulerStart.y;
    const lengthValue   = ( dxValue**2 + dyValue**2 ) ** 0.5;
    const gradientValue = dyValue / dxValue;

    // add the values into the html
    startStat.innerHTML    = rulerStart.x.toPrecision(3)  + "s, " + rulerStart.y.toPrecision(3) + "v";
    endStat.innerHTML      = rulerEnd.x.toPrecision(3)    + "s, " + rulerEnd.y.toPrecision(3)   + "v";
    dxStat.innerHTML       = dxValue.toPrecision(3)       + "s";
    dyStat.innerHTML       = dyValue.toPrecision(3)       + "v";
    lengthStat.innerHTML   = lengthValue.toPrecision(3);
    gradientStat.innerHTML = gradientValue.toPrecision(3) + "v/s";
}

function setFirstRulerPoint( event ) {

    // cement the ruler start as the current mouse pos and link the ruler end to the mouse pos which changes
    rulerStart = vec2.clone( graphjs.mousePos );
    rulerEnd   = graphjs.mousePos;

    // switch from this function on click to the setSecondRulerPoint function
    graphjs.canvas.removeEventListener( "click", setFirstRulerPoint  );
    graphjs.canvas.addEventListener(    "click", setSecondRulerPoint );
}

function setSecondRulerPoint( event ) {

    // cement ruler end as the current mouse position
    rulerEnd = vec2.clone( graphjs.mousePos );

    // remove the event listener for this function on clicking
    graphjs.canvas.removeEventListener( "click", setSecondRulerPoint );

    // set the ruler added flag and call the endRuler function
    rulerAdded = true;
    endRuler();
}

function drawRuler( graph ) {

    // only draw something if the ruler is being added or is added
    if( !addingRuler && !rulerAdded ) return;

    const ctx = graph.ctx;
    const rulerStartOnCanvas = graphjs.graphToCanvas( rulerStart );
    const rulerEndOnCanvas   = graphjs.graphToCanvas( rulerEnd   );

    if(addingRuler || draggingRulerEnd) {

        // if we're currently adding a ruler, draw dotted horizontal and vertical lines
        // at the mouse position to help alignment
        drawCrosshairAtCursor( ctx );

        // this is called every frame as the ruler points are being set
        updateRulerStats();
    }

    ctx.setLineDash([]); 
    ctx.strokeStyle = "#54f3f4";
    ctx.lineWidth   = 3;  

    // draw the ruler line between the 2 points
    ctx.beginPath();
    ctx.moveTo( rulerStartOnCanvas.x, rulerStartOnCanvas.y );
    ctx.lineTo( rulerEndOnCanvas.x,   rulerEndOnCanvas.y   );
    ctx.stroke();

    ctx.lineWidth   = 4;
    ctx.fillStyle   = "white";

    // draw 2 circles at each end of the ruler
    ctx.beginPath();
    ctx.arc( rulerStartOnCanvas.x, rulerStartOnCanvas.y, 7, 0, 6.28 );
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc( rulerEndOnCanvas.x, rulerEndOnCanvas.y, 7, 0, 6.28 );
    ctx.fill();
    ctx.stroke();
}