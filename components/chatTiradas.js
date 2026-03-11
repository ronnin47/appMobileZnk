import React, { useEffect, useRef, useContext } from 'react';
import { View, ScrollView, Text, StyleSheet, Image,ImageBackground } from 'react-native';
import { AuthContext } from './AuthContext';
import * as Animatable from 'react-native-animatable';

//sonido al llegar
import { Audio } from 'expo-av';
import { Vibration } from 'react-native';
const fondoUrl="https://res.cloudinary.com/dzul1hatw/image/upload/v1763045771/955fcaca7b9e79d2146af67dd0498136_grsvyx.jpg";
 

export const ChatTiradas = ({ p }) => {
  const scrollViewRef = useRef();
  const { historialChat, setHistorialChat } = useContext(AuthContext);
  const imagenBase = require('../assets/imagenBase.jpeg');
  const ultimoMensajeProcesado = useRef(null);

  


  useEffect(() => {
  if (historialChat.length > 0) {
    const ultimo = historialChat[historialChat.length - 1];
    ultimoMensajeProcesado.current = ultimo.id;
  }
}, []);

const reproducirSonidoIncremento = async () => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require("../assets/incremento.mp3")
    );

    await sound.playAsync();

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
      }
    });

  } catch (error) {
    console.log("Error reproduciendo sonido:", error);
  }
};

const timestampEntradaChat = useRef(Date.now());
  const optimizarAvatarUrl = (url) => {
    if (!url) return null;
    if (url.includes('/upload/')) {
      return url.replace('/upload/', '/upload/w_64,h_64,c_fill/');
    }
    return url;
  };


    useEffect(() => {
  if (!historialChat.length) return;

  const ultimo = historialChat[historialChat.length - 1];

  // evitar repetir sonido
  if (ultimoMensajeProcesado.current === ultimo.id) return;

  ultimoMensajeProcesado.current = ultimo.id;

  
  if (ultimo.tipo === "incrementos" && ultimo.idpersonaje == p.idpersonaje) {
  reproducirSonidoIncremento();

    setTimeout(() => {
    Vibration.vibrate([80, 50, 80, 50, 150, 50, 300]);
  }, 300);
}

}, [historialChat]);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [historialChat]);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, []);

// para tirada bounce 'rubberBand'
//normalcito 'fadeIn'

  const animacionPorTipo = {
  'tirada': 'bounce',
  'incrementos': 'zoomIn',
  'vida': 'rubberBand',
  'ki': 'zoomIn',
  'ken': 'zoomIn',
  'imagen': 'zoomIn',
  'chat': 'fadeIn',
};


  return (
    <View style={styles.panelHistorial}>
      <ScrollView ref={scrollViewRef} style={styles.scrollHistorial}>
        {historialChat.length === 0 ? (
          <></>
        ) : (
          historialChat.map((msg, idx) => {
            const esPropio = msg.idpersonaje == p.idpersonaje;
            const esIncremento = msg.tipo === "incrementos";
            const esIncrementoPropio = esIncremento && esPropio;

            const esImagen =
              typeof msg.mensaje === 'string' &&
              (msg.mensaje.startsWith('http://') || msg.mensaje.startsWith('https://')) &&
              (msg.mensaje.endsWith('.jpg') ||
                msg.mensaje.endsWith('.jpeg') ||
                msg.mensaje.endsWith('.png') ||
                msg.mensaje.includes('cloudinary'));

            const avatarUrlOptimizada = optimizarAvatarUrl(
              msg.imagenPjUrl ? msg.imagenPjUrl : msg.imagenurl
            );

            // Si el anterior es diferente o no existe, mostrar avatar
            const anterior = historialChat[idx - 1];
            const mostrarAvatar = !anterior || anterior.idpersonaje !== msg.idpersonaje;

          const esReciente = Number(msg.timestamp) > timestampEntradaChat.current;
          const animacion = esReciente ? animacionPorTipo[msg.tipo] || 'fadeIn' : undefined;

return (
 <Animatable.View
  animation={animacion}
  duration={1200}
  easing="ease-out"
  key={`comp2-${Number(msg.id) || idx.toString()}`}
  style={{
    marginBottom: esIncrementoPropio ? 12 : 6,
    backgroundColor: esIncrementoPropio ? "transparent" : (esPropio ? "#222" : "black"),
    padding: esIncrementoPropio ? 10 : 4,
    borderRadius: esIncrementoPropio ? 14 : 10,
    borderWidth: esIncrementoPropio ? 2.5 : (esPropio ? 0.5 : 0.1),
    borderColor: esIncrementoPropio ? "#fdfdfc" : "cyan",
    shadowColor: esIncrementoPropio ? "#f5f4f2" : (esPropio ? "white" : "#000"),
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: esIncrementoPropio ? 1 : (esPropio ? 0.9 : 0.2),
    shadowRadius: esIncrementoPropio ? 40 : (esPropio ? 18 : 4),
    elevation: esIncrementoPropio ? 40 : (esPropio ? 18 : 4),
    overflow: "hidden"
  }}
>
  {esIncrementoPropio && (
  <ImageBackground
    source={{ uri: fondoUrl }}
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }}
    imageStyle={{
      opacity: 0.7,
      resizeMode: "cover",
      borderRadius: 14
    }}
  />
)}
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      {mostrarAvatar ? (
        <Image
          source={
            avatarUrlOptimizada
              ? { uri: avatarUrlOptimizada }
              : imagenBase
          }
          style={{ width: 32, height: 32, borderRadius: 15 }}
        />
      ) : (
        <View style={{ width: 0, height: 0 }} />
      )}
      <Text
        style={[
          styles.textoHistorial,
          esPropio && styles.mensajePropio,
        ]}
      >
        {msg.nombre}:
      </Text>
      <Text style={{ color: '#888', fontSize: 10, flex: 1, textAlign: 'right' }}>
        {msg.timestamp
          ? new Date(Number(msg.timestamp)).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : ''}
      </Text>
    </View>

    {esImagen ? (
      <Image
        source={{ uri: msg.mensaje }}
        style={[
          styles.imagenChat,
          esPropio && { alignSelf: 'flex-end' },
        ]}
        resizeMode="cover"
      />
    ) : (
     <Text
  style={[
    styles.textoHistorial,
    esIncrementoPropio
      ? styles.mensajePropioIncremento
      : esPropio && styles.mensajePropio,
    { marginLeft: mostrarAvatar ? 15 : 15 },
  ]}
>
  {msg.mensaje}
</Text>
    )}
  </Animatable.View>
);

          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  panelHistorial: {
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    backgroundColor: "black",
    paddingHorizontal: 10,
    paddingVertical: 3,
    zIndex: 10,
    borderBottomWidth: 2,
    borderBottomColor: "cyan",
  },
  scrollHistorial: {
    flex: 1,
  },
  textoHistorial: {
    color: "#f2f2f2c4",
    fontSize: 14,
    marginBottom: 1,
  },
  textoHistorialVacio: {
    color: "#ADFF2F",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 20,
  },
  mensajePropio: {
    color: "yellow",
  },
   mensajePropioIncremento: {
    color: "aliceblue",
    fontSize:16
  },
  imagenChat: {
    width: 180,
    height: 120,
    borderRadius: 8,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
});
