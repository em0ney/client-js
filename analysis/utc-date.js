const Base = require('./base');
const UInt = require('./uint');

class UTCDate extends Base {
  constructor() {
    super()
    this.uint = new UInt()
  }

  perform(term) {
    const date = this.parseDate(term)
    const encoded = this.encodeDate(date)
    return this.uint.perform(encoded)
  }

  encodeDate(date) {
    return Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    )
  }

  parseDate(term) {
    if (term instanceof Date) {
      return term
    } else {
      throw `Term is not a Date instance, got ${JSON.stringify(term)}`
    }
  }

  performForQuery(predicate, term) {
    const encoded = this.encodeDate(term)
    return this.uint.performForQuery(predicate, encoded)
  }
}

module.exports = UTCDate 