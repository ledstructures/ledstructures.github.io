const webserial = new WebSerialPort();
let programmer = new ProgramDataGen();
let parser = new ProgramDataParser();

parser.dataCalbacks = pgCb;

let lastSpecialPat;
let lastStdPat;
let lastMan;
let waitforRepy = false;

const btnCon = document.getElementById("btnCon");

const btnprogSimple = document.getElementById("btnProgSimple");

const btnsaveShape = document.getElementById("btnSaveShape");
const btnprogShape = document.getElementById("btnProgShape");

const btnsaveMan = document.getElementById("btnSaveMan");
const btnprogMan = document.getElementById("btnProgMan");

document.getElementById("openCSVfile").addEventListener("change", openFile);

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
            webserial.errorCalback = disconnected;
            buttonLabel = "Disconnect";
            // enableButtons(true);
            webserial.sendSerial(programmer.getFirmwareV());
            setTimeout(() => {
                webserial.sendSerial(programmer.getFirmwareV());
            }, "100");
            setTimeout(() => {
                webserial.sendSerial(programmer.getFirmwareV());
            }, "200");

        }
    }
    // change button label:
    document.getElementById("btnCon").value = buttonLabel;
}

function okToSend() {
    let r = false;
    if (webserial) {
        if (webserial.port) {
            r = true;
        }
    }
    if (waitforRepy == false)
        r = false;
    return r;
}

// callback from serial receiver, set buttons and clears ret text
function pgCb(cmd, data) {
    // disconnect
    if (cmd == 0x00) {
        enableButtons(false);
        document.getElementById("firmwareReturn").innerHTML = "";
        document.getElementById("returnData").innerHTML = " ";
    }
    if (cmd == parser.usbcom['getfirmware']) {
        document.getElementById("firmwareReturn").innerHTML = String.fromCharCode.apply(null, data);
        enableButtons(true);
    }
    switch (cmd) {
        case parser.usbcom['programsave']:
            {
                let num = data[0] << 8;
                num |= data[1];
                document.getElementById("returnData").innerHTML = "saved ";
                document.getElementById("returnData").innerHTML += num;
                document.getElementById("returnData").innerHTML += " addresses to custom slot";
                enableButtons(true);

            }
            break;
        case parser.usbcom['programstd']:
        case parser.usbcom['programarr']:
            {
                let num = data[0] << 8;
                num |= data[1];
                document.getElementById("returnData").innerHTML = "programmed ";
                document.getElementById("returnData").innerHTML += num / 10;
                document.getElementById("returnData").innerHTML += "m ledstrip";
                enableButtons(true);

            } break;
        default:
            break;

    }
}

function disconnected(e) {
    console.log(e);
    delete webserial.port;
    document.getElementById("btnCon").value = "Connect";
    enableButtons(false);
    pgCb(0x00, 0x00);
}

function enableButtons(e) {
    btnprogSimple.disabled = !e;

    btnsaveShape.disabled = !e;
    btnprogShape.disabled = !e;

    btnsaveMan.disabled = !e;
    btnprogMan.disabled = !e;
    waitforRepy = e;
}
function progSimple() {
    if (okToSend()) {
        let addres = document.getElementById("address").value - 1;
        let patt = document.getElementsByName("pattern");
        let mode = document.getElementById("mode").value - 1;
        let pattsize = document.getElementById("segsize").value;
        let pattern;
        for (let i = 0; i < patt.length; i++) {
            if (patt[i].checked) {
                pattern = patt[i].id;
            }
        }
        webserial.sendSerial(programmer.programStd(addres, pattern, mode, pattsize));
        enableButtons(false);
    }
}

function progShape() {
    if (okToSend()) {
        webserial.sendSerial(programmer.programArr(lastSpecialPat));
        enableButtons(false);
    }

}
function saveShape() {
    if (okToSend()) {
        webserial.sendSerial(programmer.saveArr(lastSpecialPat));
        enableButtons(false);
    }
}

function progMan() {
    if (okToSend()) {
        enableButtons(false);
        webserial.sendSerial(programmer.programArr(lastMan));
    }
}

