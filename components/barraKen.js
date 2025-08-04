import React, { useState, useEffect, useContext } from 'react';
import { View,Text, TextInput, TouchableOpacity, StyleSheet,Pressable} from 'react-native';
import { AuthContext } from './AuthContext';
import socket from './socket';
import { LinearGradient } from 'expo-linear-gradient';


export const BarraKen = ({ pj, ken,setKen,kenActual,setKenActual }) => {
  const { personajes, savePersonajes,estatus,nick } = useContext(AuthContext);
  const p = personajes.find(p => p.idpersonaje === pj.idpersonaje);

  const [nombre, setNombre] = useState(p.nombre);

  const [consumir, setConsumir] = useState("0");
  

  const porcentajeKen = (parseInt(kenActual) / parseInt(ken)) * 100;

  const consumirKen = () => {
    const newValue = parseInt(kenActual) - parseInt(consumir);
    
    if (!isNaN(newValue) && newValue >= 0) {
      setKenActual(String(newValue));

      let message;
      if (parseInt(consumir) > 0) {
        message = `✨ Consumió ${consumir} p de KEN         KEN: ${newValue} / ${ken}`;
      } else if (parseInt(consumir) < 0) {
        let recuperado = -(parseInt(consumir));
        message = `✨ Recuperó ${recuperado} p de KEN         KEN: ${newValue} / ${ken}`;
      } else {
        message = `✨ KEN: ${newValue} / ${ken}`;
      }

      const msgEnviar = {
        //id: Date.now().toString() + Math.random().toString(36).substring(2),
        usuarioId:p.usuarioId,
        idpersonaje: p.idpersonaje,
        nombre: nombre,
        kenActual: newValue,
        ken: ken,
        mensaje: message,
        estatus:estatus,
        imagenPjUrl:p.imagenurl || "",
        nick: nick || "",
        tipo: "ken",
      };

      socket.emit('chat-chat', msgEnviar);
    }
  };

  // Actualiza los datos en contexto cuando cambian los valores
  const guardarCambios = () => {
    const index = personajes.findIndex(per => per.idpersonaje === p.idpersonaje);
    if (index === -1) return;

    const nuevosPersonajes = [...personajes];
    nuevosPersonajes[index] = {
      ...nuevosPersonajes[index],
      kenActual: kenActual,
   
    };

    savePersonajes(nuevosPersonajes);
  };

  useEffect(() => {
    guardarCambios();
  }, [ken,kenActual]);

  return (
   

   <LinearGradient
   colors={['#3ab222ff', '#141e30', '#000000']}
           start={{ x: 0, y: 0 }}
           end={{ x: 1, y: 0 }}
           style={[
             styles.container
           ]}
         >

  {/* Barra de Ken arriba */}
  <View style={styles.barraContenedor}>
    <LinearGradient
      colors={['#00ff66', '#00cc44', '#006622']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.barraEnergia, { width: `${Math.min(porcentajeKen, 100)}%` }]}
    />
    <Text style={styles.kenTextoEnBarra}>Ken: {kenActual}/{ken}</Text>
  </View>



  <View style={styles.fila}>
    <TextInput
      style={styles.input}
      placeholder="ingresa Ken"
      placeholderTextColor="#aaa"
      value={String(consumir)}
      onChangeText={setConsumir}
      keyboardType="numbers-and-punctuation"
    />
  
   <LinearGradient
       colors={['#32CD32', '#2E8B57', '#228B22']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.boton}
      >
       <Pressable
        style={({ pressed }) => [
            styles.botonInterno,
            pressed && { opacity: 0.8, backgroundColor: "white" }, // opacidad y color cuando presiona
          ]}
          onPress={consumirKen}
        
        >
           <Text style={styles.botonTexto}>Consumir Ken</Text>
        </Pressable>
         
       
    </LinearGradient>
  </View>

</LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    padding: 10,
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 10,
     borderWidth:0.3,
    borderColor:"white",
    borderRadius:10
  },
  kenTexto: {
    color: '#fff',
    marginBottom: 6,
    fontSize: 16,
  },
  
 
 
  barraContenedor: {
    width: '100%',
   height: 19,
    backgroundColor: 'yellow',
    borderRadius: 8, // sin bordes redondeados
    marginVertical: 6,
    overflow: 'hidden',
  },
 barraEnergia: {
  height: '100%',
  borderTopLeftRadius: 8,
  borderBottomLeftRadius: 8,
  borderTopRightRadius: 8,
  borderBottomRightRadius: 8,

  // Sombras para iOS
  shadowColor: '#00ff66',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.9,
  shadowRadius: 10,

  // Elevación para Android
  elevation: 6,
  borderColor: 'white',  // <-- así va el color en string
  borderWidth: 1,        // No olvides poner el ancho del borde
},
kenTextoEnBarra: {
  position: 'absolute',
  width: '100%',
  textAlign: 'center',
  color: '#000', // Negro para que contraste con amarillo/verde
  fontWeight: 'bold',
  fontSize: 18,
  lineHeight: 16,
  top: 0,
  bottom: 0,
  textAlignVertical: 'center', // Para Android
  includeFontPadding: false,   // Para iOS
},



botonTouchable: {
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 6,
  alignItems: 'center',
  justifyContent: 'center',
},


botonGradient: {
  borderRadius: 6,
  padding: 1,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.5,
  shadowRadius: 4,
  elevation: 6,
  // Ancho para que quede similar al input
  minWidth: 120,
},

botonTouchable: {
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 6,
  alignItems: 'center',
  justifyContent: 'center',
},


 input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 8,
    color: 'white',
    backgroundColor: '#1a1a1a',
    borderRadius: 6,
    marginTop: 10,
    width: '60%',
    textAlign: 'center',
      flex: 1,
  },
  fila: {
  flexDirection: "row",
  alignItems: "center",
  gap:5,
},



boton: {
  marginTop: 10,
  borderRadius: 6,
  padding: 1, // espacio alrededor del botón interno para mostrar el gradiente
},

botonInterno: {
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 6,
  alignItems: 'center',
  justifyContent: 'center', // ✅ centra verticalmente el texto
},

botonTexto: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 16,
  fontFamily: 'sans-serif-condensed',
}
 
});