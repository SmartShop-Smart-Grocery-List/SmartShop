// import { StyleSheet, Text, View } from 'react-native';
import { View, TextInput,Button, StyleSheet, Image, Text, SafeAreaView, Dimensions, Modal, TouchableOpacity} from 'react-native';
import React, { useState } from 'react';
import Icon from '../images/icon.jpg'
import Bowl from '../images/bowl.png'
import SmartEats from '../images/SmartEats.png'
import axios from 'axios';
interface TestRowProps {
    // Other properties
    handleTextAreaUpdate: (newValue: string) => void;
}

export default function NamePage({clickButton}:any){
    const [name,setName] = useState('')
    const submit = async() => {
        const data = {
            name: name,
        }
        try{
            const url = 'http://localhost:3000/sendData'
            const resp = await axios.post(url, data);
            console.log('response: ', resp.data)
        }catch(error){
            console.log("Error!: ", error)
        }
    }
    return(
        <>
            <View className = "flex justify-center items-center h-screen">
                <Image className= "mb-15"source = {SmartEats}/>
                    <View className = "h-3/5 p-5">
                        <Image source = {Bowl}/>

                    </View>
            </View>
            <View className ="absolute bottom-20 left-5">
                <View className = "pb-10" >
                    <Text style={{fontSize:25, color: "#2C580E"}}>
                        Eat better than ever.
                    </Text>
                    <Text style={{fontSize:25, color: "#57B01C"}}>
                        Feel better than ever.
                    </Text>
                    <Text style={{fontSize:25, color: "#5EBE1E"}}>
                        Choose better than ever.
                    </Text>
                </View>
                <Text style = {{color: "#4A2ED6", fontSize: 20}} className = "text-xlg text-#4A2ED6 pl-1 pb-3">
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


