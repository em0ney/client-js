const {Stash, Query} = require('@cipherstash/client')
const User = require('./user')

const AWS = require("aws-sdk")
var credentials = new AWS.SharedIniFileCredentials({profile: 'dev'});
AWS.config.credentials = credentials;

async function run() {
  const stash = await Stash.connect('127.0.0.1:50001')
  await stash.put(User, {id: 101, name: 'Lauren Neko', age: 35, foo: "bar"})
  await stash.put(User, {id: 102, name: 'Mojito Neko-Draper', age: 6})

  // Using a promise
  stash.put(User, {id: 100, name: 'Dan Draper', age: 39}).then(async (a) => {
    stash.get(User, a).then((r) => { console.log("GET", r) })

    stash.all(User, new Query().where({name: "Dan Draper"})).then(console.log)

    q2 = new Query().limit(10).where((q) => {
      return { age: q.gte(2) }
    })

    stash.all(User, q2.limit(2)).then((res) => { console.log("RANGE", res) })

    stash.all(User, {name: "Dan Draper"}).then((res) => { console.log('A', res) })

    const results = await stash.all(User, (q) => {
      return {age: q.between(0, 100)}
    })
    console.log('AWAIT RESULTS', results)
  })

}

run()
