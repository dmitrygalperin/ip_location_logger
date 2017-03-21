var socket = io().connect('http://127.0.0.1:9000');
var markers = [];
var minTime = Number.POSITIVE_INFINITY;
var now = Date.now();

//emit request for coordinate data
socket.emit('request-coords');

socket.on('coords', function(coords) {
    console.log('coordinate added');
    var position = {lat: Number(coords.lat), lng: Number(coords.lon)};
    var marker = new google.maps.Marker({
        position: position,
        title: coords.ip
    });

    markers.push({marker: marker, time: new Date(coords.time)});
});

socket.on('coords-done', function() {

    for(let i = 0; i < markers.length; i++) {

        markers[i].marker.setMap(map);

        let time = markers[i].time.getTime();
        if (time < minTime) minTime = time;

    }

    $( function() {
        $( "#slider" ).slider({
          range: true,
          min: minTime,
          max: now + 1000*60*60,
          values: [ now-(1000*60*100), now+1000*60*60 ],
          slide: function( event, ui ) {

            displayMarkers(ui.values[0], ui.values[1]);

            $( "#dates" ).val( formatDate(ui.values[ 0 ]) + " to " + formatDate(ui.values[ 1 ]) );
          }
        });

        displayMarkers($( "#slider" ).slider( "values", 0 ), $( "#slider" ).slider( "values", 1 ));

        $( "#dates" ).val( formatDate($( "#slider" ).slider( "values", 0 )) +
          " to " + formatDate($( "#slider" ).slider( "values", 1 ) ));
      } );
});

function formatDate(date) {
    var dateStr = new Date(date).toString();
    var formatted = dateStr.slice(0, dateStr.indexOf(' G'));
    return formatted;
}

function displayMarkers(min, max) {
    for(let i = 0; i < markers.length; i++) {
        markerTime = markers[i].time.getTime();
        if (min < markerTime && max > markerTime) {
            markers[i].marker.setVisible(true);
        } else {
            markers[i].marker.setVisible(false);
        }
    }
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 0, lng: 0},
        zoom: 2
    });
}