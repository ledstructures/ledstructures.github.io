let webserial = new WebSerialPort();
const programmer = new Programmer;
let lastSpecialPat;
let lastStdPat;
let lastMan;

const btnPgm = document.getElementById("btnPgm");

const usbcom = {
    'usbstart': 0x3c,
    'usbend': 0xc3,
    'getfirmware': 0x11,
    'programstd': 0x21,
    'programarr': 0x22,
    'programsave': 0x23,
    'settestpat': 0x31,
    'setstatic': 0x32,
    'sethighlite': 0x33,
    'setdmx': 0x34
};

const direction = {
    'forward': 0x00,
    'reverse': 0x01,
    'patforward': 0x02,
    'patflip': 0x03,
    'patreverse': 0x04,
    'patreverseflip': 0x05,
    'double': 0x06,
    'doubleflip': 0x07,
    'doublereverseflip': 0x08
};

const testfigure = {
    'off': 0x00,
    'static': 0x01,
    'whitegreensnake': 0x02,
    'greenbluesnake': 0x03,
    'blueredsnake': 0x04,
    'redgreensnake': 0x05,
    'rgb': 0x06,
    'rainbow': 0x07,
    'rgbsnap': 0x08,
    'rgbchase': 0x09,
    'fadeall': 0x0A,
    'fadechase': 0x0B
};

let colorpicker = document.getElementById("colorpicker");
let colorpickertx = colorpicker.getContext("2d");
let img = document.getElementById("colorpickersrc");
colorpicker.willReadFrequently = true;

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
    // btnPgm.disabled = !e;
}


function setCurrentData() {
    ;
}

function progSimple() {
    ;
}

function progShape() {
    console.log(lastSpecialPat)
    console.log(programmer.programArr(lastSpecialPat))
    if (webserial) {
        if (webserial.port) {
            webserial.sendSerial(programmer.programArr(lastSpecialPat));
        }
    }
}
function saveShape() {
    if (webserial) {
        if (webserial.port) {
            webserial.sendSerial(programmer.saveArr(lastSpecialPat));
        }
    }
}

function progMan() {

}
function saveMan() {

}

function changeProgShape() {
    let type = document.getElementsByName("advshape");
    let img;
    let tn;
    let arrlist;
    for (let i = 0; i < type.length; i++) {
        if (type[i].checked) {
            tn = type[i].id;
            // console.log(WinchModes[mode[i].id])
        }
    }
    switch (tn) {
        case "CUBE2M":
            arrlist = paternCube2m;
            // img...
            break;
        case "CUBE1M":
            arrlist = paternCube1m;
            break;

        case "CUBE50CM":
            arrlist = paternCube50cm;
            break;

        case "RANDOMDUB":
            arrlist = randomDoubles(120);
            break;

        case "RANDOMNODUB":
            arrlist = randomNoDoubles(120);
            break;
    }
    document.getElementById("advOutpList").innerHTML = undefined;
    let content = " ";
    for (let i = 0; i < arrlist.length; i++) {
        if (i % 10 == 0) {
            content += "<b>";
        }
        content += arrlist[i];
        content += ",";
        content += " ";
        if (i % 10 == 0) {
            content += "</b>";
        }

        if (i % 10 == 9) {
            content += "<br>";
        }
    }
    document.getElementById("advOutpList").innerHTML = content;
    document.getElementById("advOutpList").value = arrlist;
    lastSpecialPat = arrlist;
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
            webserial.sendSerial(programmer.setStaticCol(r / 100, g / 100, b / 100, w / 100));
        }
    }
}

/// set a pointer to disconnected funtion on disconnect
webserial.errorCalback = disconnected

colorpickertx.drawImage(img, 0, 0, colorpicker.width, colorpicker.height);
colorpicker.addEventListener('mousemove', function (ev) {
    if (ev.buttons) {
        let { x, y } = getCursorPosition(colorpicker, ev);
        let r = colorpickertx.getImageData(x, y, 1, 1).data[0];
        let g = colorpickertx.getImageData(x, y, 1, 1).data[1];
        let b = colorpickertx.getImageData(x, y, 1, 1).data[2];
        setColorSliders(r, g, b);
    }
});

colorpicker.addEventListener('click', function (ev) {
    let { x, y } = getCursorPosition(colorpicker, ev);
    let r = colorpickertx.getImageData(x, y, 1, 1).data[0];
    let g = colorpickertx.getImageData(x, y, 1, 1).data[1];
    let b = colorpickertx.getImageData(x, y, 1, 1).data[2];
    setColorSliders(r, g, b);
});
staticSetCols();

console.log(randomNoDoubles(10))
console.log(programmer.programArr(paternCube1m))

// try {
//     webserial.on("data", serialParser.parseData.bind(serialParser));        // make the self accesable?
// } catch {
//     console.log("not a compatible browser")
// }