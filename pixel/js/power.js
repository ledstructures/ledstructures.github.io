function calcpowerpixel(meters, psu) {
    let current = 0;
    let linmultiplier = 1.58;
    let power = meters * linmultiplier;
    if (power >= psu)
        return [0, current, power];
    else {
        psu -= (meters * linmultiplier);
        while ((power < psu) && (current < 15)) {
            power += (meters * linmultiplier);
            current++;
        }
    }
    return [1, current, power];
}

function calcpowerflex(meters, psu) {
    let current = 255;
    let linmultiplier = 58;
    let power = meters * linmultiplier * (current / 255);
    while ((power > psu) && (current > 1)) {
        power = (meters * linmultiplier) * ((current / 255));
        current--;
    }
    if (power > psu)
        return [0, current, power];
    else
        return [1, current, power];

}

function writepower() {
    let watts = 200;
    let radiopsu = document.getElementById("psu");
    let radiofixture = document.getElementById("fixture");
    let content = '';
    console.log("popow")
    if (radiopsu[1].checked)
        watts = 300;

    if (radiofixture[2].checked)    // 8606
    {
        let result = calcpowerpixel(document.getElementById("nummeters").value, watts);
        content += '<div class="pixresults">';

        if (result[0] == 0) {
            content += '<div>';
            content += 'Warning! cant run on this psu!';
            content += '</div>';
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
        content += 'W @ full power';
        content += '</div>';
        content += '</div>';



    }
    if (radiofixture[3].checked)    // 8606
    {
        let result = calcpowerflex(document.getElementById("nummeters").value, watts);
        if (result[0] == 0) {
            content += 'Warning! cant run on this psu!';
            content += '<br>';
        }
        content += 'Device doenst have current limit parameters, so uses dimmer limit';
        content += '<br>';
        content += 'Dimmer limit Advatek: ';
        content += result[1];
        content += '<br>';
        content += 'Dimmer settings Magipix: ';
        content += result[1];
        content += '<br>';
        content += 'Should result in: ';
        content += result[2].toFixed(1);
        content += 'W @ full power';
    }
    document.getElementById("powerdata").innerHTML = content;


    // }
}