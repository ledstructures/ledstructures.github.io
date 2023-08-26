// winchcontroller 2023 ledstructures
// enums in JS are weird!!
const USB_WINCH_START_MESS = 0x3c;
const USB_WINCH_END_MESS = 0xc3;

// basic set and get
const USB_WINCH_GET = 0x00;
const USB_WINCH_SET = 0x80;

// all commands are b0-6 an combined with 0x80 to set, or 0x00 to get

// 1byte commands. If the playload is bigger, dont set it
const USB_WINCH_COMMAND_LINKMODE = 0x01; // datatype LINKMODE
const USB_WINCH_COMMAND_TYPE = 0x02;     // datatype WINCHTYPE

// 1byte commands 0-255 range avail.
const USB_WINCH_COMMAND_DEVIATION_A = 0x50; // winch A has this atribute, but is never used. A is always a cunductor
const USB_WINCH_COMMAND_DEVIATION_B = 0x51;
const USB_WINCH_COMMAND_DEVIATION_C = 0x52;
const USB_WINCH_COMMAND_DEVIATION_D = 0x53;

// // 1byte commands 0-255 range avail.  // note in reversed
const USB_WINCH_COMMAND_TRIM_DOWN = 0x54;
const USB_WINCH_COMMAND_TRIM_UP = 0x55;

// // 1byte commands 0-255 range avail.  // note in reversed
const USB_WINCH_COMMAND_TRIMCD_DOWN = 0x56;
const USB_WINCH_COMMAND_TRIMCD_UP = 0x57;

// 2byte commands MSB first. If the playload is bigger, dont set it.
// must be an unsigned short (u16). 0-511. Wil be masked at 0x01ff.
const USB_WINCH_COMMAND_ADDRES_A = 0x40;
const USB_WINCH_COMMAND_ADDRES_B = 0x41;
const USB_WINCH_COMMAND_ADDRES_C = 0x42;
const USB_WINCH_COMMAND_ADDRES_D = 0x43;

const USB_WINCH_COMMAND_ADDRES_SAFETY = 0x4a;

// // 1byte commands 0-255 range avail. 
const USB_WINCH_COMMAND_LIN_POS_B = 0x30;
const USB_WINCH_COMMAND_LIN_POS_C = 0x31;


// max 8 byte command, but shrter is alowed. reply is always 8.
const USB_WINCH_COMMAND_NAME = 0x61;

// 0 byte command.
const USB_WINCH_COMMAND_SAVE = 0xAA; //should return 0x55; 


const WinchTypes = {
    TYORBISFLY5: Symbol("orbi9"),
    TYORBISFLY9: Symbol("orbi5"),
    TYDLB: Symbol("dlb")
}

const WinchModes = {
    LIFOLLOWA: Symbol("followA"),
    LIFOLLOWPREV: Symbol("followPrev"),
    LIDUBBLEPAIR: Symbol("dubble"),
    LI3INLINE: Symbol("line3"),
    LI4INLINE: Symbol("line4")
}

const usbState =
{
    USBSSTART: Symbol("UsbStart"),
    USBSCOMM: Symbol("UsbComm"),
    USBSSIZE: Symbol("UsbSize"),
    USBSPAYLOAD: Symbol("UsbPayload"),
    USBEND: Symbol("UsbEnd")
}

// bij gebrek aan een struct....
class WinchSettings {
    constructor() {
        // declare with a val to each attribute?!
        this.type;
        this.mode;

        this.WinchAaddr;
        this.WinchBaddr;
        this.WinchCaddr;
        this.WinchDaddr;

        this.WinchAdev;
        this.WinchBdev;
        this.WinchCdev;
        this.WinchDdev;

        // this.WinchAlinP;
        this.WinchBlinP;
        this.WinchClinP;
        // this.WinchDlinP;

        this.WinchTrimUp;
        this.WinchTrimDown;

        this.WinchTrimUpCD;
        this.WinchTrimDownCD;

        this.WinchSafetyAddr;

        this.name;
    }
    SetDefaults() {
        // declare with a val to each attribute?!
        this.type = WinchTypes.TYDLB;
        this.mode = WinchModes.LIFOLLOWA;

        this.WinchAaddr = 1;
        this.WinchBaddr = 11;
        this.WinchCaddr = 21;
        this.WinchDaddr = 31;

        this.WinchAdev = 16;
        this.WinchBdev = 16;
        this.WinchCdev = 16;
        this.WinchDdev = 16;

        // this.WinchAlinP = 128;
        this.WinchBlinP = 128;
        this.WinchClinP = 128;
        // this.WinchDlinP = 128;

        this.WinchTrimUp = 0;
        this.WinchTrimDown = 200;

        this.WinchTrimUpCD = 0;
        this.WinchTrimDownCD = 200;

        this.WinchSafetyAddr = 41;


        this.name = "winch1"
    }
    // ga ik hier nog echt nog setters en getters moeten maken voor elke wisseling van waarde?
}

