function calcpowerpixel(meters, psu) {
    let current = 0;
    let linmultiplier = 1.58; // w per meter per step
    let power = meters * linmultiplier;
    const ret = [0, current, power];
    for (let i = 1; i <= 16; i++) {
        ret.push((meters * linmultiplier) * i);
    }
    if (power >= psu)
        return ret;
    else {
        psu -= (meters * linmultiplier);
        while ((power < psu) && (current < 15)) {
            power += (meters * linmultiplier);
            current++;
        }
    }
    ret[0] = 1;
    ret[1] = current;
    ret[2] = power;
    return ret;
}

function calcpowerflex(meters, psu) {
    let current = 0;
    let linmultiplier = .195;
    let basepower = 6.8 * meters;
    let power = basepower;
    while ((psu > (power + (meters * linmultiplier))) && (current < 255)) {
        power += (meters * linmultiplier);
        current++;
    }
    if (power > psu)
        return [0, current, power];
    else
        return [1, current, power];

}


function calcpowerneonrgbw(meters, psu) {
    let current = 0;
    let linmultiplier = .126;
    let basepower = 3.9 * meters;
    let power = basepower;
    while ((psu > (power + (meters * linmultiplier))) && (current < 255)) {
        power += (meters * linmultiplier);
        current++;
    }
    if (power > psu)
        return [0, current, power];
    else
        return [1, current, power];

}

function calcpowerneonrgb(meters, psu) {
    let current = 0;
    let linmultiplier = .098;
    let basepower = 3.6 * meters;
    let power = basepower;
    while ((psu > (power + (meters * linmultiplier))) && (current < 255)) {
        power += (meters * linmultiplier);
        current++;
    }
    if (power > psu)
        return [0, current, power];
    else
        return [1, current, power];

}

function calcpowercirclergb(meters, psu) {
    let current = 0;
    let linmultiplier = 13.5; // 1.5a/1/2meterm *24 * 3 channels /16
    let basepower = 12 // .5A cont
    let power = (basepower * meters) + (meters * linmultiplier);
    const ret = [0, current, power];
    for (let i = 1; i <= 16; i++) {
        ret.push((basepower * meters) + ((meters * linmultiplier) * i));
    }
    if (power >= psu)
        return ret;
    else {
        psu -= (meters * linmultiplier);
        while ((power < psu) && (current < 15)) {
            power += (meters * linmultiplier);
            current++;
        }
    }
    ret[0] = 1;
    ret[1] = current;
    ret[2] = power;
    return ret;
}

function calcpowercirclergbw(meters, psu) {
    let current = 0;
    // let linmultiplier = 16.8; // 1.5a/1/2meterm *24 * 4 channels /16 steps
    let linmultiplier = 18; // 1.5a/1/2meterm *24 * 4 channels /16 steps
    let basepower = 12 // .5 a cont
    let power = (basepower * meters) + (meters * linmultiplier);
    const ret = [0, current, power];
    for (let i = 1; i <= 16; i++) {
        ret.push((basepower * meters) + ((meters * linmultiplier) * i))
    }
    if (power >= psu)
        return ret;
    else {
        psu -= (meters * linmultiplier);
        while ((power < psu) && (current < 15)) {
            power += (meters * linmultiplier);
            current++;
        }
    }
    ret[0] = 1;
    ret[1] = current;
    ret[2] = power;
    return ret;
}

function calcpowertubergb(meters, psu) {
    let current = 0;
    let linmultiplier = 13.5 / 4; // 1.5a/1/2meterm *24 * 3 channels /16
    let basepower = 12 / 4; // .5A cont
    let power = (basepower * meters) + (meters * linmultiplier);
    const ret = [0, current, power];
    for (let i = 1; i <= 16; i++) {
        ret.push((basepower * meters) + ((meters * linmultiplier) * i));
    }
    if (power >= psu)
        return ret;
    else {
        psu -= (meters * linmultiplier);
        while ((power < psu) && (current < 15)) {
            power += (meters * linmultiplier);
            current++;
        }
    }
    ret[0] = 1;
    ret[1] = current;
    ret[2] = power;
    return ret;
}

