// create serial obj from webserial wrapper
let webserial = new WebSerialPort();

// 'struct' with all settings
let winchNew = new WinchSettings();
// set default tosetting
winchNew.SetDefaults();
// init 'struct' for settings remote
let winchCurr = new WinchSettings();
// winchCurr.SetDefaults();

// init obj to send all the serial commands
// init a serial parser from winch send the instance to edit as arg (place to put data in)
let serialParser = new SerialWinchParser(winchCurr);

let increment = 50;


// for some reason this must be a const (i assume pointer) to modify disable attr? wtf....
const butCpy = document.getElementById("btnCpy");
const butSend = document.getElementById("btnSend");


async function connect() {
    // label for the button will change depending on what you do:
    let buttonLabel = "Connect";
    // if port is open, close it; if closed, open it:
    if (webserial.port) {
        await webserial.closePort();
        enableButtons(false)


    } else {
        await webserial.openPort();
        if (webserial.port) {
            buttonLabel = "Disconnect";
            getDataSet();
            enableButtons(true)
        }
    }
    // change button label:
    document.getElementById("btnCon").value = buttonLabel;

}

function disconnected(e) {
    console.log(e);
    delete webserial.port;
    document.getElementById("btnCon").value = "Connect";
    enableButtons(false);
}

function enableButtons(e) {
    butCpy.disabled = !e;
    butSend.disabled = !e;
}

function eneableButSend(e) {
    butSend.disabled = !e;
}
// add eventlistener to scrollwheel to enable scrolling on numerik inputs
document.addEventListener("wheel", function (event) {
    if (document.activeElement.type === "number") {
        //YES again a very bad idea, but it works!
        changeCatchAll();
    }
});

function setDataSer() {
    changeCatchAll();
    let sd = new SerialWinchSender(webserial);
    // webserial.
    sd.setAndReqAllData(winchNew);
    // wsender.setAllData(winchNew);
}

function cpyFromCurrent() {
    // really dont knwo if this will work...
    for (const key in winchCurr) {
        if (winchCurr.hasOwnProperty(key)) {
            // console.log(key + "'s favorite fruit is " + winchCurr[key]);
            winchNew[key] = winchCurr[key];
        }
    }
    setNewData();
    changeCatchAll();
}

function getDataSet() {
    let sd = new SerialWinchSender(webserial);
    sd.reqAllData();
    changeCatchAll();
}

//obviously a very bad implementation of onchange handler, but i don't feel like doin it right in this hiddious language!
function changeCatchAll() {
    // fuck it, just get all data from page
    getNewData();
    setVisable();
    setRWV();
    setNewData();
}

function setRWV() {
    let factor;
    let factor2;

    switch (winchNew.type) {
        case WinchTypes.TYORBISFLY5:
        case WinchTypes.TYORBISFLY9:
            factor = 600 / 255;
            factor2 = 1200 / 255;

            document.getElementById("RWVDevB").innerHTML = (winchNew.WinchBdev * factor).toFixed(1) + " / " + (winchNew.WinchBdev * factor2).toFixed(1);
            document.getElementById("RWVDevC").innerHTML = (winchNew.WinchCdev * factor).toFixed(1) + " / " + (winchNew.WinchCdev * factor2).toFixed(1);
            document.getElementById("RWVDevD").innerHTML = (winchNew.WinchDdev * factor).toFixed(1) + " / " + (winchNew.WinchDdev * factor2).toFixed(1);

            document.getElementById("RWVup").innerHTML = (winchNew.WinchTrimUp * factor).toFixed(1) + " / " + (winchNew.WinchTrimUp * factor2).toFixed(1);
            document.getElementById("RWVdown").innerHTML = (winchNew.WinchTrimDown * factor).toFixed(1) + " / " + (winchNew.WinchTrimDown * factor2).toFixed(1);
            document.getElementById("RWVupCD").innerHTML = (winchNew.WinchTrimUpCD * factor).toFixed(1) + " / " + (winchNew.WinchTrimUpCD * factor2).toFixed(1);
            document.getElementById("RWVdownCD").innerHTML = (winchNew.WinchTrimDownCD * factor).toFixed(1) + " / " + (winchNew.WinchTrimDownCD * factor2).toFixed(1);

            document.getElementById("RWVcentimeters").innerHTML = "cm, short/long"

            break;

        case WinchTypes.TYDLB:
            factor = 1200 / 255;
            document.getElementById("RWVDevB").innerHTML = (winchNew.WinchBdev * factor).toFixed(1);
            document.getElementById("RWVDevC").innerHTML = (winchNew.WinchCdev * factor).toFixed(1);
            document.getElementById("RWVDevD").innerHTML = (winchNew.WinchDdev * factor).toFixed(1);

            document.getElementById("RWVup").innerHTML = (winchNew.WinchTrimUp * factor).toFixed(1);
            document.getElementById("RWVdown").innerHTML = (winchNew.WinchTrimDown * factor).toFixed(1);
            document.getElementById("RWVupCD").innerHTML = (winchNew.WinchTrimUpCD * factor).toFixed(1);
            document.getElementById("RWVdownCD").innerHTML = (winchNew.WinchTrimDownCD * factor).toFixed(1);

            document.getElementById("RWVcentimeters").innerHTML = "cm"

            break;

        default:
            break;
    }

    document.getElementById("RWVposB").innerHTML = (winchNew.WinchBlinP / 255).toFixed(3);
    document.getElementById("RWVposC").innerHTML = (winchNew.WinchClinP / 255).toFixed(3);


}

