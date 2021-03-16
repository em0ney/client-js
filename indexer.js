
// TODO: Move the ORE code to here so it is self contained
const Indexer = async (doc, mapping, cipherSuite) => {
  const entries = mapping.mapAll(doc).map(async ({ left, right }) => {
    // TODO: await all terms sequentially for now - possibly could use Promise.all?
    // That could be a lot of parallelism - might be better to chunk it up or stream somehow
    return Buffer.concat([left, right])
  });
  return Promise.all(entries)
}

module.exports = Indexer
