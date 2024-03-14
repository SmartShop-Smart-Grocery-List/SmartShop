import { StatusBar } from 'expo-status-bar';
import { FlatList, Platform, SafeAreaView, ScrollView, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
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
const baseUrl = 'https://e2d6-2603-8000-75f0-800-22a-61d7-54c7-2e5f.ngrok-free.app/fitbitdata';
const config = {
  clientId: '23RVFQ',
  clientSecret: 'e1c3d08ba9bf0d10162b5f5395a6d8ba',
  scopes: ['heartrate', 'activity', 'profile', 'sleep'],
};
let authFlag = true;
let browserSessionActive = false;

export default function App() {
  const [data, setData] = useState<any[]>([]);
  const [result, setResult] = useState<WebBrowser.WebBrowserResult>();
  const [codeVerifier, setCodeVerifier] = useState<string>('');
  const [codeChallenge, setCodeChallenge] = useState<string>('');
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [username, setUsername] = useState('');
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [authFlagFirstEffect, setAuthFlagFirstEffect] = useState(true);
  const [authFlagSecondEffect, setAuthFlagSecondEffect] = useState(true);

  const storeUsername = async (username: string) => {
    try {
      let usernames: string[] = [];
      const storedUsernames = await AsyncStorage.getItem('Usernames');
      if (storedUsernames) {
        usernames = JSON.parse(storedUsernames);
      }

      if (!usernames.includes(username)) {
        usernames.push(username);
      }

      await AsyncStorage.setItem('Usernames', JSON.stringify(usernames));
    } catch (error) {
      console.error('Error storing username:', error);
    }
  };

  const checkUserExists = async () => {
    try {
      const currentUser = await AsyncStorage.getItem('currentUser');

      if (currentUser) {
        let usernames: string[] = [];
        const storedUsernames = await AsyncStorage.getItem('Usernames');
        if (storedUsernames) {
          usernames = JSON.parse(storedUsernames);
        }
        return usernames.includes(currentUser);
      }
      return false;
    } catch (error) {
      console.error('Error checking if user exists:', error);
      return false;
    }
  };

  const generateCodeVerifier = async () => {
    try {
      const randomBytes = await getRandomBytesAsync(32);
      const base64Encoded = fromByteArray(randomBytes);
      const verifier = base64url.encode(base64Encoded);
      setCodeVerifier(verifier);
      await AsyncStorage.setItem('codeVerifier', verifier);
      const codeChallenge = await generateCodeChallenge(verifier);
      setCodeChallenge( codeChallenge );
      console.log('Verifier: ', verifier);
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
      await generateCodeVerifier();
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

      console.log(`${URL}?${queryParams}`);
      return `${URL}?${queryParams}`;
    } catch (error) {
      console.error("Error getting Fitbit auth URL:", error);
      throw error;
    }
  };

  const _onPage = async () => {
    if (browserSessionActive) {
      console.log('Browser session is already active!');
      return;
    }
    browserSessionActive = true;
    const authUrl = await getFitbitAuthUrl();
    try {
      let result = await WebBrowser.openBrowserAsync(authUrl);
      setResult(result);
    } catch (error) {
      console.error("Error opening browser:", error);
    } finally {
      browserSessionActive = false;
    }
  };

  const fetchTokensForExistingUser = async (username: string) => {
    try {
      const accessToken = await AsyncStorage.getItem(`${username}_access_token`);
      const refreshToken = await AsyncStorage.getItem(`${username}_refresh_token`);

      if (accessToken && refreshToken) {
        return {access_token: accessToken, refresh_token: refreshToken};
      }

      return null;
    } catch (error) {
      console.error('Error fetching tokens for existing user:', error);
      return null;
    }
  }

  const sendTokensToServer = async (accessToken: string, refreshToken: string) => {
    console.log('Sending tokens to server...');
    
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

  useEffect(() => { /* RESPONSIBLE FOR INITIALIZATION */
    const fetchUserData = async () => {
      const storedUsername = await AsyncStorage.getItem('currentUser');
      if (storedUsername) {
        setUsername(storedUsername);
      }
    };

    if (authFlagFirstEffect) {
      fetchUserData();
      console.log("First Initialization Wave Completed...");
      setAuthFlagFirstEffect(false);
    }
  }, [authFlagFirstEffect]);

  useEffect(() => { /* RESPONSIBLE FOR 2ND WAVE OF INITIALIZATION */
    const checkAndInit = async () => {
      const isNewUser = await checkUserExists();
      if (isNewUser) {
        setIsNewUser(true);
        storeUsername(username);
        _onPage();
      } else {
        const tokens = await fetchTokensForExistingUser(username);
        if (tokens) { /* If tokens successfully retrieved, forward the information to the server */
          sendTokensToServer(tokens.access_token, tokens.refresh_token);
          setAuthorized(true);
          prepareDatabase();
        } else { /* otherwise communicate with api endpoint to retrieve new tokens and send those to the server */
          const retryTokens = await fetchTokensForExistingUser(username);

          if (retryTokens) {
            sendTokensToServer(retryTokens.access_token, retryTokens.refresh_token);
            setAuthorized(true);
            prepareDatabase();
          } else {
            setIsNewUser(true);
            storeUsername(username);
            _onPage();
          }
        }
      }
    };

    if (authFlagSecondEffect) {
      checkAndInit();
      console.log("Second Initialization Wave Completed...");
      setAuthFlagSecondEffect(false);
    }
  }, [authFlagSecondEffect]);

  useEffect(() => {
    const handleRedirect = async ({ url }: { url: string }) => { /* RESPONSIBLE FOR REDIRECTS FROM API */
      console.log("Users:", await AsyncStorage.getItem('Usernames'));  
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
          await AsyncStorage.setItem(`${username}_access_token`, r.access_token);
          await AsyncStorage.setItem(`${username}_refresh_token`, r.refresh_token);
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

    if (authFlag && isNewUser) {
      console.log('User is new, handling redirect now...');
      Linking.addEventListener('url', handleRedirect);
      authFlag = false;
    }

    return () => {
      /* empty */
    };
  }, [codeVerifier, codeChallenge, isNewUser]);

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
            <Text style={styles.headerText}>{username ? `${username}'s Dashboard` : `Your Dashboard`}</Text>
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
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
    borderRadius: 7,
    margin: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    backgroundColor: '#fff',
    borderRadius: 7,
    margin: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  todayDataText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 50,
    color: 'white',

  },
  steps: {
    backgroundColor: 'rgba(0, 0, 255, 0.9)',
    shadowColor: 'rgba(0, 0, 255, 0.3)',
  },
  distance: {
    backgroundColor: 'rgba(0, 255, 0, 0.9)',
    shadowColor: 'rgba(0, 255, 0, 0.5)'
  },
  maxhr: {
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    shadowColor: 'rgba(255, 0, 0, 0.5)',
  },
  minhr: {
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    shadowColor: 'rgba(255, 0, 0, 0.5)',
  },
  calories: {
    backgroundColor: 'rgba(255, 165, 0, 0.9)',
    shadowColor: 'rgba(255, 165, 0, 0.5)',
  },
  sleep: {
    backgroundColor: 'rgba(0, 0, 128, 0.9)',
    shadowColor: 'rgba(0, 0, 128, 0.5)',
  },
  averageDataWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
    borderRadius: 7,
    margin: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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