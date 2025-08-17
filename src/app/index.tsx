import {useState} from "react"
import {View, Text , StyleSheet} from "react-native"
import {router} from "expo-router"

import {Button} from "@/components/button"
import {Input} from "@/components/input"


export default function Index(){
    const [name, setName] = useState("")
    function handleNext(){
        router.navigate("/dashboard")
    }

    return(
        <View  style={style.container}>
            <Text  style={style.title} >Ola,{name}</Text>
            <Input onChangeText={setName}/>
            <Button title="Continuar" onPress={handleNext}/>
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