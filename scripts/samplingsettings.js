// Oscar Saharoy 2021

// get all the inputs that control the sampling settings
const sampleCountInput = document.getElementById("sample-count");
const minVoltageInput  = document.getElementById("voltage-range-min");
const maxVoltageInput  = document.getElementById("voltage-range-max");

const samplingSettings = [sampleCountInput, minVoltageInput, maxVoltageInput];

samplingSettings.forEach( x => x.addEventListener("input", updateSamplingSettings) );

// vars to hold info about the sampling
var sampleCount = 2048;
var voltageMin  = 0;
var voltageMax  = 3.3;

function updateSamplingSettings(event) {

    // just update the vars with the values of the inputs
    sampleCount    = parseInt(   sampleCountInput.value );
    const voltage1 = parseFloat( minVoltageInput.value  );
    const voltage2 = parseFloat( maxVoltageInput.value  );

    voltageMin = Math.min( voltage1, voltage2 );
    voltageMax = Math.max( voltage1, voltage2 );
}