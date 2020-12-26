module.exports = class Base {
  // TODO: Field max is 127 (or 7 bits)
  constructor(field) {
    this.field = field
  }

  performForQuery(_predicate, _constraint) {
    throw("analyser (" + this.constructor.name + ") does not implement performForQuery");
  }

  throwUnknownPredicate(predicate) {
    throw("unknown predicate '" + predicate + "' for " + this.constructor.name);
  }
}

