
const JSONBigInt = require('json-bigint')
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
      format: "JSON"
    }
  }

  async encrypt(plaintext) {
    // TODO: Handle encrypt stream, too
    return NodeEncrypt(this.#keyring, plaintext, {
      encryptionContext: this.#context
    })
  }

  async decrypt(ciphertext) {
    const { plaintext, messageHeader } = await NodeDecrypt(this.#keyring, ciphertext)
    /* Grab the AAD */
    const { encryptionContext } = messageHeader
    // TODO: Move this to the Decryptor
    if (encryptionContext.format == "JSON") {
      return JSONBigInt.parse(plaintext)
    }
  }
}

module.exports = CipherSuite
