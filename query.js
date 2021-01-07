
const QueryBuilder = require('./query_builder')

// TODO: Move to its own file
const Helpers = {
  lte: function(value) {
    return ["<=", value]
  },

  lt: function(value) {
    return ["<", value]
  },

  gte: function(value) {
    return [">=", value]
  },

  gt: function(value) {
    return [">", value]
  },

  between: function(a, b) {
    return ["><", [a, b]]
  },

  eq: function(value) {
    return ["==", value]
  },

  match: function(value) {
    return ["MATCH", value]
  }
}

class Query {
  constructor(collection, constraint = {}) {
    this.collection = collection
    this.constraints = []
    this.where(constraint)
    this.limit = 20 // TODO: Make a function to set the limit and after
  }

  where(constraint) {
    if (constraint instanceof Function) {
      this.where(constraint(Helpers))
    } else {
      Object.entries(constraint).forEach((cons) => {
        const [field, condition] = cons
        if (condition instanceof Array) {
          this.constraints.push(cons)
        } else {
          this.constraints.push([field, ["==", condition]])
        }
      })
    }
    return this
  }

  async buildRequest() {
    // FIXME: This is a bit leaky wrt the collection
    const terms = await QueryBuilder(this, this.collection.mapping, this.collection.cipherSuite)
    return {
      collectionId: this.collection.id,
      term: terms,
      limit: this.limit
    }
  }

  decrypt(ciphertext) {
    return this.cipher.decrypt(ciphertext)
  }
}

module.exports = Query;
