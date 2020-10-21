// $cloropleth = $('#cloropleth');
// $cloropleth.text('Success');

// create a geo path - https://github.com/mbostock/d3/wiki/Geo-Paths
var path = d3.geoPath();

// create an svg element
var svg = d3.select("#choropleth")
  .append("svg");

// create a container for counties
var counties = svg.append("g")
    .attr("id", "counties")
    .attr("class", "Blues");

// create a container for states
var states = svg.append("g")
    .attr("id", "states");

// load the county shape data
d3.json("datasetes/counties.geo.json", function(json) {
  // create paths for each county using the json data
  // and the geo path generator to draw the shapes
  counties.selectAll("path")
      .data(json.features)
    .enter().append("path")
      .attr("d", path);
});

// load the state shape data
d3.json("datasets/state.geo.json", function(json) {
  // create paths for each state using the json data
  // and the geo path generator to draw the shapes
  states.selectAll("path")
      .data(json.features)
    .enter().append("path")
      .attr("d", path);
});

