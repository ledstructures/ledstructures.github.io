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
        disconnected("disconnect pressed")


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
    // delete winchCurr; // cant do this...
    for (const key in winchCurr) {
        delete winchCurr[key];
    }
    setCurrentData();
    changeCatchAll();
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
    let sd = new SerialWinchSender(webserial);
    sd.reqAllData();
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

function setAddrPossible() {
    let enable = true;
    let personality = 3;
    switch (winchNew.type) {
        case WinchTypes.TYDLB:
            personality = 3;
            break;

        case WinchTypes.TYORBISFLY5:
            personality = 5;
            break;

        case WinchTypes.TYORBISFLY9:
            personality = 9;
            break;
        default:
            personality = 9;
            break;
    }
    let max = 512 - personality;

    // again this had to be a variable blegh....??!?!
    let d = document.getElementById("NewAddrA");
    d.setAttribute("max", max);

    d = document.getElementById("NewAddrB");
    d.setAttribute("max", max);

    d = document.getElementById("NewAddrC");
    d.setAttribute("max", max);

    d = document.getElementById("NewAddrD");
    d.setAttribute("max", max);



    let fault = "<- overlaps"

    if (!winchNew.WinchAaddrIsOk) {
        enable = false;
        document.getElementById("NewAddrAisOK").innerHTML = fault;
    } else {
        document.getElementById("NewAddrAisOK").innerHTML = "";

    }
    if (!winchNew.WinchBaddrIsOk) {
        enable = false;
        document.getElementById("NewAddrBisOK").innerHTML = fault;
    } else {
        document.getElementById("NewAddrBisOK").innerHTML = "";

    }
    if (!winchNew.WinchCaddrIsOk) {
        enable = false;
        document.getElementById("NewAddrCisOK").innerHTML = fault;
    } else {
        document.getElementById("NewAddrCisOK").innerHTML = "";

    }
    if (!winchNew.WinchDaddrIsOk) {
        enable = false;
        document.getElementById("NewAddrDisOK").innerHTML = fault;
    } else {
        document.getElementById("NewAddrDisOK").innerHTML = "";

    }
    if (!winchNew.WinchSafetyAddrIsOk) {
        enable = false;
        document.getElementById("NewAddrSisOK").innerHTML = fault;
    } else {
        document.getElementById("NewAddrSisOK").innerHTML = "";

    }
    if (enable) {
        if (webserial.port) {
            eneableButSend(true);
        }
    } else {
        eneableButSend(false);
    }
}

//obviously a very bad implementation of onchange handler, 
function changeCatchAll() {
    // fuck it, just get all data from page
    addressSequencial();
    getNewData();
    setVisable();
    setRWV();
    setNewData();
    winchNew.checkAddresses();
    setAddrPossible();
    // setDiffencesData();
}

function addressSequencial() {
    let firstaddr = parseInt(document.getElementById("NewAddrA").value)
    let offset = 0;
    let type = document.getElementById("NewType").type;
    let tn;
    for (let i = 0; i < type.length; i++) {
        if (type[i].checked == true) {
            tn = WinchTypes[type[i].id];
            // console.log(WinchModes[mode[i].id])
        }
    };
    switch (tn) {
        case WinchTypes.TYORBISFLY5:
            offset = 5;
            break;
        case WinchTypes.TYORBISFLY9:
            offset = 9;
            break;
        case WinchTypes.TYDLB:
            offset = 3;
            break;
        default:
            break;
    }

    if (document.getElementById("AddrAutomatic").checked) {
        // disable the posibilits in b-c-d-safe
        // document.getElementById("NewAddrA").disabled = true;
        document.getElementById("NewAddrB").disabled = true;
        document.getElementById("NewAddrC").disabled = true;
        document.getElementById("NewAddrD").disabled = true;

        // change the values: // is this better done in a global?
        document.getElementById("NewAddrB").value = 0x1ff & (firstaddr + offset);
        document.getElementById("NewAddrC").value = 0x1ff & (firstaddr + (offset * 2));
        document.getElementById("NewAddrD").value = 0x1ff & (firstaddr + (offset * 3));

        if (document.getElementById("AddrIncrementSafety").checked) {
            document.getElementById("NewSaftyAddr").disabled = true;
            document.getElementById("NewSaftyAddr").value = 0x1ff & (firstaddr + (offset * 4));
            document.getElementById("AddrIncrement").value = 0x1ff & ((offset * 4) + 3);

            // incement addres by 4*offset + 3
        } else {
            // increment address by 4xofsset
            document.getElementById("AddrIncrement").value = (offset * 4)

        }


    }
    else {
        document.getElementById("NewAddrB").disabled = false;
        document.getElementById("NewAddrC").disabled = false;
        document.getElementById("NewAddrD").disabled = false;
        document.getElementById("NewSaftyAddr").disabled = false;
    }
    if (!document.getElementById("AddrIncrementSafety").checked) {
        document.getElementById("NewSaftyAddr").disabled = false;
    }
}

