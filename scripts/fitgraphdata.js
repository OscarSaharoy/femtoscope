// Oscar Saharoy 2021

const fitDataButton = document.getElementById("fit-data");
fitDataButton.onclick = fitToData;

// get max and min in x and y
function compareExtents( extents, p ) {

    return { top:    Math.max( p.y, extents.top    ), 
             right:  Math.max( p.x, extents.right  ), 
             bottom: Math.min( p.y, extents.bottom ), 
             left:   Math.min( p.x, extents.left   ) };
}

// apply compareExtents across arr to get the max and min values
const getExtents = arr => arr.reduce( compareExtents, { top:   -Infinity, 
                                                        right: -Infinity, 
                                                        bottom: Infinity, 
                                                        left:   Infinity } );

function fitToData() {

    // get the extents of the graph data
    const extents    = getExtents( graphjs.points );

    // some conditions that mean we shouldn't try to resize the graph
    const badResult  = graphjs.points.length < 2 || extents.bottom == Infinity || extents.left == Infinity || extents.top == extents.bottom || extents.right == extents.left;
    if(badResult) return;
 
    // get centre, topright and bottomleft points
    const centre     = new vec2( (extents.right + extents.left) / 2, (extents.top + extents.bottom) / 2 );
    const topRight   = new vec2( extents.right, extents.top    );
    const bottomLeft = new vec2( extents.left,  extents.bottom );

    // set the graph range with these, calling vec2.lerp to give some padding to the data on the graph
    graphjs.setRange( vec2.lerp( centre, bottomLeft, 1.2 ), vec2.lerp( centre, topRight, 1.2 ) );
}
