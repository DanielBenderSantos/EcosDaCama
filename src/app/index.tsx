import {View, Text , StyleSheet, Alert} from "react-native"
import {Button} from "../components/button"
export default function Index(){
    function handleMessage(){
        const name = "Daniel"
        Alert.alert(`ola, ${name}`)
    }
    return(
        <View  style={style.container}>
            <Text  style={style.title} >Ola Daniel!</Text>
            <Button title="Continuar" onPress={handleMessage}/>
        </View>
    )
}

const style = StyleSheet.create({
    container:{
        flex:1,
        padding:36,
        justifyContent:"center",
        gap:16,
    },
    title:{
        color:"gray",
        fontSize:24,
    },
})