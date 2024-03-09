import { StatusBar } from 'expo-status-bar';
import { FlatList, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

export default function App() {
  const [data, setData] = useState<any[]>([]);
  
  useEffect(() => {
    prepareDatabase();
  }, []);

  const prepareDatabase = async () => {
    if (!(await FileSystem.getInfoAsync(FileSystem.documentDirectory + 
      'SQLite')).exists) {
              await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 
      'SQLite');
          }
          await FileSystem.deleteAsync(FileSystem.documentDirectory + 'SQLite/data.db', { idempotent: true });
          await FileSystem.downloadAsync(
              Asset.fromModule(require('../../assets/data.mp4')).uri,
              FileSystem.documentDirectory + 'SQLite/data.db'
          );
          const db = SQLite.openDatabase('data.db');

          db.transaction(tx => {
            tx.executeSql(
              'SELECT * FROM data',
              [],
              (_, { rows: { _array } }) => {
                const transformedData = _array.map(item => ({
                  ...item,
                  id: item.id.toString()
                }));
                setData(transformedData);
              },
              (_, error) => {
                console.error('Error fetching data: ', error);
                return false;
              }
            );
          });
  };

  const [isLoaded] = useFonts({
    "pacifico": require("../../assets/Pacifico-Regular.ttf"),
  });

  if (!isLoaded) { return null; }

  type ItemProps = {date: string,
                    distance: string,
                    steps: string,
                    sleep: string,
                    calories: string,
                    maxHeartRate: string,
                    restingHeartRate: string}

  const Item = ({date, distance, steps, sleep, calories, restingHeartRate, maxHeartRate}: ItemProps) => (
  <View style={styles.averageDataItemsRow}>
    <Text style={styles.averageDataItemsCell}>{date ? date : 'N/A'}</Text>
    <Text style={styles.averageDataItemsCell}>Distance: {distance ? distance : 'N/A'} miles</Text>
    <Text style={styles.averageDataItemsCell}>Steps: {steps ? steps : 'N/A'}</Text>
    <Text style={styles.averageDataItemsCell}>Sleep: {sleep ? sleep : 'N/A'} hrs</Text>
    <Text style={styles.averageDataItemsCell}>Calories: {calories ? calories : 'N/A'}</Text>
    <Text style={styles.averageDataItemsCell}>Min HR: {maxHeartRate ? maxHeartRate : 'N/A'} bpm</Text>
    <Text style={styles.averageDataItemsCell}>Max HR: {restingHeartRate ? restingHeartRate : 'N/A'} bpm</Text>
  </View>
  );

  return (
    <ScrollView style={styles.body}>
      <View style={styles.mainContent}>
        <View style={styles.headerWrapper}>
          <View style={styles.headerTitle}>
            <Text style={styles.headerText}>Your Dashboard</Text>
          </View>
        </View>
        <View style={styles.todayDataWrapper}>
          <Text style={styles.headerText}>Today's Data</Text>
          <ScrollView style={styles.todayDataItemsWrapper} horizontal={true} showsHorizontalScrollIndicator={false}>
            <View style={[styles.todayDataItems, styles.steps]}>
              <View>
                <Text style={styles.todayDataText}>Steps</Text>
                <Text style={styles.todayDataText}>{data.length > 0 && data[data.length-1].steps ? data[data.length-1].steps : 'N/A'}</Text>
              </View>
            </View>
            <View style={[styles.todayDataItems, styles.distance]}>
              <View>
                <Text style={styles.todayDataText}>Distance</Text>
                <Text style={styles.todayDataText}>{data.length > 0 && data[data.length-1].distance ? data[data.length-1].distance + ' miles': 'N/A'}</Text>
              </View>
            </View>
            <View style={[styles.todayDataItems, styles.maxhr]}>
              <View>
                <Text style={styles.todayDataText}>Max HR</Text>
                <Text style={styles.heartTextModified}>{data.length > 0 && data[data.length-1].restingHeartRate ? data[data.length-1].restingHeartRate + ' bpm': 'N/A'}</Text>
              </View>
            </View>
            <View style={[styles.todayDataItems, styles.minhr]}>
              <View>
                <Text style={styles.todayDataText}>Min HR</Text>
                <Text style={styles.heartTextModified}>{data.length > 0 && data[data.length-1].maxHeartRate ? data[data.length-1].maxHeartRate + ' bpm': ''}</Text>
              </View>
            </View>
            <View style={[styles.todayDataItems, styles.calories]}>
              <View>
                <Text style={styles.todayDataText}>Calories</Text>
                <Text style={styles.todayDataText}>{data.length > 0 && data[data.length-1].calories ? data[data.length-1].calories : 'N/A'}</Text>
              </View>
            </View>
            <View style={[styles.todayDataItems, styles.sleep]}>
              <View>
                <Text style={styles.todayDataText}>Sleep</Text>
                <Text style={styles.todayDataText}>{data.length > 0 && data[data.length-1].sleep ? data[data.length-1].sleep + ' hrs' : 'N/A'}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
        <View style={styles.averageDataWrapper}>
          <Text style={styles.headerText}>Weekly Data</Text>
          <ScrollView style={styles.averageDataItemsWrapper} nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
            <FlatList
              data={data}
              renderItem={({item}) => <Item date={item.date} distance={item.distance} steps={item.steps} sleep={item.sleep} calories={item.calories} restingHeartRate={item.restingHeartRate} maxHeartRate={item.maxHeartRate} />}
              keyExtractor={item => item.id}
            />
          </ScrollView>
        </View>
      </View>
      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff'
  },
  mainContent: {
    position: 'relative',
    width: '100%',
    padding: 10,
    justifyContent: 'space-between',
    alignSelf: 'flex-start'
  },
  headerWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(128, 128, 128, 0.09)',
    borderRadius: 7,
    margin: 10,
    padding: 10
  },
  headerTitle: {
    display: 'flex'
  },
  headerText: {
    fontSize: 20,
    color: '#5EBE1E',
    fontFamily: 'pacifico',
  },
  todayDataWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    width: 'auto',
    height: 'auto',
    backgroundColor: 'rgba(128, 128, 128, 0.09)',
    borderRadius: 7,
    margin: 10,
    padding: 10,
  },
  todayDataItemsWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    height: '100%',
    width: '100%',
    flex: 1,
    margin: 4,
    padding: 4,
  },
  todayDataItems: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    flexWrap: 'wrap',
    width: 250,
    height: 250,
    borderRadius: 10,
    margin: 5,
    padding: 5,
  },
  todayDataText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 50,
    color: 'white',

  },
  heartTextModified: {
    fontFamily: 'pacifico',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 35,
    color: 'white',
  },
  steps: {
    backgroundColor: 'rgba(0, 0, 255, 0.6)'
  },
  distance: {
    backgroundColor: 'rgba(0, 255, 0, 0.6)'
  },
  maxhr: {
    backgroundColor: 'rgba(255, 0, 0, 0.6)'
  },
  minhr: {
    backgroundColor: 'rgba(255, 0, 0, 0.5)'
  },
  calories: {
    backgroundColor: 'rgba(255, 165, 0, 0.6)'
  },
  sleep: {
    backgroundColor: 'rgba(0, 0, 128, 0.6)'
  },
  averageDataWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(128, 128, 128, 0.09)',
    borderRadius: 7,
    margin: 10,
    padding: 10
  },
  averageDataItemsWrapper: {
    width: '100%',
    display: 'flex',
    height: 400,
    padding: 10,
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(128, 128, 128, 0.1)'
  },
  averageDataItemsHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 8,
    marginHorizontal: 2,
    elevation: 1,
    borderRadius: 5,
    padding: 15,
    margin: 15,
    borderColor: '#fff',
    backgroundColor: '#fff'
  },
  averageDataItemsHeaderText: {
    fontSize: 15,
  },
  averageDataItemsRow: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    marginVertical: 8,
    marginHorizontal: 2,
    elevation: 1,
    borderRadius: 5,
    padding: 15,
    margin: 15,
    borderColor: '#fff',
    backgroundColor: '#fff',
    alignItems: 'center',
    alignContent: 'center',
  },
  averageDataItemsCell: {
    fontSize: 15,
    fontWeight: 'bold',
  }
});