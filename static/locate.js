var map;
var socket = io().connect('http://127.0.0.1:9000');
var markerPosition;
var geoLocationSuccess = true;

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

    clientIP = position.ip ? `${position.ip}` : ``;

    $("#ip").val(clientIP);
    $("#lat").val(position.coords.latitude);
    $("#lon").val(position.coords.longitude);

    markerPosition = {lat: position.coords.latitude, lng: position.coords.longitude};
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

    socket.emit('api-coords-req');
}

function sendPosition(lat, lon) {
    socket.emit('geolocation', {lat: lat, lon: lon});
}

socket.on('api-coords', function(data) {
    var position = {coords: {latitude: data.lat, longitude: data.lon}, ip: data.ip};
    showPosition(position);     
});

socket.on('client-ip', function(data) {
        $("#ip").val(data.ip);
});

socket.on('coords', function(coords) {
    var position = {lat: Number(coords.lat), lng: Number(coords.lon)};

    if (position.lat != markerPosition.lat && position.lng != markerPosition.lng) {
        console.log('coordinate added');
        var marker = new google.maps.Marker({
            position: position,
            map: map,
            title: coords.ip
        });
    }
});