function setVisable() {
    switch (winchNew.mode) {
        case WinchModes.LIFOLLOWPREV:
            document.getElementById("NewPosB").disabled = true;
            document.getElementById("NewPosC").disabled = true;

            document.getElementById("NewUpCD").disabled = true;
            document.getElementById("NewDownCD").disabled = true;

            document.getElementById("NewDevB").disabled = false;
            document.getElementById("NewDevC").disabled = false;
            document.getElementById("NewDevD").disabled = false;
            break;

        case WinchModes.LIFOLLOWA:
            document.getElementById("NewPosB").disabled = true;
            document.getElementById("NewPosC").disabled = true;

            document.getElementById("NewUpCD").disabled = true;
            document.getElementById("NewDownCD").disabled = true;

            document.getElementById("NewDevB").disabled = false;
            document.getElementById("NewDevC").disabled = false;
            document.getElementById("NewDevD").disabled = false;
            break;

        case WinchModes.LIDUBBLEPAIR:
            document.getElementById("NewPosB").disabled = true;
            document.getElementById("NewPosC").disabled = true;

            document.getElementById("NewUpCD").disabled = false;
            document.getElementById("NewDownCD").disabled = false;

            document.getElementById("NewDevB").disabled = false;
            document.getElementById("NewDevC").disabled = true;
            document.getElementById("NewDevD").disabled = false;
            break;

        case WinchModes.LI4INLINE:
            document.getElementById("NewPosC").disabled = false;
            document.getElementById("NewPosB").disabled = false;

            document.getElementById("NewUpCD").disabled = true;
            document.getElementById("NewDownCD").disabled = true;

            document.getElementById("NewDevB").disabled = true;
            document.getElementById("NewDevC").disabled = true;
            document.getElementById("NewDevD").disabled = false;
            break;

        case WinchModes.LI3INLINE:
            document.getElementById("NewPosC").disabled = true;
            document.getElementById("NewPosB").disabled = false;

            document.getElementById("NewUpCD").disabled = true;
            document.getElementById("NewDownCD").disabled = true;

            document.getElementById("NewDevB").disabled = true;
            document.getElementById("NewDevC").disabled = false;
            document.getElementById("NewDevD").disabled = true;
            break;

        default:
            break;
    }

}

