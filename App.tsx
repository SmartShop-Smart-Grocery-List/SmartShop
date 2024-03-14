import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';

import { StyleSheet, Text, View } from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from  '@react-navigation/bottom-tabs';
import LogPage from './src/components/LogPage';
import NamePage from './src/components/NamePage';
import Dashboard from './src/components/Dashboard';
const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
      <Tab.Navigator>
        <Tab.Screen name = "Dashboard" component = {Dashboard}/>
        <Tab.Screen name = "Log" component = {LogPage}/>
      </Tab.Navigator>
  )
}
function MyNamePage(){

}
export default function App() {
  const [button, clickButton] = useState(false)
  return (
    <NavigationContainer>
      {button == false ? 
      <NamePage clickButton = {clickButton} />
      :
      <MyTabs />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
