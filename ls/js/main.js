let webserial = new WebSerialPort();

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


try {
    webserial.on("data", serialParser.parseData.bind(serialParser));        // make the self accesable?
} catch {
    console.log("not a compatible browser")
}

//setting a function pointer i guesss... end of data parsed to update the html
serialParser.endcommandcb = setCurrentData;
/// set a pointer to disconnected funtion on disconnect
webserial.errorCalback = disconnected
