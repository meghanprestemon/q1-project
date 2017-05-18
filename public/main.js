// RANDOM QUOTE GENERATOR
var quoteData = {}

function getData () {
    $.getJSON("http://api.forismatic.com/api/1.0/","method=getQuote&lang=en&format=jsonp&jsonp=?", function(data) {
    $(".message").html('"' + data.quoteText + '"');

    if (data.quoteAuthor === "") {
      data.quoteAuthor = "Unknown";
    }
    quoteData = data;
    $(".author").html("- " + data.quoteAuthor);

    $("#getMessage").attr("disabled", false);

  });
}

// YOGA STUDIO LOCATOR

//*GEOLOCATION ON WINDOW LOAD*

const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?';
const GOOGLE_PLACES_API_KEY = 'AIzaSyDGeQ0CKid943ZlcntcJ-W-pQxNA3FKGIQ';
const GOOGLE_MAPS_GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json?';
const GOOGLE_MAPS_API_KEY = 'AIzaSyACrENdOygDgDn0NXgo9cJ7otYMp4-O-LY';

var map, infoWindow;

function initMap() {
   map = new google.maps.Map(document.getElementById('map'), {
     center: {lat: 42.9470, lng: 76.4291},
     zoom: 13
   });
   infoWindow = new google.maps.InfoWindow;

   // Try HTML5 geolocation.
   if (navigator.geolocation) {
     navigator.geolocation.getCurrentPosition(function(position) {
       var pos = {
         lat: position.coords.latitude,
         lng: position.coords.longitude
       };

       map.setCenter(pos);

       let locationSearchResults = fetch(`${GOOGLE_PLACES_BASE_URL}keyword=yoga&location=${pos.lat},${pos.lng}&radius=10000&key=${GOOGLE_PLACES_API_KEY}`);
       locationSearchResults
         .then(response => response.json())
         .then((places) => {
           createMapMarkers(places);
         })
     }, function() {
       handleLocationError(true, map.getCenter());
     });
   } else {
     // Browser doesn't support Geolocation
     handleLocationError(false, map.getCenter());
   }
}

function handleLocationError(browserHasGeolocation, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}

// *SEARCH LOCATION*

function getPlaces(searchTerm) {
  return fetch(`${GOOGLE_MAPS_GEOCODE_URL}address=${encodeURI(searchTerm)}&key=${GOOGLE_MAPS_API_KEY}`)
    .then(response => response.json())
    .then(data => {
      let latitude = data.results[0].geometry.location.lat
      let longitude = data.results[0].geometry.location.lng
      map.setCenter({lat: latitude, lng: longitude})
      return fetch(`${GOOGLE_PLACES_BASE_URL}keyword=yoga&location=${latitude},${longitude}&radius=10000&key=${GOOGLE_PLACES_API_KEY}`)
    })
}

function createMapMarkers(placesResponse) {
  let results = placesResponse.results;

  let location = {};

  results.forEach(studioData => {
    let infoWindow = createInfoWindow(studioData)
    location.lat = studioData.geometry.location.lat;
    location.lng = studioData.geometry.location.lng;
    createMarker(location, infoWindow);
  })
}

function createInfoWindow(studioData) {
  let name = studioData.name;
  let rating = studioData.rating;
  let contentString = `<p><b>${name}</b></p><p>Rating: ${rating}</p>`

  let infoWindow = new google.maps.InfoWindow({
    content: contentString
  });

  return infoWindow;
}

function createMarker(location, infoWindow) {
  let marker = new google.maps.Marker({
    position: location,
    map: map,
    title: 'studio'
  });
  marker.addListener('click', function() {
    infoWindow.open(map, marker);
  })
}

// INITIALIZERS

$(document).ready(function () {

  // RANDOM QUOTE GENERATOR
  $("#getMessage").on("click", function () {
    $("#getMessage").attr("disabled", "disabled");
    getData();
  });

  $(".twitter-share-button").on("click", function (e) {
    e.preventDefault();
    var twitterUrl = 'https://twitter.com/intent/tweet?text="' + encodeURIComponent(quoteData.quoteText) + '" - ' + encodeURIComponent(quoteData.quoteAuthor) + '&hashtags=quotes';
    if (('"' + quoteData.quoteText + '" - ' + quoteData.quoteAuthor + ' #quotes').length > 140) {
      var confirm = window.confirm("This quote is over 140 characters! Would you still like to tweet this quote?");
      if (confirm) {
        window.open(twitterUrl);
      }
    } else {
      window.open(twitterUrl);
    }

  });

  getData();

  // YOGA STUDIO LOCATOR
  $('#search-form').submit(event => {
    event.preventDefault();
    const searchTerm = $('#search-term').val();
    getPlaces(searchTerm)
    .then(response => response.json())
    .then((places) => {
      createMapMarkers(places);
    })
  });
});
