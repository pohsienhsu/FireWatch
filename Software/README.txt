Fire and Air Pollution Visualization
CSE 6242 Final Project
Names: Srikesh Srinivas, Wendell Hom, Po Hsien Hsu, Sam Stentz, Lauren Vossler, Yeong Jer Tseng
Software Component README

### DESCRIPTION
The package contains two folders DOC/ and CODE/. The DOC/ directory contains our final report and team poster in PDF format. 
The CODE/ directory contains all the necessary files to load our data visualizer. In this project, we attempted several things: 
to visualize over 1.88 million wilfires from 1992 to 2015 and corresponding national AQI data for those years on a choropleth map,
to analyze any correlations between fires and their air quality levels, and lastly to abstract findings from acreage burned and 
unsupervised learning classifications. All of this data visualization and analysis is presented in the webpage. 

Upon loading, the webpage first displays the AQI choropleth map. The range values are color coded based on values observed here:

https://www.airnow.gov/aqi/aqi-basics/

The map has a dropdown selector for Year, month, and day. User may select day they are interested in and the data will load in a matter
of seconds. Tooltip for the fires data will show on county mouseover, displaying data such as State and County Names, Defining AQI Parameter, overall AQI level
assessment, and the air quality score itself. 

User may click the Fires toggle button to view fires data, heatmapped according to annual scaling of fire size. Mouseover for county
will show relevant and informative data (i.e. state and county name, most common cause for that county on that date, average fire size, and a 
line chart that plots monthly pairing of AQI and acres burned in that state).

User can click on "Analysis Dropdowns" and select any item from the dropdown menu to read detailed descriptions of our analysis for this project.
The Discussion and Conclusions tab contains a summation of our findings.


### INSTALLATION
1. cd CODE/
2. Unzip final-pkg-installer.zip. This will create directory final-pkg-installer/.
3. Unzip final-pkg-installer/datasets.zip
4. Unzip final-pkg-installer/analysis_plots/state_level_monthly_paired_view.zip

### EXECUTION
1. cd final-pkg-installer/
2. In a command prompt (e.g iTerm2 on MacOS) type: python3 -m http.server 8888 to connect to the http server
3. Go to http://localhost:8888 in your browser.
4. Observe the Map. Notice the "Analysis Dropdown" and "Discussion and Conclusions" tabs.


