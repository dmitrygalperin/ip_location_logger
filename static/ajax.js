var test = $.ajax({
			url: "/location_app/get_coords/",
			method: "GET",
			success: function (data) {
				alert(data);
			};
		});