function calcpowertubergbw(meters, psu) {
    let current = 0;
    // let linmultiplier = 16.8; // 1.5a/1/2meterm *24 * 4 channels /16 steps
    let linmultiplier = 18 / 4; // 1.5a/1/2meterm *24 * 4 channels /16 steps
    let basepower = 12 / 4; // .5 a cont
    let power = (basepower * meters) + (meters * linmultiplier);
    const ret = [0, current, power];
    for (let i = 1; i <= 16; i++) {
        ret.push((basepower * meters) + ((meters * linmultiplier) * i))
    }
    if (power >= psu)
        return ret;
    else {
        psu -= (meters * linmultiplier);
        while ((power < psu) && (current < 15)) {
            power += (meters * linmultiplier);
            current++;
        }
    }
    ret[0] = 1;
    ret[1] = current;
    ret[2] = power;
    return ret;
}

function writepower() {
    let watts = 200;
    let radiopsu = document.getElementById("psu");
    let radiofixture = document.getElementById("fixture");
    let radiocolorchans = document.getElementById("colchans");
    let content = '';
    if (radiopsu[1].checked)
        watts = 300;

    if ((radiofixture[0].checked) || (radiofixture[1].checked) || (radiofixture[2].checked))   // circle /tube
    {
        let result;
        // circle
        if (radiofixture[0].checked) {
            if (radiocolorchans[0].checked)
                result = calcpowercirclergb(document.getElementById("nummeters").value, watts);
            else
                result = calcpowercirclergbw(document.getElementById("nummeters").value, watts);
        }
        // tube
        if (radiofixture[1].checked) {
            if (radiocolorchans[0].checked)
                result = calcpowertubergb(document.getElementById("nummeters").value, watts);
            else
                result = calcpowertubergbw(document.getElementById("nummeters").value, watts);
        }
        if (radiofixture[2].checked) {
            result = calcpowerpixel(document.getElementById("nummeters").value, watts);
        }
        content += '<div class="pixresults">';

        if (result[0] == 0) {
            content += '<div>';
            content += "Warning! can't run on this psu!";
            content += '</div>';
            document.getElementById("powerresults").style.backgroundColor = "red";

        } else {
            document.getElementById("powerresults").style.backgroundColor = "";

        }

        content += '<div>';

        content += 'Fixture has global ic-current settings, keeping full resolution';
        content += '</div>';

        content += '<div>';

        content += 'Current settings Advatek: ';
        // content += '</td><td>';

        content += result[1];
        content += '</div>';

        content += '<div>';
        content += 'Dimmer settings Magipix: ';
        // content += '</td><td>';

        content += (result[1] * 16) + 15;
        content += '</div>';
        content += '<div>';
        content += 'Should result in: ';
        // content += '</td><td>';
        content += result[2].toFixed(1);
        content += 'W @ full on';
        content += '</div>';
        content += '<div>';
        content += 'Powerconsumption per step: '
        content += '</div>';

        for (let i = 0; i < 16; i++) {
            content += '<div>';
            content += 'step: '
            content += i;
            content += ' (';
            content += (i * 16) + 15;
            content += ') ';

            content += result[i + 3].toFixed(1);
            content += ' W';



            content += '</div>';

        } content += '</div>';
    }

    if (radiofixture[3].checked)    // flex
    {
        let result = calcpowerflex(document.getElementById("nummeters").value, watts);
        if (result[0] == 0) {
            content += "Warning! can't run on this psu!";
            content += '<br>';
        }
        content += 'Device does not have current limit parameters, so uses dimmer limit';
        content += '<br>';
        content += 'Dimmer limit Advatek: ';
        content += result[1];
        content += '<br>';
        content += 'Dimmer settings Magipix: ';
        content += result[1];
        content += '<br>';
        content += 'Should result in: ';
        content += result[2].toFixed(1);
        content += 'W @ full on';
    }
    if (radiofixture[4].checked)    // neon
    {
        let result;
        // color/chans
        if (radiocolorchans[0].checked)
            result = calcpowerneonrgb(document.getElementById("nummeters").value, watts);
        else
            result = calcpowerneonrgbw(document.getElementById("nummeters").value, watts);

        if (result[0] == 0) {
            content += "Warning! can't run on this psu!";
            content += '<br>';
        }
        content += 'Device does not have current limit parameters, so uses dimmer limit';
        content += '<br>';
        content += 'Dimmer limit Advatek: ';
        content += result[1];
        content += '<br>';
        content += 'Dimmer settings Magipix: ';
        content += result[1];
        content += '<br>';
        content += 'Should result in: ';
        content += result[2].toFixed(1);
        content += 'W @ full on';
    }



    document.getElementById("powerdata").innerHTML = content;


    // }
}