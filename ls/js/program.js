class ProgramDataParse {
    constructor() {

    }
}

class ProgramDataGen {
    constructor() {
        this.usbcom = {
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
        // # 'enums' directions
        this.direction = {
            'forward': 0x00,
            'reverse': 0x01,
            'custom': 0x02,
            'patforward': 0x03,
            'patflip': 0x04,
            'patreverse': 0x05,
            'patreverseflip': 0x06,
            'double': 0x07,
            'doubleflip': 0x08,
            'doublereverseflip': 0x09,
            'zigzagdouble': 0x0a
        };
        // # 'enums' tespattern
        this.testfigure = {
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

    }

    getFirmwareV() {
        let data = [this.usbcom['usbstart'], this.usbcom['getfirmware'],
            0, 1, 0, 0, this.usbcom['usbend']];
        this.write(data);
        let r = this.ser.read(12);
        if (r.length < 10)
            return '000000';
        let c = list(r);
        let d = bytearray([0] * 6);
        this.write(data);
    }

    programStd(address, direction = 'forward', mode = 0, patternlen = 1) {
        let dir = 0;
        if (direction in this.direction) {
            dir = this.direction[direction];
        }
        let addressMSB = 0xff & (address >> 8);
        let addressLSB = address & 0xff;
        mode = 0xff & mode;
        let newArr = [this.usbcom['usbstart'], this.usbcom['programstd'], 0, 5, addressMSB, addressLSB, mode, dir, patternlen, 0, this.usbcom['usbend']];
        return (this.write(newArr));
    }
    programArr(intArr) {
        let length = intArr.length
        // # from short to byte = x2, 1 for the len of the short
        let newArr = [this.usbcom['usbstart'], this.usbcom['programarr'], (0xff & (length * 2) >> 8), (0xff & (length * 2))];
        for (let i = 0; i < intArr.length; i++) {
            newArr.push((0xff & (intArr[i] >> 8)));
            newArr.push(0xff & intArr[i]);
        }
        newArr.push(0);
        newArr.push(this.usbcom['usbend']);
        return (this.write(newArr));
    }

    saveArr(intArr) {
        let length = intArr.length
        let newArr = [this.usbcom['usbstart'], this.usbcom['programsave'], (0xff & (length * 2) >> 8), (0xff & (length * 2))];
        for (let i = 0; i < intArr.length; i++) {
            newArr.push((0xff & (intArr[i] >> 8)));
            newArr.push(0xff & intArr[i]);
        }
        newArr.push(0);
        newArr.push(this.usbcom['usbend']);
        return (this.write(newArr));
    }

    locateHead(headnum, address = 0) {
        let newArr;
        headnum = headnum & 0x7f;
        if (address == 0)
            newArr = [this.usbcom['usbstart'], this.usbcom['sethighlite'],
                0, 1, headnum & 0xff, 0, this.usbcom['usbend']]
        else {
            newArr = [this.usbcom['usbstart'], this.usbcom['sethighlite'], 0, 3, headnum &
                0xff, 0xff & (address >> 8), address & 0xff, 0, this.usbcom['usbend']]
        }
        return (this.write(newArr));
    }

    setTestFig(figure, speed, intensity) {
        let newArr;
        let fig = 0;
        if (figure in this.testfigure)
            fig = this.testfigure[figure];
        newArr = [this.usbcom['usbstart'], this.usbcom['settestpat'], 0, 3, fig, speed, intensity, 0, this.usbcom['usbend']];
        return (this.write(newArr));
    }

    setStaticCol(r, g, b, w, address = 0) {
        if (r >= 0 && r <= 1 && g >= 0 && g <= 1 && b >= 0 && b <= 1 && w >= 0 && w <= 1) {
            let newArr = [];
            if (address == 0) {
                newArr = [this.usbcom['usbstart'], this.usbcom['setstatic'], 0, 4, parseInt((
                    r * 255).toFixed(0)), parseInt((g * 255).toFixed(0)), parseInt((b * 255).toFixed(0)), parseInt((w * 255).toFixed(0)), 0, this.usbcom['usbend']]
            }
            else {
                newArr = [this.usbcom['usbstart'], this.usbcom['setstatic'], 0, 6, parseInt((
                    r * 255).toFixed(0)), parseInt((g * 255).toFixed(0)), parseInt((b * 255).toFixed(0)), parseInt((w * 255).toFixed(0)), , 0xff & (address >> 8), address & 0xff, 0, this.usbcom['usbend']]
            }
            return (this.write(newArr));
        }
        else {
            console.log("must be in flaot type range 0-1")
        }
    }

    calcXOR(arr) {
        let xor;
        for (let i = 4; i < arr.length - 2; i++) {
            xor ^= arr[i];
        }
        return xor;
    }
    checkXOR(arr) {
        let xor = 0;
        for (let i = 4; i < arr.length - 2; i++) {
            xor ^= arr[i];
        }
        if (xor == arr[(arr.length - 2)])
            return true;
        else
            return false;
    }

    write(arr) {
        arr[arr.length - 2] = this.calcXOR(arr);
        let bytes = new Uint8Array(arr.length);
        for (let i = 0; i < arr.length; i++) {
            bytes[i] = arr[i];
        }
        return bytes;
    }
}
