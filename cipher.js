
const BSON = require('bson')
const { Binary } = require('bson')
const { KmsKeyringNode, buildClient, CommitmentPolicy } = require('@aws-crypto/client-node')

// TODO: Read https://docs.aws.amazon.com/encryption-sdk/latest/developer-guide/concepts.html#key-commitment

const { encrypt: NodeEncrypt, decrypt: NodeDecrypt } = buildClient(
  CommitmentPolicy.REQUIRE_ENCRYPT_REQUIRE_DECRYPT
)

class CipherSuite {
  #context = null
  #keyring = null

  constructor(generatorKeyId) {
    this.#keyring = new KmsKeyringNode({ generatorKeyId })
    this.#context = {
      version: "0.1",
      format: "BSON"
    }
  }

  async encrypt(plaintext) {
    return NodeEncrypt(this.#keyring, BSON.serialize(plaintext), {
      encryptionContext: this.#context
    })
  }

  async decrypt(ciphertext) {
    const { plaintext } = await NodeDecrypt(this.#keyring, ciphertext)
    const result =  convertBinariesToBuffers(BSON.deserialize(plaintext))
    return result
  }
}

// BSON has a "Binary" datatype for representing binary data.  It's a thin
// wrapper over a regular Buffer, which is what the rest of the code expects, so
// here we convert them to Buffer objects.
function convertBinariesToBuffers(plaintext) {
  if (Array.isArray(plaintext)) {
    return plaintext.map(pt => convertBinariesToBuffers(pt))
  } else if (plaintext instanceof Object) {
    return objectMap(plaintext, (value) => {
      if (value instanceof Binary) {
        return value.value(true)
      } else {
        return convertBinariesToBuffers(value)
      }
    }) 
  } else {
    return plaintext
  }
}

function objectMap(object, mapFn) {
  return Object.keys(object).reduce((result, key) =>
    Object.assign(result, {[key]: mapFn(object[key])}) , {})
}

module.exports = CipherSuite
