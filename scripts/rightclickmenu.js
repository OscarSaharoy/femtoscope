// Oscar Saharoy 2021

class RightClickMenu {

	constructor() {

		this.div = document.getElementById( "right-click-menu" );
		window.addEventListener( "click", () => this.hide() );
	}

	show(event) {

		event.preventDefault();

		this.div.style.visibility = "visible";
		this.div.style.left = `${event.clientX}px`;
		this.div.style.top  = `${event.clientY}px`;
	}

	hide() {

		this.div.style.visibility = "hidden";
	}
}