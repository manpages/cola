var gPosition
var gGPSLoop
var gToken
var gDeviceId
var gUsername
var gDebug = true

/* * * * * UTILS * * * * */

function ok(x) { return {ok: x}; }
function nok(x) { return {nok: x}; }

function randomString(length) {
  var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
}

function getEndpoint(x) {
  return 'http://memorici.de:10081/dumb'
}

function loginMaybe(username, password) {
  return 'token666'
}

function callSession(kind, payload, ok1, nok1) {
  var token = getToken() // basically a Reader monad Kappa
  var username  = getUsername()
  if (!username) {
    username  = byId('username') ? byId('username').value : null
  }
  var password  = byId('password') ? byId('password').value : null
  var deviceId = getDeviceId()
  debug({callSession: {kind: kind, token: token, deviceId: deviceId}})
  if (token) {
    password = null
  }
  var script    = getEndpoint(kind)
  var dReq      = dumbRPCReq
  dReq(toPaddedString({action: kind, token: token, deviceId: deviceId, payload: payload,
                       username: username, password: password}),
     script, 
     'POST',
     function(x) {
       debug({ok: x})
       setToken(x.token)
       if (ok1)
         ok1(x)
       else
         debug('callSession: success callback not provided')
     },
     function(x) {
       debug({wellFuck: x})
       if (nok1)
         nok1(x)
     })
}

// Wrapper that adds DumbRPC semantics to req function
function dumbRPCReq(what, where, how, ok, nok, headers) {
  var okPrim = function(r) {
    var resultMaybe = fromPaddedString(r.responseText)
    if (resultMaybe.error)
      return nok(resultMaybe.error)
    if (resultMaybe.result && resultMaybe.token)
      return ok({result: resultMaybe.result, token: resultMaybe.token})
    return nok('Server does not implement DumbRPC correctly')
  }
  return req(what, where, how, okPrim, nok, headers)
}

// generic request function with a nice API
// void req(
//        Object,
//        URL,
//        "POST" | "GET" | "PUT" ...,
//        (req -> void),
//        (req -> void),
//        [{HttpHeader: Value}])
function req(what, where, how, ok, nok, headers) {
  var r = new XMLHttpRequest()
  debug({req: r})
  r.open(how, where)
  debug('Opened ' + how + ' request at ' + where)
  if (headers) {
    for (k in headers) {
      r.setRequestHeader(k, headers[k])
    }
  }
  r.onload = function() {
    if (r.status === 200) {
      ok(r)
    } else {
      nok(r.statusText)
    }
  }
  r.onerror = function() {
    debug('Network error')
  }
  r.send(what)
  debug('Sent payload ``' + what + "''")
}

function byId(x) {return document.getElementById(x)}
function manyByClass(x) {return document.getElementsByClassName(x)}
function byClass(x) {return document.querySelector('.' + x)}

function redirectFlat(qs) {
  document.location = (document.location.origin + document.location.pathname + '?' + qs)
}

function toString (x) { return JSON.stringify(x) }

function toPaddedString (x) { 
  var jx = JSON.stringify(x)
  var noiseN = 2000 - jx.length
  var noise = randomString(noiseN)
  debug({noiseN: noiseN, noise: noise})
  return jx + noise
}

function fromPaddedString(x) {
  return JSON.parse(x.substr(0, x.lastIndexOf('}') + 1))
}

function dateToShortString (x) {
  return (x.getMonth() + 1) + '/' +
         (x.getDate())      + '/' +
         (x.getFullYear())
}

var debug = function(x) {
  var jx
  try {
    jx = JSON.stringify(x)
  } catch(e) {
    jx = "Some circular data received, refusing to inspect"
  }
  if (gDebug) {
    debugView().innerText += '\n>>= ' + Date.now() + ' =<<\n'
    debugView().innerText += jx
    debugView().scrollTop  = debugView().scrollHeight
  }
}

/* * * * /UTILS * * * */

var view = function() {
  return document.body.querySelector('.app__mainMenu--view')
}

var debugView = function() {
  return document.body.querySelector('.app__debug--view')
}

