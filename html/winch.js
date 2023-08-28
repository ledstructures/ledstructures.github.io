// winchcontroller
// enums in JS are weird!!

const WinchTypes = {
    TYORBISFLY5: Symbol("orbi9"),
    TYORBISFLY9: Symbol("orbi5"),
    TYDLB: Symbol("dlb")
}

const WinchModes = {
    LIFOLLOWA: Symbol("followA"),
    LIFOLLOWPREV: Symbol("followPrev"),
    LIDUBBLEPAIR: Symbol("dubble"),
    LI3INLINE: Symbol("line3"),
    LI4INLINE: Symbol("line4")
}


// bij gebrek aan een struct....
class WinchSettings {
    constructor() {
        // declare with a val to each attribute?!
        this.type = WinchTypes.TYDLB;
        this.mode = WinchModes.LIFOLLOWA;

        this.WinchAaddr = 1;
        this.WinchBaddr = 11;
        this.WinchCaddr = 21;
        this.WinchDaddr = 31;

        this.WinchAdev = 16;
        this.WinchBdev = 16;
        this.WinchCdev = 16;
        this.WinchDdev = 16;

        this.WinchAlinP = 128;
        this.WinchBlinP = 128;
        this.WinchClinP = 128;
        this.WinchDlinP = 128;

        this.WinchSafetyAddr = 41;
    }
    // ga ik hier nog echt nog setters en getters moeten maken voor elke wisseling van waarde?
}
