
const JSONBigInt = require('json-bigint')

// TODO: Later on custom versions of these functions could be used
// to implement special behavour. For example, a DocumentEncryptor could
// return only a secure hashed ID for the doc and instead store the encrypted data
// in an existing database

const DocumentEncryptor = async (doc, cipherSuite) => {
  const plaintext = JSONBigInt.stringify(doc)
  return cipherSuite.encrypt(plaintext).then(({ result }) => { return result })
}

// FIXME: call this "decryptor" because it doesn't know or need to know anything about documents.
const DocumentDecryptor = async (cipherText, cipherSuite) => {
  if (cipherText instanceof Array) {
    // TODO: Use a decryptAll function instead
    const decryptors = cipherText.map((ct) => {
      return cipherSuite.decrypt(ct)
    })
    return Promise.all(decryptors)
  } else {
    return cipherSuite.decrypt(cipherText)
  }
}

module.exports = {
  DocumentEncryptor,
  DocumentDecryptor
}
