// import { StyleSheet, Text, View } from 'react-native';
import { View, StyleSheet, Text, SafeAreaView, Dimensions, Modal, Button, TouchableOpacity} from 'react-native';

export default function HomePage(){
    return(
        <View style = {styles.container}>
            <Text>
                Dashboard here!
            </Text>
            <Text style = {{padding: 40}}>
                User Info and Profile here!
            </Text>
            <Text className = "text-blue-500">
                Hi

            </Text>
        </View>
    )
}




const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });