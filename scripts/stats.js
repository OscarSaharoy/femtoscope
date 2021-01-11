// Oscar Saharoy 2021

// some helper functions that find some of the stats
const getMaxIndex  = arr =>   arr.reduce( (best, x, i) => (x > best.val && i > 1) ? {val: x, ind: i} : best, {val:0, ind:0} ).ind;
const getRMS       = arr => ( arr.reduce( (Sx2,  x   ) => Sx2 + x*x, 0 ) / arr.length ) ** 0.5;
const getDCAverage = arr =>   arr.reduce( (Sx,   x   ) => Sx  + x,   0 ) / arr.length;


class Stats {

    constructor(divIds, getStatFuncs, suffixes) {
     
        this.suffixes     = suffixes;        
        this.getStatFuncs = getStatFuncs;

        // get the divs that contain the numeric values for the stats
        this.statDivs = divIds.map( id => document.getElementById( id ) );
    }

    update() {
        
        // add the values into the divs
        this.statDivs.forEach( (div, i) => div.innerHTML = this.getStatFuncs[i]().toPrecision(3) + this.suffixes[i] );
    }

    clear() {

        // set all divs to -
        this.statDivs.forEach( div => div.innerHTML = "-" );
    }
}

const waveformStats = new Stats( ["max-stat", "min-stat", "peak-to-peak-stat", "rms-stat", "dc-average-stat", "frequency-stat"],

                                 [ () => Math.max(...points),
                                  () => Math.min(...points),
                                  () => Math.max(...points) - Math.min(...points),
                                  () => getRMS(points),
                                  () => getDCAverage(points),
                                  () => getMaxIndex(pointsfft) / (sampleTime*sampleCount) ],

                                 ["v", "v", "v", "v", "v", "hz"] );