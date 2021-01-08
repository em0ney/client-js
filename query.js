
const QueryBuilder = require('./query_builder')
const DEFAULT_LIMIT = 20

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
    // FIXME: DOes Query even need a collection?
    this.collection = collection
    this.constraints = []
    this.where(constraint)
    this.recordLimit = DEFAULT_LIMIT
    // TODO: Implement after when its available in Stash
    this.after = null
  }

  limit(number) {
    this.recordLimit = number
    return this
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
      limit: this.recordLimit
    }
  }
}

module.exports = Query;
