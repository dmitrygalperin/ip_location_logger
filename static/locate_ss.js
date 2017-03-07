function getGeoLocation() {
	var output = document.getElementById("location");

	if (!navigator.geolocation) {
		output.innerHTML = "<p>Geolocation not supported. Must use alternative method.</p>";
		return;
	}

	function success(position) {
		var latitude = position.coords.latitude;
		var longitude = position.coords.longitude.

		output.innherHTML = '<p>Latitude: ' + latitude + '<br>Longitude: ' + longitude + '</p>';
	}

	function error() {
		output.innerHTML = "Error has occurred";
	}

	output.innerHTML = "<p>Getting locaation...</p>";

	navigator.geolocation.getCurrentPosition(success, error);
}