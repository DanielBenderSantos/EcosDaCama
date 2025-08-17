import {View, Text, StyleSheet} from "react-native"
import {router} from "expo-router"


import {Button} from "@/components/button"
export default function Dashboard(){
    return(
        <View style={style.container}>
            <Text style={style.title}>Dashboard</Text>
            <Button  title="Voltar" onPress={() => router.back()}/>
        </View>
    )
}

export const style = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:"center",
        alignItems:"center",
        padding:32,
        gap:16,
    },
    title:{
        fontSize:18,
        fontWeight:"bold"
    }
})