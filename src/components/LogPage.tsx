// import { StyleSheet, Text, View } from 'react-native';
import { View, StyleSheet, Text, TextInput, Image, ScrollView, SafeAreaView, Dimensions, Modal, Button, TouchableOpacity} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import React, {useState} from 'react';
import axios from 'axios';
import SmartEats from '../images/SmartEats.png'
import Slider from '@react-native-community/slider';
import Vegetarian from '../images/vegetarian.jpeg'

import Paleo from '../images/paleo.jpg'
import Pesca from '../images/pescatarian.jpg'
import Vegan from '../images/vegan.jpg'
import Icon from '../images/icon.jpg'
interface TestRowProps {
    // Other properties
    handleTextAreaUpdate: (newValue: string) => void;
}

export default function LogPage(){

    // function changeCal(val: any){
    //     setCalorie(val)
    // }
    const submit = async(val: any) => {
        const data = {
            age: age,
            weight: weight,
            calorieBurned: calorieBurned,
            calorieGoal: calorieGoal,
            diet: diet
        }
        try{
            const url = 'http://localhost:3000/sendLogData'
            const resp = await axios.post(url, data);
            console.log('response: ', resp.data)
        }catch(error){
            console.log("Error!: ", error)
        }
    }
    const [age, setAge] = useState(0);
    const [weight, setWeight] = useState(0);
    const [calorieBurned, setCalorieBurned] = useState(0);
    const [calorieGoal, setCalorieGoal] = useState(0);
    const [diet, setDiet] = useState('');
    return(
        <ScrollView style = {styles.container}>
            <View className= "p-2">
                <Image source = {SmartEats}/>
            </View>
            <View className= "p-2" >
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
                    <TextInput className = "text-lg text-gray-900 border-b border-puple-500 pl-2 pb-1" onChangeText = {(value)=>setAge((Number(value)))} placeholder="Enter your current age"/>
                    
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
                    <TextInput className = "text-lg text-gray-900 border-b border-puple-500 pl-2 pb-1" onChangeText= {(value:Number)=>setWeight(Math.round((Number(value))))} placeholder="Enter your current weight"/>
                    
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
                        value = {calorieBurned}
                        onValueChange= {(val)=>{setCalorieBurned(Math.round(val))}}
                    />
                    <Text style= {{fontSize:16}} >
                            {calorieBurned} calories
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

            <View className ="flex items-center pl-2 pr-2 pt-10">
                <Text style = {{ fontSize: 20}} className = "text-xlg text-#4A2ED6 pl-1 pb-3">
                    What diet plan would you like to follow?
                </Text>

            </View>
            <View>
                    <TouchableOpacity className = "m-3 w-4/5 mx-auto  flex-row items-center border-gray-300 border rounded-lg" style={{ width:"80%"}}
                    onPress= {()=>{setDiet("Paleothinic")}}>
                        <Text className = "ml-2 text-lg w-1/3" title = "Submit">
                        Paleothinic
                        </Text>
                        <Image className= "ml-auto" source = {Paleo}
                        style ={{width: 60, height: 60}} />
                    </TouchableOpacity>
                    <TouchableOpacity className = " m-3 w-4/5 mx-auto  flex-row items-center border-gray-300 border rounded-lg" style={{ width:"80%"}}
                    onPress= {()=>{setDiet("Vegetarian")}}>
                        <Text className = "ml-2 text-lg w-1/3" title = "Submit">
                            Vegetarian
                        </Text>
                        <Image className= "ml-auto" source = {Vegetarian}
                        style ={{width: 60, height: 60}} />
                    </TouchableOpacity>


                    <TouchableOpacity className = "m-3 w-4/5 mx-auto  flex-row items-center border-gray-300 border rounded-lg" style={{ width:"80%"}}
                   onPress= {()=>{setDiet("Pescatarian")}}>
                        <Text className = "ml-2 text-lg w-1/3" title = "Submit">
                           Pescatarian
                        </Text>
                        <Image className= "ml-auto" source = {Pesca}
                        style ={{width: 60, height: 60}} />
                    </TouchableOpacity>

                    <TouchableOpacity className = "m-3 w-4/5 mx-auto  flex-row items-center border-gray-300 border rounded-lg" style={{ width:"80%"}}
                    onPress= {()=>{setDiet("Vegan")}}>
                        <Text className = "ml-2 text-lg w-1/3" title = "Submit">
                           Vegan
                        </Text>
                        <Image className= "ml-auto" source = {Vegan}
                        style ={{width: 60, height: 60}} />
                    </TouchableOpacity>
                    <View className= "flex items-center justify-center">
                        <Text className ="text-lg text-blue-500">
                            Your Diet Choice: {diet}
                        </Text>
                    </View>

                    <View className = "pt-5">
                    {(age == 0 || weight == 0 || calorieBurned ==0 || calorieGoal == 0 || diet == '')&& <View className = "mb-5 flex-row items-center  w-4/5 mx-auto  justify-center border-gray-100 border-2 rounded-full " style={{width:"60%"}}>
                        <Image className = "" source = {Icon}/>
                        <Text className = "p-2 text-lg" style={{color: "#4A2ED6"}} title = "Submit">
                            Continue
                        </Text>
                    </View>}
                    {(age != 0 && weight != 0 && calorieBurned != 0 && calorieGoal != 0 && diet != '') && <TouchableOpacity className = "flex-row items-center  w-4/5 mx-auto  justify-center border-gray-100 border-2 rounded-full " style={{backgroundColor:"#83B6F1", width:"60%"}}>
                        <Image className = "" source = {Icon}/>
                        <Text className = "p-2 text-lg" style={{color: "#4A2ED6"}} title = "Submit" onPress={submit}
                        >
                            Continue
                        </Text>
                    </TouchableOpacity>}
                </View>
                {/* <Text>
                Weight:{weight}
                Age: {age}
                Calorie Consumption: {calorieBurned}
                calorie goal: {calorieGoal}
                Diet: {diet}
                </Text> */}


            </View>
        </ScrollView>
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