import React, { useState, useEffect, useContext } from 'react';
import {View, Text, TextInput, TouchableOpacity,StyleSheet} from 'react-native';
import { AuthContext } from './AuthContext';
import socket from './socket';
import { LinearGradient } from 'expo-linear-gradient';

export const BarraKi = ({ pj }) => {
  const { personajes, savePersonajes } = useContext(AuthContext);
  const p = personajes.find(p => p.idpersonaje === pj.idpersonaje);

  const [nombre, setNombre] = useState(p.nombre);
  const [ki, setKi] = useState(p.ki != null ? String(p.ki) : '');
  const [fortaleza, setFortaleza] = useState(p.fortaleza != null ? String(p.fortaleza) : '');
  const [kiActual, setKiActual] = useState(p.kiActual != null ? String(p.kiActual) : '');
  const [consumir, setConsumir] = useState("0");
  const [consumision, setConsumision] = useState(p.consumision != null ? String(p.consumision) : '');

  const porcentajeKi = (parseInt(kiActual) / parseInt(ki)) * 100;

  const consumirKi = () => {
    const newValue = parseInt(kiActual) - parseInt(consumir);
    
    if (!isNaN(newValue) && newValue >= 0) {
      setKiActual(String(newValue));

      let message;
      if (parseInt(consumir) > 0) {
        message = `Consumió ${consumir} p de KI             KI: ${newValue} / ${ki}`;
      } else if (parseInt(consumir) < 0) {
        let recuperado = -(parseInt(consumir));
        message = `Recuperó ${recuperado} p de KI             KI: ${newValue} / ${ki}`;
      } else {
        message = `    KI: ${newValue} / ${ki}`;
      }

      const msgEnviar = {
        idpersonaje: p.idpersonaje,
        nombre: nombre,
        kiActual: newValue,
        ki: ki,
        mensaje: message,
      };

      socket.emit('chat-message', msgEnviar);
    }
  };

  // Actualiza los datos en contexto cuando cambian los valores
  const guardarCambios = () => {
    const index = personajes.findIndex(per => per.idpersonaje === p.idpersonaje);
    if (index === -1) return;

    const nuevosPersonajes = [...personajes];
    nuevosPersonajes[index] = {
      ...nuevosPersonajes[index],
      kiActual: kiActual,
      consumision: consumision,
    };

    savePersonajes(nuevosPersonajes);
  };

  useEffect(() => {
    guardarCambios();
  }, [ki, kiActual, consumision]);

  return (
   <View style={styles.container}>
   
      <TouchableOpacity onPress={consumirKi} style={styles.boton}>
        <Text style={styles.botonTexto}>Consumir KI</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Consumir"
        placeholderTextColor="#aaa"
        keyboardType="numeric"
        value={consumir}
        onChangeText={setConsumir}
      />

      <TextInput
        style={styles.input}
        placeholder="Consumision"
        placeholderTextColor="#aaa"
        keyboardType="numeric"
        value={consumision}
        onChangeText={setConsumision}
      />

       <View style={styles.barraContenedor}>
                  <LinearGradient
                     colors={['#00c6ff', '#0072ff', '#003d99']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.barraEnergia, { width: `${Math.min(porcentajeKi, 100)}%` }]}
                  />
                     <Text style={styles.kiTextoEnBarra}>Ki: {kiActual}/{ki}</Text>

          </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    padding: 16,
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 10,
  },
  kiTexto: {
    color: '#fff',
    marginBottom: 6,
    fontSize: 16,
  },
  boton: {
    marginTop: 10,
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  botonTexto: {
    color: 'white',
    fontWeight: 'bold',
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
  },
  barraContenedor: {
    width: '100%',
    height: 16,
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
kiTextoEnBarra: {
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
});