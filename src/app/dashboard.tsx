import {View,Text,ScrollView, StyleSheet,Dimensions} from "react-native"
import{useState} from "react"
import {router} from "expo-router"
import {FontAwesome } from "@expo/vector-icons";
import {SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient"; // se estiver usando expo


import CamposDataHora from "@/components/camposDataHora";

export default function Dashboard(){
     const [when, setWhen] = useState<Date>(new Date()); // controlado (opcional)
     function handleBack(){
        router.navigate("/")
    }
    return(
       <SafeAreaProvider>
            <StatusBar style="dark" translucent={false} backgroundColor="#fff" />    
            <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top", "left", "right"]}>
                <LinearGradient  colors={["#7c74c4ff", "#f0c1b4ff"]} style={{ flex: 1 ,justifyContent:"center"}}start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} >
                    <View style={{alignItems:"center",justifyContent:"center",  }}>  
                        <View style={[style.card, {backgroundColor:"rgba(255, 255, 255, 0.57)", minHeight:Dimensions.get("window").height * 0.95, maxHeight:Dimensions.get("window").height * 0.95, width:"90%"}]}>
                            <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",}} >
                                <FontAwesome  onPress={handleBack}  name="arrow-left" size={32} color="black"/>                                
                                <FontAwesome name="user-circle" size={32} color="black"/>                              
                            </View>
                            <Text style={{fontSize:32,textAlign:"center"}}>Novo Sonho</Text>

                            <View>
                                <View style={{ padding: 16 }}>
                                    <CamposDataHora
                                        value={when}                 // pode omitir se quiser não-controlado
                                        onChange={setWhen}
                                        labelDate="Data"
                                        labelTime="Hora"
                                        is24Hour
                                        // minimumDate={new Date()}  // exemplo: bloquear passado
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

export const style = StyleSheet.create({
   card: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,       
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        gap:15,               //espaçamento entre os filhos
    },
})