// set real world values
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

    let mode = document.getElementById("NewMode").mode;
    for (let i = 0; i < mode.length; i++) {
        if (winchNew.mode == WinchModes[mode[i].id]) {
            (mode[i].checked = true)
            // console.log(WinchModes[mode[i].id])
        }
    };

    let type = document.getElementById("NewType").type;
    for (let i = 0; i < type.length; i++) {
        if (winchNew.type == WinchTypes[type[i].id]) {
            type[i].checked = true
        }
    }
}

// cpy the data from the 'winchCurr' obj to the html 
function setDiffencesData() {
    // winchCurr.WinchAaddr++;
    let notEqual = "x"
    if (parseInt(winchCurr.WinchAaddr) != parseInt(winchNew.WinchAaddr))
        document.getElementById("CurrAddrAeq").innerHTML = notEqual;
    else
        document.getElementById("CurrAddrAeq").innerHTML = "";

    if (winchCurr.WinchBaddr != winchNew.WinchBaddr)
        document.getElementById("CurrAddrBeq").innerHTML = notEqual;
    else
        document.getElementById("CurrAddrBeq").innerHTML = "";

    if (winchCurr.WinchCaddr != winchNew.WinchCaddr)
        document.getElementById("CurrAddrCeq").innerHTML = notEqual;
    else
        document.getElementById("CurrAddrCeq").innerHTML = "";

    if (winchCurr.WinchDaddr != winchNew.WinchDaddr)
        document.getElementById("CurrAddrDeq").innerHTML = notEqual;
    else
        document.getElementById("CurrAddrDeq").innerHTML = "";

    if (winchCurr.WinchSafetyAddr != winchNew.WinchTrimUp)
        document.getElementById("CurrSaftyAddreq").innerHTML = notEqual;
    else
        document.getElementById("CurrSaftyAddreq").innerHTML = "";

    if (winchCurr.WinchTrimUp != winchNew.WinchTrimUp)
        document.getElementById("CurrUpeq").innerHTML = notEqual;
    else
        document.getElementById("CurrUpeq").innerHTML = "";
    if (winchCurr.WinchTrimDown != winchNew.WinchTrimDown)
        document.getElementById("CurrDowneq").innerHTML = notEqual;
    else
        document.getElementById("CurrDowneq").innerHTML = "";
    if (winchCurr.WinchTrimUpCD != winchNew.WinchTrimUpCD)
        document.getElementById("CurrUpCDeq").innerHTML = notEqual;
    else
        document.getElementById("CurrUpCDeq").innerHTML = "";

    if (winchCurr.WinchTrimDownCD != winchNew.WinchTrimDownCD)
        document.getElementById("CurrDownCDeq").innerHTML = notEqual;
    else
        document.getElementById("CurrDownCDeq").innerHTML = "";



    if (winchCurr.WinchBdev != winchNew.WinchTrimUp)
        document.getElementById("CurrDevBeq").innerHTML = notEqual;
    else
        document.getElementById("CurrDevBeq").innerHTML = "";

    if (winchCurr.WinchCdev != winchNew.WinchTrimUp)
        document.getElementById("CurrDevCeq").innerHTML = notEqual;
    else
        document.getElementById("CurrDevCeq").innerHTML = "";

    if (winchCurr.WinchDdev != winchNew.WinchTrimUp)
        document.getElementById("CurrDevDeq").innerHTML = notEqual;
    else
        document.getElementById("CurrDevDeq").innerHTML = "";

    if (winchCurr.WinchBlinP != winchNew.WinchTrimUp)
        document.getElementById("CurrPosBeq").innerHTML = notEqual;
    else
        document.getElementById("CurrPosBeq").innerHTML = "";

    if (winchCurr.WinchClinP != winchNew.WinchTrimUp)
        document.getElementById("CurrPosCeq").innerHTML = notEqual;
    else
        document.getElementById("CurrPosCeq").innerHTML = "";

    if (winchCurr.name != winchNew.name)
        document.getElementById("CurrNameeq").innerHTML = notEqual;
    else
        document.getElementById("CurrNameeq").innerHTML = "";



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
    } else
        document.getElementById("CurrMode").innerHTML = "";

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
    } else
        document.getElementById("CurrType").innerHTML = "";
}

