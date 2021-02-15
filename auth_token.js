const https = require('https')
const querystring = require('querystring')

const OPTS = {
  port: 443,
  path: '/oauth/token',
  method: 'POST',
  rejectUnauthorized: true,
  minVersion: "TLSv1.3",
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
};

const DATA = {
  grant_type: "client_credentials"
}

/* Refresh tokens before the expiry to avouid API errors due
 * to race conditions. Expiry buffer is in seconds */
const EXPIRY_BUFFER = 20

class AuthToken {
  /* 
   * Instantiates a new AuthToken.
   * @param {string} idpHost is the hostname of the issuing Identity Provider
   * @param {string} dataServer the URL of the stash data service we want to connect to
   * @param {object} creds is an object containing the `clientId` and `clientSecret`
   */
  constructor({idpHost, dataServer, creds}) {
    this.request = {...OPTS}
    this.request.host = idpHost
    this.data = {...DATA}
    this.data.client_id = creds.clientId
    this.data.client_secret = creds.clientSecret
    this.data.audience = dataServer
    this.token = null
    this.expiresAt = 0
  }

  async getToken() {
    // Check if token is set and not expired
    // authenticate and return the token or just return the token
    if (!this.tokenValid()) {
      console.log("Fetching new token")
      const {access_token, expires_in} = await this.authenticate()
      this.token = access_token
      this.expiresAt = Math.trunc((new Date()).getTime() / 1000) + expires_in - EXPIRY_BUFFER
    }
    return this.token
  }

  tokenValid() {
    return !!this.token
  }

  authenticate() {
    const body = querystring.stringify(this.data)

    return new Promise((resolve, reject) => {
      const req = https.request(this.request, (res) => {
        res.on('data', (response) => {
          resolve(JSON.parse(response))
        });
      });

      req.on('error', (e) => reject(e))

      req.write(body);
      req.end();
    })
  }
}

module.exports = AuthToken;
