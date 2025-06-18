import React, { useContext, useState, useRef, useEffect } from 'react';

import { AuthContext } from './AuthContext';
import { View,Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ChatTiradas } from './chatTiradas';

import { BarraVida } from './barraVida';
import { BarraKi } from './barraKi';
import { BarraKen } from './barraKen';

import { io } from 'socket.io-client';
//const socket = io('http://192.168.0.38:3000');

import socket from './socket';

const generarNumerosAzarSinRangoMin=(cantidad, rangoMax)=> {
  var numeros = [];
  for (var i = 0; i < cantidad; i++) {
    var numero = Math.floor(Math.random() * rangoMax) + 1;
    numeros.push(numero);
  }
  return numeros;
}

export const Tiradas = ({ pj }) => {
  
  const { personajes, historialChat, setHistorialChat } = useContext(AuthContext);

  const p = personajes.find((p) => p.idpersonaje === pj.idpersonaje);



  const [valTirada, setValTirada] = useState("");
  const [sumaTirada, setSumaTirada] = useState("");
  const [valTiradaD6, setValTiradaD6] = useState("");
  const [valTiradaD4, setValTiradaD4] = useState("");
  const [valTiradaD12, setValTiradaD12] = useState("");
  const [valTiradaD10, setValTiradaD10] = useState("");
  const [valTiradaD20, setValTiradaD20] = useState("");
  const [valTiradaD10Bono, setValTiradaD10Bono] = useState("");
  const [principal, setPrincipal] = useState("");
  const [secundaria, setSecundaria] = useState("");

  const [dadosD12Bono, setDadosD12Bono] = useState(0);
  const [dadosD6Bono, setDadosD6Bono] = useState(0);
  const [dadosD4Bono, setDadosD4Bono] = useState(0);
  const [dadosD10, setDadosD10] = useState(0);
  const [dadosD20, setDadosD20] = useState(0);
  const [dadosD10Bono, setDadosD10Bono] = useState(0);

  //console.log("USUARIO ID: ",p.usuarioId)

  useEffect(() => {

    // Cuando el socket se conecta, enviamos info del usuario (ejemplo)
    socket.emit('user-connected', { usuarioId: p.usuarioId, sesion: 'algo' });

    // Cleanup al desmontar componente
    return () => {
      socket.off('chat-message');
    };
  }, []);
 

  const scrollViewRef = useRef();

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [historialChat]);

  if (!p) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Personaje no encontrado</Text>
      </View>
    );
  }

  const tirarDados = () => {
    const principalValue = principal === "" ? 0 : parseInt(principal);
    const secundariaValue = secundaria === "" ? 0 : parseInt(secundaria);
    let base = 1;
    if (principal == 0) {
      base = 0;
    }
    let cantD10 = Math.floor(principal / 10) + base;
    let tirada = generarNumerosAzarSinRangoMin(cantD10, 10);
    let d12 = generarNumerosAzarSinRangoMin(dadosD12Bono, 12);
    let d6 = generarNumerosAzarSinRangoMin(dadosD6Bono, 6);
    let d4 = generarNumerosAzarSinRangoMin(dadosD4Bono, 4);
    let d10 = generarNumerosAzarSinRangoMin(dadosD10, 10);
    let d20 = generarNumerosAzarSinRangoMin(dadosD20, 20);
    let d10Bono = generarNumerosAzarSinRangoMin(dadosD10Bono, 10);

    let sumaTirada = tirada.reduce((a, v) => a + v, 0);
    let sumaD12 = d12.reduce((a, v) => a + v, 0);
    let sumaD6 = d6.reduce((a, v) => a + v, 0);
    let sumaD4 = d4.reduce((a, v) => a + v, 0);
    let sumaD10 = d10.reduce((a, v) => a + v, 0);
    let sumaD20 = d20.reduce((a, v) => a + v, 0);
    let sumaD10Bono = d10Bono.reduce((a, v) => a + v, 0);

    let total =
      sumaTirada +
      principalValue +
      secundariaValue +
      sumaD10 +
      sumaD20 +
      sumaD10Bono +
      sumaD6 +
      sumaD4 +
      sumaD12;

    setValTirada(tirada.join(", "));
    setValTiradaD12(d12.join(", "));
    setValTiradaD6(d6.join(", "));
    setValTiradaD4(d4.join(", "));
    setValTiradaD10(d10.join(", "));
    setValTiradaD20(d20.join(", "));
    setValTiradaD10Bono(d10Bono.join(", "));
    setSumaTirada(total);

    const baset = principalValue + secundariaValue;

    let mensajeChat = `Tirada    ${baset > 0 ? `Base: ${baset}` : ""}   ` +
      `${tirada.length > 0 ? `D10 esfuerzo: ${tirada.join(", ")}` : ""}   ` +
      `${d10.length > 0 ? `Bono D10 Ken: ${d10.join(", ")}` : ""}   ` +
      `${d20.length > 0 ? `Bono D20: ${d20.join(", ")}` : ""}   ` +
      `${d10Bono.length > 0 ? `Bono D10: ${d10Bono.join(", ")}` : ""}   ` +
      `${d6.length > 0 ? `Bono D6: ${d6.join(", ")}` : ""}   ` +
      `${d4.length > 0 ? `Bono D4: ${d4.join(", ")}` : ""}   ` +
      `${d12.length > 0 ? `Bono D12: ${d12.join(", ")}` : ""}   
                                   TOTAL: ${total}`;

   // setHistorialChat(prev => [...prev, mensaje]);
  
    const mensaje={
      idpersonaje:p.idpersonaje,
      nombre:p.nombre,
      mensaje:mensajeChat
    }

    socket.emit('chat-message', mensaje);
  };

  return (
    <>
     <ChatTiradas p={p}/>

      <ScrollView style={styles.container}>
        <Text style={styles.titulo}>Tiradas</Text>

        <TextInput
          style={styles.input}
          placeholder="Atributo principal"
          placeholderTextColor="#ccc"
          keyboardType="numeric"
          value={principal}
          onChangeText={setPrincipal}
        />
        <TextInput
          style={styles.input}
          placeholder="Atributo secundario"
          placeholderTextColor="#ccc"
          keyboardType="numeric"
          value={secundaria}
          onChangeText={setSecundaria}
        />

        <View style={styles.dadosContainer}>
  {/* Primera columna con primeros 3 dados */}
  <View style={styles.columna}>
    {[
      { label: "D12 bono", valor: dadosD12Bono, add: () => setDadosD12Bono(d => d + 1), rest: () => setDadosD12Bono(d => Math.max(0, d - 1)) },
      { label: "D4 bono", valor: dadosD4Bono, add: () => setDadosD4Bono(d => d + 1), rest: () => setDadosD4Bono(d => Math.max(0, d - 1)) },
      
      { label: "D10 bono", valor: dadosD10Bono, add: () => setDadosD10Bono(d => d + 1), rest: () => setDadosD10Bono(d => Math.max(0, d - 1)) },
     
    ].map((dado, idx) => (
      <View key={idx} style={styles.dadoRow}>
        <Text style={styles.dadoLabel}>{dado.label}: {dado.valor}</Text>
        <View style={styles.botones}>
          <TouchableOpacity style={styles.boton} onPress={dado.rest}>
            <Text style={styles.botonTexto}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.boton} onPress={dado.add}>
            <Text style={styles.botonTexto}>+</Text>
          </TouchableOpacity>         
        </View>
      </View>
    ))}
  </View>

  {/* Segunda columna con los otros 3 dados */}
  <View style={styles.columna}>
    {[
      { label: "D20", valor: dadosD20, add: () => setDadosD20(d => d + 1), rest: () => setDadosD20(d => Math.max(0, d - 1)) },
      { label: "D6 bono", valor: dadosD6Bono, add: () => setDadosD6Bono(d => d + 1), rest: () => setDadosD6Bono(d => Math.max(0, d - 1)) },
       { label: "D10", valor: dadosD10, add: () => setDadosD10(d => d + 1), rest: () => setDadosD10(d => Math.max(0, d - 1)) },
      
    ].map((dado, idx) => (
      <View key={idx} style={styles.dadoRow}>
        <Text style={styles.dadoLabel}>{dado.label}: {dado.valor}</Text>
        <View style={styles.botones}>
           <TouchableOpacity style={styles.boton} onPress={dado.rest}>
            <Text style={styles.botonTexto}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.boton} onPress={dado.add}>
            <Text style={styles.botonTexto}>+</Text>
          </TouchableOpacity>
         
        </View>
      </View>
    ))}
  </View>
