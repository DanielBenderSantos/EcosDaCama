import {View,Text,TextInput,ScrollView, StyleSheet,Dimensions} from "react-native"
import {router} from "expo-router"
import {FontAwesome } from "@expo/vector-icons";
import {SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient"; // se estiver usando expo

import {Input} from "@/components/input"


const { height: SCREEN_HEIGHT } = Dimensions.get("window");
export default function Index(){
    function handleNext(){
        router.navigate("/novoSonho")
    }
     function deletar(){
        alert('deletado')
    }

    return(   
        <SafeAreaProvider>
            <StatusBar style="dark" translucent={false} backgroundColor="#fff" />    
            <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top", "left", "right"]}>
                <LinearGradient  colors={["#7c74c4ff", "#f0c1b4ff"]} style={{ flex: 1 ,justifyContent:"center"}}start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} >
                    
                    <View style={{alignItems:"center",justifyContent:"center",  }}>  
                        <View style={[style.card, {backgroundColor:"rgba(255, 255, 255, 0.57)", minHeight:Dimensions.get("window").height * 0.95, maxHeight:Dimensions.get("window").height * 0.95, width:"90%"}]}>
                            <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",height:42,}} >
                                <TextInput placeholder="Pesquisar" style={style.pesquisa} />
                                <FontAwesome name="user-circle" size={32} color="black"/>
                            </View>
                            <ScrollView style={{gap:12 , }} contentContainerStyle={{ padding: 12 }} showsVerticalScrollIndicator={true} >
                                <View  style={{gap:12}}>
                                    <View style={style.card}>
                                        <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>
                                            <View>
                                                <Text>ola</Text>
                                                <Text>02/02/2025</Text>
                                            </View>
                                            <FontAwesome name="trash" onPress={deletar}  size={32} color="black"/>
                                        </View>
                                        <Text  style={style.conteudoCard }   numberOfLines={4} ellipsizeMode="tail">
                                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                                        </Text>
                                    </View>
                                    <View style={style.card}>
                                        <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>
                                            <View>
                                                <Text>ola</Text>
                                                <Text>02/02/2025</Text>
                                            </View>
                                            <FontAwesome name="trash" onPress={deletar}  size={32} color="black"/>
                                        </View>
                                        <Text  style={style.conteudoCard }   numberOfLines={4} ellipsizeMode="tail">
                                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                                        </Text>
                                    </View>
                                    <View style={style.card}>
                                        <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>
                                            <View>
                                                <Text>ola</Text>
                                                <Text>02/02/2025</Text>
                                            </View>
                                            <FontAwesome name="trash" onPress={deletar}  size={32} color="black"/>
                                        </View>
                                        <Text  style={style.conteudoCard }   numberOfLines={4} ellipsizeMode="tail">
                                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                                        </Text>
                                    </View>
                                    <View style={style.card}>
                                        <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>
                                            <View>
                                                <Text>ola</Text>
                                                <Text>02/02/2025</Text>
                                            </View>
                                            <FontAwesome name="trash" onPress={deletar}  size={32} color="black"/>
                                        </View>
                                        <Text  style={style.conteudoCard }   numberOfLines={4} ellipsizeMode="tail">
                                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                                        </Text>
                                    </View>
                                </View>
                            </ScrollView>

                            <View style={{flexDirection:"row",justifyContent:"flex-end",}} >
                                <FontAwesome  onPress={handleNext} name="plus-circle" size={40} color="purple"/>
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
    conteudoCard:{
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    textAlignVertical: "top", // garante que o texto comece em cima no Android
    
    },
    pesquisa:{
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        fontSize: 16,
        padding:10,
        backgroundColor: "#fff",
        width:"85%"
    }
})