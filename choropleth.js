// enter code to define margin and dimensions for svg
var width = 1300,
  height = 600;

var selectedMonth = 01  // default is Jan-1
var selectedDay = 01 // default is Jan-1
var radio_val = "airQuality" // default is AQI
var button_pressed = 0 // keep track of radio button switches

// enter code to create svg
var svg = d3.select("#choropleth").append("svg")
  .attr("width", width)
  .attr("height", height);

// enter code to create color scale
var colorScale = d3.scaleQuantile()
  .range(d3.schemeBlues[4]);

var colorFireScale = d3.scaleQuantile()
  .range(d3.schemeReds[4]);

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

const formatYear = d3.timeFormat("%Y");
const formatMonth = d3.timeFormat("%m");
const formatDay = d3.timeFormat("%d");

// const parseYear = d3.timeParse("%Y");
const parseDate = d3.timeParse("%Y-%m-%d");
const parseYear = d3.timeParse("%Y");

var states_json = [];
var county_json = [];
var fires_arr = [];
// Aqi csv file takes a bit longer to read, so cache the data
var aqi_data = {};

// define any other global variables
Promise.all([
  // enter code to read files
  d3.json("datasets/state.geo.json"),
  d3.json("datasets/counties.geo.json"),
]).then((values) => {
  // enter code to call ready() with required arguments
  states_json = values[0]
  county_json = values[1]
  ready(null, values[0], values[1]);
}
);

// this function should be called once the data from files have been read
// state: topojson from state.geo.json
// county: topojson from counties.geo.json
// fireData: data from fire_dates_fixed.csv
var aqiData = [];
function ready(error, state, county) {
  fireData = []

  // List of years we are interested in
  let years = [1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003,
               2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015] 

  // enter code to append the years to the dropdown
  d3.select("#dropdown")
    .selectAll('myOptions')
    .data(years)
    .enter()
    .append('option')
    .text(function (d) { return d; })
    .attr("value", function (d) { return d; })

  // radio button map-type
  d3.selectAll("input[name='map-type']").on("change", function() {
    radio_val = this.value
    button_pressed = 1
    selectedYear = d3.select("#dropdown").property("value")
    loadDataAndCreateMap(selectedYear, state, county, fireData)
    //handleMonthAndDay(state, county, fireData, aqiData, selectedYear)
    //createMapAndLegend(state, county, fireData, aqiData, selectedYear, selectedMonth, selectedDay)
  })

  // for default year
  selectedYear = years[0]
  loadDataAndCreateMap(selectedYear, state, county, fireData)

  // event listener for the dropdown. Update choropleth and legend when selection changes. Call createMapAndLegend() with required arguments.
  d3.select("#dropdown").on("change", function (d) {
    var selectedYear = d3.select(this).property("value")
    loadDataAndCreateMap(selectedYear, state, county, fireData)
  })
}


