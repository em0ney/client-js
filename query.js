
class Query {
  constructor(constraints, analyzers) {
    this.constraints = this.#analyzeConstraints(constraints, analyzers);
  }

  // TODO: Use null object pattern for analyzers
  #analyzeConstraints(constraints, analyzers) {
      const ret = Object.entries(constraints).map((constraint) => {
        const [attr, condition] = constraint;
        const analyzer = analyzers[attr];

        if (condition instanceof Array && condition.length == 2) {
          const [predicate, term] = condition;
          return analyzer.performForQuery(predicate, term);
        } else {
          return analyzer.performForQuery("==", condition);
        }
      });
      return ret;
  }
}

module.exports = Query;