</View>
        <TouchableOpacity style={styles.botonPrincipal} onPress={tirarDados}>
          <Text style={styles.botonPrincipalTexto}>¡Tirar Dados!</Text>
        </TouchableOpacity>

        <View style={styles.resultado}>
          <Text style={styles.resultadoTexto}>D10 esfuerzo: {valTirada}</Text>
          <Text style={styles.resultadoTexto}>Bono D10 Ken: {valTiradaD10}</Text>
          <Text style={styles.resultadoTexto}>Bono D20 bono: {valTiradaD20}</Text>
          <Text style={styles.resultadoTexto}>Bono D10 bono: {valTiradaD10Bono}</Text>
          <Text style={styles.resultadoTexto}>Bono D12 bono: {valTiradaD12}</Text>
          <Text style={styles.resultadoTexto}>Bono D6 bono: {valTiradaD6}</Text>
          <Text style={styles.resultadoTexto}>Bono D4 bono: {valTiradaD4}</Text>
          
          
          <Text style={styles.resultadoTotal}>TOTAL: {sumaTirada}</Text>
        </View>

        <View style={styles.barras}>
            <View >
              <BarraVida pj={p}></BarraVida>
            </View>

            <View>
              <BarraKi pj={p}></BarraKi>
            </View>

            <View>
              <BarraKen pj={p}></BarraKen>
            </View>       
        </View>

        
        
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  panelHistorial: {

  top: 0,
  left: 0,
  right: 0,
  height: 200,
  backgroundColor: "#111827",       // Azul oscuro, buena elección para fondo
  color: "#ADFF2F",             // Este no tendrá efecto en View, solo en Text
  paddingHorizontal: 10,
  paddingVertical: 8,
  zIndex: 10,
  borderBottomWidth: 1,
  borderBottomColor: "#ADFF2F", // Resalta bien el borde
},
  scrollHistorial: {
    flex: 1,
  },
  textoHistorial: {
   color: "#ADFF2F",
    fontSize: 12,
    marginBottom: 6,
  },
  textoHistorialVacio: {
    color: "#ADFF2F",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 20,
  },
  container: {
    padding: 16,
    backgroundColor: "#1a1a1a",
    flex: 1,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#facc15",
    marginBottom: 12,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#2d2d2d",
    color: "#fff",
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#444",
  },
  dadoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dadoLabel: {
    color: "#ccc",
    fontSize: 16,
  },
  botones: {
    flexDirection: "row",
    gap: 6,
  },
  boton: {
    backgroundColor: "#444",
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  botonTexto: {
    color: "#fff",
    fontSize: 24,
  },
  botonPrincipal: {
    backgroundColor: "#f97316",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  botonPrincipalTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  resultado: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#2a2a2a",
    borderRadius: 6,  
  },
  resultadoTexto: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 4,
  },
  resultadoTotal: {
    color: "#facc15",
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 10,
  },
  dadosContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginVertical: 10,
},
columna: {
  flex: 1,
  marginHorizontal: 5,
},
dadoRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
},
barras: {
  marginBottom:50,
}
});