function loadDataAndCreateMap(selectedYear, state, county, fireData) {

  // for year selected in dropdown by user
  if (radio_val == "airQuality") {

    if (!(selectedYear in aqi_data)) {
    d3.csv("datasets/daily_aqi_by_county_" + selectedYear + ".csv")
      .then(function (data) {
        data.forEach(function (d) {
          d["year"] = formatYear(parseDate(d["DATE"]));
          d["month"] = formatMonth(parseDate(d["DATE"]));
          d["day"] = formatDay(parseDate(d["DATE"]));
        });

        aqiData = data
        aqi_data[selectedYear] = data
        handleMonthAndDay(state, county, fireData, aqiData, selectedYear)
        createMapAndLegend(state, county, fireData, aqiData, selectedYear, selectedMonth, selectedDay)
      })
    } else {
      aqiData = aqi_data[selectedYear]
      handleMonthAndDay(state, county, fireData, aqiData, selectedYear)
      createMapAndLegend(state, county, fireData, aqiData, selectedYear, selectedMonth, selectedDay)
    }

  }
  else {
    d3.csv("datasets/fires_" + selectedYear + ".csv")
      .then(function (data) {
        data.forEach(function (d) {
          d.fire_code = d['FIRE_CODE'];
          d.fire_name = d['FIRE_NAME'];
          d.year = d['FIRE_YEAR'];
          d.month = formatMonth(parseDate(d["DISCOVERY_DATE"]));
          d.day = formatDay(parseDate(d["DISCOVERY_DATE"]));
          d.discovery_date = parseDate(d['DISCOVERY_DATE']);
          /*d.discovery_doy: parseDate(d['DISCOVERY_DOY']),
          d.discovery_time: parseDate(d['DISCOVERY_TIME']),*/
          d.stat_cause_descr = parseDate(d['STAT_CAUSE_DESCR']);
          d.continue_date = parseDate(d['CONT_DATE']);
          /*d.continue_doy: parseDate(d['CONT_DOY']),
          d.continue_time: parseDate(d['CONT_TIME']),*/
          d.fire_size = d['FIRE_SIZE'];
          d.fire_size_class = d['FIRE_SIZE_CLASS'];
          d.lat = d['LATITUDE'];
          d.long = d['LONGITUDE'];
          /*d.owner_code: d['OWNER_CODE'],
          d.owner_descr: d['OWNER_DESCR'],*/
          d.county_dec = d['COUNTY'];
          d.county_code = d['COUNTY_CODE'];
          /*d.fips_name: d['FIPS_NAME'], */
          d.state = d["STATE_NAME"];
          d.county = d["COUNTY_NAME"];
          d.state_code = d["STATE_CODE"];
      });
      //console.log(data)
      fireData = data
      handleMonthAndDay(state, county, fireData, aqiData, selectedYear)
      createMapAndLegend(state, county, fireData, aqiData, selectedYear, selectedMonth, selectedDay)
    })

  }
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

function parseDays(filteredData) {
  d3.select("#dropdown_day").html("")

  let filteredDataByMonth = filteredData.filter((datum) => { return parseInt(datum.month) === parseInt(selectedMonth) })
  let days = [];
  filteredDataByMonth.forEach((datum) => {
    // console.log(datum.day);
    if (!days.includes(datum.day)) {
      days.push(datum.day);
    }
  })
  days.sort();
  selectedDay = parseInt(days[0])

  // enter code to append the months to the dropdown
  d3.select("#dropdown_day")
    .selectAll('myOptions')
    .data(days)
    .enter()
    .append('option')
    .text(function (d) { return d; })
    .attr("value", function (d) { return d; })
}

function handleMonthAndDay(state, county, fireData, aqiData, selectedYear) {
  let filteredAqiData
  let filteredFireData
  let months = [];
  d3.select("#dropdown_month").html("")
  d3.select("#dropdown_day").html("")

  console.log("radio_val")
  console.log(radio_val)
 if (radio_val == "airQuality") {
   filteredAqiData = aqiData.filter((datum) => { return datum.year == selectedYear })
   filteredAqiData.forEach((datum) => {
     //console.log(datum.month);
     if (!months.includes(datum.month)) {
       months.push(datum.month);
     }
   })
   months.sort();
   selectedMonth = parseInt(months[0])
 }
 else { 
   console.log(datum.year + " " + selectedYear)
   filteredFireData = fireData.filter((datum) => { return datum.year == selectedYear })
   filteredFireData.forEach((datum) => {
     //console.log(datum.month);
     if (!months.includes(datum.month)) {
       months.push(datum.month);
     }
   })
   months.sort();
   selectedMonth = parseInt(months[0])
 }

  //console.log(months)
  // enter code to append the months to the dropdown
  d3.select("#dropdown_month")
    .selectAll('myOptions')
    .data(months)
    .enter()
    .append('option')
    .text(function (d) { return d; })
    .attr("value", function (d) { return d; })

  d3.select("#dropdown_month").on("change", function (d) {
       // for year selected in dropdown by user
       selectedMonth = d3.select(this).property("value")
       if (radio_val == "airQuality") {
         parseDays(filteredAqiData)
       }
       else {
         parseDays(filteredFireData)
       }
       createMapAndLegend(state, county, fireData, aqiData, selectedYear, selectedMonth, selectedDay)
  })

  if (radio_val == "airQuality") {
    parseDays(filteredAqiData)
  }
  else {
    parseDays(filteredFireData)
  }

  d3.select("#dropdown_day").on("change", function (d) {
       // for year selected in dropdown by user
       selectedDay = d3.select(this).property("value")
       createMapAndLegend(state, county, fireData, aqiData, selectedYear, selectedMonth, selectedDay)
  })
}

function showAqiMap(state, county, fireData, aqiData, selectedYear, selectedMonth, selectedDay) {
  // clear out everything currently in the svg
  svg.select('g').remove()

  // reset on change jic aqi data not present for that day.
  /*if (button_pressed == 1) {
    selectedYear = 1992
    selectedMonth = 01
    selecedtDay = 01
  }*/

  let filteredAqiData = aqiData.filter((datum) => {  
                                                          return datum.year == selectedYear  && 
                                                          datum.month == selectedMonth  &&
                                                          datum.day == selectedDay})

  // this is for the year aqi avg reading
  // we are doing it by day now
  /*var avgAqiPerYearData = d3.nest()
                            .key(function(d) {return d["STATE_CODE"} ]})
                            .key(function(d) {return d["COUNTY_CODE"} ]})
                            .rollup(function(v) { return d3.mean(v, function(d) { return d.AQI })})
                            .entries(filteredAqiData)*/


  var aqiTable = {}

  for (var i = 0; i < filteredAqiData.length; i++)
  {
    datum = filteredAqiData[i]
    aqiTable[[datum.STATE_CODE, datum.COUNTY_CODE]] = datum.AQI
  }


  // NOTE: using filteredAqiData not aqiData here to get range by year.
  // change this to aqiData, ... if you want to make one universal color domain
  // i.e. within the yearly AQI range, how did this day do.
  colorScale.domain(d3.extent(filteredAqiData, function (d) { return d["AQI"]; }))

  // only consider data for selectedGame
  // let filteredfireData = fireData.filter((datum) => { return datum.game === selectedGame })
  // mapping from each county to its properties
  let properties_dict = {}
  fireData.forEach((datum) => {
    properties_dict["state"] = datum.state;
    properties_dict["county"] = datum.state;
  })
  // colorScale.domain(d3.extent(fireData, function (d) { return parseYear(d.year); }))

  console.log("Before")
  // add counties
  svg.append("g")
    .selectAll("path")
    .data(county.features)
    .enter()
    .append("path")
    .attr("d", d3.geoPath().projection(projection))
    .attr("stroke", "#A9A9A9")
    .attr("stroke-width", "0.6px")
    .attr("fill", function(d) {
       var state_code = d.properties.STATE
       var county_code = d.properties.COUNTY
       var county_name = d.properties.NAME
        
       if ([state_code, county_code] in aqiTable) {
           return colorScale(aqiTable[[state_code, county_code]])
       }

       return "grey";
    })
    .attr("id", function (d) {
      return d.properties.NAME;
    })
    // .on("mouseenter", (d) => { showtooltip(d, properties_dict) })
    // .on("mousemove", (d) => { movetooltip(d) })
    // .on("mouseleave", (d) => { hidetooltip(d) });

  console.log("After")
  //also add the legend
  svg.append("g")
     .attr("class", "legend")
     .attr("transform", "translate(" + (width - 130) + ", " + 20 + ")");
  var legend = d3.legendColor()
              .scale(colorScale)
              .title("AQI Level Legend")
              .labelFormat(d3.format('.2f'));
  d3.select(".legend").call(legend);
}

function showFireMap(state, county, fireData, aqiData, selectedYear, selectedMonth, selectedDay) {

  // clear out everything currently in the svg
  svg.select('g').remove()

  let filteredFireData = fireData.filter((datum) => { return datum.year == selectedYear &&
                                                             datum.month == selectedMonth &&
                                                             datum.day == selectedDay })

  // this is for the year aqi avg reading
  // we are doing it by day now
  /*var avgAqiPerYearData = d3.nest()
                            .key(function(d) {return d["STATE_CODE"} ]})
                            .key(function(d) {return d["COUNTY_CODE"} ]})
                            .rollup(function(v) { return d3.mean(v, function(d) { return d.AQI })})
                            .entries(filteredAqiData)*/

  // NOTE: using filteredAqiData not aqiData here to get range by year.
  // change this to aqiData, ... if you want to make one universal color domain
  // i.e. within the yearly AQI range, how did this day do.
  colorFireScale.domain(d3.extent(filteredFireData, function (d) { return d.fire_size ; }))

  // only consider data for selectedGame
  // let filteredfireData = fireData.filter((datum) => { return datum.game === selectedGame })
  // mapping from each county to its properties
  let properties_dict = {}
  fireData.forEach((datum) => {
    properties_dict["state"] = datum.state;
    properties_dict["county"] = datum.state;
  })
  // colorScale.domain(d3.extent(fireData, function (d) { return parseYear(d.year); }))


  console.log("Hello")
  // add counties
  svg.append("g")
    .selectAll("path")
    .data(county.features)
    .enter()
    .append("path")
    .attr("d", d3.geoPath().projection(projection))
    .attr("stroke", "#A9A9A9")
    .attr("stroke-width", "0.6px")
    .attr("fill", function(d) {
       var state_code = d.properties.STATE
       var county_code = d.properties.COUNTY
       var county_name = d.properties.NAME

       for (var i = 0; i < filteredFireData.length; i++)
       {
         if (parseInt(filteredFireData[i].county_code) == county_code && parseInt(filteredFireData[i].state_code) == state_code)
         {
           var yr = parseInt(filteredFireData[i].year)
           var m = parseInt(filteredFireData[i].month)
           var d = parseInt(filteredFireData[i].day)
           if (yr == selectedYear && m == selectedMonth && d == selectedDay)
           {
             return colorFireScale(filteredFireData[i].fire_size)
           }
         }
       }
       return "grey";
    })
    .attr("id", function (d) {
      return d.properties.NAME;
    })
    // .on("mouseenter", (d) => { showtooltip(d, properties_dict) })
    // .on("mousemove", (d) => { movetooltip(d) })
    // .on("mouseleave", (d) => { hidetooltip(d) });
  console.log("Bye bye")

  //also add the legend
  svg.append("g")
     .attr("class", "legend")
     .attr("transform", "translate(" + (width - 130) + ", " + 20 + ")");
  var legend = d3.legendColor()
              .scale(colorFireScale)
              .title("Fire Size Legend")
              .labelFormat(d3.format('.2f'));
  d3.select(".legend").call(legend);
}

// this function should create a Choropleth and legend using the state and fireData arguments for a selectedGame
// also use this function to update Choropleth and legend when a different game is selected from the dropdown
function createMapAndLegend(state, county, fireData, aqiData, selectedYear, selectedMonth, selectedDay) {
  if (radio_val == "airQuality") {
    showAqiMap(state, county, fireData, aqiData, selectedYear, selectedMonth, selectedDay)
    button_pressed = 0
  }
  else {
    showFireMap(state, county, fireData, aqiData, selectedYear, selectedMonth, selectedDay)
    button_pressed = 0
  }
}
