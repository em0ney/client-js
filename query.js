
class Query {
  constructor(connection, collectionId, ore, constraints, mapping, cipher) {
    // TODO: Most if not all of these things could be delegated to the collection!
    this.connection = connection;
    this.collectionId = collectionId;
    this.cipher = cipher
    let plaintextTerms = this.#analyzeConstraints(constraints, mapping);
    this.queryTerms = this.#encryptTermsForQuery(plaintextTerms, ore);
  }

  async one() {
    // TODO: Move to a buildRequest function
    const request = {
      collectionId: this.collectionId,
      term: this.queryTerms,
      limit: 1
    }

    return this.connection.query(request).then(({ result }) => {
      if (result instanceof Array && result.length > 0) {
        return this.decrypt(result[0])
      } else {
        return null;
      }
    });
  }

  async all(limit = 20) {

    // TODO: Move to a buildRequest function
    const request = {
      collectionId: this.collectionId,
      term: this.queryTerms,
      limit: limit
    }

    return this.connection.query(request).then(({ result }) => {
      // TODO: Implement a decryptAll function which takes a list (or stream)
      return Promise.all(result.map((entry) => this.decrypt(entry)))
    })
  }

  decrypt(ciphertext) {
    return this.cipher.decrypt(ciphertext)
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
