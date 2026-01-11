
function times() {
    let numofpix = document.getElementById('numpixels').value;
    let colorchans = 3;
    let chanbits = 8;
    let pixeltype = 'WS'
    let radiocolor = document.getElementById("colchans");
    let radiopixtype = document.getElementById("fixture");
    let radiobits = document.getElementById('channeldept');

    if ((!radiopixtype[2].checked) && (!radiopixtype[3].checked)) {
        if (radiocolor[1].checked) {
            colorchans = 4;
        }
    }

    if ((radiopixtype[0].checked) || (radiopixtype[1].checked)) {
        pixeltype = 'CIRCLE'
        if (radiobits[3].checked) {
            chanbits = 16;
        } else if (radiobits[2].checked) {
            chanbits = 14;
        } else if (radiobits[1].checked) {
            chanbits = 12;
        } else {
            chanbits = 8;
        }
    }

    if (radiopixtype[2].checked) {
        pixeltype = 'CL28'

    }
    writetimes(calctimes(numofpix, colorchans, chanbits, pixeltype));
}

// calt times based on 
function calctimes(pixels, channelspp, bitspp, pixeltype) {
    let timinusec = 100 // latchtime specified in most datsheets
    let bits = pixels * channelspp * bitspp;

    if (pixeltype == 'CL28') {
        while ((pixels % 48) != 0) {
            pixels++;
            bits += 8;
        }
        bits += 16;
    }
    if (pixeltype == 'CIRCLE') {
        timinusec = 300 // 250 main reset + 50 reset between 'work code' and data
        bits += (9 * 8); // 'work code 8 bytes, '
    }
    timinusec += (bits * 1.25);
    return [timinusec, bits];
}
// write times + warning
function writetimes(vals) {
    let timinus = vals[0]
    let channels = (vals[1] / 8).toFixed(0)
    let fps = 1000000 / timinus;
    let content = '';
    // console.log(timinus);

    if (timinus > 23000) // longer than a dmx frame
    {
        content += 'Warning! Framerate is lower than DMX-512! (at 43fps)';
        document.getElementById("fpsresult").style.backgroundColor = "red";
    } else {
        content += 'Max framerate can be higher than DMX-512';
        document.getElementById("fpsresult").style.backgroundColor = "";
    }
    content += '<br>';
    content += '<br>';

    content += 'Max fps:    ';
    content += fps.toFixed(2);
    content += ' Hz <br>';
    content += 'Minimal frame time: ';
    if (timinus < 1000) {
        content += timinus.toFixed(2);
        content += ' μs';
    }
    else if (timinus < 1000000) {
        content += (timinus / 1000).toFixed(2);
        content += ' ms';
    } else {
        content += (timinus / 1000000).toFixed(2);
        content += ' sec';
    }
    content += '<br>';
    content += 'Channels: ';

    content += channels;
        content += ', pulses: ';
    content += channels*8;

    document.getElementById("fpsdata").innerHTML = content;
};
