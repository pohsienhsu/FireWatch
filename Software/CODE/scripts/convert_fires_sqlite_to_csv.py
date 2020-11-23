import numpy as py
import pandas as pd
import sqlite3

def read_data():
    csv_file = open('fires_ascii.csv', 'w')
    connection = sqlite3.connect('FPA_FOD_20170508.sqlite')
    cursor = connection.cursor()
    cursor.execute('select * from Fires')
    df = pd.DataFrame(cursor.fetchall())
    df.to_csv(csv_file, header= ["OBJECTID", "FOD_ID", "FPA_ID", "SOURCE_SYSTEM_TYPE", "SOURCE_SYSTEM", "NWCG_REPORTING_AGENCY", "NWCG_REPORTING_UNIT_ID", "NWCG_REPORTING_UNIT_NAME", "SOURCE_REPORTING_UNIT", "SOURCE_REPORTING_UNIT_NAME", "LOCAL_FIRE_REPORT_ID", "LOCAL_INCIDENT_ID", "FIRE_CODE", "FIRE_NAME", "ICS_209_INCIDENT_NUMBER", "ICS_209_NAME", "MTBS_ID", "MTBS_FIRE_NAME", "COMPLEX_NAME", "FIRE_YEAR", "DISCOVERY_DATE", "DISCOVERY_DOY", "DISCOVERY_TIME", "STAT_CAUSE_CODE", "STAT_CAUSE_DESCR", "CONT_DATE", "CONT_DOY", "CONT_TIME", "FIRE_SIZE", "FIRE_SIZE_CLASS", "LATITUDE", "LONGITUDE", "OWNER_CODE", "OWNER_DESCR", "STATE", "COUNTY", "FIPS_CODE", "FIPS_NAME", "Shape"], index=False)

if __name__ == "__main__":
    read_data()
