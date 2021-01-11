// Oscar Saharoy 2021

class Ruler {

    constructor() {

        // reference to the graph
        this.graph = graphjs;
        
        // button that adds a ruler to the graph
        this.button = document.getElementById("add-ruler");
        this.button.onclick = () => this.addRuler();

        // 2 vec2s that hold the start and end of the ruler
        this.startPos = new vec2(0, 0);
        this.endPos   = new vec2(0, 0);

        // true while the ruler is being added
        this.adding = false;
        this.added  = false;

        // flags to tell if the mouse is near the ruler
        this.nearRuler = false;
        this.nearStart = false;
        this.nearEnd   = false;
        this.dragging  = false;

        // html elements that have the numeric values for the ruler stats
        const startStat    = document.getElementById("start-stat");
        const endStat      = document.getElementById("end-stat");
        const dxStat       = document.getElementById("dx-stat");
        const dyStat       = document.getElementById("dy-stat");
        const lengthStat   = document.getElementById("length-stat");
        const gradientStat = document.getElementById("gradient-stat");

        const statIds = 
        const rulerStats   = [startStat, endStat, dxStat, dyStat, lengthStat, gradientStat];

        this.graph.canvas.addEventListener("contextmenu", cancelRuler);
    }

    cancelRulerOnEsc(event) {
        
        if( event.key == "Escape" ) cancelRuler();
    }

    addRuler() {

        // toggle the add ruler button to cancel adding the ruler
        addRulerButton.innerHTML = "adding a ruler 🤔";
        addRulerButton.onclick   = cancelRuler;

        // event listener to call endRuler on pressing esc
        window.addEventListener( "keydown", cancelRulerOnEsc );

        rulerStart = this.graph.mousePos;
        rulerEnd   = vec2.notANumber();
        this.graph.canvas.addEventListener( "click", setFirstRulerPoint );

        // prevent graph panning
        this.graph.preventPanning = true;

        // add the drawruler function in to be called each frame
        this.graph.userDrawFunctions.push( drawRuler );

        addingRuler = true;
    }

    cancelRuler(event) {

        // unset all the ruler stats
        for(rulerStat of rulerStats) rulerStat.innerHTML = "-";

        // unset the rulerAdded flag and call endRuler
        rulerAdded = false;
        endRuler();
    }

    endRuler() {

        // reset the add ruler button to normal so it adds a ruler
        addRulerButton.innerHTML = "add a ruler 📏";
        addRulerButton.onclick   = addRuler;

        // remove the event listener that calls this function on pressing esc
        window.removeEventListener( "keydown", cancelRulerOnEsc );
        this.graph.canvas.removeEventListener( "click", setFirstRulerPoint  );
        this.graph.canvas.removeEventListener( "click", setSecondRulerPoint );

        // re enable graph panning and set addingRuler flag
        this.graph.preventPanning = false;
        addingRuler = false;
    }

    dragRuler(event) {

        if( nearRulerStart )
            rulerStart.setv( this.graph.mousePos );

        else if( nearRulerEnd )
            rulerEnd.setv( this.graph.mousePos );

        else {
            rulerStart.incBy( this.graph.mouseMove );
            rulerEnd.incBy(   this.graph.mouseMove );

            updateRulerStats();
        }
    }

    this.graph.canvas.addEventListener( "mousemove", rulerMouseMove );

    rulerMouseMove(event) {

        // flag to tell the drawing routine if we need to draw the dotted crosshair
        draggingRulerEnd = this.graph.mouseClicked && ( nearRulerStart || nearRulerEnd );

        // if clicked, moving mouse and near the ruler then we must be dragging the ruler
        if( this.graph.mouseClicked && nearRuler ) dragRuler(event);

        // only update cursor and closeness flags if mouse is not clicked
        if( !this.graph.mouseClicked ) {

            // sets the nearRulerStart, nearRulerEnd, and nearRuler flags
            checkIfNearRuler();
        }
    }

    checkIfNearRuler() {

        const rulerStartOnCanvas = this.graph.graphToCanvas( rulerStart );
        const rulerEndOnCanvas   = this.graph.graphToCanvas( rulerEnd   );

        // check if mouse is near to either ruler end
        nearRulerStart = vec2.sqrDist( this.graph.mousePosOnCanvas, rulerStartOnCanvas ) < 120;
        nearRulerEnd   = vec2.sqrDist( this.graph.mousePosOnCanvas, rulerEndOnCanvas   ) < 120;

        // fraction of the distance along the line that is closest to the mouse
        var lambda = vec2.dot( vec2.sub(this.graph.mousePosOnCanvas, rulerStartOnCanvas), vec2.sub(rulerEndOnCanvas, rulerStartOnCanvas) ) 
                   / vec2.dot( vec2.sub(rulerEndOnCanvas,         rulerStartOnCanvas), vec2.sub(rulerEndOnCanvas, rulerStartOnCanvas) );

        // limit the fraction along the line between 0 and 1
        lambda = lambda < 0 ? 0 : lambda > 1 ? 1 : lambda;

        const closestPointOnRuler = vec2.lerp( rulerStartOnCanvas, rulerEndOnCanvas, lambda );
        nearRuler = vec2.sqrDist( this.graph.mousePosOnCanvas, closestPointOnRuler ) < 120;
    }

    updateRulerStats() {

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

    setFirstRulerPoint( event ) {

        // cement the ruler start as the current mouse pos and link the ruler end to the mouse pos which changes
        rulerStart = vec2.clone( this.graph.mousePos );
        rulerEnd   = this.graph.mousePos;

        // switch from this function on click to the setSecondRulerPoint function
        this.graph.canvas.removeEventListener( "click", setFirstRulerPoint  );
        this.graph.canvas.addEventListener(    "click", setSecondRulerPoint );
    }

    setSecondRulerPoint( event ) {

        // cement ruler end as the current mouse position
        rulerEnd = vec2.clone( this.graph.mousePos );

        // remove the event listener for this function on clicking
        this.graph.canvas.removeEventListener( "click", setSecondRulerPoint );

        // set the ruler added flag and call the endRuler function
        rulerAdded = true;
        endRuler();
    }

    drawRuler( graph ) {

        // only draw something if the ruler is being added or is added
        if( !addingRuler && !rulerAdded ) return;

        const ctx = graph.ctx;
        const rulerStartOnCanvas = this.graph.graphToCanvas( rulerStart );
        const rulerEndOnCanvas   = this.graph.graphToCanvas( rulerEnd   );

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
}

const ruler = new Ruler();