// Oscar Saharoy 2021

// some helper functions that find some of the stats
const getMaxIndex  = arr =>   arr.reduce( (best, x, i) => (x > best.val && i > 1) ? {val: x, ind: i} : best, {val:0, ind:0} ).ind;
const getRMS       = arr => ( arr.reduce( (Sx2,  x   ) => Sx2 + x*x, 0 ) / arr.length ) ** 0.5;
const getDCAverage = arr =>   arr.reduce( (Sx,   x   ) => Sx  + x,   0 ) / arr.length;


// class that represents a stat with a function to get its value and a suffix
class Stat {

    constructor( id, getValueFunc ) {

        this.elm          = document.getElementById( id );
        this.getValueFunc = getValueFunc;
    }

    update() {

        // set the element's innerHTML to the value returned by the get function
        this.elm.innerHTML = this.getValueFunc();
    }

    clear() {

        // clear the elm's text to "-"
        this.elm.innerHTML = "-";
    }

    static numberAndSuffix( number, suffix ) {

        return number.toPrecision(3) + suffix;
    }
}

// const waveformStats = new Stats( ["max-stat", "min-stat", "peak-to-peak-stat", "rms-stat", "dc-average-stat", "frequency-stat"],

//                                  [ () => Math.max(...points),
//                                   () => Math.min(...points),
//                                   () => Math.max(...points) - Math.min(...points),
//                                   () => getRMS(points),
//                                   () => getDCAverage(points),
//                                   () => getMaxIndex(pointsfft) / (sampleTime*sampleCount) ],

//                                  ["v", "v", "v", "v", "v", "hz"] );