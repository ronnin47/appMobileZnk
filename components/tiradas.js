import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { View,Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ChatTiradas } from './chatTiradas';
import { BarraVida } from './barraVida';
import { BarraKi } from './barraKi';
import { BarraKen } from './barraKen';
import socket from './socket';
import { LinearGradient } from 'expo-linear-gradient';

const generarNumerosAzarSinRangoMin=(cantidad, rangoMax)=> {
  var numeros = [];
  for (var i = 0; i < cantidad; i++) {
    var numero = Math.floor(Math.random() * rangoMax) + 1;
    numeros.push(numero);
  }
  return numeros;
}

export const Tiradas = ({ pj,ki,setKi,fortaleza,setFortaleza,ken,setKen,
            kenActual,
            setKenActual,
            kiActual,
            setKiActual,
            vidaActual,
            setVidaActual }) => {
  
  const { personajes, historialChat, setHistorialChat,savePersonajes,estatus } = useContext(AuthContext);

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


 const [abierto, setAbierto] = useState(false);
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

  
    const mensaje={
      usuarioId:p.usuarioId,
      idpersonaje:p.idpersonaje,
      nombre:p.nombre,
      mensaje:mensajeChat,
      estatus:estatus,
    }

    console.log("***TIRADAS emite**",mensaje)
    socket.emit('chat-message', mensaje);
  };



  //aca los states de positiva, negativa, cicatriz
  const [positiva, setPositiva] = useState(p.positiva != null ? String(p.positiva) : '');
  const [negativa, setNegativa] = useState(p.negativa != null ? String(p.negativa) : '');
  const [cicatriz, setCicatriz] = useState(p.cicatriz != null ? String(p.cicatriz) : '');

//ESTO ES PARA LA LOGICA INTERNA DE GUARDAR sobre el array que esta en el context
    const guardarCambios = () => {
    const index = personajes.findIndex(per => per.idpersonaje === pj.idpersonaje);
    if (index === -1) return;

    const nuevosPersonajes = [...personajes];

    nuevosPersonajes[index] = {
      ...nuevosPersonajes[index],
      positiva: positiva,
      negativa: negativa,
      cicatriz: cicatriz,
    };

    savePersonajes(nuevosPersonajes);
  };
  
  useEffect(() => {
   guardarCambios();
  }, [ 
    positiva,
    negativa,
    cicatriz,
  ]);

    //se refiere a la cantidad de vida por fase 
  const faseSalud = parseInt(ki) + parseInt(fortaleza);

  return (
    <>
     <ChatTiradas p={p}/>

      <ScrollView style={styles.container}>
      

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
        <LinearGradient
            colors={['#EF6C00', '#E65100', '#BF360C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.botonPrincipal}
          >
            <TouchableOpacity onPress={tirarDados} style={styles.botonToque}>
              <Text style={styles.botonPrincipalTexto}>Tirar Dados</Text>
            </TouchableOpacity>
          </LinearGradient>

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
              <BarraVida            setKenActual={setKenActual}
          
            vidaActual={Number(vidaActual)||0}
            setVidaActual={setVidaActual}
             pj={p} ki={ki} setKi={setKi} fortaleza={fortaleza} setFortaleza={setFortaleza}  positiva={Number(positiva) || 0} negativa={Number(negativa) || 0} cicatriz={Number(cicatriz) || 0}></BarraVida>
            </View>

            <View>
              <BarraKi 
                kiActual={Number(kiActual)||0}
               setKiActual={setKiActual}
            pj={p} ki={ki} setKi={setKi}></BarraKi>
            </View>

            <View>
              <BarraKen
              kenActual={Number(kenActual)||0}
              setKenActual={setKenActual}
              pj={p} ken={ken} setKen={setKen}></BarraKen>
            </View>       
        </View>

        
        
         <View style={styles.acordeonContainer}>
      <TouchableOpacity onPress={() => setAbierto(!abierto)} style={styles.acordeonHeader}>
        <Text style={styles.acordeonTitulo}>Fases y cicatrices {abierto ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {abierto && (
  <View style={styles.inputsContainer}>
    <View style={styles.inputGroup}>
       <Text style={styles.labelFases}>Fases de Salud {faseSalud} pv</Text>
      <Text style={styles.label}>Fases positivas</Text>
      <TextInput
        style={styles.input}
        placeholder="Fases positivas"
        placeholderTextColor="#aaa"
        value={positiva}
        onChangeText={setPositiva}
        keyboardType="numbers-and-punctuation"
      />
    </View>

    <View style={styles.inputGroup}>
      <Text style={styles.label}>Fases negativas</Text>
      <TextInput
        style={styles.input}
        placeholder="Fases negativas"
        placeholderTextColor="#aaa"
        value={negativa}
        onChangeText={setNegativa}
        keyboardType="numbers-and-punctuation"
      />
    </View>

    <View style={styles.inputGroup}>
      <Text style={styles.label}>Puntos de cicatrices</Text>
      <TextInput
        style={styles.input}
        placeholder="Puntos de cicatrices"
        placeholderTextColor="#aaa"
        value={cicatriz}
        onChangeText={setCicatriz}
        keyboardType="numbers-and-punctuation"
      />
    </View>
  </View>
)}
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
    backgroundColor: "#28a745",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderColor:"gray",
    borderWidth: 2, 
  },
  botonTexto: {
    color: "#fff",
    fontSize: 24,
  },
  botonPrincipal: {
   backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
      borderColor:"white",
    borderWidth: 4,
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
},
 acordeonContainer: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    marginBottom:100, 
  },
  acordeonHeader: {
    backgroundColor: '#222',
    padding: 12,
  },
  acordeonTitulo: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputsContainer: {
    padding: 12,
    backgroundColor: '#111',
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#444',
  },
  inputGroup: {
  marginBottom: 12,
},
label: {
  color: '#ddd',
  fontSize: 13,
  marginBottom: 4,
  fontWeight: '500',
},
labelFases: {
  color: 'yellow',
  fontSize: 16,
  marginBottom: 4,
  fontWeight: '500',
  textAlign:"center",
},
botonPrincipal: {
  borderRadius: 10,
  overflow: 'hidden',
},

botonToque: {
  paddingVertical: 12,
  paddingHorizontal: 24,
  alignItems: 'center',
},

botonPrincipalTexto: {
  color: 'white',
  fontSize: 18,
  fontWeight: 'bold',
}
});
