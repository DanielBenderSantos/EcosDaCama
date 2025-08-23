import {View,Text,Alert,Platform,ScrollView, StyleSheet,Dimensions, TextInput} from "react-native"
import{useState} from "react"
import {router} from "expo-router"
import {FontAwesome } from "@expo/vector-icons";
import {SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient"; // se estiver usando expo

import CamposDataHora from "@/components/camposDataHora";
import TipoSonhoCheckbox, { TipoSonhoId } from "@/components/tipoSonho";
import {Button} from "@/components/button"
import {Input} from "@/components/input"
import SentimentosCheckbox from "@/components/sentimentosCheckbox";

export default function Dashboard(){
    const [when, setWhen] = useState<Date>(new Date()); 
    const [tipo, setTipo] = useState<TipoSonhoId | null>(null);
    const [sentimentos, setSentimentos] = useState({
      feliz: false,
      triste: false,
      assustado: false,
      confuso: false,
      raiva: false,
      aliviado: false,
      ansioso: false,
      sereno: false,
    });

    const [textoSonho, setTextoSonho] = useState("");

    function handleBack(){
        router.navigate("/")
    }

    const salvar = () => {
        const selecionados = Object.keys(sentimentos)
          .filter((k) => sentimentos[k as keyof typeof sentimentos])
          .join(", ");
        
        const msg = `Sonho: ${textoSonho}\nSentimentos: ${selecionados || "nenhum"}`;

        if (Platform.OS === "web") {
            window.alert(`Sonho salvo\n${msg}`);
        } else {
            Alert.alert("Sonho salvo", msg);
        }
    };
    

    return(
       <SafeAreaProvider>
            <StatusBar style="dark" translucent={false} backgroundColor="#fff" />    
            <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top", "left", "right"]}>
                <LinearGradient  colors={["#7c74c4ff", "#f0c1b4ff"]} style={{ flex: 1 ,justifyContent:"center"}} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} >
                    <View style={{alignItems:"center",justifyContent:"center"}}>  
                        <View style={[style.card, {backgroundColor:"rgba(255, 255, 255, 0.57)", minHeight:Dimensions.get("window").height * 0.95, maxHeight:Dimensions.get("window").height * 0.95, width:"90%"}]}>
                            <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}} >
                                <FontAwesome  onPress={handleBack}  name="arrow-left" size={32} color="black"/>                                
                                <FontAwesome name="user-circle" size={32} color="black"/>                              
                            </View>
                            <ScrollView style={{gap:12 , }} contentContainerStyle={{ padding: 12 }} showsVerticalScrollIndicator={true} >
                            
                                <Text style={{fontSize:32,textAlign:"center"}}>Novo Sonho</Text>

                                <View>
                                    <View style={{ gap:12 }}>
                                        <CamposDataHora value={when} onChange={setWhen} labelDate="Data " labelTime="Hora " is24Hour/>
                                        <Input placeholder="Titulo"/>

                                        {/* Textarea Sonho */}
                                        <TextInput
                                            placeholder="Descreva seu sonho..."
                                            value={textoSonho}
                                            onChangeText={setTextoSonho}
                                            multiline
                                            numberOfLines={6}
                                            textAlignVertical="top"
                                            style={style.textarea}
                                        />

                                        <SentimentosCheckbox value={sentimentos} onChange={setSentimentos} />
                                        <TipoSonhoCheckbox value={tipo} onChange={setTipo} />
                                        <Button title="Salvar" onPress={salvar} />
                                    </View>
                                </View>
                            </ScrollView>

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
        gap:15,
    },
    container: { flex: 1, padding: 20, backgroundColor: "#fff" },
    header: { fontSize: 20, fontWeight: "700", marginBottom: 20 },
    textarea: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        minHeight: 100,
        fontSize: 16,
        backgroundColor: "#fff"
    }
})
