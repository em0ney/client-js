
const Query = require('./query')
const path = require('path')
const GRPC = require('./grpc').V1

const CipherSuite = require('./cipher')
const Collection = require('./collection')

class Stash {
  /*
   * @param {string} host - dataService host to connect to
   * @param {AuthToken} auth - instance of an AuthToken
   * @param {string} version - for forward compatibility (only v1 is valid right now)
   */
  static async connect(host, auth, version = "v1") {
    const stash = new Stash(host, auth, version)

    /* Get a token at startup so that any federated identities
     * (required for encryption) are ready */
    await auth.getToken(host)

    return stash
  }

  /*
   * @param {string} host - the data service we are connecting to
   * @param {AuthToken} auth
   * @param {string} version - for forward compatibility (only v1 is valid right now)
   */
  constructor(host, auth, cmk, version) {
    this.stub = GRPC.API(host)
    this.host = host
    this.auth = auth
    const oreKeyTemp = Buffer.from('2e877eebe7f0b8ef1492f314d66c4dcce6c53234aa05cfe2dd54df83d18d09be', 'hex')
    this.cipherSuite = new CipherSuite(cmk, oreKeyTemp) // FIXME: CipherSuite shouldn't take the ORE key in the constructor
  }

  close() {
    this.stub.close()
  }

  async createCollection(name, indexes) {
    return Collection.create(name, indexes, this.stub, this.auth, this.cipherSuite)
  }

  async collection(name) {
    /* Ensure a token is available and federated */
    await this.auth.getToken(this.host)

    return await Collection.load(name, this.stub, this.auth, this.cipherSuite)
  }

}

module.exports = Stash