class SerialWinchParser {

    constructor(winch) {
        this.ws = winch;
        this.state = usbState.USBSSTART;
        this.pktsize;
        this.command;
        this.incommingdata = new Uint8Array(16);
        // this.incommingdata = new Array(16);
        this.value;
        this.comComplete;
        this.count = 10;
    }

    endcommandcb() {
        console.log("complete packet received placeholder");
    }

    parseData(data) {
        ///hahaha data.detail.data
        // console.log(data)
        for (let i = 0; i < data.detail.data.length; i++) {
            this.parseByte(data.detail.data[i]);
        }


    }
    parseByte(bt) {
        // console.log(bt);
        // console.log(this.state);
        switch (this.state) {
            case usbState.USBSSTART:

                if (bt == USB_WINCH_START_MESS)
                    this.state = usbState.USBSCOMM;
                break;

            case usbState.USBSCOMM:
                this.command = bt;
                this.state = usbState.USBSSIZE;
                break;

            case usbState.USBSSIZE:
                this.pktsize = bt;
                this.pktcount = 0;
                this.count = 0;

                this.state = usbState.USBSPAYLOAD;
                break;

            case usbState.USBSPAYLOAD:
                this.incommingdata[this.count] = bt;
                this.count++;
                if (this.count >= this.pktsize)
                    this.state = usbState.USBEND;
                break;

            case usbState.USBEND:

                if (bt == USB_WINCH_END_MESS) {
                    // only run complet f on correct endbyte
                    this.dataComplete();
                }
                this.state = usbState.USBSSTART;
                break;

            default:
                this.state = usbState.USBSSTART;
                break;
        }
    }
    dataComplete() {
        if (this.pktsize == 1) {
            this.value = this.incommingdata[0]; // parse as 8bit

        } else if (this.pktsize == 2) {
            //litlebit of shifitng here and there
            this.value = this.incommingdata[1];
            this.value |= (8 << this.incommingdata[0])
        } else {
            // ;
            // do something with the name
            //
            // does this work?!?!?
            this.value = "";
            for (let i = 0; i < this.pktsize; i++) {
                this.value += String.fromCharCode(parseInt(array[i], 2));
            }
        }
        switch (this.command) {

            // 1byt commands
            case USB_WINCH_COMMAND_LINKMODE:
                this.ws.mode = this.value;
                break;

            case USB_WINCH_COMMAND_TYPE:
                this.ws.type = this.value;
                break;

            // deviatons
            case USB_WINCH_COMMAND_DEVIATION_A:
                this.ws.WinchAdev = this.value;
                break;

            case USB_WINCH_COMMAND_DEVIATION_B:
                this.ws.WinchBdev = this.value;
                break;

            case USB_WINCH_COMMAND_DEVIATION_C:
                this.ws.WinchCdev = this.value;
                break;

            case USB_WINCH_COMMAND_DEVIATION_D:
                this.ws.WinchDdev = this.value;
                break;

            case USB_WINCH_COMMAND_DEVIATION_D:
                this.ws.WinchDdev = this.value;
                break;
            //trim
            case USB_WINCH_COMMAND_TRIM_DOWN:
                this.ws.WinchDdev = this.value;
                this.ws.WinchTrimDown = this.value;
                break;

            case USB_WINCH_COMMAND_TRIM_UP:
                this.ws.WinchTrimUp = this.value;
                break;

            case USB_WINCH_COMMAND_TRIMCD_DOWN:
                this.ws.WinchTrimDownCD = this.value;
                break;

            case USB_WINCH_COMMAND_TRIMCD_UP:
                this.ws.WinchTrimUpCD = this.value;
                break;


            //dmx addresses // 2byt vals
            case USB_WINCH_COMMAND_ADDRES_A:
                this.ws.WinchAaddr = this.value;
                break;

            case USB_WINCH_COMMAND_ADDRES_B:
                this.ws.WinchBaddr = this.value;
                break;

            case USB_WINCH_COMMAND_ADDRES_C:
                this.ws.WinchCaddr = this.value;
                break;

            case USB_WINCH_COMMAND_ADDRES_D:
                this.ws.WinchDaddr = this.value;
                break;

            case USB_WINCH_COMMAND_ADDRES_SAFETY:
                this.ws.WinchSafetyAddr = this.value;
                break;

            case USB_WINCH_COMMAND_NAME:
                this.ws.WinchSafetyAddr = this.value;
                break;

            default:
                break;

        }

        // if(this.endcommandcb)
        this.endcommandcb();
    }
}

