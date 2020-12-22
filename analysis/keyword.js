const SipHash = require('siphash');
const SIPKEY = [ 0xdeadbeef, 0xcafebabe, 0x8badf00d, 0x1badb002 ];

const Base = require('./base');

class Keyword extends Base {
  perform() {
    const {h: h, l: l} = SipHash.hash(SIPKEY, this.term);
    const buff = Buffer.alloc(8);
    buff.writeUint32BE(h)
    buff.writeUint32BE(l, 4)

    /* First byte is the field (7-bits) and the LSB of the first siphash byte */
    buff.writeUint8((this.field << 1) + (buff.readUint8() & 1));

    // TODO: ORE Encrypt (in the caller but not here)
    return buff.readBigUint64BE();
  }
}

module.exports = Keyword;
