
const AWS = require("aws-sdk")
const { DocumentEncryptor, DocumentDecryptor } = require('./document_encryptor')
const CipherSuite = require('./cipher')
const Indexer = require('./indexer')
const Mapping = require('./mapping')
const Analysis = require('./analysis')
const Stash = require('./stash')
const Collection = require('./collection')
const collectionId = "de8c0950-3274-4cb8-8298-af1d5989fdfe";
const Query = require('./query')

var credentials = new AWS.SharedIniFileCredentials({profile: 'dev'});
AWS.config.credentials = credentials;

// TODO: Read from env
const generatorKeyId = 'arn:aws:kms:ap-southeast-2:377140853070:key/80c0f67d-e02a-4b59-a314-80a07ef0d4a2'
const OREKEY = Buffer.from('2e877eebe7f0b8ef1492f314d66c4dcce6c53234aa05cfe2dd54df83d18d09be', 'hex');
const cipher = new CipherSuite(generatorKeyId, OREKEY)

// TODO: use strings to represent the analyser and encapsulate standard analysers
// Include field ID in the mapping, not the analyser
const UserMapping = new Mapping().setField('name', new Analysis.Keyword(0)).setField('age', new Analysis.UInt(1))

const User = new Collection(collectionId, UserMapping, cipher)
//col.buildPutRequest({id: 100, name: "Dan Draper"}).then(console.log)

Stash.connect('127.0.0.1:50051').then(async (conn) => {
  await conn.put(User, {id: 101, name: 'Lauren Neko', age: 35})
  await conn.put(User, {id: 102, name: 'Mojito Neko-Draper', age: 6})

  conn.put(User, {id: 100, name: 'Dan Draper', age: 39}).then((a) => {
    conn.get(User, a).then((r) => { console.log("GET", r) })

    conn.all(User, new Query().where({name: "Dan Draper"})).then(console.log)

    q2 = new Query().limit(10).where((q) => {
      return { age: q.gte(2) }
    })

    conn.all(User, q2.limit(2)).then((res) => { console.log("RANGE", res) })

    conn.all(User, {name: "Dan Draper"}).then((res) => { console.log('A', res) })

    conn.all(User, (q) => {
      return {age: q.between(0, 100)}
    }).then((res) => { console.log('B', res) })
  })
})
