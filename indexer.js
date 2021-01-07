
// TODO: Move the ORE code to here so it is self contained
const Indexer = async (doc, mapping, cipherSuite) => {
  const out = []

  for (const field in doc) {
    if (field != "id") { // TODO: this is a bit clunky!
      const value = doc[field];
      const plainTexts = mapping.map(field, value);

      /* Handle analyzers that return a single term and those
       * that return an array */
      [].concat(plainTexts).forEach(async (buffer) => {
        // TODO: await all terms sequentially for now - possibly could use Promise.all?
        // That could be a lot of parallelism - might be better to chunk it up or stream somehow
        const { left, right} = await cipherSuite.encryptTerm(buffer)
        out.push(Buffer.concat([left, right]))
      });
    }
  }
  return out;
}

module.exports = Indexer