var showLogin = function() {
  document.body.querySelector('.call__mainMenu--view')  . setAttribute('style', 'display:none;')
  document.body.querySelector('.app__mainMenu--view')   . setAttribute('style', 'display:none;')
  document.body.querySelector('.login__mainMenu--view') . setAttribute('style', 'display:block;')
}

var showApp = function() {
  document.body.querySelector('.call__mainMenu--view')  . setAttribute('style', 'display:none;')
  document.body.querySelector('.app__mainMenu--view')   . setAttribute('style', 'display:block;')
  document.body.querySelector('.login__mainMenu--view') . setAttribute('style', 'display:none;')
}

var showCall = function() {
  document.body.querySelector('.call__mainMenu--view')  . setAttribute('style', 'display:block;')
  document.body.querySelector('.app__mainMenu--view')   . setAttribute('style', 'display:none;')
  document.body.querySelector('.login__mainMenu--view') . setAttribute('style', 'display:none;')
}

var setUsername = function(x) {
  return gUsername = x
}
var getUsername = function() {
  return gUsername
}

var setToken = function(x) {
  return gToken = x
}
var getToken = function() {
  return gToken
}

var setDeviceId = function(x) {
  return gDeviceId = x
}
var getDeviceId = function() {
  return gDeviceId
}

var positionToString = function(position) {
  return ('Latitude: '          + position.coords.latitude          + '\n' +
          'Longitude: '         + position.coords.longitude         + '\n' +
          'Altitude: '          + position.coords.altitude          + '\n' +
          'Accuracy: '          + position.coords.accuracy          + '\n' +
          'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
          'Heading: '           + position.coords.heading           + '\n' +
          'Speed: '             + position.coords.speed             + '\n' +
          'Timestamp: '         + position.timestamp                + '\n') 
}

var beamGPS = function() {
  navigator.geolocation.getCurrentPosition( function(x) {
                                              gPosition = x
                                            }
                                          , function() {
                                              debug('Failed GPS beam!')
                                            } )
}

var setupLoginButton = function() {
  var ok1 = function(x) {
    debug('Login success')
    showApp()
  }
  var nok1 = function() {
    debug('Login failure')
    byClass('login__mainMenu--error').innerText = "Incorrect credentials"
  }
  byId("login").onclick = function () { callSession('login', null, ok1, nok1); }
}

var setupPanicButton = function() {
  var ok1 = function(x) {
    debug("Distress signal was accepted:")
    debug(x)
  }
  var nok1 = function(x) {
    debug("Distress signal was denied:")
    debug(x)
  }
  byClass("app__mainMenu--button").onclick = function() {
    debug("Sending distress signal:")
    debug(gPosition)
    callSession('call', {position: gPosition}, ok1, nok1)
  }
}

var app = {

    initialize: function() {
        debug('Initializing...')
        this.bindEvents()
        // We're working only in foreground to drain less battery
        // so we fetch GPS data pretty rigorously.
        gGPSLoop = window.setInterval(beamGPS, 666) 
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false)
    },

    onDeviceReady: function() {
        setupLoginButton()
        setupPanicButton()
        app.receivedEvent('deviceready')
        req('', 'http://memorici.de:10081', 'GET', function(x) {debug({testRequestSuccess: x})},
                                                   function(x) {debug({testRequestFailure: x})})

        setDeviceId(localStorage.getItem('deviceId'))
        if (!getDeviceId()) {
          setDeviceId(randomString(56))
          localStorage.setItem('deviceId', getDeviceId())
        }

        setUsername(localStorage.getItem('username'))
        setToken(localStorage.getItem('token'))
        if (!getToken()) {
          showLogin()
        } else {
          showApp()
        }
    },

    receivedEvent: function(id) {
        var parentElement = document.getElementById(id)
        var listeningElement = parentElement.querySelector('.listening')
        var receivedElement = parentElement.querySelector('.received')

        listeningElement.setAttribute('style', 'display:none;')

        console.log('Received Event: ' + id)
    }
};

app.initialize()
