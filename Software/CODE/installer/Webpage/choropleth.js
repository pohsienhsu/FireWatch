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
var colorScale = d3.scaleThreshold()
  .range(["grey", "green", "yellow", "orange", "red", "purple", "maroon"]);

var colorFireScale = d3.scaleQuantile()
  .domain([0, 0.25, 10, 100, 300, 1000, 5000, 1000000])
  .range(d3.schemeReds[7]);

// enter code to define tooltip
var tooltip = d3.select('body').append("div")
  .attr("id", "tooltip-div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// enter code to define projection and path required for Choropleth
var path = d3.geoPath();
var projection = d3.geoAlbersUsa()
  .scale(1200)
  //  .center([0,20])
  .translate([width / 2.75, height / 2]);

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
var fire_yearly_data = {};

var tooltip_data = [];

// define any other global variables
Promise.all([
  // enter code to read files
  d3.json("datasets/state.geo.json"),
  d3.json("datasets/us-albers-counties.json"),
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
    console.log(selectedYear)
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

    // load additional averaging data for tooltip
    d3.csv("datasets/fires_" + selectedYear + "_avgs.csv")
      .then(function (data) {
        console.log("tooltip_data")
        console.log(data)
        tooltip_data = data
      })

    if (!(selectedYear in fire_yearly_data)) {
      console.log("loading from data for year " + selectedYear)
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
            d.cont_date = parseDate(d['CONT_DATE']);
            d.cont_year = formatYear(parseDate(d['CONT_DATE']));
            d.cont_month = formatMonth(parseDate(d['CONT_DATE']));
            d.cont_day = formatDay(parseDate(d['CONT_DATE']));
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
            d.fips = d.STATE_CODE.padStart(2, '0') + d.COUNTY_CODE.padStart(3, '0')
        });

        fireData = data
        fire_yearly_data[selectedYear] = data

        handleMonthAndDay(state, county, fireData, aqiData, selectedYear)
        createMapAndLegend(state, county, fireData, aqiData, selectedYear, selectedMonth, selectedDay)
    })
    } else {
      fireData = fire_yearly_data[selectedYear]
      handleMonthAndDay(state, county, fireData, aqiData, selectedYear)
      createMapAndLegend(state, county, fireData, aqiData, selectedYear, selectedMonth, selectedDay)
    }
  }
}

var first = 0
var curr_node = new Object()
var precision = d3.precisionFixed(.001), round = d3.format("." + precision + "f");

// helpers for tooltip
function showtooltip(d, properties_dict) {
  tooltip.transition()
    .duration(200)
    .style("opacity", .8);

  var county_info = properties_dict[d.properties.fips]
  if (radio_val == "airQuality") {
    if (county_info !== undefined) {
      tooltip.html("<b>State</b>: " + county_info[0]+ "<br />"
        + "<b>County</b>: " + county_info[1] + "<br />"
        + "<b>Defining Parameter</b>: " + county_info[2] + "<br />"
        + "<b>Category</b>: " + county_info[3] + "<br />"
        + "<b>AQI</b>: " + county_info[4] + "<br />")
        .style("left", (d3.event.pageX + 20) + "px")
        .style("top", (d3.event.pageY + 20) + "px");
     } else {
       tooltip.html("<b>No available data for this county</b><br />")
       .style("left", (d3.event.pageX + 20) + "px")
       .style("top", (d3.event.pageY + 20) + "px");
     }
   } else {
      let filteredTooltipData = tooltip_data.filter( function (datum) {
            fips = datum.STATE_CODE.padStart(2, '0') + datum.COUNTY_CODE.padStart(3, '0')
            return d.properties.fips == fips })[0]

      var geo_names = properties_dict[d.properties.fips]
      if (filteredTooltipData !== undefined && geo_names !== undefined) {
        tooltip.html("<b>State</b>: " + geo_names[0] + "<br />"
                      + "<b>County</b>: " + geo_names[1] + "<br />"
                      + "<b>County Max Fire Size (per Day)</b>: " + round(geo_names[2]) + "<br />"
                      + "<b>County Average Fire Size (per Year)</b>: " + round(filteredTooltipData.AVG_FIRE_SIZE) + "<br />"
                      + "<b>Most Common Cause</b>: " + filteredTooltipData.MOST_COMMON_CAUSE + "<br />")
          .style("left", (d3.event.pageX + 20) + "px")
          .style("top", (d3.event.pageY + 20) + "px");

      } else {
        tooltip.html("<b>No available data for this county</b><br />")
        .style("left", (d3.event.pageX + 20) + "px")
        .style("top", (d3.event.pageY + 20) + "px");
      }
    }
}

