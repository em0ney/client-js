const SipHash = require('siphash');
const SIPKEY = [ 0xdeadbeef, 0xcafebabe, 0x8badf00d, 0x1badb002 ];

module.exports = class Base {
  // TODO: Field max is 127 (or 7 bits)
  constructor(field) {
    this.field = field
  }

  /* Returns an 8-byte Buffer of the SIPHASHED term
   * with a field header */
  sipHashStrWithField(term) {
    const {h: h, l: l} = SipHash.hash(SIPKEY, term);
    const buff = Buffer.alloc(8);
    buff.writeUint32BE(h)
    buff.writeUint32BE(l, 4)

    /* First byte is the field (7-bits) and the LSB of the first siphash byte */
    buff.writeUint8((this.field << 1) + (buff.readUint8() & 1));
    return buff.readBigUint64BE();
  }

  performForQuery(_predicate, _constraint) {
    throw("analyser (" + this.constructor.name + ") does not implement performForQuery");
  }

  throwUnknownPredicate(predicate) {
    throw("unknown predicate '" + predicate + "' for " + this.constructor.name);
  }
}

