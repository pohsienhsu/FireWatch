import pandas as pd
import json
import requests
# import zipcodes
# from functools import partial
# from geopy.geocoders import Nominatim
from pprint import pprint
from datetime import date

# api_key: 635546E7-B173-4882-B11A-3F151443E6A5

class AQINow:
    def __init__(self, api_key):
        self.api_key = api_key
    
    def __repr__(self):
        return f"< AIPNow: api_key: {self.api_key} >"

    @classmethod
    def load_data(cls, data="datasets/counties_latLong.csv"):
        # add dtype for FIRE_CODE to silence the warning
        geo_data = pd.read_csv(data \
            , dtype={"USPS": str, 'GEOID': int, 'ANSICODE': int \
            , 'NAME': str, 'ALAND': float, 'AWATER': float, 'ALAND_SQMI': float \
            , 'AWATER_SQMI': float, 'INTPTLAT': float, 'INTPTLONG': float})
        
        columns = ['USPS', 'GEOID', 'NAME', 'INTPTLAT', 'INTPTLONG']
        geo_data = geo_data[columns]
        
        return geo_data

    @classmethod
    def get_latLong(cls, state_code=None, county_name=None, data="datasets/counties_latLong.csv"):
        # add dtype for FIRE_CODE to silence the warning
        if ('County' not in county_name) and (county_name != None):
            county_name += " County"
        print(county_name)
        geo_data = cls.load_data(data)
        if state_code is not None:
            geo_data = geo_data[geo_data['USPS'] == state_code]
        if county_name is not None:
            geo_data = geo_data[geo_data['NAME'] == county_name]
        columns = ['INTPTLAT', 'INTPTLONG']
        geo_data = geo_data[columns]
        print(geo_data)
        try:
            latLong = (geo_data.at[0,'INTPTLAT'], geo_data.at[0,'INTPTLONG'])
        except:
            print('No data')
            return None
        # print(latLong)
        
        return latLong

    def get_past_aqi(self, state_code, county_name, format_type="application/json", date="1992-01-01", distance=50):
        """
        Retrieves the average AQI of a specific data & location
        parameters: {latitude: float or str,
                     longitude: float or str,
                     format_type: str (application/json),
                     date: str (ex. 1992-01-10),
                     distance: int}
        
        return: data: json, aqi: int
        """
        api_key = self.api_key
        latLong = AQINow.get_latLong(state_code, county_name)
        options = {}
        options["baseurl"] = "https://www.airnowapi.org/aq/observation/latLong/historical/?"
        options["date"] = date + "T00-0000"
        options["latitude"] = str(latLong[0])
        options["longitude"] = str(latLong[1])
        options["distance"] = str(distance)
        options["format"] = format_type
        options["api_key"] = api_key

        REQUEST_URL = options["baseurl"] \
                  + "format=" + options["format"] \
                  + "&latitude=" + options["latitude"] \
                  + "&longitude=" + options["longitude"] \
                  + "&date=" + options["date"] \
                  + "&distance=" + options["distance"] \
                  + "&API_KEY=" + options["api_key"]
        
        response = requests.get(REQUEST_URL)
        print(REQUEST_URL)
        aqi_total = 0

        if response.status_code == 200 and options['format'] == "application/json":
            data = json.loads(response.content.decode('utf-8'))
            if(len(data) == 0):
                return "No data"
        else:
            print(f"{response.status_code}: request failed")
            return None

        for ob in data:
                aqi_total += ob['AQI']
        
        return data, round(aqi_total/len(data), 2)

    
    def get_forecast_aqi(self, state_name=None, county_name=None, format_type="application/json", date="2020-11-10", distance=50):
        """
        Retrieves the average AQI of a specific data & location
        parameters: {latitude: float or str,
                     longitude: float or str,
                     format_type: str (application/json),
                     date: str (ex. 2020-11-10),
                     distance: int}
        
        return: data: json, aqi: int
        """
        api_key = self.api_key
        latLong = AQINow.get_latLong(state_name, county_name)
        options = {}
        options["baseurl"] = "https://www.airnowapi.org/aq/forecast/latLong/?"
        options["date"] = date
        options["latitude"] = str(latLong[0])
        options["longitude"] = str(latLong[1])
        options["distance"] = str(distance)
        options["format"] = format_type
        options["api_key"] = api_key

        REQUEST_URL = options["baseurl"] \
                  + "format=" + options["format"] \
                  + "&latitude=" + options["latitude"] \
                  + "&longitude=" + options["longitude"] \
                  + "&date=" + options["date"] \
                  + "&distance=" + options["distance"] \
                  + "&API_KEY=" + options["api_key"]

        response = requests.get(REQUEST_URL)
        print(REQUEST_URL)
        aqi_total = 0

        if response.status_code == 200 and options['format'] == "application/json":
            data = json.loads(response.content.decode('utf-8'))
            for ob in data:
                aqi_total += ob['AQI']
        else:
            print(f"{response.status_code}: request failed")
            return None
        
        discussion = data[0]['Discussion']
        return data, round(aqi_total/len(data), 2), discussion

        

def main():
    aqinow = AQINow(api_key="635546E7-B173-4882-B11A-3F151443E6A5")

    # data, aqi = aqinow.get_past_aqi_latLong(39.7302, -112.0163, date="2018-09-23")
    data, aqi = aqinow.get_past_aqi('AL', 'Autauga', date="2018-09-23", distance=100)
    print(f"Past => AQI: {aqi}")
    # pprint(data)
    print("**************************")

    today = date.today()
    d = today.strftime("%Y-%m-%d")
    print("today: ", d)

    data, aqi, discussion = aqinow.get_forecast_aqi('AL', 'Autauga', date=d, distance=100)
    print(f"Forecast => AQI: {aqi}\nDiscussion:\n{discussion}")
    # pprint(data)
    print("**************************")

    df_geo = AQINow.load_data()
    print(df_geo.shape)

    latLong = AQINow.get_latLong('AL', 'Autauga County')
    print(latLong[0], latLong[1])

    
if __name__ == "__main__":
    # execute only if run as a script
    main()






