// Oscar Saharoy 2021

class RightClickMenu {

	constructor( femtoscope ) {

		this.femtoscope = femtoscope;

		this.div = document.getElementById( "right-click-menu" );
		window.addEventListener( "mousedown", () => { if( !this.div.contains(event.target) ) this.hide(); } );

		this.functions = [ () => this.femtoscope.togglePause(),
						   () => this.femtoscope.fitToData(),
						   () => this.femtoscope.togglefft(),
						   () => this.femtoscope.ruler.create(),
						   () => this.femtoscope.ruler.remove() ];

		this.menuButtons = Array.from( this.div.children );
		[ this.pauseButton, this.fitDataButton, this.togglefftButton, this.addRulerButton, this.removeRulerButton ] = this.menuButtons;

		this.menuButtons.forEach( (mb, i) => mb.onclick = () => { this.hide(); this.functions[i](); } );
	}

	show(event) {

		event.preventDefault();

		this.pauseButton.innerHTML     = this.femtoscope.paused  ? "play" : "pause";
		this.togglefftButton.innerHTML = this.femtoscope.showfft ? "show waveform" : "show fft";
		this.removeRulerButton.style.display = this.femtoscope.ruler.created || this.femtoscope.ruler.creating ? "block" : "none";

		this.div.style.left = `${event.clientX}px`;
		this.div.style.top  = `${event.clientY}px`;
		this.div.style.visibility = "visible";
	}

	hide() {

		this.div.style.visibility = "hidden";
	}
}