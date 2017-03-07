var output = document.getElementById("location");

function getLocation() {
	if (navigator.geolocation) {
    	navigator.geolocation.getCurrentPosition(showPosition, getLocationAlternate);
	} else { 
    	output.innerHTML = "Geolocation is not supported by this browser.";
    	getLocationAlternate();
	}
}

function showPosition(position) {
	output.innerHTML = "Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude;
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
	$.ajax({
		url: "/location_app/get_coords/",
		method: "GET",
		//dataType: "json",
		success: function (data) {
			var data = JSON.parse(data);
			//output.innerHTML = "latitude: " + 
			var position = {coords: {latitude: data.lat, longitude: data.lon}};
			showPosition(position);
		}
	});
}