
//Creating the map object

let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 2,
  });
  
  // Adding the tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(myMap);
  
  // Store our API endpoint as queryUrl.
  let queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

  let depthScale = d3.scaleLinear()
  .domain([0, 700])
  .range([0.5, 1]);

   // Create a legend control
let legend = L.control({ position: "bottomright" });

// Define the onAdd method for the legend
legend.onAdd = function (map) {
  // Create a new div element for the legend
  let div = L.DomUtil.create("div", "legend");

  // Define the legend content
  let grades = [-10, 200, 300, 400, 500, 600];
  let labels = [];

  // Loop through the depth intervals and generate a label with a colored square for each interval
  for (let i = 0; i < grades.length; i++) {
    let from = grades[i];
    let to = grades[i + 1] || grades[grades.length - 1];
    let color = d3.interpolateBlues(depthScale((from + to) / 2));
    let label = i === grades.length - 1 ? `${from}+` : `${from} - ${to}`;
    labels.push(`<i style="background:${color}"></i>${label}`);
  }

  // Add the legend content to the div
  div.innerHTML = `<h4>Depth</h4>${labels.join("<br>")}`;

  return div;
};

// Add the legend control to the map
legend.addTo(myMap)
  
  //Perform a GET request to the query URL
  d3.json(queryURL).then(function (data) {
      console.log(data.features)
     //Defind a function to create circle markers
      function createCircleMarker( feature, latlng){
        //Calculate radius of circle based on magnitude
        let magnitude = feature.properties.mag;
        let radius = Math.sqrt(magnitude)*5;
        let depth = feature.geometry.coordinates[2];
        let depthColor= d3.interpolateBlues(depthScale(depth));
        //Create and return the circle market
        return L.circleMarker(latlng, {
            radius: radius,
            fillColor: depthColor,
            color: "white",
            weight: 1,
            opacity: 1,
            fillOpacity:0.8
        }).bindPopup(`<h3>${feature.properties.place}</h3><hr><p> Magnitude: ${feature.properties.mag}</h3><hr><p> Depth: ${feature.geometry.coordinates[2]}`);
      }

        // Define a function to set the style of each feature in the GeoJSON data
      
      let earthquakesLayer = L.geoJson(data, {
        pointToLayer: createCircleMarker
      });

      earthquakesLayer.addTo(myMap);
  }); 
