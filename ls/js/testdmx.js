let c = document.getElementById("colorpicker");
let ctx = c.getContext("2d");
let img = document.getElementById("colorpickersrc");
ctx.drawImage(img, 0, 0, c.width, c.height);
c.addEventListener('click', function (ev) {
    let { x, y } = getCursorPosition(c, ev);
    let r = ctx.getImageData(x, y, 1, 1).data[0];
    let g = ctx.getImageData(x, y, 1, 1).data[1];
    let b = ctx.getImageData(x, y, 1, 1).data[2];
    setColorSliders(r, g, b);
});
staticSetCols();

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
}