// copy the set data from the html to the winchNew obj
function getNewData() {

    increment = document.getElementById("AddrIncrement").value;
    // console.log(increment);
    winchNew.WinchAaddr = document.getElementById("NewAddrA").value;
    winchNew.WinchBaddr = document.getElementById("NewAddrB").value;
    winchNew.WinchCaddr = document.getElementById("NewAddrC").value;
    winchNew.WinchDaddr = document.getElementById("NewAddrD").value;

    winchNew.WinchTrimUp = document.getElementById("NewUp").value;
    winchNew.WinchTrimDown = document.getElementById("NewDown").value;
    winchNew.WinchTrimUpCD = document.getElementById("NewUpCD").value;
    winchNew.WinchTrimDownCD = document.getElementById("NewDownCD").value;

    winchNew.WinchSafetyAddr = document.getElementById("NewSaftyAddr").value;

    // document.getElementById("NewDevA").innerHTML = winchNew.WinchAdev;
    winchNew.WinchBdev = document.getElementById("NewDevB").value;
    winchNew.WinchCdev = document.getElementById("NewDevC").value;
    winchNew.WinchDdev = document.getElementById("NewDevD").value;

    // document.getElementById("NewPosA").innerHTML = winchCurr.WinchALinP;
    winchNew.WinchBlinP = document.getElementById("NewPosB").value;
    winchNew.WinchClinP = document.getElementById("NewPosC").value;

    winchNew.name = document.getElementById("NewName").value

    let mode = document.getElementById("NewMode").mode;
    for (let i = 0; i < mode.length; i++) {
        if (mode[i].checked == true) {
            winchNew.mode = WinchModes[mode[i].id];
            // console.log(WinchModes[mode[i].id])
        }
    };

    let type = document.getElementById("NewType").type;
    for (let i = 0; i < type.length; i++) {
        if (type[i].checked == true) {
            winchNew.type = WinchTypes[type[i].id];
            // console.log(WinchTypes[type[i].id])
        }
    }
}


// copy the data from the winchNew obj to the html
function setNewData() {


    winchNew.checkTrim();

    document.getElementById("NewAddrA").value = winchNew.WinchAaddr;
    document.getElementById("NewAddrB").value = winchNew.WinchBaddr;
    document.getElementById("NewAddrC").value = winchNew.WinchCaddr;
    document.getElementById("NewAddrD").value = winchNew.WinchDaddr;

    document.getElementById("NewUp").value = winchNew.WinchTrimUp;
    document.getElementById("NewDown").value = winchNew.WinchTrimDown;
    document.getElementById("NewUpCD").value = winchNew.WinchTrimUpCD;
    document.getElementById("NewDownCD").value = winchNew.WinchTrimDownCD;

    document.getElementById("NewSaftyAddr").value = winchNew.WinchSafetyAddr;

    document.getElementById("NewDevB").value = winchNew.WinchBdev;
    document.getElementById("NewDevC").value = winchNew.WinchCdev;
    document.getElementById("NewDevD").value = winchNew.WinchDdev;

    document.getElementById("NewPosB").value = winchNew.WinchBlinP;
    document.getElementById("NewPosC").value = winchNew.WinchClinP;

    document.getElementById("NewName").value = winchNew.name;

    document.getElementById("AddrIncrement").value = increment
}

