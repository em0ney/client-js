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
   * Tokens are cached up to just before they expire along with the data service for which
   * they have been issued. This prevents a cached token being eroneously used for a new data server.
   * Consequently, the AuthToken can manage tokens for multiple data services at once.
   *
   * @param {string} idpHost is the hostname of the issuing Identity Provider
   * @param {object} creds is an object containing the `clientId` and `clientSecret`
   */
  constructor({idpHost, creds}) {
    this.request = {...OPTS}
    this.request.host = idpHost
    this.data = {...DATA}
    this.data.client_id = creds.clientId
    this.data.client_secret = creds.clientSecret
    this.tokens = {}
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
    if (!this.tokenValid(dataServer)) {
      const {access_token, expires_in} = await this.authenticate(dataServer)
      this.tokens[dataServer] = {
        accessToken: access_token,
        expiresAt: Math.trunc((new Date()).getTime() / 1000) + expires_in - EXPIRY_BUFFER
      }
    }
    return this.tokens[dataServer]
  }

  /*
   * Determines if we already have a valid auth token for the data
   * server
  * */
  tokenValid(dataServer) {
    return !!this.tokens[dataServer]
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
