import {useState} from "react"
import {View, Text , StyleSheet} from "react-native"
import {router} from "expo-router"

import {Button} from "@/components/button"
import {Input} from "@/components/input"
import {styles} from "../styles"



export default function Index(){
    const [name, setName] = useState("")
    function handleNext(){
        router.navigate("/dashboard")
    }

    return(        
        <View  style={styles.myContainer}>
            <View  style={styles.myBody}>
                <Text  style={style.title} >Ola,{name}</Text>
                <Input onChangeText={setName}/>
                <Button title="Continuar" onPress={handleNext}/>
            </View>
        </View>
    )
}

const style = StyleSheet.create({
    
    title:{
        fontSize:24,
        color:"#121214",
    },
})