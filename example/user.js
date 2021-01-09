
const {Collection, CipherSuite} = require('@cipherstash/client')

// TODO: Read from env
const generatorKeyId = 'arn:aws:kms:ap-southeast-2:377140853070:key/80c0f67d-e02a-4b59-a314-80a07ef0d4a2'
const OREKEY = Buffer.from('2e877eebe7f0b8ef1492f314d66c4dcce6c53234aa05cfe2dd54df83d18d09be', 'hex');
const cipher = new CipherSuite(generatorKeyId, OREKEY)

const User = {
  id: "de8c0950-3274-4cb8-8298-af1d5989fdfe",
  cipherSuite: cipher,
  fields: {
    name: {number: 0, analyzer: 'keyword'},
    age:  {number: 1, analyzer: 'uint'}
  }
}

// TODO: Rename from to for?
module.exports = Collection.from(User)
