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

async function queryWithAssertion(collection, query, assertion) {
  const results = await collection.all(query)
  if (assertion(results)) {
    console.log("☑️ Queried the collection and got expected match");
  } else {
    console.error("❌ The query did not return the expected result")
    process.exit(1)
  }
}

async function run() {
  try {
    const cmk = process.env.CS_DEV_CMK
    const address = process.env.CS_SERVICE_FQDN
    const clusterID = address.split('.')[0]
    const stash = await Stash.connect(address, clusterID, auth, cmk)

    // FIXME: for some reason the return value is not the same as when getting a collection
    const _users = await stash.createCollection("users", [
      // TODO: Rename `name` to `field`
      {name: "name", analyzer: "typeahead"},
      {name: "position", analyzer: "keyword"},
      {name: "age", analyzer: "uint"},
    ])

    console.log("☑️ Collection created");

    const users = await stash.collection("users")
    console.log("☑️ Collection retrieved");

    await users.put({id: 101, name: "Dan Draper", position: "Founder & CEO", age: 39})
    await users.put({id: 102, name: "Lindsay Holmwood", position: "CPO", age: 33})
    await users.put({id: 103, name: "James Sadler", position: "CTO", age: 43})
    console.log("☑️ Inserted records into collection");

    const _user = await users.get(101)
    console.log("☑️ Retrieved a record from the collection");

    await queryWithAssertion(users, new Query().limit(10).where((q) =>
      ({ name: q.match("Dan") })
    ), (results) =>
      results.length === 1 && results[0].name === "Dan Draper"
    )

    await queryWithAssertion(users, new Query().limit(10).where((q) =>
      ({ name: q.match("Hans Gruber") })
    ), (results) => results.length === 0)

    await queryWithAssertion(users, new Query().limit(10).where((q) =>
      ({ position: q.eq("CPO") })
    ), (results) =>
      results.length === 1 && results[0].name === "Lindsay Holmwood"
    )

    await queryWithAssertion(users, new Query().limit(10).where((q) =>
      ({ position: q.eq("Santa's Little Helper") })
    ), (results) => results.length === 0)

    await queryWithAssertion(users, new Query().limit(10).where((q) =>
      ({ age: q.gte(43) })
    ), (results) => {
      return results.length === 1 && results[0].name === "James Sadler"
    })

    await queryWithAssertion(users, new Query().limit(10).where((q) =>
      ({ age: q.lt(20) })
    ), (results) => results.length === 0)

    await stash.deleteCollection("users")
    console.log("☑️ Deleted the collection");
  } catch(error) {
    console.error("FAILED", error)
  }
}

run()
