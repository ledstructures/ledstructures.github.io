const htmltext = '  <nav>\
 <ul>\
 \
 <li> <a href="https://www.ledstructures.com">Ledstructures.com</a></li>\
 <li> <a href="../ls/program.html">Program LS</a></li>\
        <li><a href="../mq/chamsys_uni.html">Magicq patch shift</a></li>\
        <li><a href="../winch/winch.html">Winch controller</a></li>\
    </ul >\
    </nav>\
    ';
{
    let oldelem = document.querySelector("script#navbar");
    let newelem = document.createElement("div");
    newelem.innerHTML = htmltext;
    oldelem.parentNode.replaceChild(newelem, oldelem);
}