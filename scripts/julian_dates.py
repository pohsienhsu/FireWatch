import pandas as pd
import numpy as np

data = pd.read_csv('fires.csv')
epoch = pd.to_datetime(0, unit='s').to_julian_date()
data['DISCOVERY_DATE'] = pd.to_datetime(data['DISCOVERY_DATE'] - epoch, unit='D')
data['CONT_DATE']= pd.to_datetime(data['CONT_DATE'] - epoch, unit='D')
pd.to_csv('fires_dates_fixed.csv')
