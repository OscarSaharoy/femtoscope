// Oscar Saharoy 2021

class RightClickMenu {

	constructor( femtoscope ) {

		this.femtoscope = femtoscope;

		// get the right click menu div and link a click on the window to close it
		this.div = document.getElementById( "right-click-menu" );
		window.addEventListener( "mousedown", () => { if( !this.div.contains(event.target) ) this.hide(); } );

		// functions to call for each menu button
		this.functions = [ () => this.femtoscope.togglePause(),
						   () => this.femtoscope.fitToData(),
						   () => this.femtoscope.togglefft(),
						   () => this.femtoscope.ruler.create(),
						   () => this.femtoscope.ruler.remove() ];

		// get all the menu buttons
		this.menuButtons = Array.from( this.div.children );
		[ this.pauseButton, this.fitDataButton, this.togglefftButton, this.addRulerButton, this.removeRulerButton ] = this.menuButtons;

		// link each function to each button
		this.menuButtons.forEach( (mb, i) => mb.onclick = () => { this.hide(); this.functions[i](); } );
	}

	show(event) {

		event.preventDefault();

		// set some of the menu button's text to the correct thing
		this.pauseButton.innerHTML     = this.femtoscope.paused  ? "play" : "pause";
		this.togglefftButton.innerHTML = this.femtoscope.showfft ? "show waveform" : "show fft";
		this.removeRulerButton.style.display = this.femtoscope.ruler.created || this.femtoscope.ruler.creating ? "block" : "none";

		// position and show the menu
		this.div.style.left = `${event.clientX}px`;
		this.div.style.top  = `${event.clientY}px`;
		this.div.style.visibility = "visible";
	}

	hide() {

		this.div.style.visibility = "hidden";
	}
}