function saveMan() {
    if (okToSend()) {
        enableButtons(false);
        webserial.sendSerial(programmer.saveArr(lastMan));
    }
}
function updateManAddr() {
    let content = " ";
    for (let i = 0; i < lastMan.length; i++) {
        if (i % 10 == 0) {
            content += "<b>";
        }
        if (i < 10)
            content += "&nbsp;";
        if (i < 100)
            content += "&nbsp;";

        content += lastMan[i] + 1;
        content += ",";
        content += " ";
        if (i % 10 == 0) {
            content += "</b>";
        }

        if (i % 5 == 4) {
            content += "<br>";
        }
    }
    document.getElementById("manOutpList").innerHTML = content;
}

function openFile(e) {
    let file = e.target.files[0];
    if (!file) {
        return;
    }
    let reader = new FileReader();
    reader.onload = function (e) {
        let contents = e.target.result;
        let split = contents.split(/(?:[,\s]+)/)
        let newArr = [];
        for (let i = 0; i < split.length; i++) {
            let num = parseInt(split[i]);
            if (num)
                newArr.push(num - 1)
        }
        let cplen = newArr.length;
        if (newArr.length > 128)
            cplen = 128;
        let maskarr = [cplen];
        // mask to max 512
        for (let i = 0; i < cplen; i++)
            maskarr[i] = (newArr[i] & 0x01ff);
        lastMan = maskarr;
        updateManAddr();

    };
    reader.readAsText(file);
}


function setTestpat() {
    if (okToSend()) {
        let speed = 31 - document.getElementById("testPattSpeed").value;
        let patt = document.getElementsByName("shape");
        let intensity = 4 - document.getElementById("testPattInt").value;
        let pattern;
        for (let i = 0; i < patt.length; i++) {
            if (patt[i].checked) {
                pattern = patt[i].id;
            }
        }
        console.log(programmer.setTestFig(pattern, speed, intensity));
        webserial.sendSerial(programmer.setTestFig(pattern, speed, intensity));
    }
}

function locateHead(el) {
    let prev = document.getElementsByClassName('locateHitemSel');
    let num = el.id;
    for (let i = 0; i < prev.length; i++) {
        prev[i].className = 'locateHitem';
    }
    if (okToSend())
        webserial.sendSerial(programmer.locateHead(num));
    el.className = 'locateHitemSel'
    // prev = el;

}

function setLocateincontent() {
    let innerd = ' ';
    for (let i = 0; i < 128; i++) {
        innerd += '<div class="locateHitem"';
        // innerd += (i)
        innerd += 'id="'
        innerd += (i);

        innerd += '" onmouseover="locateHead(this'
        // innerd += (i);
        innerd += ');"><b>';
        innerd += i + 1;
        innerd += '</b><br> @'
        innerd += (i * 4 + 1);
        innerd += '-';
        innerd += (i * 4 + 4);
        innerd += '</div>';
    }
    document.getElementById("locthead").innerHTML = innerd;
}

function changeProgShape() {
    let type = document.getElementsByName("advshape");
    let img = document.getElementById("shapeExample");
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
            img.src = "../img/cube.png";
            break;
        case "CUBE1M":
            arrlist = paternCube1m;
            img.src = "../img/cube.png";
            break;

        case "CUBE50CM":
            arrlist = paternCube50cm;
            img.src = "../img/cube.png";
            break;

        case "RANDOMDUB":
            arrlist = randomDoubles(120);
            img.src = "../img/cat.jpeg";
            break;

        case "RANDOMNODUB":
            arrlist = randomNoDoubles(120);
            img.src = "../img/cat.jpeg";
            break;
    }
    document.getElementById("advOutpList").innerHTML = undefined;
    let content = " ";
    for (let i = 0; i < arrlist.length; i++) {
        if (i % 10 == 0) {
            content += "<b>";
        }
        if (i < 10)
            content += "&nbsp;";
        if (i < 100)
            content += "&nbsp;";

        content += arrlist[i] + 1;
        content += ",";

        content += " ";
        if (i % 10 == 0) {
            content += "</b>";
        }

        if (i % 5 == 4) {
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
enableButtons(false);
setLocateincontent();

webserial.on("data", parser.parser.bind(parser));        // make the self accesable?

// try {
//     webserial.on("data", serialParser.parseData.bind(serialParser));        // make the self accesable?
// } catch {
//     console.log("not a compatible browser")
// }