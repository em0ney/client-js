
const BSON = require('bson')

// TODO: Later on custom versions of these functions could be used
// to implement special behavour. For example, a DocumentEncryptor could
// return only a secure hashed ID for the doc and instead store the encrypted data
// in an existing database

const SourceEncryptor = async (doc, cipherSuite) => {
  const plaintext = BSON.serialize(doc)
  return cipherSuite.encrypt(plaintext).then(({ result }) => { return result })
}

const SourceDecryptor = async (cipherText, cipherSuite) => {
  if (cipherText instanceof Array) {
    // TODO: Use a decryptAll function instead
    const decryptors = cipherText.map((ct) => {
      return BSON.deserialize(cipherSuite.decrypt(ct))
    })
    return Promise.all(decryptors)
  } else {
    return BSON.deserialize(cipherSuite.decrypt(cipherText))
  }
}

module.exports = {
  SourceEncryptor,
  SourceDecryptor
}
