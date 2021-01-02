
class Query {
  constructor(connection, collectionId, ore, constraints, mapping) {
    this.connection = connection;
    this.collectionId = collectionId;
    let plaintextTerms = this.#analyzeConstraints(constraints, mapping);
    this.queryTerms = this.#encryptTermsForQuery(plaintextTerms, ore);
  }

  one() {
    return new Promise((resolve, reject) => {
      this.connection.query(this.collectionId, this.queryTerms, {limit: 1}, (err, res) => {
        if (err) {
          reject(err);
        } else {
          if (res.result instanceof Array && res.result.length > 0) {
            resolve({result: res.result[0]});
          } else {
            resolve(null);
          }
        }
      });
    });
  }

  all(limit = 20) {
    return new Promise((resolve, reject) => {
      this.connection.query(this.collectionId, this.queryTerms, {limit: limit}, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  // TODO: Use null object pattern for analyzers
  // TODO: Move this and the ORE encryption into the mapping class
  #analyzeConstraints(constraints, mapping) {
    const ret = Object.entries(constraints).flatMap((constraint) => {
      const [field, condition] = constraint;

      if (condition instanceof Array && condition.length == 2) {
        const [predicate, term] = condition;
        return mapping.query(field, predicate, term);
      } else {
        return analyzer.performForQuery("==", condition);
      }
    });
    return ret;
  }

  #encryptTermsForQuery(terms, ore) {
    return terms.map((term) => {
      // TODO: Only left terms should be required for the query!
      if (term instanceof Array && term.length == 2) {
        const [min, max] = term;
        const {left: minL, right: minR} = ore.encrypt(min.readBigUInt64BE());
        const {left: maxL, right: maxR} = ore.encrypt(max.readBigUInt64BE());

        return Buffer.concat([
          Buffer.from([1]),
          minL,
          minR,
          maxL,
          maxR
        ]);
      } else {
        const {left: left, right: right} = ore.encrypt(term.readBigUInt64BE());
        return Buffer.concat([Buffer.from([0]), left, right]);
      }
    });
  }
}

module.exports = Query;
