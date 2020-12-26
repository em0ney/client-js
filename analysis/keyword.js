
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
      throw("Unsupported predicate for Keyword type: '" + predicate + "'");
    }
  }
}

module.exports = Keyword;
