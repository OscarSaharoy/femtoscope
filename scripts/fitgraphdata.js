// Oscar Saharoy 2021

// the button that fits data to graph
const fitDataButton = document.getElementById("fit-data");
fitDataButton.onclick = fitToData;

function fitToData() {

    // if there's too few points then return
    if( graphjs.points.length < 2 ) return;

    const topRight   = vec2.minusInfinity;
    const bottomLeft = vec2.infinity;

    // find the topright and bottomleft points that contain all the data
    for( point of graphjs.points ) {

        topRight.setIfGreater( point );
        bottomLeft.setIfLess(  point );
    }

    // if data all falls in a line then return
    if( topRight.x == bottomLeft.x || topRight.y == bottomLeft.y ) return;

    // get centre point
    const centre = vec2.add( topRight, bottomLeft ).scaleBy( 0.5 );

    // set the graph range with these, calling vec2.lerp to give some padding to the data on the graph
    graphjs.setRange( vec2.lerp( centre, bottomLeft, 1.2 ), vec2.lerp( centre, topRight, 1.2 ) );
}
