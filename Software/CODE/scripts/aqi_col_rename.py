import pandas as pd
import numpy as np
import csv

for i in range(1993,2016):
    df = pd.read_csv("daily_aqi_by_county_" + str(i) + ".csv", dtype={'State Code': str, 'County Code': str, 'AQI':int, 'NUMBER_OF_SITES_REPORTING': int})
    df.columns = ["STATE_NAME","COUNTY_NAME","STATE_CODE","COUNTY_CODE","DATE","AQI","CATEGORY","DEFINING_PARAMETER","DEFINING_SITE","NUMBER_OF_SITES_REPORTING"]
    df['YEAR'] = pd.DatetimeIndex(df['DATE']).year
    df.to_csv("daily_aqi_by_county_" + str(i) + ".csv", index=False, quoting=csv.QUOTE_NONNUMERIC)
