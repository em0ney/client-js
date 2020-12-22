
const Base = require('./base');

class UInt57 extends Base {
  perform() {
    const buf = Buffer.alloc(8);
    buff.writeUint64BE(this.term)
    buff.writeUint8((this.field << 1) + (buff.readUint8() & 1));

    // TODO: ORE Encrypt (in the caller but not here)
    return buff.readBigUint64BE();
  }
}
 
module.exports = UInt57;
