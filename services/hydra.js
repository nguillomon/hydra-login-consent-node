var fetch = require('node-fetch')
var uj = require('url-join')

var hydraUrl = process.env.HYDRA_URL

// A little helper that takes type (can be "login" or "consent") and a challenge and returns the response from ORY Hydra.
function get(flow, challenge) {
  return fetch(uj(hydraUrl, '/oauth2/auth/requests/' + flow + '/' + challenge))
    .then(function (res) {
      if (res.status < 200 || res.status > 302) {
        return res.json().then(function (body) {
          console.error('An error occurred while making a HTTP request: ', body)
          return Promise.reject(new Error(body.error.message))
        })
      }

      return res.json();
    });
}

// A little helper that takes type (can be "login" or "consent"), the action (can be "accept" or "reject") and a challenge and returns the response from ORY Hydra.
function put(flow, action, challenge, body) {
  return fetch(
    uj(hydraUrl, '/oauth2/auth/requests/' + flow + '/' + challenge + '/' + action),
    {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' }
    },
  )
    .then(function (res) {
      if (res.status < 200 || res.status > 302) {
        return res.json().then(function (body) {
          console.error('An error occurred while making a HTTP request: ', body)
          return Promise.reject(new Error(body.error.message))
        })
      }

      return res.json();
    });
}

var hydra = {
  // Fetches information on a login request.
  getLoginRequest(challenge) {
    return get('login', challenge);
  },
  // Accepts a login request.
  acceptLoginRequest(challenge, body) {
    return put('login', 'accept', challenge, body);
  },
  // Rejects a login request.
  rejectLoginRequest(challenge) {
    return put('login', 'reject', challenge, body);
  },
  // Fetches information on a consent request.
  getConsentRequest(challenge) {
    return get('consent', challenge);
  },
  // Accepts a consent request.
  acceptConsentRequest(challenge, body) {
    return put('consent', 'accept', challenge, body);
  },
  // Rejects a consent request.
  rejectConsentRequest(challenge, body) {
    return put('consent', 'reject', challenge, body);
  }
};

module.exports = hydra;