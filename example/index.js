const {AuthToken, Stash, Query} = require('@cipherstash/client')

const auth = new AuthToken({
  idpHost: process.env.CS_IDP_HOST,
  creds: {
    clientId: process.env.CS_CLIENT_ID,
    clientSecret: process.env.CS_SECRET
  },
  federation: {
    IdentityPoolId: process.env.CS_FEDERATED_IDENTITY_ID,
    region: 'ap-southeast-2'
  }
})

async function run() {
  try {
    const cmk = 'arn:aws:kms:ap-southeast-2:377140853070:key/80c0f67d-e02a-4b59-a314-80a07ef0d4a2'
    const stash = await Stash.connect('localhost:50001', auth, cmk)

    const col = await stash.createCollection("patients", [
      // TODO: Rename `name` to `field`
      {name: "name", analyzer: "typeahead"},
      {name: "dob", analyzer: "uint"}
    ])
    console.log("COL", col)

    /*    const users = await stash.collection("users")

    await users.put({id: 101, name: "Lauren Neko", age: 35})
    const lauren = await users.get(101)

    q2 = new Query().limit(10).where((q) => {
      return { name: q.eq("Lauren Neko") }
    })

    const results = await users.all(q2.limit(2))*/

    /*await stash.put(User, {id: 101, name: 'Lauren Neko', age: 35, foo: "bar"})
    await stash.put(User, {id: 102, name: 'Mojito Neko-Draper', age: 6})

    // Using a promise
    stash.put(User, {id: 100, name: 'Dan Draper', age: 39}).then(async (a) => {
      stash.get(User, a)
      .then((r) => { console.log("GET", r) })
      .catch((err) => console.error("GET ERR", err))

      stash.all(User, new Query().where({name: "Dan Draper"}))
      .then((results) => console.log("Results", results))
      .catch((err) => console.error("Query error", err))

      q2 = new Query().limit(10).where((q) => {
        return { age: q.gte(2) }
      })

      stash.all(User, q2.limit(2))
      .then((res) => { console.log("RANGE", res) })
      .catch((err) => console.error("Query error", err))*/

      /* Example query using await */
      /*const results = await stash.all(User, (q) => {
        return {age: q.between(0, 100)}
      })
      console.log('AWAIT RESULTS', results)

      }).catch((err) => console.error("PUT FAILED", err))*/
  } catch(error) {
    console.error("FAILED", error)
  }
}

run()
