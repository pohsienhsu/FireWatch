#!/usr/bin/env python

import pandas as pd
import numpy as np

columns = [
 'FIRE_CODE',
 'FIRE_NAME',
 'FIRE_YEAR',
 'DISCOVERY_DATE',
 'DISCOVERY_DOY',
 'DISCOVERY_TIME',
 'STAT_CAUSE_DESCR',
 'CONT_DATE',
 'CONT_DOY',
 'CONT_TIME',
 'FIRE_SIZE',
 'FIRE_SIZE_CLASS',
 'LATITUDE',
 'LONGITUDE',
 'OWNER_CODE',
 'OWNER_DESCR',
 'STATE',
 'COUNTY',
 'FIPS_CODE',
 'FIPS_NAME',
]


print("Reading fires.csv...")
fires = pd.read_csv("fires.csv")

print("Reading state_abbrev.csv...")
state_abbrev = pd.read_csv("state_abbrev.csv")

fires = fires[columns]
fires = fires.set_index('STATE').join(state_abbrev.set_index("CODE")) 
fires = fires.drop(["ABBREV"], axis=1)

print("Reading US_FIPS_Codes.csv")
fips_codes = pd.read_csv("US_FIPS_Codes.csv")

fires = pd.merge(fires, fips_codes, on=['FIPS_CODE', 'STATE'])

fires.FIPS_CODE = fires.FIPS_CODE.astype(int)


