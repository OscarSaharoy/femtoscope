// Oscar Saharoy 2021

// some helper functions that find some of the stats
const getMaxIndex  = arr =>   arr.reduce( (best, x, i) => (x > best.val && i > 1) ? {val: x, ind: i} : best, {val:0, ind:0} ).ind;
const getRMS       = arr => ( arr.reduce( (Sx2,  x   ) => Sx2 + x*x, 0 ) / arr.length ) ** 0.5;
const getDCAverage = arr =>   arr.reduce( (Sx,   x   ) => Sx  + x,   0 ) / arr.length;


class WaveformStats {

    constructor() {
     
        // get the divs that contain the numeric values for the stats
        this.divIds   = ["max-stat", "min-stat", "peak-to-peak-stat", "rms-stat", "dc-average-stat", "frequency-stat"];
        this.statDivs = this.divIds.map( id => document.getElementById( id ) );
    }

    update() {

        // get all the stats from the points arrays
        const statValues = [ Math.max( ...points ), Math.min( ...points ), Math.max( ...points ) - Math.min( ...points ),
                             getRMS( points ), getDCAverage( points ), getMaxIndex( pointsfft ) / (sampleTime*sampleCount) ];

        // add the values into the html
        for(var i=0; i<6; ++i)

            this.statDivs[i].innerHTML = statValues[i].toPrecision(3) + i==6 ? "hz" : "v";
    }
}

const waveformStats = new WaveformStats();