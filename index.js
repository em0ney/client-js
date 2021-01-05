
const AWS = require("aws-sdk")
const Encryptor = require('./encryptor')

var credentials = new AWS.SharedIniFileCredentials({profile: 'dev'});
AWS.config.credentials = credentials;

const generatorKeyId = 'arn:aws:kms:ap-southeast-2:377140853070:key/80c0f67d-e02a-4b59-a314-80a07ef0d4a2'
const encryptor = new Encryptor(generatorKeyId)
encryptor.encrypt({name: "Dan", email: "dan@coderdan.co"}).then(({ result }) => {
  console.log(result)
})
