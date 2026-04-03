import React, { useContext, useState, useEffect,useRef } from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, TouchableOpacity,Modal, FlatList, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthContext';
import socket from './socket';
import { Vibration } from 'react-native';
import { API_BASE_URL } from './config';
import axios from 'axios';
import { Audio } from 'expo-av'; 
import { Estrellitas } from './estrellitas';
import { Animated } from 'react-native';

export const Party = ({ pj }) => {
  const { historialChat,coleccionPersonajes, estatus, nick } = useContext(AuthContext);
  const [estadoTiempoReal, setEstadoTiempoReal] = useState({}); 


  const [busqueda, setBusqueda] = useState('');
  const [personajesAgregados, setPersonajesAgregados] = useState([]);
  const [kenPuntos, setKenPuntos] = useState({}); // Guardar puntos por personaje
  const imagenBase = require('../assets/imagenBase.jpeg');
  const [historialKen, setHistorialKen] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  //const fondoUrl ="https://res.cloudinary.com/dzul1hatw/image/upload/v1773419661/700ef2bb7f79b95bcd3a084cb2095559_cn3ywp.avif"
  const fondoUrl="https://res.cloudinary.com/dzul1hatw/image/upload/v1774897126/descarga_drneff.jpg";
  const fondoUrlRegistroKen="https://res.cloudinary.com/dzul1hatw/image/upload/v1773775660/WhatsApp_Image_2026-03-17_at_16.13.54_1_w5quwi.jpg"
  
const fondoUrlLeyenda="https://res.cloudinary.com/dzul1hatw/image/upload/v1775231592/9c44e6368ca569c0a2ec788f053b6c3d_kj2rsn.jpg";

const fondoUrlNormal="https://res.cloudinary.com/dzul1hatw/image/upload/v1775230094/5ffb7588b70b88f2f5341e3c0ce369a9_iwz1zm.avif";

//recuperamos los personajes
  useEffect(() => {
  const cargarPersonajes = async () => {
    try {
      const data = await AsyncStorage.getItem(
        `personajesSeleccionadosV2_${pj.idpersonaje}`
      );

      if (data) {
        const parsed = JSON.parse(data);

        let listaPersonajes = [];

        if (Array.isArray(parsed)) {
          if (typeof parsed[0] === "object") {
            // formato viejo
            listaPersonajes = parsed;
          } else {
            // formato nuevo (IDs)
            listaPersonajes = coleccionPersonajes.filter(p =>
              parsed.includes(p.idpersonaje)
            );
          }
        }

        setPersonajesAgregados(listaPersonajes);

       setKenPuntos({});
      }
    } catch (err) {
      console.log("Error cargando personajes:", err);
    }
  };

  cargarPersonajes();
}, [pj.idpersonaje, coleccionPersonajes]);


  const guardarPersonajes = async (lista) => {
  try {
    const ids = lista.map(p => p.idpersonaje);
    await AsyncStorage.setItem(
      `personajesSeleccionadosV2_${pj.idpersonaje}`,
      JSON.stringify(ids)
    );
  } catch (err) {
    console.log("Error guardando personajes:", err);
  }
};

//agreagmos personajes
 const agregarPersonaje = (personaje) => {
  const existe = personajesAgregados.some(
    p => p.idpersonaje === personaje.idpersonaje
  );

  if (!existe) {
    const nuevaLista = [...personajesAgregados, personaje];
    setPersonajesAgregados(nuevaLista);
    guardarPersonajes(nuevaLista);

    setBusqueda('');
    setKenPuntos({
      ...kenPuntos,
      [personaje.idpersonaje]: 0
    });
  }
};

//eliminamos personajes del storage
 const eliminarPersonaje = (id) => {
  if (id == null) return;

  const nuevaLista = personajesAgregados.filter(
    p => p.idpersonaje !== id
  );

  setPersonajesAgregados(nuevaLista);
  guardarPersonajes(nuevaLista);

  const nuevosKen = { ...kenPuntos };
  delete nuevosKen[id];
  setKenPuntos(nuevosKen);
};




// REACCIONAR A CAMBIOS EN EL HISTORIAL DE CHAT
useEffect(() => {
  if (!historialChat.length) return;

  const nuevoEstado = {};

  // recorrer de atrás hacia adelante
  for (let i = historialChat.length - 1; i >= 0; i--) {
    const msg = historialChat[i];

    if (
      msg.tipo !== "vida" &&
      msg.tipo !== "ki" &&
      msg.tipo !== "ken"
    ) continue;

    const id = String(msg.idpersonaje);

    // si no es de mi lista, ignorar
    const esDeMiLista = personajesAgregados.some(
      p => String(p.idpersonaje) === id
    );
    if (!esDeMiLista) continue;

    if (!nuevoEstado[id]) {
      nuevoEstado[id] = {};
    }

    // solo setear si todavía no lo tenemos
    

        if (msg.tipo === "vida") {
        if (nuevoEstado[id].vidaActual == null && msg.vidaActual != null) {
            nuevoEstado[id].vidaActual = msg.vidaActual;
        }

        if (nuevoEstado[id].vidaTotal == null && msg.vidaTotal != null) {
            nuevoEstado[id].vidaTotal = msg.vidaTotal;
        }
    }
  

        if (msg.tipo === "ki") {
        if (nuevoEstado[id].kiActual == null && msg.kiActual != null) {
            nuevoEstado[id].kiActual = msg.kiActual;
        }

        if (nuevoEstado[id].kiTotal == null && msg.ki != null) {
  nuevoEstado[id].kiTotal = msg.ki;
}
    }


        if (msg.tipo === "ken") {
        if (nuevoEstado[id].kenActual == null && msg.kenActual != null) {
            nuevoEstado[id].kenActual = msg.kenActual;
        }

       if (nuevoEstado[id].kenTotal == null && msg.ken != null) {
  nuevoEstado[id].kenTotal = msg.ken;
}
    }
  }

  setEstadoTiempoReal(nuevoEstado);

}, [historialChat, personajesAgregados]);




const pulso = useRef(new Animated.Value(0)).current;

useEffect(() => {
  const loop = Animated.loop(
    Animated.sequence([
      Animated.timing(pulso, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }),
      Animated.timing(pulso, {
        toValue: 0,
        duration: 600,
        useNativeDriver: false,
      }),
    ])
  );

  loop.start();

  return () => loop.stop();
}, []);


