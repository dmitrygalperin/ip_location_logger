var output = document.getElementById("location");
var geoLocationSuccess = true;

function getLocation() {
	if (navigator.geolocation) {
    	navigator.geolocation.getCurrentPosition(showPosition, getLocationAlternate);
	} else { 
    	getLocationAlternate();
	}
}

function showPosition(position) {
	output.innerHTML = "Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude;

	if(geoLocationSuccess) sendPosition(position.coords.latitude, position.coords.longitude);
}

function getLocationAlternate(error) {
	/*
	switch(error.code) {
    	case error.PERMISSION_DENIED:
        	output.innerHTML = "User denied the request for Geolocation."
        	break;
        case error.POSITION_UNAVAILABLE:
            output.innerHTML = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            output.innerHTML = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            output.innerHTML = "An unknown error occurred."
            break;
	}
	*/
	geoLocationSuccess = false;

	$.ajax({
		url: "/location_app/get_coords/",
		method: "GET",
		success: function (data) {
			var data = JSON.parse(data);
			//output.innerHTML = "latitude: " + 
			var position = {coords: {latitude: data.lat, longitude: data.lon}};
			showPosition(position);
		}
	});
}

function sendPosition(lat, lon) {
	$.ajax({
		url: "/location_app/log_ip/",
		method: "POST",
		data: {"lat" : lat, "lon" : lon}
	});
}