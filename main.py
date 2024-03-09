import fitbit
import gather_keys_oauth2 as Oauth2
import include.ENV as env
import datetime
import os
import sqlite3
import pandas as pd


CLIENT_ID     = env.getClientID()
CLIENT_SECRET = env.getClientSecret()
HOME = os.getcwd()

def authenticate():
    global auth2_client

    server=Oauth2.OAuth2Server(CLIENT_ID, CLIENT_SECRET)
    server.browser_authorize()
    ACCESS_TOKEN=str(server.fitbit.client.session.token['access_token'])
    REFRESH_TOKEN=str(server.fitbit.client.session.token['refresh_token'])
    auth2_client=fitbit.Fitbit(CLIENT_ID, CLIENT_SECRET, oauth2=True, access_token=ACCESS_TOKEN, refresh_token=REFRESH_TOKEN)


def fetchDistance():
    today = datetime.date.today()
    prev_week = today - datetime.timedelta(weeks=1)
    distance_json = auth2_client.time_series('activities/distance', base_date=prev_week, end_date=today)
    lines = []
    outfile = open("1_distance_data.csv", 'w')
    for object in distance_json['activities-distance']:
        dateTime = object['dateTime']
        value    = object['value']
        format   = f"{dateTime}, {round(float(value), 2)}\n"
        lines.append(format)
    outfile.writelines(lines)
    outfile.close()


def fetchSteps():
    today = datetime.date.today()
    prev_week = today - datetime.timedelta(weeks=1)
    steps_json = auth2_client.time_series('activities/steps', base_date=prev_week, end_date=today)
    lines = []
    outfile = open("2_steps_data.csv", 'w')
    for object in steps_json['activities-steps']:
        value    = object['value']
        format   = f"{value}\n"
        lines.append(format)
    outfile.writelines(lines)
    outfile.close()


def fetchSleep():
    today = datetime.date.today()
    prev_week = today - datetime.timedelta(weeks=1)
    sleep_json = auth2_client.time_series('sleep/', base_date=prev_week, end_date=today)
    lines = []
    outfile = open("3_sleep_data.csv", 'w')
    for object in sleep_json['sleep']:
        minutesAsleep = object['minutesAsleep'] / 60
        format        = f"{round(float(minutesAsleep), 2)}\n"
        lines.append(format)
    outfile.writelines(lines)
    outfile.close()


def fetchCaloriesBurned():
    today = datetime.date.today()
    prev_week = today - datetime.timedelta(weeks=1)
    calories_json = auth2_client.time_series('activities/calories', base_date=prev_week, end_date=today)
    lines = []
    outfile = open("4_calories_data.csv", 'w')
    for object in calories_json['activities-calories']:
        value    = object['value']
        format   = f"{value}\n"
        lines.append(format)
    outfile.writelines(lines)
    outfile.close() 


def fetchHeartRate():
    today = datetime.date.today()
    prev_week = today - datetime.timedelta(weeks=1)
    heart_json = auth2_client.time_series('activities/heart', base_date=prev_week, end_date=today)
    lines = []
    outfile = open("5_hr_data.csv", 'w')
    for object in heart_json['activities-heart']:
        if 'restingHeartRate' in object['value']:
            maxHeartRate     = object['value']['heartRateZones'][1]['max']
            restingHeartRate = object['value']['restingHeartRate']
            format           = f"{maxHeartRate}, {restingHeartRate}\n"
            lines.append(format)
    outfile.writelines(lines)
    outfile.close()

def mergeCSV():
    csv_files = os.listdir(os.getcwd())

    df1 = 0
    df2 = 0
    df3 = 0
    df4 = 0
    df5 = 0

    for index in range(len(csv_files)):
        try:
            if index == 0:
                df1 = pd.read_csv(csv_files[index])
            elif index == 1:
                df2 = pd.read_csv(csv_files[index])
            elif index == 2:
                df3 = pd.read_csv(csv_files[index])
            elif index == 3: 
                df4 = pd.read_csv(csv_files[index])
            else:
                df5 = pd.read_csv(csv_files[index])
        except:
            old_files = os.listdir(os.chdir('../Week 3'))
            if index == 0:
                df1 = pd.read_csv(old_files[index])
            elif index == 1:
                df2 = pd.read_csv(old_files[index])
            elif index == 2:
                df3 = pd.read_csv(old_files[index])
            elif index == 3: 
                df4 = pd.read_csv(old_files[index])
            else:
                df5 = pd.read_csv(old_files[index])
            
            os.chdir('..')
            os.chdir(os.listdir(os.getcwd())[-1])

    merged = pd.concat([df1, df2, df3, df4, df5], axis=1)
    
    outfile = open("health_data.csv", 'w')
    merged.to_csv('health_data.csv', index=False)
    outfile.close()


def load_index():
    if not os.path.isdir('index'): # index directory does not exist
        os.makedirs('index')       # create index directory
    os.chdir('index')              # change cwd to index
    dir_path = os.getcwd()         # update cwd
    if not os.listdir(dir_path):   # list dirs in index
        os.makedirs('Week 1')      # if no dirs exist, create the first one
        os.chdir('Week 1')         # update cwd to begin data archival
        return
                                   # otherwise,    
    lst = os.listdir(dir_path)     # list all current directories
    updated_index = int(lst[len(lst)-1][-1]) + 1 # update index
    new_dir_name = f'Week {updated_index}' # create name of the next dir
    os.makedirs(new_dir_name)              # create the next dir
    os.chdir(new_dir_name)                 # update cwd to begin data archival

def setup_database():
    os.chdir(f'{HOME}/assets')
    
    if ( os.path.exists(f'{HOME}/assets/data.mp4') ):
        os.rename('data.mp4', 'data.db')
    conn = sqlite3.connect('data.db')
    cursor = conn.cursor()

    cursor.execute('''CREATE TABLE IF NOT EXISTS data (
                   id INTEGER PRIMARY KEY AUTOINCREMENT,
                   date TEXT,
                   distance TEXT,
                   steps TEXT,
                   sleep TEXT,
                   calories TEXT,
                   restingHeartRate TEXT,
                   maxHeartRate TEXT
    )''')

    cursor.execute('''DELETE FROM data''')

    os.chdir(f'{HOME}/index')
    dir = os.listdir( os.getcwd() )[-1]
    os.chdir(dir)

    df = pd.read_csv('health_data.csv', header=None)
    df.columns = ['date', 'distance', 'steps', 'sleep', 'calories', 'restingHeartRate', 'maxHeartRate']

    for index, row in df.iterrows():
        try:
            cursor.execute('''INSERT INTO data (date, distance, steps, sleep, calories, restingHeartRate, maxHeartRate)
                                VALUES (?, ?, ?, ?, ?, ?, ?)''', 
                            (row['date'], row['distance'], row['steps'], row['sleep'], row['calories'], 
                            row['restingHeartRate'], row['maxHeartRate']))
        except KeyError as e:
            print(f"Error: {e} - One or more column names are missing in the DataFrame.")
            continue

    conn.commit()
    conn.close()

    os.chdir(f'{HOME}/assets')
    os.rename('data.db', 'data.mp4');


def archive_data():
    load_index()
    fetchDistance()
    fetchSteps()
    fetchSleep()
    fetchCaloriesBurned()
    fetchHeartRate()
    mergeCSV()


if __name__ == "__main__":
    authenticate()
    archive_data()
    setup_database()