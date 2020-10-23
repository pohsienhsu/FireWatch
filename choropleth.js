// enter code to define margin and dimensions for svg
var width = 1300,
  height = 600;

// enter code to create svg
var svg = d3.select("#choropleth").append("svg")
  .attr("width", width)
  .attr("height", height);

// enter code to create color scale
var colorScale = d3.scaleQuantile()
  .range(d3.schemeBlues[4]);

// enter code to define tooltip
var tooltip = d3.select('body').append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)

// enter code to define projection and path required for Choropleth
var path = d3.geoPath();
var projection = d3.geoAlbersUsa()
  .scale(1200)
  //  .center([0,20])
  .translate([width / 2, height / 2]);

// define any other global variables 
Promise.all([
  // enter code to read files
  d3.json("datasets/state.geo.json"),
  d3.csv("datasets/ratings-by-country.csv", (data) => {
    return {
      avg_rating: parseFloat(data['Average Rating']),
      country: data['Country'],
      game: data['Game'],
      num_users: parseInt(data['Number of Users']),
    }
  }),
  d3.json("datasets/counties.geo.json")
]).then((values) => {
  // enter code to call ready() with required arguments
  ready(null, values[0], values[1], values[2]);
}
);

// this function should be called once the data from files have been read
// world: topojson from world_countries.json
// gameData: data from ratings-by-country.csv
function ready(error, state, gameData, county) {
  // enter code to extract all unique games from gameDatas
  let games = [];
  gameData.forEach((datum) => {
    if (!games.includes(datum.game)) {
      games.push(datum.game);
    }
  })
  games.sort();

  // enter code to append the game options to the dropdown
  d3.select("#dropdown")
    .selectAll('myOptions')
    .data(games)
    .enter()
    .append('option')
    .text(function (d) { return d; })
    .attr("value", function (d) { return d; })

  // event listener for the dropdown. Update choropleth and legend when selection changes. Call createMapAndLegend() with required arguments.
  d3.select("#dropdown").on("change", function (d) {
    var selectedGame = d3.select(this).property("value")
    console.log(state, gameData, selectedGame)
    createMapAndLegend(state, county, gameData, selectedGame)
  })

  // create Choropleth with default option. Call createMapAndLegend() with required arguments. 
  createMapAndLegend(state, county, gameData, games[0])
}

// helpers for tooltip
function showtooltip(d, properties_dict) {
  tooltip.transition()
    .duration(200)
    .style("opacity", .8);
  tooltip.html("<b>Country</b>: " + d.properties.name + "<br />"
    + "<b>Game</b>: " + d3.select('#dropdown').property("value") + "<br />"
    + "<b>Avg Rating</b>: " + (d.properties.name in properties_dict ? properties_dict[d.properties.name].avg_rating : 0) + "<br />"
    + "<b>Number of Users</b>: " + (d.properties.name in properties_dict ? properties_dict[d.properties.name].num_users : 0))
    .style("left", (d3.event.pageX + 20) + "px")
    .style("top", (d3.event.pageY + 20) + "px");
}
function movetooltip(d) {
  tooltip
    .style("left", (d3.event.pageX + 20) + "px")
    .style("top", (d3.event.pageY + 20) + "px");
}
function hidetooltip(d) {
  tooltip.transition()
    .duration(200)
    .style("opacity", 0);
}

// this function should create a Choropleth and legend using the state and gameData arguments for a selectedGame
// also use this function to update Choropleth and legend when a different game is selected from the dropdown
function createMapAndLegend(state, county, gameData, selectedGame) {
  // clear out everything currently in the svg
  svg.select('g').remove()
  // only consider data for selectedGame
  let filteredGameData = gameData.filter((datum) => { return datum.game === selectedGame })
  // mapping from each country to its properties
  let properties_dict = {}
  filteredGameData.forEach((datum) => {
    properties_dict[datum.country] = datum
  })
  colorScale.domain(d3.extent(filteredGameData, function (d) { return d.avg_rating; }))

  // add states
  svg.append("g")
    .selectAll("path")
    .data(state.features)
    .enter()
    .append("path")
    .attr("d", d3.geoPath().projection(projection))
    .attr("id", function (d) {
      return d.properties.name;
    })
    // .attr("fill", function (d) {
    //   if (d.properties.name in properties_dict) {
    //     return colorScale(properties_dict[d.properties.name].avg_rating);
    //   }
    //   return 'gray';
    // })
    .attr("fill", '#696969')
    .attr("stroke", "white")
    .attr("stroke-width", "2px")
    .on("mouseenter", (d) => { showtooltip(d, properties_dict) })
    .on("mousemove", (d) => { movetooltip(d) })
    .on("mouseleave", (d) => { hidetooltip(d) });

  // add counties
  svg.append("g")
    .selectAll("path")
    .data(county.features)
    .enter()
    .append("path")
    .attr("d", d3.geoPath().projection(projection))
    .attr("stroke", "#A9A9A9")
    .attr("stroke-width", "0.6px")
    .attr("fill", "none")
  // .attr("id", function (d) {
  //   return d.properties.name;
  // })
  // .attr("fill", function (d) {
  //   if (d.properties.name in properties_dict) {
  //     return colorScale(properties_dict[d.properties.name].avg_rating);
  //   }
  //   return 'gray';
  // })

  // also add the legend
  svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + (width - 130) + ", " + 20 + ")");
  var legend = d3.legendColor()
    .scale(colorScale)
    .title("Legend")
    .labelFormat(d3.format('.2f'));
  d3.select(".legend").call(legend);
}
