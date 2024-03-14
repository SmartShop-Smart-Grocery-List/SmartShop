import { StatusBar } from 'expo-status-bar';
import { FlatList, Platform, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { useFonts } from 'expo-font';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import qs from 'qs';
import URL from 'url-parse';
import { getRandomBytesAsync, CryptoDigestAlgorithm, digestStringAsync } from 'expo-crypto';
import { fromByteArray } from 'base64-js';
import base64url from 'base64url';
import AsyncStorage from '@react-native-async-storage/async-storage';
global.Buffer = require('buffer').Buffer;

const redirectUri = AuthSession.makeRedirectUri();
const baseUrl = 'https://db01-2603-8000-75f0-800-22a-61d7-54c7-2e5f.ngrok-free.app/fitbitdata';
const config = {
  clientId: '23RVFQ',
  clientSecret: 'e1c3d08ba9bf0d10162b5f5395a6d8ba',
  scopes: ['heartrate', 'activity', 'profile', 'sleep'],
};
let flag = true;

export default function App() {
  const [data, setData] = useState<any[]>([]);
  const [result, setResult] = useState<WebBrowser.WebBrowserResult>();
  const [codeVerifier, setCodeVerifier] = useState<string>('');
  const [codeChallenge, setCodeChallenge] = useState<string>('');
  const [authorized, setAuthorized] = useState<boolean>(false);

  useEffect(() => {
    const initCodeVerifier = async () => {
      const verifier = await generateCodeVerifier();
      setCodeVerifier(verifier);
    };
    initCodeVerifier();
  }, []);

  useEffect(() => {
    const handleRedirect = async ({ url }: { url: string }) => {
      const deeplink = URL(url, true);
    
      const uri = 'https://api.fitbit.com/oauth2/token';
      const queryParams = qs.stringify({
        client_id: config.clientId,
        code: deeplink.query.code,
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      });
    
      try {
        const response = await fetch(`${uri}?${queryParams}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
          },
          body: queryParams,
        });
    
        if (response.ok) {
          const r = await response.json();
          await sendTokensToServer(r.access_token, r.refresh_token);
          setAuthorized(true);
          prepareDatabase();
          console.log('Tokens fetched and sent successfully.');
        } else {
          console.error('Error fetching tokens - Status:', response.status, 'Message: ', await response.text());
        }
      } catch (error) {
        console.error('Error fetching tokens:', error);
      }
    };    

    if (flag) {
      Linking.addEventListener('url', handleRedirect);
    }

    return () => {
      flag = false;
    };
  }, [codeVerifier, codeChallenge]);

  const generateCodeVerifier = async () => {
    try {
      const randomBytes = await getRandomBytesAsync(32);
      const base64Encoded = fromByteArray(randomBytes);
      const verifier = base64url.encode(base64Encoded);
      await AsyncStorage.setItem('codeVerifier', verifier);
      setCodeChallenge(await generateCodeChallenge(verifier));
      return verifier;
    } catch (error) {
      console.error("Error generating code verifier:", error);
      throw error;
    }
  };

  const generateCodeChallenge = async (codeVerifier: string) => {
    try {
      const digest = await digestStringAsync(CryptoDigestAlgorithm.SHA256, codeVerifier);
      return base64url.encode(digest);
    } catch (error) {
      console.error("Error generating code challenge:", error);
      throw error;
    }
  };

  const getFitbitAuthUrl = async () => {
    try {
      const URL = 'https://www.fitbit.com/oauth2/authorize';
      const queryParams = qs.stringify({
        client_id: config.clientId,
        response_type: 'code',
        scope: config.scopes.join(' '),
        redirect_uri: redirectUri,
        expires_in: '31536000',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
      });

      return `${URL}?${queryParams}`;
    } catch (error) {
      console.error("Error getting Fitbit auth URL:", error);
      throw error;
    }
  };

  const _onPage = async () => {
    const authUrl = await getFitbitAuthUrl();
    let result = await WebBrowser.openBrowserAsync(authUrl);
    setResult(result);
  };

  useEffect(() => {
    _onPage();
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

  const sendTokensToServer = async (accessToken: string, refreshToken: string) => {
    const data = new URLSearchParams();
    data.append('access_token', accessToken);
    data.append('refresh_token', refreshToken);

    try {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data.toString(),
      });

      if (response.ok) {
        console.log('Tokens sent to server successfully.');
      } else {
        console.error('Failed to send tokens to server.');
      }
    } catch (error) {
      console.error('Error sending tokens to server:', error);
    }
  }

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
                <Text style={styles.todayDataText}>{data.length > 0 && data[data.length-1].restingHeartRate ? data[data.length-1].restingHeartRate + ' bpm': 'N/A'}</Text>
              </View>
            </View>
            <View style={[styles.todayDataItems, styles.minhr]}>
              <View>
                <Text style={styles.todayDataText}>Min HR</Text>
                <Text style={styles.todayDataText}>{data.length > 0 && data[data.length-1].maxHeartRate ? data[data.length-1].maxHeartRate + ' bpm': 'N/A'}</Text>
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