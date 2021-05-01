const { Bool, Keyword, UInt, TypeAhead, Timestamp } = require("./analysis");
const ORE = require("@cipherstash/ore");

class Mapping {
  static analyzer(analyzerName) {
    switch (analyzerName) {
      case "keyword":
        return new Keyword();

      case "uint":
        return new UInt();

      case "typeahead":
        return new TypeAhead();

      case "timestamp":
        return new Timestamp();

      case "bool":
        return new Bool();

      default:
        throw `Unknown analyzerName ${analyzerName}`;
    }
  }

  constructor(fieldMappings) {
    this.analyzers = {};

    Object.entries(fieldMappings).forEach(
      ([indexId, { name, analyzer, key }]) => {
        this.analyzers[name] = {
          indexId: Buffer.from(indexId, 'hex'),
          analyzer: Mapping.analyzer(analyzer),
          key,
        };
      }
    );
  }

  mapAll(record) {
    return Object.entries(this.analyzers).map(([fieldName, { indexId }]) => {
      const value = record[fieldName];
      if (value) {
        return this.map(indexId, fieldName, value)
      } else {
        return [];
      }
    })
  }

  map(indexId, fieldName, value) {
    const { analyzer, key } = this.getField(fieldName);

    const termBuffers = analyzer.perform(value);

    // FIXME: Just keep the 2 keys (prf/prp) as separate fields within the settings (in stash)
    // TODO: Probably should have a format version for the field settings as well
    const fieldKeyBuffer = Buffer.from(key, "hex");
    const ore = new ORE(
      fieldKeyBuffer.slice(0, 16),
      fieldKeyBuffer.slice(16, 32)
    );

    return termBuffers.map((buffer) => {
      return { indexId, ore: ore.encrypt(buffer.readBigUint64BE()) }
    });
  }

  // Handle single or an array of conditions
  query(field, condition) {
    const [predicate, value] = condition

    const {indexId, analyzer, key} = this.getField(field)
    const fieldKeyBuffer = Buffer.from(key, 'hex')
    const ore = new ORE(fieldKeyBuffer.slice(0, 16), fieldKeyBuffer.slice(16, 32))

    // FIXME: performForQuery should return either a term or a "tuple" (not a single element array)
    const [term] = analyzer.performForQuery(predicate, value)

    if (term instanceof Array && term.length == 2) {
      const [min, max] = term;
      const {left: minL, right: minR} = ore.encrypt(min.readBigUint64BE())
      const {left: maxL, right: maxR} = ore.encrypt(max.readBigUint64BE())

      return {
        indexId,
        range: {
          upper: Buffer.concat([maxL, maxR]),
          lower: Buffer.concat([minL, minR]),
        }
      }
    } else {
      const {left: left, right: right} = ore.encrypt(term.readBigUint64BE())
      return {
        indexId,
        exact: {
          term: Buffer.concat([left, right])
        }
      }
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
