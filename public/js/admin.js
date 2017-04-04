var socket = socketAddress;
var map;
var markers = [];
var minTime = Number.POSITIVE_INFINITY;
var now = Date.now();
var leftHandleInterped, rightHandleInterped;
var currentVisitorsMsg = "Showing all current visitors (active within last 5 minutes)";
var currentVisitorsTimeOFfset = 1000*60*5;

//emit request for coordinate data
socket.emit('request-coords');

socket.on('coords', function(coords) {
        //create new marker and add to markers array
        marker = createMarker(coords.lat, coords.lon, coords.ip);
        markers.push({marker: marker, time: new Date(coords.time)});
});

socket.on('coords-done', function() {

    /*when all coordinate data has been received from server:
    add coordinates to map, create UI slider, display all coordinates
    within time range */

    now = Date.now() + 1000*5;

    var sliderExists = $("#slider").hasClass("ui-slider");

    if(!sliderExists) {

        for(let i = 0, len = markers.length; i < len; i++) {

            markers[i].marker.setMap(map);

            let time = markers[i].time.getTime();
            if (time < minTime) minTime = time;

        }

        $( function() {
            $( "#slider" ).slider({
              range: true,
              min: 1,
              max: 1000,
              step: 1,
              values: [ 950, 1000 ],
              slide: function( event, ui ) {

                leftHandleInterped = logInterp(ui.values[0], 1, 950, minTime, now);
                rightHandleInterped = logInterp(ui.values[1], 1, 950, minTime, now);

                //lock right portion of slider to show only active visitors (within last 5 minutes)
                if(ui.values[0] >= 950) {

                    $("#slider").slider("values", 0, 950);

                    //display markers within last 5 minutes
                    displayMarkers(now - currentVisitorsTimeOFfset, now);

                    $("#dates").val(currentVisitorsMsg);

                    return false;
                }

                if(ui.values[1] > 950) rightHandleInterped = now;

                displayMarkers(leftHandleInterped, rightHandleInterped);

                $("#dates").val( formatDate(leftHandleInterped) + " to " + formatDate(rightHandleInterped));
              }

            });

             $("#dates").val(currentVisitorsMsg);

        });

        displayMarkers(now - 1000*60*5, now);

    } else {

        markers[markers.length-1].marker.setMap(map);

        leftHandleValue = $("#slider").slider("values", 0);
        rightHandleValue = $("#slider").slider("values", 1);

        if(leftHandleValue >= 950 && rightHandleValue > 950) {
            displayMarkers(now - currentVisitorsTimeOFfset, now);
        } else {

            leftHandleInterped = logInterp(leftHandleValue, 1, 950, minTime, now);
            rightHandleInterped = logInterp(rightHandleValue, 1, 950, minTime, now);

            //if($("#slider").slider("values", 1) > 950) rightHandleInterped = now;

            displayMarkers(leftHandleInterped, rightHandleInterped);

        }
    }

});

function formatDate(date) {
    var dateStr = new Date(date).toString();
    var formatted = dateStr.slice(0, dateStr.indexOf(' G'));
    return formatted;
}

function logInterp(val, min, max, minValue, maxValue) {

    /*adjust slider behavior to follow logarithmic curve.
    makes slider positions closer to now more precise.
    does not seem to work well with the huge numbers in this use case.*/

    var temp = ((Math.log(maxValue) - Math.log(minValue)) * (val - max) / (min - max)) + Math.log(minValue);

    var returnVal = (maxValue + minValue) - Math.pow(Math.E, temp);
    return Math.round(returnVal);
}

function displayMarkers(min, max) {
    for(let i = 0, len = markers.length; i < len; i++) {
        markerTime = markers[i].time.getTime();
        if (min <= markerTime && max >= markerTime) {
            markers[i].marker.setVisible(true);
        } else {
            markers[i].marker.setVisible(false);
        }
    }
}

function createMarker(lat, lon, ip) {
    var position = {lat: Number(lat), lng: Number(lon)};
    var marker = new google.maps.Marker({
        position: position,
        title: ip,
        visible: false
    });

    return marker;
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 0, lng: 0},
        zoom: 2
    });
}
