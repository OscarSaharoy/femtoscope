// Oscar Saharoy 2021


class Buttons {

    constructor( femtoscope ) {

        this.femtoscope  = femtoscope;
 
        this.infoButton  = document.querySelector(".info-button");
        this.infoScreen  = document.querySelector(".info-screen");
        
        this.infoClicked = false;
        this.infoButton.onclick = () => this.onInfoClick();

        this.playButton  = document.querySelector(".play-button");
        this.playButton.onclick = () => this.femtoscope.togglePause();
    }

    onInfoClick() {

        // flip infoClicked and add or remove the classes as needed
        if( this.infoClicked ^= 1 ) {

            this.infoButton.classList.add("info-button-cross");
            this.infoScreen.classList.add("info-screen-onscreen");
        }
        else {

            this.infoButton.classList.remove("info-button-cross");
            this.infoScreen.classList.remove("info-screen-onscreen");
        }
    }

    pause() {
        this.playButton.classList.add("play-button-paused");
    }

    unpause() {
        this.playButton.classList.remove("play-button-paused");
    }
}