class SerialWinchSender {
    constructor() {
        // this.sendatacb; // pointer to serial obj.sendblbala
        this.pktsize;
    }
    sendatacb(d) {
        console.log(d);
        console.log("datasender placeholder")
            ;
    }
    reqAllData() {
        this.reqMode();
        this.reqType();

        this.reqAddrA();
        this.reqAddrB();
        this.reqAddrC();
        this.reqAddrD();
        this.reqAddrSaf();

        this.reqDevA();
        this.reqDevB();
        this.reqDevC();
        this.reqDevD();

        this.reqLinB();
        this.reqLinC();

        this.reqTrimDown();
        this.reqTrimDownCD();
        this.reqTrimUp();
        this.reqTrimUpCD();

        this.reqName();
    }
    setAllData(winch) {
        // this.setMode(winch);
        // this.setType(winch);

        this.setAddrA(winch);
        this.setAddrB(winch);
        this.setAddrC(winch);
        this.setAddrD(winch);
        this.setAddrSaf(winch);

        this.setDevA(winch);
        this.setDevB(winch);
        this.setDevC(winch);
        this.setDevD(winch);

        this.setLinB(winch);
        this.setLinC(winch);

        this.setTrimDown(winch);
        this.setTrimDownCD(winch);
        this.setTrimUp(winch);
        this.setTrimUpCD(winch);

        this.setName(winch);
    }

    set1Byte(command, value) {
        this.outgoingdata = new Uint8Array(5);
        this.outgoingdata[0] = USB_WINCH_START_MESS | USB_WINCH_SET;
        this.outgoingdata[1] = command;
        this.outgoingdata[2] = 0x01;
        this.outgoingdata[3] = 0xff & value; // mask?
        this.outgoingdata[4] = USB_WINCH_END_MESS;
        this.pktsize = 5;
        this.sendatacb(this.outgoingdata);
    }

    set2Byte(command, value) {
        this.outgoingdata = new Uint8Array(6);
        this.outgoingdata[0] = USB_WINCH_START_MESS | USB_WINCH_SET;
        this.outgoingdata[1] = command;
        this.outgoingdata[2] = 0x02;
        this.outgoingdata[3] = 0xff & (value >> 8); // mask?
        this.outgoingdata[4] = 0xff & value; // mask?
        this.outgoingdata[5] = USB_WINCH_END_MESS;
        this.pktsize = 6;
        this.sendatacb(this.outgoingdata);
    }

    set11Byte(command, value) {
        // assuming its a string, just pad everything with spaces?
        value.padStart(8, ' ');
        let encoder = new TextEncoder();
        let bytes = encoder.encode(value);
        this.outgoingdata = new Uint8Array(11);
        this.outgoingdata[0] = USB_WINCH_START_MESS | USB_WINCH_SET;
        this.outgoingdata[1] = command;
        for (let i = 0; i < bytes.length; i++) {
            this.outgoingdata[i + 2] = bytes[i];
        }
        this.outgoingdata[10] = USB_WINCH_END_MESS;
        this.pktsize = 11;
        this.sendatacb(this.outgoingdata);
    }

    reqByte(command) {
        this.outgoingdata = new Uint8Array(3);
        this.outgoingdata[0] = USB_WINCH_START_MESS;
        this.outgoingdata[1] = command;
        this.outgoingdata[2] = USB_WINCH_END_MESS;
        this.pktsize = 3;
        this.sendatacb(this.outgoingdata);
    }


    // special snowflake!
    setSAve() {

        this.outgoingdata = new Uint8Array(3);
        this.outgoingdata[0] = USB_WINCH_START_MESS | USB_WINCH_SET;
        this.outgoingdata[1] = USB_WINCH_COMMAND_SAVE;
        this.outgoingdata[2] = USB_WINCH_END_MESS;
        this.pktsize = 3;
        this.sendatacb(this.outgoingdata);
    }

    reqMode() {
        this.reqByte(USB_WINCH_COMMAND_LINKMODE);
    }

