
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
  constructor(constraint = {}) {
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
}

module.exports = Query;
