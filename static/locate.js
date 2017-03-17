var output = document.getElementById("location");
var geoLocationSuccess = true;
var map;
var socket = io().connect('http://127.0.0.1:9000');

function getLocation() {
    //if geolocation is supported, try geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, getLocationAlternate);
    } else {
        //if not supported, use alternate method
        getLocationAlternate();
    }
}

function showPosition(position) {
    //display coordinates in window
    output.innerHTML = "Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude;
    var markerPosition = {lat: position.coords.latitude, lng: position.coords.longitude};
    map = new google.maps.Map(document.getElementById('map'), {
        center: markerPosition,
        zoom: 11
    });

    var marker = new google.maps.Marker({
        position: markerPosition,
        map: map,
        title: 'You are here.'
    });

    //if geolocation was successful, send coordinates to server for logging
    if(geoLocationSuccess) sendPosition(position.coords.latitude, position.coords.longitude);
}

function getLocationAlternate(error) {
    //use ip-based location if html5 geolcation failed/denied
    geoLocationSuccess = false;

    //get ip location from server side
    /*
    $.ajax({
        url: "/location_app/get_coords/",
        method: "GET",
        success: function (data) {
            var data = JSON.parse(data);
            var position = {coords: {latitude: data.lat, longitude: data.lon}};
            showPosition(position);
        }
    });
    */
    socket.emit('api-coords-req');
}

function sendPosition(lat, lon) {
    socket.emit('geolocation', {lat: lat, lon: lon});
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 0, lng: 0},
        zoom: 2
    });
}

socket.on('api-coords', function(data) {
    var position = {coords: {latitude: data.lat, longitude: data.lon}};
    showPosition(position);     
});