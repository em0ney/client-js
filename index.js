
const Analysis = require('./analysis');

const ta = new Analysis.TypeAhead(2);
console.log(ta.perform("dan@coderdan.co"));

const kw = new Analysis.Keyword(1);
console.log(kw.perform("dan@coderdan.co"));
