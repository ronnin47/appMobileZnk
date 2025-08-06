import React, { useState, useContext, useRef,useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import axios from 'axios';
import { API_BASE_URL } from './config';
import { AuthContext } from './AuthContext';

export const PageDerechaChat = () => {

  const [pjHistorial, setPjHistorial] = useState([]);
  const [nombrePjHistorial, setNombrePjHistorial] = useState('');
  const [imagenAmpliada, setImagenAmpliada] = useState(null);

  const { userToken } = useContext(AuthContext);
  const usuarioId = userToken ? userToken.split('-')[1] : null;

  const imagenBase = require('../assets/imagenBase.jpeg');
  const flatListRef = useRef(null);


const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  useEffect(() => {
  if (nombrePjHistorial.trim() === '') {
    setBusquedaRealizada(false);
  }
}, [nombrePjHistorial]);

  const animacionPorTipo = {
    tirada: 'bounce',
    vida: 'rubberBand',
    ki: 'zoomIn',
    ken: 'zoomIn',
    imagen: 'zoomIn',
    chat: 'fadeIn',
  };



  const buscarHistorial = async () => {
    if (nombrePjHistorial === '') return;

    try {
      const response = await axios.get(`${API_BASE_URL}/buscarHistorialPj`, {
        params: { nombre: nombrePjHistorial },
      });
      const { historialPj } = response.data;
      if (!Array.isArray(historialPj)) {
        console.error('El formato de datos no es un array.');
        return;
      }
      setPjHistorial(historialPj);
      setBusquedaRealizada(true);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 300);
    } catch (error) {
      console.error('Fallo al consumir el historial del personaje', error.message);
    }
  };

  const optimizarAvatarUrl = (url) => {
    if (!url) return null;
    if (url.includes('/upload/')) {
      return url.replace('/upload/', '/upload/w_64,h_64,c_fill/');
    }
    return url;
  };

  return (
    <View style={styles.container}>
      {/* Búsqueda historial */}
      <View style={styles.wrapper}>
        <Text style={styles.titulo}>Buscar historial de personaje</Text>
        <View style={styles.barraBusqueda}>
          <TextInput
            style={styles.campoTexto}
            placeholder="Ingresa el nombre del personaje"
            value={nombrePjHistorial}
            onChangeText={setNombrePjHistorial}
            placeholderTextColor="#999"
          />
        <Pressable
        onPress={buscarHistorial}
        style={({ pressed }) => [
          styles.botonBuscar,
          pressed && { backgroundColor: '#088', transform: [{ scale: 0.96 }] },
        ]}
      >
        <Text style={styles.iconoBuscar}>🔍</Text>
      </Pressable>
        </View>
      </View>

      {/* Lista de mensajes */}
      <FlatList
        ref={flatListRef}
        data={pjHistorial}
        keyExtractor={(item, index) => `msg-${item.id || index}`}
        contentContainerStyle={{
          paddingBottom: 100,
          flexGrow: 1,
          justifyContent: pjHistorial.length === 0 ? 'center' : 'flex-start',
        }}
    ListEmptyComponent={() =>
  busquedaRealizada && nombrePjHistorial.trim() !== '' && pjHistorial.length === 0 ? (
    <Text style={{ color: 'aliceblue', textAlign: 'center', marginTop: 20, fontSize: 20 }}>
      No se encontraron resultados.
    </Text>
  ) : null
}
        renderItem={({ item, index }) => {
          const esPropio = item.usuarioId == usuarioId;
          const esNarrador = item.estatus === 'narrador';
          const anterior = pjHistorial[index - 1];
          const mismoRemitenteAnterior =
            anterior && anterior.usuarioId === item.usuarioId && anterior.nombre === item.nombre;
          const mostrarAvatar = !mismoRemitenteAnterior;

          const estilos = [styles.mensaje];
          if (esNarrador) estilos.push(styles.mensajeNarrador);
          else if (esPropio) estilos.push(styles.mensajePropio);
          estilos.push(esPropio ? styles.alinearDerecha : styles.alinearIzquierda);

          const esImagen =
            typeof item.mensaje === 'string' &&
            item.mensaje.startsWith('http') &&
            (item.mensaje.endsWith('.jpg') ||
              item.mensaje.endsWith('.jpeg') ||
              item.mensaje.endsWith('.png') ||
              item.mensaje.endsWith('.webp'));

          const avatarUrlOptimizada = optimizarAvatarUrl(
            item.imagenPjUrl ? item.imagenPjUrl : item.imagenurl
          );

          const esUltimo = index === pjHistorial.length - 1;
          const animacion = esUltimo ? animacionPorTipo[item.tipo] || 'fadeIn' : undefined;

          const fechaHoraFormateada = item.timestamp
            ? new Date(Number(item.timestamp)).toLocaleString([], {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
               
              })
            : '';

          return (
            <Animatable.View
              animation={animacion}
              duration={1000}
              easing="ease-out"
              style={[estilos, { paddingRight: 6, marginBottom: mostrarAvatar ? 6 : 2 }]}
            >
              {mostrarAvatar && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Image
                    source={avatarUrlOptimizada ? { uri: avatarUrlOptimizada } : imagenBase}
                    style={{ width: 32, height: 32, borderRadius: 15, marginRight: 8 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: 'aliceblue', fontSize: 12, fontWeight: 'bold' }}>
                      {item.nombre || item.nick}
                    </Text>
                    <Text style={{ color: '#888', fontSize: 10, marginTop: 2 }}>
                      {fechaHoraFormateada}
                    </Text>
                  </View>
                </View>
              )}

              {esImagen ? (
                <TouchableOpacity onPress={() => setImagenAmpliada(item.mensaje)}>
                  <Image
                    source={{ uri: item.mensaje }}
                    style={{
                      width: '100%',
                      aspectRatio: 1,
                      borderRadius: 8,
                      marginTop: 4,
                    }}
                  />
                  {!mostrarAvatar && (
                    <Text style={{ color: '#888', fontSize: 10, marginTop: 4, textAlign: 'right' }}>
                      {fechaHoraFormateada}
                    </Text>
                  )}
                </TouchableOpacity>
              ) : (
                <View
                  style={{
                    marginLeft: mostrarAvatar ? 40 : 6,
                    marginTop: 2,
                    paddingRight: 4,
                    flexShrink: 1,
                  }}
                >
                  <Text
                    style={[
                      estilos.includes(styles.mensajeNarrador)
                        ? { color: 'yellow' }
                        : estilos.includes(styles.mensajePropio)
                        ? { color: 'greenyellow' }
                        : { color: '#f2f2f2c4' },
                      {
                        marginBottom: 4,
                        fontSize: 14,
                        flexWrap: 'wrap',
                      },
                    ]}
                  >
                    {item.mensaje}
                  </Text>
                  {!mostrarAvatar && (
                    <Text style={{ color: '#888', fontSize: 10, textAlign: 'right' }}>
                      {fechaHoraFormateada}
                    </Text>
                  )}
                </View>
              )}
            </Animatable.View>
          );
        }}
      />





      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 10,
  },
  wrapper: {
    padding: 16,
    backgroundColor: '#111',
  },
  titulo: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  barraBusqueda: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    paddingHorizontal: 10,
  },
  campoTexto: {
    flex: 1,
    height: 40,
    color: '#fff',
  },
  botonBuscar: {
    backgroundColor: '#0af',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
    borderWidth:0.5,
    borderColor:"white"
  },
  iconoBuscar: {
    fontSize: 18,
    color: 'white',
  },
  mensaje: {
    padding: 8,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
  },
  mensajePropio: {
    backgroundColor: '#003300',
  },
  mensajeNarrador: {
    backgroundColor: '#0e5055a4',
  },
  alinearDerecha: {
    alignSelf: 'flex-end',
  },
  alinearIzquierda: {
    alignSelf: 'flex-start',
  },
});
