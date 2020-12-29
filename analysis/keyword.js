
const Base = require('./base');

class Keyword extends Base {
  perform(term) {
    return this.sipHashStrWithField(term);
  }

  // TODO: Test this
  performForQuery(predicate, term) {
    if (predicate == "==") {
      return this.perform(term);
    } else {
      this.throwUnknownPredicate(predicate);
    }
  }
}

module.exports = Keyword;