// cpy the data from the 'winchCurr' obj to the html 
function setCurrentData() {
    // winchCurr.WinchAaddr++;
    if (winchCurr.WinchAaddr || (winchCurr.WinchTrimUp === 0))
        document.getElementById("CurrAddrA").innerHTML = winchCurr.WinchAaddr;
    if (winchCurr.WinchBaddr || (winchCurr.WinchTrimUp === 0))
        document.getElementById("CurrAddrB").innerHTML = winchCurr.WinchBaddr;
    if (winchCurr.WinchCaddr || (winchCurr.WinchTrimUp === 0))
        document.getElementById("CurrAddrC").innerHTML = winchCurr.WinchCaddr;
    if (winchCurr.WinchDaddr || (winchCurr.WinchTrimUp === 0))
        document.getElementById("CurrAddrD").innerHTML = winchCurr.WinchDaddr;

    if (winchCurr.WinchTrimUp || (winchCurr.WinchTrimUp === 0))
        document.getElementById("CurrUp").innerHTML = winchCurr.WinchTrimUp;
    if (winchCurr.WinchTrimDown || (winchCurr.WinchTrimUp === 0))
        document.getElementById("CurrDown").innerHTML = winchCurr.WinchTrimDown;
    if (winchCurr.WinchTrimUpCD || (winchCurr.WinchTrimUp === 0))
        document.getElementById("CurrUpCD").innerHTML = winchCurr.WinchTrimUpCD;
    if (winchCurr.WinchTrimDownCD || (winchCurr.WinchTrimUp === 0))
        document.getElementById("CurrDownCD").innerHTML = winchCurr.WinchTrimDownCD;

    if (winchCurr.WinchSafetyAddr || (winchCurr.WinchTrimUp === 0))
        document.getElementById("CurrSaftyAddr").innerHTML = winchCurr.WinchSafetyAddr;

    if (winchCurr.WinchBdev || (winchCurr.WinchTrimUp === 0))
        document.getElementById("CurrDevB").innerHTML = winchCurr.WinchBdev;
    if (winchCurr.WinchCdev || (winchCurr.WinchTrimUp === 0))
        document.getElementById("CurrDevC").innerHTML = winchCurr.WinchCdev;
    if (winchCurr.WinchDdev || (winchCurr.WinchTrimUp === 0))
        document.getElementById("CurrDevD").innerHTML = winchCurr.WinchDdev;

    if (winchCurr.WinchBlinP || (winchCurr.WinchTrimUp === 0))
        document.getElementById("CurrPosB").innerHTML = winchCurr.WinchBlinP;
    if (winchCurr.WinchClinP || (winchCurr.WinchTrimUp === 0))
        document.getElementById("CurrPosC").innerHTML = winchCurr.WinchClinP;
    if (winchCurr.name)
        document.getElementById("CurrName").innerHTML = winchCurr.name;
    if ((winchCurr.serNum) || (winchCurr.serNum === 0))
        document.getElementById("CurrSer").innerHTML = winchCurr.serNum;

    // set mode and type to html
    if (winchCurr.mode) {
        let m;
        // console.log(winchCurr.mode);
        switch (winchCurr.mode) {
            case WinchModes.LIFOLLOWA:
                m = "Square";
                break;
            case WinchModes.LIFOLLOWPREV:
                m = "flex line";
                break;
            case WinchModes.LIDUBBLEPAIR:
                m = "Double ab & cd";
                break;
            case WinchModes.LI3INLINE:
                m = "3-in-line";
                break;
            case WinchModes.LI4INLINE:
                m = "4-in-line";
                break;
            default:
                break;
        }
        document.getElementById("CurrMode").innerHTML = m;
    }
    if (winchCurr.type) {
        let t;
        switch (winchCurr.type) {
            case WinchTypes.TYORBISFLY5:
                t = "Orbi 5";
                break;
            case WinchTypes.TYORBISFLY9:
                t = "Orbi 9";
                break;
            case WinchTypes.TYDLB:
                t = "DLB";
                break;
            default:
                break;
        }
        document.getElementById("CurrType").innerHTML = t;
    }
}


// increases the addesses of WinchSettings Obj, 
// takes WinchSettings obj, number to increment, bool to increment safety also
function incrementAddresses(w, increment, saf) {
    let incr = parseInt(increment);
    if (!incr) {
        return
    }
    // mask to overflow at 512
    w.WinchAaddr = 0x01ff & (parseInt(w.WinchAaddr) + incr);
    w.WinchBaddr = 0x01ff & (parseInt(w.WinchBaddr) + incr);
    w.WinchCaddr = 0x01ff & (parseInt(w.WinchCaddr) + incr);
    w.WinchDaddr = 0x01ff & (parseInt(w.WinchDaddr) + incr);
    if (saf) {
        w.WinchSafetyAddr = 0x01ff & (parseInt(w.WinchSafetyAddr) + incr);
    }
    setNewData();
    // console.log(w.WinchAaddr)
}

//// pppffftttt!!!
// note bind to instance!
try {
    webserial.on("data", serialParser.parseData.bind(serialParser));        // make the self accesable?
} catch {
    console.log("not a compatible browser")
}

//setting a function pointer i guesss... end of data parsed to update the html
serialParser.endcommandcb = setCurrentData;
/// set a pointer to disconnected funtion on disconnect
webserial.errorCalback = disconnected

setCurrentData();
setNewData();
changeCatchAll();
enableButtons(false);
