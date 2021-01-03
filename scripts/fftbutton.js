// Oscar Saharoy 2021

// button that toggles the graph between showing the fft of the signal or the original
const fftButton = document.getElementById("fft");
fftButton.onclick = togglefft;

function togglefft( event ) {

    // toggles whether we show the fft
    showfft = !showfft;

    // set the fft button to show the correct value
    fftButton.innerHTML = showfft ? "show waveform 🌊" : "show frequency spectrum 🎵";

    // update the graph display
    updateGraphPoints();
    fitToData();
    cancelRuler();
}