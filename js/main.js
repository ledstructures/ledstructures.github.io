// create serial obj from webserial wrapper
const webserial = new  WebSerialPort();

// 'struct with all settings'
const winchNew = new WinchSettings();
// set default tosetting
winchNew.SetDefaults();
const winchCurr = new WinchSettings();

// winchCurr.SetDefaults();

// create a serial parser from winch send the instance to edit as arg
const serialParser = new SerialWinchParser(winchCurr);

// F onclick to connect to serial port(check on port connected evntlistener?) 
function connect() {
    if (webserial) {
        if (document.getElementById("con").value == "Connect") {
            webserial.openPort();
            document.getElementById("con").value = "Disconnect"
        } else {
            webserial.closePort();
            document.getElementById("con").value = "Connect"
        }
    }
}

// copy the set data from the html to the winchNew obj
function getNewData() {
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
    winchNew.WinchBdev = document.getElementById("NewDevB").innerHTML;
    winchNew.WinchCdev = document.getElementById("NewDevC").innerHTML;
    winchNew.WinchDdev = document.getElementById("NewDevD").innerHTML;

    // document.getElementById("NewPosA").innerHTML = winchCurr.WinchALinP;
    winchNew.WinchBlinP = document.getElementById("NewPosB").innerHTML;
    winchNew.WinchClinP = document.getElementById("NewPosC").innerHTML;
}

// copy the data from the winchNew obj to the html
function setNewData() {
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

    document.getElementById("AddrIncrement").value = 40
}

// cpy the data from the 'winchCurr' obj to the html 
function setCurrentData() {
    // winchCurr.WinchAaddr++;
    if (winchCurr.WinchAaddr)
        document.getElementById("CurrAddrA").innerHTML = winchCurr.WinchAaddr;
    if (winchCurr.WinchBaddr)
        document.getElementById("CurrAddrB").innerHTML = winchCurr.WinchBaddr;
    if (winchCurr.WinchCaddr)
        document.getElementById("CurrAddrC").innerHTML = winchCurr.WinchCaddr;
    if (winchCurr.WinchDaddr)
        document.getElementById("CurrAddrD").innerHTML = winchCurr.WinchDaddr;
    if (winchCurr.WinchTrimUp)
        document.getElementById("CurrUp").value = winchCurr.WinchTrimUp;
    if (winchCurr.WinchTrimDown)
        document.getElementById("CurrDown").value = winchCurr.WinchTrimDown;
    if (winchCurr.WinchTrimUpCD)
        document.getElementById("CurrUpCD").value = winchCurr.WinchTrimUpCD;
    if (winchCurr.WinchTrimDownCD)
        document.getElementById("CurrDownCD").value = winchCurr.WinchTrimDownCD;

    if (winchCurr.WinchSafetyAddr)
        document.getElementById("CurrSaftyAddr").innerHTML = winchCurr.WinchSafetyAddr;

    if (winchCurr.WinchBdev)
        document.getElementById("CurrDevB").innerHTML = winchCurr.WinchBdev;
    if (winchCurr.WinchCdev)
        document.getElementById("CurrDevC").innerHTML = winchCurr.WinchCdev;
    if (winchCurr.WinchDdev)
        document.getElementById("CurrDevD").innerHTML = winchCurr.WinchDdev;

    if (winchCurr.WinchBlinP)
        document.getElementById("CurrPosB").innerHTML = winchCurr.WinchBlinP;
    if (winchCurr.WinchClinP)
        document.getElementById("CurrPosC").innerHTML = winchCurr.WinchClinP;

}

// increases the addesses of WinchSettings Obj, 
// takes WinchSettings obj, number to increment, bool to increment safety also
function incrementAddresses(w, increment, saf) {
    let incr = parseInt(increment);
    if (!incr) {
        return
    }
    // mask to overflow at 512
    w.WinchAaddr = 0x01ff & (w.WinchAaddr + incr);
    w.WinchBaddr = 0x01ff & (w.WinchBaddr + incr);
    w.WinchCaddr = 0x01ff & (w.WinchCaddr + incr);
    w.WinchDaddr = 0x01ff & (w.WinchDaddr + incr);
    if (saf) {
        w.WinchSafetyAddr = 0x01ff & (w.WinchSafetyAddr + incr);
    }
    setNewData();
    console.log(w.WinchAaddr)
}

//// pppffftttt!!!
// note bind to instance!
webserial.on("data", serialParser.parseData.bind(serialParser));        // make the self accesable?

// attacht a callback at the end of data parsed to update the html
serialParser.endcommandcb = setCurrentData;
// attacht the 
// serialParser.wc = winchCurr;
setCurrentData();
setNewData();
const wsender = new SerialWinchSender();
wsender.sendatacb = webserial.sendSerial
wsender.reqMode();
