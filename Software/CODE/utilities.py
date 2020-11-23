#!/usr/bin/env python
import pandas as pd

def load_data(fire_csv="datasets/fires.csv", aqi_csv="datasets/aqi.csv"):
    # add dtype for FIRE_CODE to silence the warning
    fires = pd.read_csv(fire_csv, dtype={"FIRE_CODE": str})

    aqi = pd.read_csv(aqi_csv, dtype= \
            {"STATE_NAME": str, "COUNTY_NAME": str,"STATE_CODE": int,"COUNTY_CODE": int,"DATE": object, \
             "AQI": int,"CATEGORY": str,"DEFINING_PARAMETER": str, "DEFINING_SITE": str,"NUMBER_OF_SITES_REPORTING":int,
             "YEAR":int})

    columns = ["FIRE_NAME", "FIRE_YEAR", "FIRE_SIZE", "DISCOVERY_DATE", "CONT_DATE", "STAT_CAUSE_DESCR", \
               "STATE_NAME", "COUNTY_NAME", "STATE_CODE", "COUNTY_CODE"]

    fires = fires[columns]
    aqi['DATE'] = pd.to_datetime(aqi['DATE'])
    return fires, aqi

def load_data_year(year):
    # add dtype for FIRE_CODE to silence the warning
    fires = pd.read_csv("datasets/fires.csv", dtype={"FIRE_CODE": str})
    
#     aqi = pd.read_csv(f"datasets/daily_aqi_by_county_{year}.csv", dtype= \
#             {"DATE": object, "AQI": int})
    aqi = pd.read_csv(f"datasets/daily_aqi_by_county_{year}.csv")
    columns = ["FIRE_NAME", "FIRE_YEAR", "FIRE_SIZE", "DISCOVERY_DATE", "CONT_DATE", "STAT_CAUSE_DESCR", \
               "STATE_NAME", "COUNTY_NAME", "STATE_CODE", "COUNTY_CODE"]
    
    fires = fires[columns]
    aqi['DATE'] = pd.to_datetime(aqi['DATE'])
    return fires, aqi


def get_fires(df, state=None, county=None, year=None, date=None):
    fires = df
    if year is not None:
        fires = fires[fires['FIRE_YEAR'] == year]
    if date is not None:
        fires = fires[fires['DISCOVERY_DATE'] == date]
    if state is not None:
        fires = fires[fires['STATE_NAME'] == state]
    if county is not None:
        fires = fires[fires['COUNTY_NAME'] == county]
    return fires

def get_aqi(df, state=None, state_code=None, county=None, county_code=None, date=None, days_before=0, days_after=None, year=None):
    aqi_df = df
    if year is not None:
        aqi_df = aqi_df[(aqi_df['YEAR'] == year)]
    if date is not None and days_after is not None:
        from_date = pd.to_datetime(date) + pd.DateOffset(days=-days_before)
        to_date = pd.to_datetime(date) + pd.DateOffset(days=days_after)
        aqi_df = aqi_df[(aqi_df['DATE'] >= from_date) & (aqi_df['DATE'] <= to_date )]
    elif date is not None:
        aqi_df = aqi_df[(aqi_df['DATE'] == date)]
    if state is not None:
        aqi_df = aqi_df[aqi_df['STATE_NAME'] == state]
    if county is not None:
        aqi_df = aqi_df[aqi_df['COUNTY_NAME'] == county]
    if county_code is not None:
        aqi_df = aqi_df[aqi_df['COUNTY_CODE'] == county_code]
    if state_code is not None:
        aqi_df = aqi_df[aqi_df['STATE_CODE'] == state_code]
    return aqi_df


def compare_aqi_with_year(df, state=None, state_code=None, county=None, county_code=None, date=None, days_before=0, days_after=None, year=None):

    aqi_df = get_aqi(df, state=state, state_code=state_code, county=county, county_code=county_code, date=date, days_before=days_before, \
                     days_after=days_after, year=year)

    if len(aqi_df) == 0:
        return None, None

    year = aqi_df.iloc[0]['YEAR']
    avg_year_aqi = get_aqi(df, state=state, state_code=state_code, county=county, county_code=county_code, year=year).AQI.mean()
    avg_aqi = aqi_df.AQI.mean()
    return avg_aqi, avg_year_aqi


def compare_aqi_for_fire(fires, aqi, fire_id, days=(0,14)):
    entry = fires.iloc[fire_id]

    name, state_code, county_code, date = entry.FIRE_NAME, entry.STATE_CODE, entry.COUNTY_CODE, entry.DISCOVERY_DATE
    state_name, county_name = entry.STATE_NAME, entry.COUNTY_NAME
    aqi_avg, aqi_year_avg = compare_aqi_with_year(aqi, state_code=state_code, county_code=county_code, date=date, days_before=days[0], days_after=days[1])

    return aqi_avg, aqi_year_avg

def get_aqi_for_fire(fires, aqi, fire_id, days=(0,14)):
    entry = fires.iloc[fire_id]

    name, state_code, county_code, date = entry.FIRE_NAME, entry.STATE_CODE, entry.COUNTY_CODE, entry.DISCOVERY_DATE
    state_name, county_name = entry.STATE_NAME, entry.COUNTY_NAME
    aqi_df = get_aqi(aqi, state_code=state_code, county_code=county_code, date=date, days_before=days[0], days_after=days[1])

    return aqi_df

def get_aqi_change(aqi, row, days, year=None):
    date = row.DISCOVERY_DATE
    state_code = row.STATE_CODE
    county_code = row.COUNTY_CODE
    days_before = days[0]
    days_after = days[1]


    avg_aqi, avg_year_aqi = compare_aqi_with_year(aqi, state_code=state_code, county_code=county_code, date=date, days_before=days_before, days_after=days_after)

    if avg_aqi is None or avg_year_aqi is None:
        return None

    # Just return a value of 0 for counties that always have 0 as their AQI
    if avg_year_aqi is 0:
        return 0

    return (avg_aqi-avg_year_aqi)/avg_year_aqi

def get_fires_in_range(fires, lower_bound, upper_bound):
    fires = fires[(fires.FIRE_SIZE >= lower_bound) & (fires.FIRE_SIZE <= upper_bound) ]
    return fires


def get_aqi_change2(aqi, row, year=None):
    date = row.DISCOVERY_DATE
    state_code = row.STATE_CODE
    county_code = row.COUNTY_CODE
    days_before = 0
    days_after = row.DAYS

    avg_aqi, avg_year_aqi = compare_aqi_with_year(aqi, state_code=state_code, county_code=county_code, date=date, days_before=days_before, days_after=days_after, year=year)
    if avg_aqi is None or avg_year_aqi is None:
        return None

    return (avg_aqi-avg_year_aqi)/avg_year_aqi

def get_aqi_avg(aqi, row, days, year=None):
    date = row.DISCOVERY_DATE
    state_code = row.STATE_CODE
    county_code = row.COUNTY_CODE
    days_before = days[0]
    days_after = days[1]

    avg_aqi, avg_year_aqi = compare_aqi_with_year(aqi, state_code=state_code, county_code=county_code, date=date, days_before=days_before, days_after=days_after, year=year)
    if avg_aqi is None or avg_year_aqi is None:
        return None

    return avg_aqi