    reqType() {
        this.reqByte(USB_WINCH_COMMAND_TYPE);
    }
    // deviatons
    reqDevA() {
        this.reqByte(USB_WINCH_COMMAND_DEVIATION_A);
    }
    reqDevB() {
        this.reqByte(USB_WINCH_COMMAND_DEVIATION_B);
    }
    reqDevC() {
        this.reqByte(USB_WINCH_COMMAND_DEVIATION_C);
    }
    reqDevD() {
        this.reqByte(USB_WINCH_COMMAND_DEVIATION_D);
    }
    // trim
    reqTrimUp() {
        this.reqByte(USB_WINCH_COMMAND_TRIM_UP);
    }
    reqTrimDown() {
        this.reqByte(USB_WINCH_COMMAND_TRIM_DOWN);
    }
    reqTrimUpCD() {
        this.reqByte(USB_WINCH_COMMAND_TRIMCD_UP);
    }
    reqTrimDownCD() {
        this.reqByte(USB_WINCH_COMMAND_TRIMCD_DOWN);
    }

    // linpos
    reqLinB() {
        this.reqByte(USB_WINCH_COMMAND_LIN_POS_B)
    }
    reqLinC() {
        this.reqByte(USB_WINCH_COMMAND_LIN_POS_C)
    }

    // addresses
    reqAddrA() {
        this.reqByte(USB_WINCH_COMMAND_ADDRES_A);
    }
    reqAddrB() {
        this.reqByte(USB_WINCH_COMMAND_ADDRES_B);
    }
    reqAddrC() {
        this.reqByte(USB_WINCH_COMMAND_ADDRES_C);
    }
    reqAddrD() {
        this.reqByte(USB_WINCH_COMMAND_ADDRES_D);
    }
    reqAddrSaf() {
        this.reqByte(USB_WINCH_COMMAND_ADDRES_SAFETY);
    }

    reqName() {
        this.reqByte(USB_WINCH_COMMAND_NAME);
    }


    // setters
    setMode(winch) {
        this.set1Byte(USB_WINCH_COMMAND_LINKMODE, winch.mode);
    }
    setType(winch) {
        this.set1Byte(USB_WINCH_COMMAND_TYPE, winch.type);
    }
    // deviatons
    setDevA(winch) {
        this.set1Byte(USB_WINCH_COMMAND_DEVIATION_A, winch.WinchAdev);
    }

    setDevB(winch) {
        this.set1Byte(USB_WINCH_COMMAND_DEVIATION_B, winch.WinchAdev);
    }

    setDevC(winch) {
        this.set1Byte(USB_WINCH_COMMAND_DEVIATION_C, winch.WinchAdev);
    }

    setDevD(winch) {
        this.set1Byte(USB_WINCH_COMMAND_DEVIATION_D, winch.WinchAdev);
    }

    // trim
    setTrimUp(winch) {
        this.set1Byte(USB_WINCH_COMMAND_TRIM_UP, winch.WinchTrimUp);
    }

    setTrimDown(winch) {
        this.set1Byte(USB_WINCH_COMMAND_TRIM_DOWN, winch.WinchTrimDown);
    }

    setTrimUpCD(winch) {
        this.set1Byte(USB_WINCH_COMMAND_TRIMCD_UP, winch.WinchTrimUpCD);
    }

    setTrimDownCD(winch) {
        this.set1Byte(USB_WINCH_COMMAND_TRIMCD_DOWN, winch.WinchTrimDownCD);
    }
    // linpos
    setLinB(winch) {
        this.set1Byte(USB_WINCH_COMMAND_LIN_POS_B, winch.WinchBlinP)
    }
    setLinC(winch) {
        this.set1Byte(USB_WINCH_COMMAND_LIN_POS_C, winch.WinchClinP)
    }

    // addresses
    setAddrA(winch) {
        this.set2Byte(USB_WINCH_COMMAND_ADDRES_A, winch.WinchAaddr);
    }
    setAddrB(winch) {
        this.set2Byte(USB_WINCH_COMMAND_ADDRES_B, winch.WincBAaddr);
    }
    setAddrC(winch) {
        this.set2Byte(USB_WINCH_COMMAND_ADDRES_C, winch.WinchCaddr);
    }
    setAddrD(winch) {
        this.set2Byte(USB_WINCH_COMMAND_ADDRES_D, winch.WinchDaddr);
    }
    setAddrSaf(winch) {
        this.set2Byte(USB_WINCH_COMMAND_ADDRES_SAFETY, winch.WinchSafetyAddr);
    }

    // name
    setName(winch) {
        this.set11Byte(USB_WINCH_COMMAND_NAME, winch.name);
    }


}