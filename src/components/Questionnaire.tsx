import { View, StyleSheet, Text, TextInput, SafeAreaView, Dimensions, Modal, Button, TouchableOpacity} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import React, {useState} from 'react';
import axios from 'axios';

export default function(){
    return(
        <>
            <View>
                <Text style = {{color: "#4A2ED6", fontSize: "20px"}} className = "text-xlg text-#4A2ED6 pl-1 pb-3">
                    Before we begin, enter your name!
                </Text>
                <View className = "bg-gray-100 rounded-lg ">
                    <Text className ="text-md pl-2 pt-2">
                        Name
                    </Text>
                    <TextInput className = "text-lg text-gray-900 border-b border-puple-500 pl-2 pb-1" onChangeText = {(value)=>setName(value)} placeholder="Enter Name"/>
                </View>
                <View className = "pt-5">
                <TouchableOpacity className = "flex-row items-center justify-center border-gray-100 border-2 rounded-full " style={{backgroundColor:"#83B6F1", width:"60%"}}>
                    <Image className = "" source = {Icon}/>
                    <Text className = "p-2 text-lg" style={{color: "#4A2ED6"}} title = "Submit" onPress = {()=>{
                        clickButton(true)
                        submit()
                    }

                    }>
                        Continue
                    </Text>
                </TouchableOpacity>
                </View>
            </View>
        </>
    )
}