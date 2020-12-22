module.exports = class Base {
  // TODO: Field max is 127 (or 7 bits)
  constructor(field, term) {
    this.field = field
    this.term = term;
  }
}

