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
  .style("opacity", 0);

// enter code to define projection and path required for Choropleth
var path = d3.geoPath();
var projection = d3.geoAlbersUsa()
  .scale(1200)
  //  .center([0,20])
  .translate([width / 2, height / 2]);

const formatDate = d3.timeFormat("%Y");
// const parseYear = d3.timeParse("%Y");
const parseDate = d3.timeParse("%Y-%m-%d");
const parseYear = d3.timeParse("%Y");

// define any other global variables 
Promise.all([
  // enter code to read files
  d3.json("datasets/state.geo.json"),
  d3.json("datasets/counties.geo.json"),
  d3.csv("datasets/fire_perDate.csv", (data) => {
    return {
      fire_code: data['FIRE_CODE'],
      fire_name: data['FIRE_NAME'],
      fire_year: formatDate(parseDate(data["DISCOVERY_Date"])),
      discovery_date: parseDate(data['DISCOVERY_Date']),
      continue_date: parseDate(data['CONT_Date']),
      owner_code: parseInt(data["OWNER_CODE"]),
      owner_descr: data["OWNER__DESCR"],
      state: data["STATE"],
      county: data["COUNTY_NAME"], 
    }
  })
]).then((values) => {
  // enter code to call ready() with required arguments
  ready(null, values[0], values[1], values[2]);
  // ready(null, values[0], values[1])
}
);

// this function should be called once the data from files have been read
// state: topojson from state.geo.json
// county: topojson from counties.geo.json
// fireData: data from fire_dates_fixed.csv
function ready(error, state, county, fireData) {
  // enter code to extract all unique games from fireDatas
  let years = [];
  fireData.forEach((datum) => {
    // console.log(datum.fire_year);
    if (!years.includes(datum.fire_year)) {
      years.push(datum.fire_year);
    }
  })
  years.sort();

  // enter code to append the years to the dropdown
  d3.select("#dropdown")
    .selectAll('myOptions')
    .data(years)
    .enter()
    .append('option')
    .text(function (d) { return d; })
    .attr("value", function (d) { return d; })

  // event listener for the dropdown. Update choropleth and legend when selection changes. Call createMapAndLegend() with required arguments.
  // d3.select("#dropdown").on("change", function (d) {
  //   var selectedYear = d3.select(this).property("value")
  //   console.log(state, fireData, selectedYear)
  //   createMapAndLegend(state, county, fireData, selectedYear)
  // })

  // create Choropleth with default option. Call createMapAndLegend() with required arguments. 
  createMapAndLegend(state, county, fireData);
}

// helpers for tooltip
function showtooltip(d, properties_dict) {
  tooltip.transition()
    .duration(200)
    .style("opacity", .8);
  console.log(properties_dict["state"]);
  console.log(properties_dict["county"]);
  tooltip.html("<b>State</b>: " + properties_dict[d.properties.state] + "<br />"
    + "<b>County</b>: " + properties_dict[d.properties.county] + "<br />")
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

// this function should create a Choropleth and legend using the state and fireData arguments for a selectedGame
// also use this function to update Choropleth and legend when a different game is selected from the dropdown
function createMapAndLegend(state, county, fireData) {
  // let states = []
  // fireData.forEach((datum) => {
  //   if(!states.includes(datum.state)) {
  //     states.push(datum.state)
  //   }
  // })

  // let counties = []
  // fireData.forEach((datum) => {
  //   if(!counties.includes(datum.county)) {
  //     counties.push(datum.county)
  //   }
  // })

  // clear out everything currently in the svg
  svg.select('g').remove()

  // only consider data for selectedGame
  // let filteredfireData = fireData.filter((datum) => { return datum.game === selectedGame })
  // mapping from each county to its properties
  let properties_dict = {}
  fireData.forEach((datum) => {
    properties_dict["state"] = datum.state;
    properties_dict["county"] = datum.state;
  })
  // colorScale.domain(d3.extent(fireData, function (d) { return parseYear(d.fire_year); }))

  // add states
  svg.append("g")
    .selectAll("path")
    .data(state.features)
    .enter()
    .append("path")
    .attr("d", d3.geoPath().projection(projection))
    .attr("id", function (d) {
      return d.properties.NAME10;
    })
    .attr("fill", '#696969')
    .attr("stroke", "white")
    .attr("stroke-width", "2px")
    // .on("mouseenter", (d) => { showtooltip(d, properties_dict) })
    // .on("mousemove", (d) => { movetooltip(d) })
    // .on("mouseleave", (d) => { hidetooltip(d) });

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
    .attr("id", function (d) {
      return d.properties.NAME;
    })
    // .on("mouseenter", (d) => { showtooltip(d, properties_dict) })
    // .on("mousemove", (d) => { movetooltip(d) })
    // .on("mouseleave", (d) => { hidetooltip(d) });

  // also add the legend
  // svg.append("g")
  //   .attr("class", "legend")
  //   .attr("transform", "translate(" + (width - 130) + ", " + 20 + ")");
  // var legend = d3.legendColor()
  //   .scale(colorScale)
  //   .title("Legend")
  //   .labelFormat(d3.format('.2f'));
  // d3.select(".legend").call(legend);
}
