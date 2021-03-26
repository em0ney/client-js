const { Keyword, UInt, TypeAhead } = require("./analysis");
const ORE = require("@cipherstash/ore");

class Mapping {
  static analyzer(fieldNumber, analyzer) {
    switch (analyzer) {
      case "keyword":
        return new Keyword(fieldNumber);

      case "uint":
        return new UInt(fieldNumber);

      case "typeahead":
        return new TypeAhead(fieldNumber);

      default:
        throw `Unknown analyzer ${analyzer}`;
    }
  }

  /*
    fieldMappings is an object shaped like this:
    {
      0: { name: "email", analyzer: __, key: _},
      1: { name: "age", analyzer: __, key: _},
    }
  */
  constructor(fieldMappings) {
    this.analyzers = {};
    // TODO: `fieldNumber`is a string encoding of an integer right now but will be a UUID soon
    // There is lower level code that depends on it being an integer right now.
    Object.entries(fieldMappings).forEach(
      ([fieldNumber, { name, analyzer, key }]) => {
        this.analyzers[name] = {
          analyzer: Mapping.analyzer(fieldNumber, analyzer),
          key,
        };
      }
    );
  }

  mapAll(record) {
    return Object.keys(this.analyzers).flatMap((field) => {
      const value = record[field];
      if (value) {
        const mapped = this.map(field, value)
        return mapped
      } else {
        return [];
      }
    });
  }

  map(field, value) {
    const { analyzer, key } = this.getField(field);
    const termBuffers = analyzer.perform(value);

    // FIXME: Just keep the 2 keys (prf/prp) as separate fields within the settings (in stash)
    // TODO: Probably should have a format version for the field settings as well
    const fieldKeyBuffer = Buffer.from(key, "hex");
    const ore = new ORE(
      fieldKeyBuffer.slice(0, 16),
      fieldKeyBuffer.slice(16, 32)
    );

    return termBuffers.map((buffer) => {
      return ore.encrypt(buffer.readBigUint64BE());
    });
  }

  // Handle single or an array of conditions
  query(field, condition) {
    const [predicate, value] = condition

    const {analyzer, key} = this.getField(field)
    const fieldKeyBuffer = Buffer.from(key, 'hex')
    const ore = new ORE(fieldKeyBuffer.slice(0, 16), fieldKeyBuffer.slice(16, 32))

    // FIXME: performForQuery should return either a term or a "tuple" (not a single element array)
    const [term] = analyzer.performForQuery(predicate, value)

    if (term instanceof Array && term.length == 2) {
      const [min, max] = term;
      const {left: minL, right: minR} = ore.encrypt(min.readBigUint64BE())
      const {left: maxL, right: maxR} = ore.encrypt(max.readBigUint64BE())

      // TODO: Use a constant instead of magic number
      return Buffer.concat([
        Buffer.from([1]),
        minL,
        minR,
        maxL,
        maxR
      ])
    } else {
      const {left: left, right: right} = ore.encrypt(term.readBigUint64BE())
      // TODO: Use a constant instead of magic number
      return Buffer.concat([Buffer.from([0]), left, right])
    }
  }

  setField(field, analyzer, key) {
    this.analyzers[field] = { analyzer, key };
    return this;
  }

  getField(field) {
    let analyzer = this.analyzers[field];
    if (analyzer) {
      return analyzer;
    }
    throw "Field '" + field + "' not defined";
  }
}

module.exports = Mapping;
