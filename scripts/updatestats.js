// Oscar Saharoy 2021

// html elements that have the numeric values for the stats
const maxStat        = document.getElementById("max-stat");
const minStat        = document.getElementById("min-stat");
const peakToPeakStat = document.getElementById("peak-to-peak-stat");
const rmsStat        = document.getElementById("rms-stat");
const dcAverageStat  = document.getElementById("dc-average-stat");
const frequencyStat  = document.getElementById("frequency-stat");

const waveformStats  = [maxStat, minStat, peakToPeakStat, rmsStat, dcAverageStat, frequencyStat];

// some helper functions that find some of the stats
const indexOfMaxFreq = arr =>   arr.reduce( (best, x, i) => (x > best.val && i > 4) ? {val: x, ind: i} : best, {val:0, ind:0} ).ind;
const getRMS         = arr => ( arr.reduce( (Sx2, x)     => Sx2 + x*x, 0 ) / arr.length ) ** 0.5
const getDCAverage   = arr =>   arr.reduce( (Sx, x)      => Sx + x,    0 ) / arr.length

function updateStats() {

    // get all the stats from the points arrays
    const maxValue   = Math.max( ...points );
    const minValue   = Math.min( ...points );
    const p2pValue   = maxValue - minValue;
    const rmsValue   = getRMS( points );
    const dcAvgValue = getDCAverage( points );
    const freqValue  = indexOfMaxFreq( pointsfft )/(sampleTime*sampleCount);

    // add the values into the html
    maxStat.innerHTML        = maxValue.toPrecision(3)   + "v";
    minStat.innerHTML        = minValue.toPrecision(3)   + "v";
    peakToPeakStat.innerHTML = p2pValue.toPrecision(3)   + "v";
    rmsStat.innerHTML        = rmsValue.toPrecision(3)   + "v";
    dcAverageStat.innerHTML  = dcAvgValue.toPrecision(3) + "v";
    frequencyStat.innerHTML  = freqValue.toString()      + "Hz";
}