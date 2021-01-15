// Oscar Saharoy 2021


class Buttons {

	constructor( femtoscope ) {

		this.femtoscope = femtoscope;

		this.infoButton   = document.querySelector(".info-button");
		this.iBody        = document.querySelector(".info-button .i-body");
		this.iDot         = document.querySelector(".info-button .i-dot");
		this.iBack        = document.querySelector(".info-button .i-back");
		this.infoScreen   = document.querySelector(".info-screen");
		
		this.infoClicked = false;
		this.infoButton.onclick = () => this.onInfoClick();


		this.playButton   = document.querySelector(".play-button");
		this.playTriangle = document.querySelector(".play-button .play-triangle");
		this.playSquare   = document.querySelector(".play-button .play-square");
		this.playWhite    = document.querySelector(".play-button .play-white");

		this.playClicked        = false;
		this.playButton.onclick = () => this.onPlayClick();
	}

	onInfoClick() {

		this.infoClicked = !this.infoClicked;

		if(this.infoClicked) {
			this.iBody.classList.add("i-body-cross");
			this.iDot.classList.add("i-dot-cross");
			this.iBack.classList.add("i-back-cross");
			this.infoScreen.classList.add("info-screen-onscreen");
		}
		else {
			this.iBody.classList.remove("i-body-cross");
			this.iDot.classList.remove("i-dot-cross");
			this.iBack.classList.remove("i-back-cross");
			this.infoScreen.classList.remove("info-screen-onscreen");
		}
	}

	onPlayClick() {

		this.playClicked = !this.playClicked;

		this.femtoscope.paused = !this.playClicked;

		if( this.playClicked ) {
			this.playTriangle.classList.add("play-triangle-paused");
			this.playSquare.classList.add("play-square-paused");
			this.playWhite.classList.add("play-white-paused");
		}
		else {
			this.playTriangle.classList.remove("play-triangle-paused");
			this.playSquare.classList.remove("play-square-paused");
			this.playWhite.classList.remove("play-white-paused");
		}
	}
}