let webserial = new WebSerialPort();

const btnPgm = document.getElementById("btnPgm");

let c = document.getElementById("colorpicker");
let ctx = c.getContext("2d");
let img = document.getElementById("colorpickersrc");


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
            enableButtons(true)
            // setCollors();
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
}

function enableButtons(e) {
    btnPgm.disabled = !e;
}

function ls_usb_checksum(p) {
    let r = 0;
    for (let i = 4; i < (p.length - 2); i++) {
        r ^= p[i];
        r &= 0xff;
    }
    // console.log(r);

    return r;
}

function setCurrentData() {
    ;
}

function setColorSliders(r, g, b) {
    let radio = document.getElementById("colorMode");
    let coltype;
    let w = 0;
    let rt = r;
    let gt = g;
    let bt = b;
    for (i = 0; i < radio.length; i++) {
        if (radio[i].checked)
            coltype = radio[i].id;
    }
    switch (coltype) {
        case "RGB":
            document.getElementById("staticRed").value = r;
            document.getElementById("staticGreen").value = g;
            document.getElementById("staticBlue").value = b;
            document.getElementById("staticWhite").value = w;
            break;
        case "RGBW":
            while ((r > 0) && (g > 0) && (b > 0)) {
                w++;
                r--;
                g--;
                b--;
            }
            document.getElementById("staticRed").value = r;
            document.getElementById("staticGreen").value = g;
            document.getElementById("staticBlue").value = b;
            document.getElementById("staticWhite").value = w;
            break;
        case "RGBWPLUS":

            while ((r > 0) && (g > 0) && (b > 0)) {
                w++;
                r--;
                g--;
                b--;
            }
            document.getElementById("staticRed").value = rt;
            document.getElementById("staticGreen").value = gt;
            document.getElementById("staticBlue").value = bt;
            document.getElementById("staticWhite").value = w;
            break;
    }
    staticSetCols();

}
function getCursorPosition(canvas, ev) {
    let rect = canvas.getBoundingClientRect()
    let x = ev.clientX - rect.left
    let y = ev.clientY - rect.top
    return { x, y };
}
function staticSetCols() {
    let r = (document.getElementById("staticRed").value / 2.55).toFixed(0);
    let g = (document.getElementById("staticGreen").value / 2.55).toFixed(0);
    let b = (document.getElementById("staticBlue").value / 2.55).toFixed(0);
    let w = (document.getElementById("staticWhite").value / 2.55).toFixed(0);

    document.getElementById("redInt").innerHTML = "value: " + document.getElementById("staticRed").value + ", " + r + "%";
    document.getElementById("greenInt").innerHTML = "value: " + document.getElementById("staticGreen").value + ", " + g + "%";
    document.getElementById("blueInt").innerHTML = "value: " + document.getElementById("staticBlue").value + ", " + b + "%";
    document.getElementById("whiteInt").innerHTML = "value: " + document.getElementById("staticWhite").value + ", " + w + "%";

    if (webserial) {
        if (webserial.port) {
            data = new Uint8Array(10);
            data[0] = 0x3c;
            data[1] = 0x15;
            data[2] = 0x00;
            data[3] = 0x04;
            data[4] = r;
            data[5] = g;
            data[6] = b;
            data[7] = w;
            data[8] = ls_usb_checksum(data);
            data[9] = 0xc3;
            webserial.sendSerial(data);
        }
    }
}

/// set a pointer to disconnected funtion on disconnect
webserial.errorCalback = disconnected




ctx.drawImage(img, 0, 0, c.width, c.height);
c.addEventListener('mousemove', function (ev) {
    if (ev.buttons) {
        let { x, y } = getCursorPosition(c, ev);
        let r = ctx.getImageData(x, y, 1, 1).data[0];
        let g = ctx.getImageData(x, y, 1, 1).data[1];
        let b = ctx.getImageData(x, y, 1, 1).data[2];
        setColorSliders(r, g, b);
    }
});

c.addEventListener('click', function (ev) {
        let { x, y } = getCursorPosition(c, ev);
        let r = ctx.getImageData(x, y, 1, 1).data[0];
        let g = ctx.getImageData(x, y, 1, 1).data[1];
        let b = ctx.getImageData(x, y, 1, 1).data[2];
        setColorSliders(r, g, b);
});
staticSetCols();

// try {
//     webserial.on("data", serialParser.parseData.bind(serialParser));        // make the self accesable?
// } catch {
//     console.log("not a compatible browser")
// }