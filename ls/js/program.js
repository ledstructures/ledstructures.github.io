class Programmer {

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
        this.dmxframe = [undefined] * 512;

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
        for (let i = 0; i < 6; i++) {
            ;
            //     d[i] = r[4 + i]
            // }
            // if (this.checkXOR(c)) {
            //     return d.decode("utf-8")
            // }
            // else {
            //     return '888888'
            // }
        }
    }

    programStd(address = 0, direction = 'forward', mode = 0, patternlen = 1) {
        let dir = 0;
        if (direction in this.direction) {
            dir = this.direction[direction];
        }
        let addressMSB = 0xff & (address >> 8);
        let addressLSB = address & 0xff;
        mode = 0xff & mode;
        let newArr = [this.usbcom['usbstart'], this.usbcom['programstd'], 0, 5, addressMSB, addressLSB, mode, dir, patternlen, 0, this.usbcom['usbend']];
        this.write(newArr);
        // return this.readStd()
    }
    programArr(intArr) {
        let length = intArr.length
        // # from short to byte = x2, 1 for the len of the short
        let newArr = [this.usbcom['usbstart'], this.usbcom['programarr'], (0xff & (length * 2) >> 8), (0xff & (length * 2))];
        for (let i = 0; i < intArr.length; i++) {
            newArr.push((0xff & (i >> 8)));
            newArr.push(0xff & i);
            newArr.push(0);
            newArr.push(this.usbcom['usbend']);
        }
        this.write(newArr)
        // return this.readStd()
    }

    saveArr(intArr) {
        let length = intArr.length
        let newArr = [this.usbcom['usbstart'], this.usbcom['programsave'], (0xff & (length * 2) >> 8), (0xff & (length * 2))];
        for (let i = 0; i < intArr.length; i++) {
            newArr.push((0xff & (i >> 8)));
            newArr.push(0xff & i);
            newArr.push(0);
            newArr.push(this.usbcom['usbend']);
        }
        this.write(newArr)
        // return this.readStd()
    }

    setDMX(dmxframe) {
        let newArr = [this.usbcom['usbstart'], this.usbcom['setdmx'], 0, 0,];
        let smallest = this.dmxframe.length;
        if (dmxframe.length < this.dmxframe.length) {
            smallest = dmxframe.length;
        }
        // # compare frames for speed only send the parts of a frame that differ
        let notequal = false
        length = 2// first two are startaddress
        i = 0
        while (i < smallest) {
            if (dmxframe[i] != this.dmxframe[i]) {
                length += 1
            }

            if (notequal == false) {
                notequal = true
                newArr.push(0xff & (i >> 8))
                newArr.push(0xff & i)
                newArr.push(dmxframe[i])
                this.dmxframe[i] = dmxframe[i]
            }

            else {
                if (notequal == true)
                    notequal = false
                newArr[2] = 0xff & (length >> 8)
                newArr[3] = 0xff & length
                newArr.push(0)
                newArr.push(this.usbcom['usbend'])
                this.write(newArr)
                length = 2
                newArr = [this.usbcom['usbstart'],
                this.usbcom['setdmx'], 0, 0,]
                i += 1
            }
        }
        // # if last vals differ
        if (notequal == true) {
            newArr[2] = 0xff & (length >> 8)
            newArr[3] = 0xff & length
            newArr.push(0)
            newArr.push(this.usbcom['usbend'])
            this.write(newArr)
        }
    }
    locateHead(headnum, address = 0) {
        let newArr = new Uint8Array(7);
        if (address == 0)
            newArr = [this.usbcom['usbstart'], this.usbcom['sethighlite'],
                0, 1, headnum & 0xff, 0, this.usbcom['usbend']]
        else {
            newArr = [this.usbcom['usbstart'], this.usbcom['sethighlite'], 0, 3, headnum &
                0xff, 0xff & (address >> 8), address & 0xff, 0, this.usbcom['usbend']]
        }
        this.write(newArr)
    }

    setStaticCol(r, g, b, w, address = 0) {
        if (r >= 0 && r <= 1 && g >= 0 && g <= 1 && b >= 0 && b <= 1 && w >= 0 && w <= 1) {
            let newArr = [];
            if (address == 0) {
                // let newArr = new Uint8Array(10);
                newArr = [this.usbcom['usbstart'], this.usbcom['setstatic'], 0, 4, parseInt((
                    r * 255).toFixed(0)), parseInt((g * 255).toFixed(0)), parseInt((b * 255).toFixed(0)), parseInt((w * 255).toFixed(0)), 0, this.usbcom['usbend']]
            }
            else {
                // let newArr = new Uint8Array(12);
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
        console.log(bytes);
        return bytes;

    }
    readStd() {
        reply = this.ser.read(9);
        // l = list(reply)
        x = false;
        y = 0;
        //     try {
        //         if (l[6] == this.xor) {
        //             x = true
        //             y = l[4] << 8 | l[5]
        //         }
        //         else
        //             x = false
        //     }
        // except{
        //         x = false
        //     }
        //     return x, y
    }

    setport(port) {
        this.serPortName = port;
    }
    connect(self) {
        serdata = [0] * 10;
        this.ser.baudrate = 9600;
        this.ser.port = this.serPortName;
        this.ser.stopbits = 1;
        // # timout is pretty long, but programming takes at least 3200ms, so wait for a reply after programming is done.
        this.ser.timeout = 6;
        this.ser.open();
        // #write a bunch of zeros to trigger the connect itc in the programmer, 
        if (this.ser.is_open) {
            bytes = bytearray(serdata);
            this.ser.write(bytes);
            // #wait a little while until the programmer has been set in usb data receiver mode, might need to draw a displayor something....
            time.sleep(0.3);
        }
    }
}