const sonidoSeleccionRef = useRef(null);

  useEffect(() => {
    const cargarSonido = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/enviarKen.mp3')
      );
      sonidoSeleccionRef.current = sound;
    };
  
    cargarSonido();
  
    return () => {
      sonidoSeleccionRef.current?.unloadAsync();
    };
  }, []);
  
  
   const reproducirSonidoSeleccion = async () => {
    try {
      await sonidoSeleccionRef.current?.replayAsync();
    } catch (error) {
      console.log("Error reproduciendo sonido:", error);
    }
  };


useEffect(() => {
  if (!modalVisible) return;

  const pedirHistorialKen = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pedirHistorialKen`, {
        params: { idpersonaje: pj.idpersonaje }
      });

      const { historialKen } = response.data;

      //console.log("HISTORIAL: ",historialKen)

      if (Array.isArray(historialKen)) {
        setHistorialKen(historialKen);
      }
    } catch (error) {
      console.error('Error al consumir historial de ken del personaje:', error.message);
    }
  };

  pedirHistorialKen();
}, [modalVisible]);


  // SUBIR PUNTOS
  const subirPunto = (id) => {
    setKenPuntos({ ...kenPuntos, [id]: (kenPuntos[id] || 0) + 1 });
  };

  // BAJAR PUNTOS
  const bajarPunto = (id) => {
    setKenPuntos({ ...kenPuntos, [id]: Math.max((kenPuntos[id] || 0) - 1, 0) });
  };

  // ENVIAR PUNTOS DE KEN
  const enviarKen = (personaje) => {
    const valor = kenPuntos[personaje.idpersonaje] || 0;
    if (valor <= 0) return;


    
    
    const mensaje = {
      usuarioId: pj.usuarioId,
      idpersonaje: pj.idpersonaje,
      nombre: pj.nombre,
      mensaje: `⭐ ${personaje.nombre} ⭐ recibio +${valor} puntos de Ken  de ${pj.nombre}`,
     
      estatus,
      imagenPjUrl: pj.imagenurl || "",
      nick: nick || "",
      tipo: "entregaKen",
      idpersonajeReceptor: personaje.idpersonaje,
      idusuarioReceptor: personaje.usuarioId,
      nombreReceptor: personaje.nombre,
      puntajeKen: valor,

    };

    socket.emit('chat-chat', mensaje);
    Vibration.vibrate([0, 40, 40, 40]);
    setKenPuntos({ ...kenPuntos, [personaje.idpersonaje]: 0 });
  };


  const agruparSesionesKen = (historial) => {
  if (!historial || historial.length === 0) return [];

  const ordenados = [...historial].sort(
    (a, b) => Number(a.timestamp) - Number(b.timestamp)
  );

  const sesiones = [];
  let sesionActual = [];
  let ultimoTiempo = null;

  ordenados.forEach((item) => {
    const tiempo = Number(item.timestamp);

    if (!ultimoTiempo) {
      sesionActual.push(item);
    } else {
      const diferencia = tiempo - ultimoTiempo;

      if (diferencia <= 3600000) {
        sesionActual.push(item);
      } else {
        sesiones.push(sesionActual);
        sesionActual = [item];
      }
    }

    ultimoTiempo = tiempo;
  });

  if (sesionActual.length) sesiones.push(sesionActual);

  return sesiones;
};

  // FILTRAR PERSONAJES
  const personajesFiltrados = coleccionPersonajes.filter(p =>
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) &&
    p.idpersonaje !== pj.idpersonaje
  );

  const sesionesKen = agruparSesionesKen(historialKen);



  const calcularVidaTotal = (pj) => { 
    const ki = Number(pj.ki) || 0; const fortaleza = Number(pj.fortaleza) || 0; const positiva = Number(pj.positiva) || 0; const negativa = Number(pj.negativa) || 0; const faseSalud = ki >= 10 ? ki + fortaleza : fortaleza; 
    return faseSalud * (positiva + negativa); 
};



const calcularEstadoFase = (pj, vidaActual) => {
  const vida = Number(vidaActual) || 0;
  const ki = Number(pj.ki) || 0;
  const fortaleza = Number(pj.fortaleza) || 0;
  const positiva = Number(pj.positiva) || 0;
  const negativa = Number(pj.negativa) || 0;

  const faseSalud = ki >= 10 ? ki + fortaleza : fortaleza;

  const vidaTotalPositiva = faseSalud * positiva;
  const vidaTotal = faseSalud * (positiva + negativa);

  if (vida === 0) return "SIN HERIDAS";
  if (vida > vidaTotal) return "MUERTO";

  if (vida <= vidaTotalPositiva) {
    if (vida >= vidaTotalPositiva - faseSalud) return "MALHERIDO";
    if (vida >= vidaTotalPositiva - faseSalud * 2) return "MALTRECHO";
    return "RAZGADO";
  }

  const exceso = vida - vidaTotalPositiva;

  if (exceso <= faseSalud) {
    if (negativa === 1) return "MORIBUNDO";
    if (negativa === 2) return "INCAPACITADO";
    if (negativa >= 3) return "INCONCIENTE";
  }

  if (exceso <= faseSalud * 2) {
    if (negativa <= 2) return "MORIBUNDO";
    return "INCAPACITADO";
  }

  if (exceso <= faseSalud * 3) {
    if (negativa >= 3) return "MORIBUNDO";
  }

  return "MUERTO";
};



  return (
    <ImageBackground source={{ uri: fondoUrl }} style={{ flex: 1, backgroundColor:"black" }} resizeMode='cover'>
      <View style={styles.overlay}>

        {/* BUSCADOR */}
        <TextInput
          style={styles.buscador}
          placeholder="Buscar personaje..."
          placeholderTextColor="#aaa"
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {/* BOTÓN PARA ABRIR MODAL HISTORIAL */}
<TouchableOpacity
  style={styles.botonHistorial}
  onPress={() => setModalVisible(true)}
>
  
  <Text style={{ color: "black", fontWeight: "bold" }}>Historial de Ken</Text>
</TouchableOpacity>



<Modal
  animationType="slide"
  transparent={true}
  visible={modalVisible}
  onRequestClose={() => setModalVisible(false)}
>
  
  <View style={styles.modalFondo}>
    <View style={styles.modalContainer}>
      {/* Botón X */}
      <TouchableOpacity
        style={styles.modalCerrarX}
        onPress={() => setModalVisible(false)}
      >
        <Text style={{ color: "white", fontSize: 22, fontWeight: "bold" }}>×</Text>
      </TouchableOpacity>

      {/* Título */}
      <Text style={styles.modalTitulo}>Historial de Ken</Text>

      {/* FlatList scrollable */}
     <FlatList
  data={sesionesKen}
  //keyExtractor={(item, index) => index.toString()}
  keyExtractor={(item, index) => String(item?.idpersonaje ?? index)}
 renderItem={({ item }) => {

  const fechaSesion = new Date(Number(item[0].timestamp));
  const fechaFormateada = fechaSesion.toLocaleDateString();

    const totalKenSesion = item.reduce((acc, reg) => {
    return acc + Number(reg.puntajeKen || 0);
  }, 0);


const Contenedor = esLeyenda ? ImageBackground : View;


  return (
     <ImageBackground source={{ uri: fondoUrlRegistroKen }} style={{ flex: 1, backgroundColor:"black" }} resizeMode='cover'>
     <View style={styles.bloqueSesion}>
<View style={styles.headerSesion}>
  <Text style={styles.tituloSesion}>
    Sesión {fechaFormateada}
  </Text>

  <Text style={styles.puntajeKenSesion}>
    ✨ +{totalKenSesion} Ken
  </Text>
</View>

      {item.map((registro, i) => {

        const fecha = new Date(Number(registro.timestamp));
        const horaFormateada = fecha.toLocaleTimeString();

        return (
          <View key={i} style={styles.itemHistorial}>
            <Text style={styles.mensajeTexto}>
              {registro.mensaje || "Registro de Ken"}
             
              

            </Text>

            <Text style={styles.fechaTexto}>
              {horaFormateada}
            </Text>
          </View>
        );
      })}

    </View>
  </ImageBackground>
    
  );
}}
  ListEmptyComponent={
    <Text style={{ color: "white", textAlign: "center", marginTop: 20 }}>
      No hay registros
    </Text>
  }
  contentContainerStyle={{ paddingBottom: 20 }}
  style={{ width: "100%", maxHeight: "90%" }}
/>
    </View>
  </View>
</Modal>

        {/* RESULTADOS BUSQUEDA */}
        {busqueda.length > 0 && (
          <FlatList
            data={personajesFiltrados}
            //keyExtractor={(item) => item.idpersonaje.toString()}
            keyExtractor={(item, index) => String(item?.idpersonaje ?? index)}
            style={styles.resultados}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const yaAgregado = personajesAgregados.some(p => p.idpersonaje === item.idpersonaje);
              return (
                <TouchableOpacity
                  style={[styles.card, yaAgregado && { opacity: 0.5 }]}
                  onPress={() => agregarPersonaje(item)}
                  disabled={yaAgregado}
                >
                  <Image
                    source={item.imagenurl ? { uri: item.imagenurl } : imagenBase}
                    style={styles.avatar}
                  />
                  <Text style={styles.nombre}>{item.nombre}</Text>
                </TouchableOpacity>
              );
            }}
          />
        )}

        {/* PERSONAJES SELECCIONADOS */}
        <Text style={styles.tituloSeleccionados}>Favoritos</Text>

        <FlatList
          data={personajesAgregados}
         // keyExtractor={(item) => item.idpersonaje.toString()}
         keyExtractor={(item, index) => String(item?.idpersonaje ?? index)}
          style={styles.listaSeleccionados}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {


            const estado = estadoTiempoReal[String(item.idpersonaje)] || {};

            const vidaActual = estado.vidaActual ?? item.vidaActual ?? 0;
            const vidaTotal = estado.vidaTotal ?? calcularVidaTotal(item) ?? 1;


            
            const kiActual = estado.kiActual ?? item.kiActual ?? 0;
            const kiTotal = estado.kiTotal ?? item.ki ?? 1;
          

            const kenActual = estado.kenActual ?? item.kenActual ?? 0;
            const kenTotal = estado.kenTotal ?? item.ken ?? 1;
            
            const estadoFase = calcularEstadoFase(item, vidaActual);

            //si es una estrella del destino
           const esLeyenda = Number(item.ken) >= 400;



           return(          
           <ImageBackground
  source={
    esLeyenda
      ? { uri: fondoUrlLeyenda }
      : { uri: fondoUrlNormal } // o una imagen negra
  }
  style={[
  styles.cardSeleccionado,
  esLeyenda && styles.cardSeleccionadoLeyenda
]}
  imageStyle={{ borderRadius: 10 }}
>

              {/* Botón Quitar X */}
              <TouchableOpacity
                style={styles.botonEliminarX}
                onPress={() => eliminarPersonaje(item.idpersonaje)}
              >
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>×</Text>
              </TouchableOpacity>

             {/* Fila de imagen + nombre */}
            <View style={styles.row}>

                                <View style={styles.colImagen}>
                                    <Image
                                    source={item.imagenurl ? { uri: item.imagenurl } : imagenBase}
                                    style={styles.avatarLista}
                                    />
                                    <Text style={styles.dominio}>
                                    {item.dominio || "Dominio desconocido"}
                                    </Text>

                                    
                                    <Estrellitas ken={parseInt(item.ken) || 0} />
                                </View>

                                <View style={styles.infoPersonaje}>
                                    <Text style={styles.nombre} numberOfLines={1}>
                                    {item.nombre}
                                    </Text>

                                    

                                  <Text style={styles.textVida}> 
                                    vida: {vidaActual}/{vidaTotal || "??"}     {estadoFase}
                                    </Text> 
                                    

                
                                    <BarraVida 
                                    actual={vidaActual} 
                                    total={vidaTotal} 
                                    color="red"
                                    estadoFase={estadoFase}
                                    pulso={pulso} /> 
                                    
                                    <Text style={styles.textKi}> ki: {kiActual}/{kiTotal || "??"} </Text> 
                                    <Barra actual={kiActual} total={kiTotal} color="blue" /> 
                                    <Text style={styles.textKen}> ken: {kenActual}/{kenTotal || "??"} </Text> 
                                    
                                    <Barra actual={kenActual} total={kenTotal} color="green" />

                                    <Text style={styles.conviccion}>
                                    {item.conviccion || "Conviccion desconocida"}
                                    </Text>
                                
                                </View>

            </View>

              {/* Contador con botones subir/bajar y Enviar */}
              <View style={styles.rowInput}>
                <View style={styles.contadorContainer}>
                  <TouchableOpacity style={styles.botonSubirBajar} onPress={() => bajarPunto(item.idpersonaje)}>
                    <Text style={styles.botonSubirBajarText}>-</Text>
                  </TouchableOpacity>

                  <Text style={styles.contadorPuntos}>{kenPuntos[item.idpersonaje] || 0}</Text>

                  <TouchableOpacity style={styles.botonSubirBajar} onPress={() => subirPunto(item.idpersonaje)}>
                    <Text style={styles.botonSubirBajarText}>+</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.botonEnviarKen} onPress={() => {
                     reproducirSonidoSeleccion();
                    enviarKen(item)}}>
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Enviar</Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
            );
          }}
        />
      </View>
    </ImageBackground>
  );
};




const Barra = ({ actual, total, color }) => { 
    const porcentaje = parseInt(total) ? (actual / parseInt(total)) * 100 : 0; 
    
    return ( 
    <View style={{ width: "100%", height: 10, backgroundColor: "#f3dc0eef", borderRadius: 5, overflow: "hidden" }}> 
    
    <View style={{ width: `${porcentaje}%`, height: "100%", backgroundColor: color }} /> 

    </View> 
    
); 
    };



const BarraVida = ({ actual, total, color, estadoFase, pulso }) => {
  const porcentaje = parseInt(total) ? (actual / parseInt(total)) * 100 : 0;

  let intensidadMin = 0;
  let intensidadMax = 0;

  switch (estadoFase) {
    case "RAZGADO":
      intensidadMin = 0.05;
      intensidadMax = 0.25;
      color="red";
      break;
    case "MALTRECHO":
      intensidadMin = 0.08;
      intensidadMax = 0.33;
      color="red";
      break;
    case "MALHERIDO":
      intensidadMin = 0.08;
      intensidadMax = 0.42;
      color="red";
      break;
    case "INCONCIENTE":
      intensidadMin = 0.1;
      intensidadMax = 0.58;
        color = "#57007ada";
      break;
    case "INCAPACITADO":
      intensidadMin = 0.12;
      intensidadMax = 0.65;
       color = "#57007ada";
      break;
    case "MORIBUNDO":
      intensidadMin = 0.15;
      intensidadMax = 0.8;
       color = "#57007a7a";
      break;
    default:
      intensidadMin = 0;
      intensidadMax = 0;
  }

  const muerto = estadoFase === "MUERTO";

  const colorBarra = muerto ? "#131212d7" : color;
  const mostrarPulso = estadoFase !== "SIN HERIDAS" && !muerto;

  return (
    <View style={{ width: "100%", height: 10, borderRadius: 5, overflow: "hidden" }}>
      
      <View style={{ position: "absolute", width: "100%", height: "100%", backgroundColor: "#f3dc0eef" }} />

      <View style={{ width: `${porcentaje}%`, height: "100%", backgroundColor: colorBarra }} />

      {mostrarPulso && (
        <Animated.View
          pointerEvents="none"
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: pulso.interpolate({
              inputRange: [0, 1],
              outputRange: [
                `rgba(255,0,0,${intensidadMin})`,
                `rgba(255,0,0,${intensidadMax})`,
              ],
            }),
          }}
        />
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, padding: 12, backgroundColor: "rgba(54, 52, 52, 0.18)" },
  buscador: { backgroundColor: "#1a1a1ae1", color: "white", padding: 12, borderRadius: 10, marginBottom: 10, marginTop: 40 },
  resultados: { maxHeight: 180, marginBottom: 20 },
  tituloSeleccionados: { color: "gold", fontSize: 18, marginBottom: 10, fontWeight: "bold" },
  listaSeleccionados: { flex: 1, marginBottom: 60 },
  card: { flexDirection: "row", alignItems: "center", padding: 10, backgroundColor: "rgba(8, 8, 8, 0.84)", borderRadius: 10, marginBottom: 8 },
  cardSeleccionado: { 
    flexDirection: "column", 
    padding: 12, 
      borderWidth: 1,
  borderColor: "#fcfcfc75", // oro más limpio
    backgroundColor: "rgba(0, 0, 0, 0.87)", 
    borderRadius: 10, 
    marginBottom: 10, position: "relative" },

 cardSeleccionadoLeyenda: {
  flexDirection: "column",
  padding: 14,
  borderWidth: 2,
  borderColor: "#f7f0f0fd", // oro más limpio
  backgroundColor: "rgba(10, 10, 10, 0.87)",
  borderRadius: 10,
  marginBottom: 12,
  position: "relative",

  // sombra (Android + iOS)
  elevation: 10,
  shadowColor: "#fdfdf9",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.6,
  shadowRadius: 10,
},

  avatar: { width: 55, height: 55, borderRadius: 30, marginRight: 4, borderWidth: 2, borderColor: "#000" },
  avatarLista: { width: 100, height: 100, borderRadius: 10,marginLeft:4, marginRight: 12, borderWidth: 2, borderColor: "#000" },
  
 nombre: {
  color: "#FFD700",
  fontSize: 16,
  fontWeight: "bold",
  flexShrink: 1,
  paddingRight: 35
},
 dominio: {
  color: "#f1e9eddc",
  fontSize: 12,
  fontWeight: "bold",

},
 conviccion: {
  color: "#e7b018dc",
  fontSize: 12,
  fontWeight: "bold",
  width: "100%",
  marginTop: 12,
},

  rowInput: { flexDirection: "row", alignItems: "center", marginTop: 0 },
  contadorContainer: { flexDirection: "row", alignItems: "center" },
  botonSubirBajar: { backgroundColor: "#060706e1", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 6,borderWidth:1,borderColor:"#cdd1cd7a"},
  botonSubirBajarText: { color: "white", fontSize: 18, fontWeight: "bold" },
  contadorPuntos: { color: "yellow", fontSize: 20, fontWeight: "bold", marginHorizontal: 10 },
  botonEnviarKen: {backgroundColor: "#007AFF", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginLeft: 'auto' },
  botonEliminarX: { position: 'absolute', top: 6, right: 6, zIndex: 10, backgroundColor: "#f82222ea", width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  
  botonHistorial: { backgroundColor: "#FFD700", padding: 10, borderRadius: 6, marginBottom: 10, alignSelf: 'flex-start' },
  modalFondo: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", padding: 20 },
  modalContainer: { backgroundColor: "#1a1a1a", borderRadius: 10, padding: 5, maxHeight: "100%" },
  modalTitulo: { color: "gold", fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  botonCerrarModal: { backgroundColor: "#007AFF", marginTop: 10, padding: 10, borderRadius: 6 },

modalFondo: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.7)",
  justifyContent: "center",
  alignItems: "center",
  padding: 15,
},
modalContainer: {
  backgroundColor: "#1a1a1a",
  borderRadius: 15,
  padding: 20,
  width: "100%",
  maxHeight: "100%",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.5,
  shadowRadius: 10,
  elevation: 10,
},
modalTitulo: {
  color: "gold",
  fontSize: 22,
  fontWeight: "bold",
  marginBottom: 15,
  textAlign: "center",
},
modalCerrarX: {
  position: "absolute",
  top: 10,
  right: 10,
  zIndex: 20,
  backgroundColor: "red",
  width: 30,
  height: 30,
  borderRadius: 15,
  justifyContent: "center",
  alignItems: "center",
},
itemHistorial: {
  paddingVertical: 10,
  borderBottomWidth: 0.5,
  borderBottomColor: "#444",
},
mensajeTexto: {
  color: "white",
  fontSize: 16,
},
fechaTexto: {
  color: "#ccc",
  fontSize: 12,
  marginTop: 2,
  textAlign: "right",
},
bloqueSesion: {
  borderWidth: 2,
  borderColor: "gold",
  borderRadius: 12,
  padding: 10,
  marginBottom: 10,
  backgroundColor: "rgba(255,255,255,0.03)",
},
tituloSesion: {
  color: "gold",
  fontWeight: "bold",
  fontSize: 14,
  marginBottom: 6,
},
headerSesion: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
},

puntajeKenSesion: {
  color: "yellow",
  fontWeight: "bold",
  fontSize: 16,
  backgroundColor: "rgba(0,255,200,0.08)",
  paddingVertical: 3,
  paddingHorizontal: 10,
  borderRadius: 8,
},


infoPersonaje: {
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "flex-start",
  flex: 1,
  paddingRight: 10,
   paddingLeft: 10
},


row: {
  flexDirection: "row",
  alignItems: "flex-start",
  marginBottom: 10,
  marginTop:0,
  
},

colImagen: {
  flexDirection: "column",
  alignItems: "center",
  marginRight: 2,
  width: 90
},


textVida: { color: "#f7261fdc", fontSize: 13, fontWeight: "bold", width: "100%", }, textKi: { color: "#1762d1dc", fontSize: 13, fontWeight: "bold", width: "100%", }, textKen: { color: "#0bf00bec", fontSize: 13, fontWeight: "bold", width: "100%", },
});