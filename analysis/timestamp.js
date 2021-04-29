
const Base = require('./base');
const UInt = require('./uint');

/* Doesn't support Timezone currently */
class Timestamp extends Base {
  constructor() {
    super()
    // FIXME: This is a bit shit - analyzers should use static methods?
    this.uint = new UInt()
  }

  /* Encodes the term as an integer and then
   * uses the UInt analyser */
  perform(term) {
    const date = this.parseDate(term)
    const encoded = this.encodeDate(date)

    return this.uint.perform(encoded)
  }

  encodeDate(date) {
    return Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getMilliseconds()
    )
  }

  parseDate(term) {
    if (term instanceof Date) {
      return term
    } else {
      const date = new Date(term)
      if (!isFinite(date)) {
        throw `Cannot parse invalid date: '${term}'`
      }
      return date
    }
  }

  // TODO: Test this
  performForQuery(predicate, term) {
    const encoded = this.encodeDate(term)
    return this.uint.performForQuery(predicate, encoded)
  }
}

module.exports = Timestamp