// cpy the data from the 'winchCurr' obj to the html 
function setCurrentData() {
    // winchCurr.WinchAaddr++;
    if (winchCurr.WinchAaddr || (winchCurr.WinchAaddr === 0))
        document.getElementById("CurrAddrA").innerHTML = winchCurr.WinchAaddr;
    else
        document.getElementById("CurrAddrA").innerHTML = "";

    if (winchCurr.WinchBaddr || (winchCurr.WinchBaddr === 0))
        document.getElementById("CurrAddrB").innerHTML = winchCurr.WinchBaddr;
    else
        document.getElementById("CurrAddrB").innerHTML = "";

    if (winchCurr.WinchCaddr || (winchCurr.WinchCaddr === 0))
        document.getElementById("CurrAddrC").innerHTML = winchCurr.WinchCaddr;
    else
        document.getElementById("CurrAddrC").innerHTML = "";

    if (winchCurr.WinchDaddr || (winchCurr.WinchDaddr === 0))
        document.getElementById("CurrAddrD").innerHTML = winchCurr.WinchDaddr;
    else
        document.getElementById("CurrAddrD").innerHTML = "";

    if (winchCurr.WinchSafetyAddr || (winchCurr.WinchTrimUp === 0))
        document.getElementById("CurrSaftyAddr").innerHTML = winchCurr.WinchSafetyAddr;
    else
        document.getElementById("CurrSaftyAddr").innerHTML = "";

    if (winchCurr.WinchTrimUp || (winchCurr.WinchTrimUp === 0))
        document.getElementById("CurrUp").innerHTML = winchCurr.WinchTrimUp;
    else
        document.getElementById("CurrUp").innerHTML = "";
    if (winchCurr.WinchTrimDown || (winchCurr.WinchTrimDown === 0))
        document.getElementById("CurrDown").innerHTML = winchCurr.WinchTrimDown;
    else
        document.getElementById("CurrDown").innerHTML = "";
    if (winchCurr.WinchTrimUpCD || (winchCurr.WinchTrimUpCD === 0))
        document.getElementById("CurrUpCD").innerHTML = winchCurr.WinchTrimUpCD;
    else
        document.getElementById("CurrUpCD").innerHTML = "";

    if (winchCurr.WinchTrimDownCD || (winchCurr.WinchTrimDownCD === 0))
        document.getElementById("CurrDownCD").innerHTML = winchCurr.WinchTrimDownCD;
    else
        document.getElementById("CurrDownCD").innerHTML = "";



    if (winchCurr.WinchBdev || (winchCurr.WinchTrimUp === 0))
        document.getElementById("CurrDevB").innerHTML = winchCurr.WinchBdev;
    else
        document.getElementById("CurrDevB").innerHTML = "";

    if (winchCurr.WinchCdev || (winchCurr.WinchTrimUp === 0))
        document.getElementById("CurrDevC").innerHTML = winchCurr.WinchCdev;
    else
        document.getElementById("CurrDevC").innerHTML = "";

    if (winchCurr.WinchDdev || (winchCurr.WinchTrimUp === 0))
        document.getElementById("CurrDevD").innerHTML = winchCurr.WinchDdev;
    else
        document.getElementById("CurrDevD").innerHTML = "";

    if (winchCurr.WinchBlinP || (winchCurr.WinchTrimUp === 0))
        document.getElementById("CurrPosB").innerHTML = winchCurr.WinchBlinP;
    else
        document.getElementById("CurrPosB").innerHTML = "";

    if (winchCurr.WinchClinP || (winchCurr.WinchTrimUp === 0))
        document.getElementById("CurrPosC").innerHTML = winchCurr.WinchClinP;
    else
        document.getElementById("CurrPosC").innerHTML = "";

    if (winchCurr.name)
        document.getElementById("CurrName").innerHTML = winchCurr.name;
    else
        document.getElementById("CurrName").innerHTML = "";

    if ((winchCurr.serNum) || (winchCurr.serNum === 0))
        document.getElementById("CurrSer").innerHTML = winchCurr.serNum;
    else
        document.getElementById("CurrSer").innerHTML = "";


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
    } else
        document.getElementById("CurrMode").innerHTML = "";

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
    } else
        document.getElementById("CurrType").innerHTML = "";
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
