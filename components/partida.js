import React, { useContext, useState, useEffect,useRef } from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, TouchableOpacity, FlatList, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthContext';
import socket from './socket';
import { Vibration } from 'react-native';

import { Audio } from 'expo-av' 

export const Partida = ({ pj }) => {
  const { coleccionPersonajes, estatus, nick } = useContext(AuthContext);

  const [busqueda, setBusqueda] = useState('');
  const [personajesAgregados, setPersonajesAgregados] = useState([]);
  const [kenPuntos, setKenPuntos] = useState({}); // Guardar puntos por personaje

  const imagenBase = require('../assets/imagenBase.jpeg');

  const fondoUrl =
    "https://res.cloudinary.com/dzul1hatw/image/upload/v1773419661/700ef2bb7f79b95bcd3a084cb2095559_cn3ywp.avif"
  // Cargar personajes guardados al montar el componente
  useEffect(() => {
    const cargarPersonajes = async () => {
      try {
        const data = await AsyncStorage.getItem(`personajesSeleccionados_${pj.idpersonaje}`);
        if (data) {
          const parsed = JSON.parse(data);
          setPersonajesAgregados(parsed);

          // Inicializar kenPuntos si es necesario
          const inicialKen = {};
          parsed.forEach(p => inicialKen[p.idpersonaje] = 0);
          setKenPuntos(inicialKen);
        }
      } catch (err) {
        console.log("Error cargando personajes:", err);
      }
    };
    cargarPersonajes();
  }, [pj.idpersonaje]);

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


  // Guardar personajes seleccionados en AsyncStorage
  const guardarPersonajes = async (lista) => {
    try {
      await AsyncStorage.setItem(`personajesSeleccionados_${pj.idpersonaje}`, JSON.stringify(lista));
    } catch (err) {
      console.log("Error guardando personajes:", err);
    }
  };

  // AGREGAR PERSONAJE
  const agregarPersonaje = (personaje) => {
    const existe = personajesAgregados.some(p => p.idpersonaje === personaje.idpersonaje);
    if (!existe) {
      const nuevaLista = [...personajesAgregados, personaje];
      setPersonajesAgregados(nuevaLista);
      guardarPersonajes(nuevaLista);

      setBusqueda('');
      setKenPuntos({ ...kenPuntos, [personaje.idpersonaje]: 0 });
    }
  };

  // ELIMINAR PERSONAJE
  const eliminarPersonaje = (id) => {
    const nuevaLista = personajesAgregados.filter(p => p.idpersonaje !== id);
    setPersonajesAgregados(nuevaLista);
    guardarPersonajes(nuevaLista);

    const nuevosKen = { ...kenPuntos };
    delete nuevosKen[id];
    setKenPuntos(nuevosKen);
  };

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
      idpersonajeReceptor: personaje.idpersonaje,
      idUsuarioReceptor: personaje.usuarioId,
      nombreReceptor: personaje.nombre,
      mensaje: `⭐ ${personaje.nombre} ⭐ recibio +${valor} puntos de Ken  de ${pj.nombre}`,
      ken: valor,
      estatus,
      imagenPjUrl: pj.imagenurl || "",
      nick: nick || "",
      tipo: "entregaKen",
    };

    socket.emit('chat-chat', mensaje);
    Vibration.vibrate([0, 40, 40, 40]);
    setKenPuntos({ ...kenPuntos, [personaje.idpersonaje]: 0 });
  };

  // FILTRAR PERSONAJES
  const personajesFiltrados = coleccionPersonajes.filter(p =>
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) &&
    p.idpersonaje !== pj.idpersonaje
  );

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

        {/* RESULTADOS BUSQUEDA */}
        {busqueda.length > 0 && (
          <FlatList
            data={personajesFiltrados}
            keyExtractor={(item) => item.idpersonaje.toString()}
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
          keyExtractor={(item) => item.idpersonaje.toString()}
          style={styles.listaSeleccionados}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <View style={styles.cardSeleccionado}>

              {/* Botón Quitar X */}
              <TouchableOpacity
                style={styles.botonEliminarX}
                onPress={() => eliminarPersonaje(item.idpersonaje)}
              >
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>×</Text>
              </TouchableOpacity>

              {/* Fila de imagen + nombre */}
              <View style={styles.row}>
                <Image
                  source={item.imagenurl ? { uri: item.imagenurl } : imagenBase}
                  style={styles.avatarLista}
                />
                <Text style={styles.nombre}>{item.nombre}</Text>
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
            </View>
          )}
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, padding: 12, backgroundColor: "rgba(54, 52, 52, 0.18)" },
  buscador: { backgroundColor: "#1a1a1a", color: "white", padding: 12, borderRadius: 10, marginBottom: 10, marginTop: 40 },
  resultados: { maxHeight: 180, marginBottom: 20 },
  tituloSeleccionados: { color: "gold", fontSize: 18, marginBottom: 10, fontWeight: "bold" },
  listaSeleccionados: { flex: 1, marginBottom: 60 },
  card: { flexDirection: "row", alignItems: "center", padding: 10, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 10, marginBottom: 8 },
  cardSeleccionado: { flexDirection: "column", padding: 12, backgroundColor: "rgba(0,0,0,0.45)", borderRadius: 10, marginBottom: 10, position: "relative" },
  avatar: { width: 55, height: 55, borderRadius: 30, marginRight: 12, borderWidth: 2, borderColor: "#000" },
  avatarLista: { width: 80, height: 80, borderRadius: 10, marginRight: 12, borderWidth: 2, borderColor: "#000" },
  nombre: { flex: 1, color: "#FFD700", fontSize: 16, fontWeight: "bold" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  rowInput: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  contadorContainer: { flexDirection: "row", alignItems: "center" },
  botonSubirBajar: { backgroundColor: "#1a1a1a", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  botonSubirBajarText: { color: "white", fontSize: 18, fontWeight: "bold" },
  contadorPuntos: { color: "yellow", fontSize: 20, fontWeight: "bold", marginHorizontal: 10 },
  botonEnviarKen: {backgroundColor: "#007AFF", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginLeft: 'auto' },
  botonEliminarX: { position: 'absolute', top: 6, right: 6, zIndex: 10, backgroundColor: 'red', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
});