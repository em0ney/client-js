
// TODO: Move the ORE code to here so it is self contained
const Indexer = async (doc, mapping, cipherSuite) => {
  return mapping.mapAll(doc).map(async (buffer) => {
    // TODO: await all terms sequentially for now - possibly could use Promise.all?
    // That could be a lot of parallelism - might be better to chunk it up or stream somehow
    const { left, right} = await cipherSuite.encryptTerm(buffer)
    return Buffer.concat([left, right])
  });
}

module.exports = Indexer
