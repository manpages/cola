var gPosition
var gGPSLoop

var view = function() {
  return document.body.querySelector('.app__mainMenu--view')
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
                                              view().innerText = positionToString(gPosition)
                                            }
                                          , function() {} )
}

var app = {

    initialize: function() {
        this.bindEvents()
        // We're working only in foreground to drain less battery
        // so we fetch GPS data pretty rigorously.
        gGPSLoop = window.setInterval(beamGPS, 666) 
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false)
    },

    onDeviceReady: function() {
        app.receivedEvent('deviceready')
    },

    receivedEvent: function(id) {
        var parentElement = document.getElementById(id)
        var listeningElement = parentElement.querySelector('.listening')
        var receivedElement = parentElement.querySelector('.received')

        listeningElement.setAttribute('style', 'display:none;')
        receivedElement.setAttribute('style', 'display:block;')

        console.log('Received Event: ' + id)
    }
};

app.initialize()
