
const Base = require('./base');

class UInt57 extends Base {
  perform(term) {
    // TODO: Force conversion to Bigint - and test that
    const buff = Buffer.alloc(8);
    buff.writeBigUInt64BE(term)
    buff.writeUint8((this.field << 1) + (buff.readUint8() & 1));

    // TODO: ORE Encrypt (in the caller but not here)
    return buff.readBigUint64BE();
  }
}
 
module.exports = UInt57;
