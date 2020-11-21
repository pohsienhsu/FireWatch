import pandas as pd
import numpy as np

for i in range(1992, 2021):
    df = pd.read_csv("fires_" + str(i) + ".csv")
    df_G = df.groupby(['STATE_CODE', 'COUNTY_CODE'])
    df_mean =  df_G.agg({'FIRE_SIZE':'mean'}).reset_index()
    df_mean.rename(columns={"FIRE_SIZE": "AVG_FIRE_SIZE"})
    df_new = df_G['STAT_CAUSE_DESCR'].apply(lambda x: x.value_counts().head(1)).reset_index(name='counts')
    df_new = df_new.rename(columns={'level_2': 'MOST_COMMON_CAUSE'})
    df_final = pd.merge(df_mean, df_new, on=['STATE_CODE', 'COUNTY_CODE'])
    df_final.to_csv("fires_"+str(i)+"_avgs.csv")
