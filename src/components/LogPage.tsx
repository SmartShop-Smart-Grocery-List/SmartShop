// import { StyleSheet, Text, View } from 'react-native';
import { View, StyleSheet, Text, TextInput, Image, SafeAreaView, Dimensions, Modal, Button, TouchableOpacity} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import React, {useState} from 'react';
import axios from 'axios';
import SmartEats from '../images/SmartEats.png'
import Slider from '@react-native-community/slider';

interface TestRowProps {
    // Other properties
    handleTextAreaUpdate: (newValue: string) => void;
}

export default function LogPage(){
    const [diet, setDiet] = useState('')
    const [calorie, setCalorie] = useState(0)
    const [calorieGoal, setCalorieGoal] = useState(0)
    function changeCal(val: any){
        setCalorie(val)
    }
    const submit = async(val: any) => {
        const data = {
            dataCalorie: Number(calorie),
            dataDiet: diet
        }
        try{
            const url = 'http://localhost:3000/sendData'
            const resp = await axios.post(url, data);
            console.log('response: ', resp.data)
        }catch(error){
            console.log("Error!: ", error)
        }
    }
    const [age, setAge] = useState('');
    return(
        <View style = {styles.container}>
            <View className= "p-2">
                <Image source = {SmartEats}/>
            </View>
            <View className= "p-2">
                <Text style = {{fontSize: 27, fontWeight: 600}}>
                    Personal Health Questionnaire
                </Text>
            </View>
            <View className ="flex justify-start items-start p-2 ">
                <Text style = {{ fontSize: 20}} className = "text-xlg text-#4A2ED6 pl-1 pb-3">
                    What is your current age?
                </Text>
                <View className = "bg-gray-100 rounded-lg w-3/5">
                    <Text className ="text-md pl-2 pt-2">
                        Age
                    </Text>
                    <TextInput className = "text-lg text-gray-900 border-b border-puple-500 pl-2 pb-1" onChangeText = {(value)=>setAge(value)} placeholder="Enter your current age"/>
                    
                </View>
            </View>
            <View className ="flex justify-start items-start p-2">
                <Text style = {{ fontSize: 20}} className = "text-xlg text-#4A2ED6 pl-1 pb-3">
                    What is your current weight(lbs)?
                </Text>
                <View className = "bg-gray-100 rounded-lg w-3/5">
                    <Text className ="text-md pl-2 pt-2">
                        Weight
                    </Text>
                    <TextInput className = "text-lg text-gray-900 border-b border-puple-500 pl-2 pb-1" onValueChange = {(value:Number)=>setAge(Math.round(value))} placeholder="Enter your current weight"/>
                    
                </View>
            </View>
            <View className ="flex justify-item items-start pl-2 pr-2 pt-10">
                <Text style = {{ fontSize: 20}} className = "text-xlg text-#4A2ED6 pl-1 pb-3">
                    What is your current estimated daily calorie consumption?
                </Text>
            </View>
            <View className = "flex justify-center items-center">
                <Slider
                        style = {{width:' 90%', height: '10%'}}
                        maximumValue={4000}
                        minimumValue= {0}
                        minimumTrackTintColor='#5EBE1E'
                        value = {calorie}
                        onValueChange= {(val)=>{setCalorie(Math.round(val))}}
                    />
                    <Text style= {{fontSize:16}} >
                            {calorie} calories
                    </Text>
            </View>
            <View className ="flex justify-item items-start pl-2 pr-2 pt-10">
                <Text style = {{ fontSize: 20}} className = "text-xlg text-#4A2ED6 pl-1 pb-3">
                    What is your target daily calorie consumption?
                </Text>
            </View>
            <View className = "flex justify-center items-center">
                <Slider
                        style = {{width:' 90%', height: '10%'}}
                        maximumValue={4000}
                        minimumValue= {0}
                        minimumTrackTintColor='#83B6F1'
                        value = {calorieGoal}
                        onValueChange= {(val)=>{setCalorieGoal(Math.round(val))}}
                    />
                    <Text style= {{fontSize:16}} >
                            {calorieGoal} calorie goal
                    </Text>
            </View>

            <View className ="flex justify-item items-start pl-2 pr-2 pt-10">
                <Text style = {{ fontSize: 20}} className = "text-xlg text-#4A2ED6 pl-1 pb-3">
                    Please list any dietary restrictions you have.
                </Text>
            </View>
        </View>
    )







    
    // return(
    //     <View style = {styles.container}>
    //         <View style = {{padding: 50}}>
    //             <Text style={{textAlign:'center', padding: 5}}>
    //                 Enter Calorie Goal: 
                    
    //             </Text>
    //             <View>

    //             </View>
    //             <TouchableOpacity style = {styles.calorie}>
    //                 <TextInput
    //                     style = {{textAlign:'center', fontSize: 15}}
    //                     placeholder = "Eg. 2153"
    //                     onChangeText = {setCalorie}
    //                     value = {calorie}
    //                 />
    //             </TouchableOpacity>
    //         </View>
    //         <View>
    //                 <Text style={{textAlign:'center', padding: 5}}>
    //                     Select Your Diet:
    //                 </Text>
    //                 <TouchableOpacity style = {styles.diet}>
    //                     <RNPickerSelect
    //                         onValueChange={(value)=> {
    //                             setDiet(value)
    //                         }}
    //                         items={[
    //                             {label: 'Vegetarian', value: 'vegetarian'},
    //                             {label: 'Vegan', value: 'vegan'},
    //                             {label: 'Pescatarian', value: 'pescatarian'},
    //                         ]}
    //                         style = {{inputIOS: {textAlign:'center', fontSize: 15, padding: 5}, inputAndroid: {textAlign:'center'}}}
    //                         placeholder = {{label:"No Preference...", value: 'nopref'}}
    //                 >
    //                     </RNPickerSelect>
    //                 </TouchableOpacity>
    //         </View>
    //         <TouchableOpacity style={styles.option} onPress={submit}>
    //             <Text style={styles.text}>
    //                 Submit
    //             </Text>
    //         </TouchableOpacity>
    //     </View>
    // )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
  });
// const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: '#fff',
//       alignItems: 'center',
//       justifyContent: 'center',
//     },
//     text: {
//         color: 'white',
//         padding: 5,
//         alignItems: 'center'
//     },
//     option:{
//         backgroundColor: '#444BF5',
//         borderRadius: 12,
//         padding: 5,
//         paddingLeft: 10,
//         paddingRight: 10,
//         paddingTop: 3,
//         paddingBottom: 3,
//         width: '30%',
//         margin: 40,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     calorie:{
//         height: 20,
//         borderColor: '#bdc3c7',
//         borderWidth: 1,
//         borderRadius: 12,
//         paddingLeft: 10,
//         paddingRight: 10,
//         paddingTop: 3,
//         paddingBottom: 3,
//     },
//     diet:{
//         height: 20,
//         borderColor: '#bdc3c7',
//         borderWidth: 1,
//         borderRadius: 12,

//     }
//   });