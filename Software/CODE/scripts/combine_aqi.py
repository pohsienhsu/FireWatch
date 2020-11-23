import pandas as pd
import numpy as np
import csv

dfs = []

for i in range(1992,2016):
    dfs.append(pd.read_csv("daily_aqi_by_county_" + str(i) + ".csv"))

df = pd.concat(dfs)
df.to_csv("aqi.csv", index=False)

    
