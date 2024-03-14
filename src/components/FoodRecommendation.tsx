import { View, ScrollView, TextInput,Button, StyleSheet, Image, Text, SafeAreaView, Dimensions, Modal, TouchableOpacity} from 'react-native';
import React, { useState } from 'react';
import FoodStock from '../images/foodstock.png'
import axios from 'axios';

const foodItems = [
    {
        id: 1,
        name: 'Food Item 1',
        image: FoodStock,
        description: 'Description of Food Item 1',
        calorieAmount: 300,
        learnMoreUrl: ''
    },
];

const FoodRecommendationPage = () => {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        {foodItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.foodItem} onPress={() => handleLearnMore(item.learnMoreUrl)}>
            <Image source={item.image} style={styles.foodImage} />
            <Text style={styles.foodName}>{item.name}</Text>
            <Text style={styles.foodDescription}>{item.description}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.calorieButton}>
                <Text style={styles.calorieButtonText}>{item.calorieAmount} Calories</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.learnMoreButton} onPress={() => handleLearnMore(item.learnMoreUrl)}>
                <Text style={styles.learnMoreButtonText}>Learn More</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };
  
  const handleLearnMore = (url) => {
    // Implement navigation to external page here
  };
  
  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    foodItem: {
      width: 375,
      height: 400,
      backgroundColor: '#FFFFFF',
      borderRadius: 10,
      padding: 10,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    foodImage: {
      width: '100%',
      height: 210,
      borderRadius: 10,
      marginBottom: 10,
    },
    foodName: {
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 3,
      marginBottom: 5,
    },
    foodDescription: {
      fontSize: 16,
      marginTop: 3,
      marginBottom: 10,
    },
    buttonContainer: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      flexDirection: 'row',
      margin: 10
    },
    calorieButton: {
      backgroundColor: '#DDDDDD',
      padding: 10,
      borderRadius: 100,
      marginRight: 10,
      width: 128,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    calorieButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    learnMoreButton: {
      backgroundColor: '#5EBE1E',
      padding: 10,
      borderRadius: 100,
      width: 128,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    learnMoreButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
  });
  
  export default FoodRecommendationPage;