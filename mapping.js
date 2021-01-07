const Keyword = require('./analysis').Keyword

class Mapping {
  constructor() {
    this.analyzers = {}
  }

  mapAll(record) {
    // TODO
  }

  map(field, value) {
    return this.getField(field).perform(value)
  }

  // Handle single or an array of conditions
  query(field, condition) {
    const [predicate, value] = condition
    return this.getField(field).performForQuery(predicate, value)
  }

  setField(field, analyzer) {
    this.analyzers[field] = analyzer
    return this
  }

  getField(field) {
    let analyzer = this.analyzers[field]
    if (analyzer) {
      return analyzer;
    }
    throw("Field '" + field + "' not defined")
  }
}

module.exports = Mapping;