function movetooltip(d) {
  tooltip.style("left", (d3.event.pageX + 20) + "px")
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

  let filteredAqiData = aqiData.filter((datum) => {
                                                          return datum.year == selectedYear  &&
                                                          datum.month == selectedMonth  &&
                                                          datum.day == selectedDay})

  var aqiTable = {}

  for (var i = 0; i < filteredAqiData.length; i++)
  {
    datum = filteredAqiData[i]
    aqiTable[datum.STATE_CODE + datum.COUNTY_CODE] = datum.AQI
  }

  colorScale.domain([0,50, 100, 150, 200, 300])

  // mapping from each county to its properties
  var properties_dict = {}
  filteredAqiData.forEach((datum) => {
    properties_dict[datum.STATE_CODE + datum.COUNTY_CODE] = [datum.STATE_NAME, datum.COUNTY_NAME, datum.DEFINING_PARAMETER,datum.CATEGORY,datum.AQI]
  })

  var geojson = topojson.feature(county, county.objects.collection);

  // add counties
  svg.append("g")
    .selectAll("path")
    .data(geojson.features)
    .enter()
    .append("path")
    .attr("d", d3.geoPath().projection(projection))
    .attr("stroke", "#A9A9A9")
    .attr("stroke-width", "0.6px")
    .attr("fill", function(d) {
       var fips = d.properties.fips

       if (fips in aqiTable) {
           return colorScale(aqiTable[fips])
       }

       return "grey";
    })
    .attr("id", function (d) {
      return d.properties.NAME;
    })
    .on("mouseenter", (d) => { showtooltip(d, properties_dict) })
    .on("mousemove", (d) => { movetooltip(d) })
    .on("mouseleave", (d) => { hidetooltip(d) });

  //also add the legend
  svg.append("g")
     .attr("class", "legend")
     .attr("transform", "translate(" + (width - 300) + ", " + 20 + ")");
  var legend = d3.legendColor()
              .scale(colorScale)
              .title("AQI Level Legend")
              .labels(["No Data", "Good (0 to 50)", "Moderate (51 to 100)", "Unhealthy for Sensitive Groups (101 to 150)", "Unhealthy (151 to 200)", "Very Unhealthy (201 to 300)", "Hazardous (301 and higher)"])
              //.labels(d3.legendHelpers.thresholdLabels)
              .labelFormat(d3.format('.2f'));
  d3.select(".legend").call(legend);
}

function callback(datum, selectedYear, selectedMonth, selectedDay) {


  if (datum.year == selectedYear) {
    if (datum.month < selectedMonth && datum.cont_month > selectedMonth)  {
      return true;
    }
    if (datum.month == selectedMonth && datum.day <= selectedDay && datum.cont_month > selectedMonth) {
      return true;
    }
    if (datum.month == selectedMonth && datum.day <= selectedDay && datum.cont_month == selectedMonth && (datum.cont_day >= selectedDay || datum.cont_day == "")) {
      return true;
    }
    if (datum.cont_month == selectedMonth && (datum.cont_day >= selectedDay || datum.cont_day == "") && datum.month == selectedMonth) {
      return true;
    }
    if (datum.cont_month == selectedMonth && (datum.cont_day >= selectedDay || datum.cont_day == "") && datum.month < selectedMonth) {
      return true;
    }
  }

  return false;
}

function showFireMap(state, county, fireData, aqiData, selectedYear, selectedMonth, selectedDay) {

  // clear out everything currently in the svg
  svg.select('g').remove()

  // Pass selectedYear, selectedMonth, and selectedDay to callback function otherwise it uses the wrong values from the global variables
  let filteredFireData = fireData.filter(function(d) {
       return callback(d, selectedYear, selectedMonth, selectedDay)
  })

  var fsizeTable = {}

  for (var i = 0; i < filteredFireData.length; i++)
  {
    datum = filteredFireData[i]

    if (datum.fips in fsizeTable) {
        fsizeTable[datum.fips] = Math.max(parseInt(datum.fire_size), fsizeTable[datum.fips])
    } else {
        fsizeTable[datum.fips] = parseInt(datum.fire_size)
    }
  }

  //colorFireScale.domain(d3.extent(fireData, function (d) { return d.fire_size ; }))

  // only consider data for selectedGame
  // let filteredfireData = fireData.filter((datum) => { return datum.game === selectedGame })
  // mapping from each county to its properties
  let properties_dict = {}
  filteredFireData.forEach((datum) => {
    properties_dict[datum.fips] = [datum.STATE_NAME, datum.COUNTY_NAME, fsizeTable[datum.fips]]
  })
  // colorScale.domain(d3.extent(fireData, function (d) { return parseYear(d.year); }))

  var geojson = topojson.feature(county, county.objects.collection);

  // add counties
  svg.append("g")
    .selectAll("path")
    .data(geojson.features)
    .enter()
    .append("path")
    .attr("d", d3.geoPath().projection(projection))
    .attr("stroke", "#A9A9A9")
    .attr("stroke-width", "0.6px")
    .attr("fill", function(d) {
       var fips = d.properties.fips

       if (fips in fsizeTable) {
           return colorFireScale(fsizeTable[fips])
       }
       return "grey";
    })
    .attr("id", function (d) {
      return d.properties.NAME;
    })
    .on("mouseenter", (d) => { showtooltip(d, properties_dict) })
    .on("mousemove", (d) => { movetooltip(d) })
    .on("mouseleave", (d) => { hidetooltip(d) });

  //also add the legend
  svg.append("g")
     .attr("class", "legend")
     .attr("transform", "translate(" + (width - 300) + ", " + 20 + ")");
  var legend = d3.legendColor()
              .scale(colorFireScale)
              .title("Fire Size Legend (Acres Burned)")
              .labels(["0 to 0.25 acres", "0.25 to 10 acres", "10 to 100 acres", "100 to 300 acres", "300 to 1000 acres", "1000 to 5000 acres", "5000+ acres"])
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
