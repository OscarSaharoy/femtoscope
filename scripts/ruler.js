// Oscar Saharoy 2021

class Ruler {

    constructor() {

        // reference to the graph
        this.graph = graphjs;
        
        // button that adds a ruler to the graph
        this.button = document.getElementById("add-ruler");
        this.button.onclick = () => this.create();

        // 2 vec2s that hold the start and end of the ruler
        this.startPos    = vec2.zero;
        this.endPos      = vec2.zero;

        // ruler state flags
        this.creating    = false;
        this.created     = false;
        this.dragging    = false;
        this.draggingEnd = false;

        // flags to tell if the mouse is near the ruler
        this.nearRuler   = false;
        this.nearStart   = false;
        this.nearEnd     = false;

        // function which lets us remove the ruler when esc is pressed
        this.cancelOnEsc = event => { if( event.key == "Escape" && this.creating ) this.remove() };
        window.addEventListener( "keydown", e => this.cancelOnEsc(e) );

        // add the draw function in to be called each frame
        this.graph.userDrawFunctions.push( graph => this.draw(graph) );
        
        // setup event listeners
        this.graph.canvas.addEventListener( "click",     e => this.onClick(e)     );
        this.graph.canvas.addEventListener( "mousemove", e => this.onMousemove(e) );

        // ruler stats are messy
        this.stats = [

            new Stat("start-stat",    () => Stat.numberAndSuffix( this.startPos.x, "s") + ", " 
                                          + Stat.numberAndSuffix( this.startPos.y, "v")                  ),

            new Stat("end-stat",      () => Stat.numberAndSuffix( this.endPos.x,   "s") + ", " 
                                          + Stat.numberAndSuffix( this.endPos.y,   "v")                  ),

            new Stat("dx-stat",       () => Stat.numberAndSuffix( this.endPos.x - this.startPos.x, "s" ) ),
            new Stat("dy-stat",       () => Stat.numberAndSuffix( this.endPos.y - this.startPos.y, "v" ) ),
            new Stat("length-stat",   () => vec2.dist(this.startPos, this.endPos).toPrecision(3)         ),

            new Stat("gradient-stat", () => Stat.numberAndSuffix( 
                                            vec2.grad(vec2.sub(this.startPos, this.endPos)), "v/s" )     )
        ];
    }

    create() {

        // toggle the add ruler button to cancel adding the ruler
        this.button.innerHTML = "adding ruler 🤔";
        this.button.onclick   = () => this.remove();

        // prevent graph panning
        this.graph.preventPanning = true;
        this.creating = true;

        // setup the ruler start to follow the mouse position
        this.startPos = this.graph.mousePos;
        this.endPos   = vec2.notANumber;
    }

    onClick(event) {

        // this function only works while the ruler is being created
        if( !this.creating ) return;

        // true if we are currently placing the first point
        if( vec2.isNaN( this.endPos ) ) {

            // set the start position and set the end to follow the mouse
            this.startPos = vec2.clone( this.graph.mousePos );
            this.endPos   = this.graph.mousePos;
        }

        // else we are placing the end of the ruler
        else {

            // set the end position
            this.endPos = vec2.clone( this.graph.mousePos );

            // set the created flag and call finishCreating
            this.created = true;
            this.finishCreating();
        }
    }

    remove() {

        // unset the created flag and call finishCreating
        this.created = false;
        this.finishCreating();

        // unset all the ruler stats
        this.updateStats();

        // we are definately not close to the ruler
        this.nearRuler = this.nearStart = this.nearEnd = false;
    }

    finishCreating() {

        // reset the add ruler button to normal so it adds a ruler
        this.button.innerHTML  = "add ruler 📏";
        this.button.onclick    = () => this.create();

        // re enable graph panning and set creating flag
        this.graph.preventPanning = false;
        this.creating             = false;
    }

    dragRuler(event) {

        if( this.nearStart )
            this.startPos.setv( this.graph.mousePos );

        else if( this.nearEnd )
            this.endPos.setv( this.graph.mousePos );

        else {
            this.startPos.incBy( this.graph.mouseMove );
            this.endPos.incBy(   this.graph.mouseMove );
        }

        // update the stats for the ruler
        this.updateStats();
    }

    onMousemove(event) {

        // if we're creating a ruler then update the stats
        if( this.creating ) this.updateStats();

        // nothing else to do if the ruler hasn't been created
        if( !this.created ) return;

        // flag to tell the drawing routine if we need to draw the dotted crosshair
        this.draggingEnd = this.graph.mouseClicked && ( this.nearStart || this.nearEnd );

        // if clicked, moving mouse and near the ruler then we must be dragging the ruler
        if( this.graph.mouseClicked && this.nearRuler ) this.dragRuler(event);

        // only update cursor and closeness flags if mouse is not clicked
        if( !this.graph.mouseClicked ) this.checkIfNearRuler();
    }

    checkIfNearRuler() {

        const rulerStartOnCanvas = this.graph.graphToCanvas( this.startPos );
        const rulerEndOnCanvas   = this.graph.graphToCanvas( this.endPos   );
        const startToEndOnCanvas = vec2.sub(rulerEndOnCanvas, rulerStartOnCanvas);

        // check if mouse is near to either ruler end
        this.nearStart = vec2.sqrDist( this.graph.mousePosOnCanvas, rulerStartOnCanvas ) < 120;
        this.nearEnd   = vec2.sqrDist( this.graph.mousePosOnCanvas, rulerEndOnCanvas   ) < 120;

        // fraction of the distance along the line that is closest to the mouse
        var lambda = vec2.dot( vec2.sub(this.graph.mousePosOnCanvas, rulerStartOnCanvas), startToEndOnCanvas ) 
                   / vec2.dot( startToEndOnCanvas, startToEndOnCanvas );

        // limit the fraction along the line between 0 and 1
        lambda = lambda < 0 ? 0 : lambda > 1 ? 1 : lambda;

        // caclculate distance to closest point
        const closestPointOnRuler = vec2.lerp( rulerStartOnCanvas, rulerEndOnCanvas, lambda );
        this.nearRuler = vec2.sqrDist( this.graph.mousePosOnCanvas, closestPointOnRuler ) < 120;
    }

    updateStats() {

        if( !this.created && !this.creating ) { 

            this.stats.forEach( stat => stat.clear() );
        }
        else if( vec2.isNaN(this.endPos) ) {

            this.stats.forEach( stat => stat.clear() );
            this.stats[0].update();
        }
        else {

            this.stats.forEach( stat => stat.update() );
        }
    }

    draw( graph ) {

        // only draw something if the ruler is being added or is added
        if( !this.creating && !this.created ) return;

        const ctx = graph.ctx;
        const rulerStartOnCanvas = graph.graphToCanvas( this.startPos );
        const rulerEndOnCanvas   = graph.graphToCanvas( this.endPos   );

        // if we're currently moving an endpoint, draw dotted horizontal and vertical lines
        // at the mouse position to help alignment
        if( this.creating || this.draggingEnd ) drawCrosshairAtCursor( ctx );

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