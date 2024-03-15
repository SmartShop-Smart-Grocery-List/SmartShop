import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from  '@react-navigation/bottom-tabs';
import LogPage from './src/components/LogPage';
import NamePage from './src/components/NamePage';
import Dashboard from './src/components/Dashboard';
import FoodRecommendationPage from './src/components/FoodRecommendation';
const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => {
            const image = focused
              ? require('./src/images/home.png')
              : require('./src/images/home.png');
            return (
              <Image
                source={image}
                style={{ height: 25, width: 25 }}
              />
            );
          },
        }}
      />
      <Tab.Screen
        name="Recommendation"
        component={FoodRecommendationPage}
        options={{
          title: 'Recommendation',
          tabBarIcon: ({ focused }) => {
            const image = focused
              ? require('./src/images/diet.png')
              : require('./src/images/diet.png');
            return (
              <Image
                source={image}
                style={{ height: 25, width: 25 }}
              />
            );
          },
        }}
      />
      <Tab.Screen
        name="Log"
        component={LogPage}
        options={{
          title: 'Log',
          tabBarIcon: ({ focused }) => {
            const image = focused
              ? require('./src/images/log.png')
              : require('./src/images/log.png');
            return (
              <Image
                source={image}
                style={{ height: 25, width: 25 }}
              />
            );
          },
        }}
      />
    </Tab.Navigator>
  );
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
