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
}

const DATA = {
  grant_type: "client_credentials"
}

/* Refresh tokens before the expiry to avoid API errors due
 * to race conditions. Expiry buffer is in seconds */
const EXPIRY_BUFFER = 20

class AuthToken {
  /* 
   * Instantiates a new AuthToken.
   * @param {string} idpHost is the hostname of the issuing Identity Provider
   * @param {object} creds is an object containing the `clientId` and `clientSecret`
   */
  constructor({idpHost, creds}) {
    this.request = {...OPTS}
    this.request.host = idpHost
    this.data = {...DATA}
    this.data.client_id = creds.clientId
    this.data.client_secret = creds.clientSecret
    this.token = null
    this.expiresAt = 0
  }

  /*
   * Gets an Auth token for the given server. This will fail if access is denied.
   *
   * @param {string} dataServer the URL of the stash data service we want to connect to
   * @returns {Promise} a promise for the token
   */
  async getToken(dataServer) {
    // Check if token is set and not expired
    // authenticate and return the token or just return the token
    if (!this.tokenValid()) {
      const {access_token, expires_in} = await this.authenticate(dataServer)
      this.token = access_token
      this.expiresAt = Math.trunc((new Date()).getTime() / 1000) + expires_in - EXPIRY_BUFFER
    }
    return this.token
  }

  tokenValid() {
    return !!this.token
  }

  /*
   * Performs an OAuth2 exchange using a client credentials grant to the IdP
   *
   * @param {string} dataServer - the URL of the data server we want access to
   */
  authenticate(dataServer) {
    const body = querystring.stringify({
      audience: dataServer,
      ...this.data
    })

    return new Promise((resolve, reject) => {
      const req = https.request(this.request, (res) => {
        res.on('data', (data) => {
          const response = JSON.parse(data)

          if (response.error) {
            reject(response)
          } else {
            resolve(response)
          }
        });
      });

      req.on('error', (e) => reject(e))

      req.write(body);
      req.end();
    })
  }
}

module.exports = AuthToken;
