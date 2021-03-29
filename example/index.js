// This file contains example code that uses the Collections API.
// It currently serves as a smoke test.

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
    const cmk = process.env.CS_DEV_CMK
    const stash = await Stash.connect('localhost:50001', auth, cmk)

    // FIXME: for some reason the return value is not the same as when getting a collection
    const _users = await stash.createCollection("users", [
      // TODO: Rename `name` to `field`
      {name: "name", analyzer: "typeahead"},
      {name: "position", analyzer: "keyword"}
    ])

    console.log("☑️ Collection created");

    const users = await stash.collection("users")
    console.log("☑️ Collection retrieved");

    await users.put({id: 101, name: "Dan Draper", position: "Founder & CEO"})
    await users.put({id: 102, name: "Lindsay Holmwood", position: "CPO"})
    await users.put({id: 103, name: "James Sadler", position: "CTO"})
    console.log("☑️ Inserted records into collection");

    const _user = await users.get(101)
    console.log("☑️ Retrieved a record from the collection");

    q2 = new Query().limit(10).where((q) => {
      return { name: q.match("Dan") }
    })

    const _results = await users.all(q2.limit(2))
    console.log("☑️ Queried the collection");

    await stash.deleteCollection(users.id)
    console.log("☑️ Deleted the collection");
  } catch(error) {
    console.error("FAILED", error)
  }
}

run()
