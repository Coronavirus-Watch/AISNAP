/* Useful resources:
  https://dev.to/wuz/building-a-country-highlighting-tool-with-mapbox-2kbh
  https://bl.ocks.org/danswick/fc56f37c10d40be62e4feac5984250d2
*/

mapboxgl.accessToken =
  "pk.eyJ1IjoibWF4d2lsbGtlbGx5IiwiYSI6ImNrNjhsOWdlZTA0M2Yza21mMG9icjBwdmIifQ.OTaUkNePX-6XE3Vgcy9v6A";

// Creates a map and sets basic properties
var map = new mapboxgl.Map({
  container: "map",
  // Sets the map style
  style: "mapbox://styles/mapbox/light-v10",
  // Displays the world
  zoom: 0,
  center: [10, 50],
  });

// Adds full screen control
map.addControl(new mapboxgl.FullscreenControl());

// Runs when the map is loaded
map.on('load', function() {
  
});

// Runs when a country is clicked on
map.on('click', 'countries', function(mapElement) {

});