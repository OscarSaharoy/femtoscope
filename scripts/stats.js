// Oscar Saharoy 2021

// class that represents a stat with a function to get its value
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