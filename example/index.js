const {AuthToken, Stash, Query} = require('@cipherstash/client')
const User = require('./user')

const AWS = require("aws-sdk")
var credentials = new AWS.SharedIniFileCredentials({profile: 'dev'});
AWS.config.credentials = credentials;

const auth = new AuthToken({
  idpHost: process.env.CS_IDP_HOST,
  creds: {
    clientId: process.env.CS_CLIENT_ID,
    clientSecret: process.env.CS_SECRET
  }
})

async function run() {
  try {
    const stash = await Stash.connect('localhost:50001', auth)
    await stash.put(User, {id: 101, name: 'Lauren Neko', age: 35, foo: "bar"})
    await stash.put(User, {id: 102, name: 'Mojito Neko-Draper', age: 6})

    // Using a promise
    stash.put(User, {id: 100, name: 'Dan Draper', age: 39}).then(async (a) => {
      stash.get(User, a)
      .then((r) => { console.log("GET", r) })
      .catch((err) => console.error("GET ERR", err))

      stash.all(User, new Query().where({name: "Dan Draper"}))
      .then((results) => console.log("Results", results))
      .catch((err) => console.error("Query error", err))*/

      q2 = new Query().limit(10).where((q) => {
        return { age: q.gte(2) }
      })

      stash.all(User, q2.limit(2))
      .then((res) => { console.log("RANGE", res) })
      .catch((err) => console.error("Query error", err))

      /* Example query using await */
      const results = await stash.all(User, (q) => {
        return {age: q.between(0, 100)}
      })
      console.log('AWAIT RESULTS', results)

    }).catch((err) => console.error("PUT FAILED", err))
  } catch(error) {
    console.error("FAILED", error)
  }
}

run()
