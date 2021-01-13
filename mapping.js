const {Keyword, UInt, TypeAhead} = require('./analysis')

class Mapping {
  static from(fields) {
    const mapping = new Mapping()
    Object.entries(fields).forEach((entry) => {
      const [name, settings] = entry
      const {number, analyzer} = settings
      mapping.setField(name, Mapping.analyzer(number, analyzer))
    })
    return mapping
  }

  static analyzer(fieldNumber, analyzer) {
    switch(analyzer) {
      case 'keyword':
        return new Keyword(fieldNumber)

      case 'uint':
        return new UInt(fieldNumber)

      case 'typeahead':
        return new TypeAhead(fieldNumber)

      default:
        throw(`Unknown analyzer ${analyzer}`)
    }
  }

  constructor() {
    this.analyzers = {}
  }

  mapAll(record) {
    return Object.keys(this.analyzers).flatMap((field) => {
      const value = record[field]
      if (value) {
        return this.map(field, value)
      } else {
        return []
      }
    })
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
