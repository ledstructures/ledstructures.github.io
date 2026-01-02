const htmltext = '  <nav>\
 <ul>\
 \
        <li class=" " id="lscom">           <a onclick="" href="https://www.ledstructures.com">    Ledstructures.com</a></li>\
        <li class=" " id="programmain">           <a onclick="" href="../ls/program.html">               Program LS</a></li>\
        <li class=" " id="pixelcalc">           <a onclick="" href="../pixel/pixelmain.html">           Pixel calculator</a></li>\
        <li class=" " id="unimain">           <a onclick="" href="../mq/chamsys_uni.html">           Magicq patch shift</a></li>\
        <li class=" " id="winchmain">           <a onclick="" href="../winch/winch.html">              Winch controller</a></li>\
    </ul >\
    </nav>\
    ';
{
    let oldelem = document.querySelector("script#navbar");
    let newelem = document.createElement("div");

    newelem.innerHTML = htmltext;
    oldelem.parentNode.replaceChild(newelem, oldelem);
    function higliteactive(higliteid) {
        document.getElementById(higliteid).classList.add('menu_active');
        console.log(higliteid);
    }

}