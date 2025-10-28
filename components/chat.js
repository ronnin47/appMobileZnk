import React, { useState, useContext, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Image, ImageBackground
} from 'react-native';
import socket from './socket';
import { AuthContext } from './AuthContext';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import * as Animatable from 'react-native-animatable';

export default function Chat({ tiradasGuardadas }) {
  
  const scrollViewRef = useRef();
  const [input, setInput] = useState('');
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenAmpliada, setImagenAmpliada] = useState(null);
  const { historialChat, setHistorialChat, userToken, personajeActual, estatus, imagenurl, nick } = useContext(AuthContext);
  const imagenBase = require('../assets/imagenBase.jpeg');
  const usuarioId = userToken ? userToken.split("-")[1] : null;

  const fondoUrl = "https://res.cloudinary.com/dzul1hatw/image/upload/v1761596480/300b0a177654b700a1719b9f8ee53331_lp1nb2.jpg";
  
  const animacionPorTipo = {
    'tirada': 'bounce',
    'vida': 'rubberBand',
    'ki': 'zoomIn',
    'ken': 'zoomIn',
    'imagen': 'zoomIn',
    'chat': 'fadeIn',
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [historialChat]);

  // 🧠 Escala animada
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // ⚡ Gesto pinch compatible con Expo Go
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = e.scale;
    })
    .onEnd(() => {
      scale.value = 1;
    });

  // 🔧 Avatar optimizado
  const optimizarAvatarUrl = (url) => {
    if (!url) return null;
    if (url.includes('/upload/')) {
      return url.replace('/upload/', '/upload/w_64,h_64,c_fill/');
    }
    return url;
  };

  const activarTirada = (mensaje) => {
    if (!mensaje.includes('#')) return mensaje;
    const partes = mensaje.split('#');
    const textoAntes = partes[0].trim();
    const resto = partes[1].trim();

    const matchClaveYExtras = /^([^\s+]+(?:\s+[^\s+]+)*)(.*)$/i.exec(resto);
    if (!matchClaveYExtras) return mensaje;

    const claveTirada = matchClaveYExtras[1].trim().toLowerCase();
    const extraFormula = (matchClaveYExtras[2] || '').replace(/\s+/g, '');
    const tiradaBase = tiradasGuardadas.find(t => t.nombre === claveTirada);
    const formulaBase = tiradaBase?.tirada?.replace(/\s+/g, '') || claveTirada;
    const formulaFinal = `${formulaBase}${extraFormula}`;
    const regex = /([+-]?)(\d+)(d(\d+))?/gi;

    let totalFinal = 0;
    let resultadoTexto = '';
    let match;
    let esPrimero = true;

    while ((match = regex.exec(formulaFinal)) !== null) {
      const signoStr = match[1] || '+';
      const signo = signoStr === '-' ? -1 : 1;
      const cantidad = parseInt(match[2], 10);
      const esDado = !!match[3];
      const caras = parseInt(match[4], 10);
      const prefix = esPrimero ? '' : signo === 1 ? '+ ' : '- ';

      if (esDado) {
        const tiradas = [];
        for (let i = 0; i < cantidad; i++) {
          const resultado = Math.floor(Math.random() * caras) + 1;
          tiradas.push(resultado);
        }
        const suma = tiradas.reduce((a, b) => a + b, 0) * signo;
        totalFinal += suma;
        resultadoTexto += `${prefix}${cantidad}d${caras} → [${tiradas.join(', ')}] `;
      } else {
        const modificador = cantidad * signo;
        totalFinal += modificador;
        resultadoTexto += `${prefix}${Math.abs(modificador)} `;
      }
      esPrimero = false;
    }

    return `🎲 ${textoAntes} "${claveTirada}" ${resultadoTexto.trim()}\nTotal final: ${totalFinal}`;
  };

  const enviar = async () => {
    if (imagenPreview) {
      try {
       const imagenBase64 = await FileSystem.readAsStringAsync(imagenPreview, {
        encoding: 'base64',
      });

        const mensajeImagen = {
          usuarioId: Number(usuarioId),
          idpersonaje: personajeActual?.idpersonaje || 0,
          nombre: nick || estatus,
          estatus,
          imagenBase64: `data:image/jpeg;base64,${imagenBase64}`,
          imagenurl: imagenurl || "",
          nick: nick || "",
          tipo: "imagen",
        };

        socket.emit('chat-chat', mensajeImagen);
        setImagenPreview(null);
        await new Promise(res => setTimeout(res, 100));
      } catch (error) {
        console.error('❌ Error al convertir imagen a base64:', error);
        return;
      }
    }

    if (input.trim()) {
      const mensaje = activarTirada(input);
      const esTirada = mensaje.includes("🎲");

      const msgEnviar = {
        usuarioId: Number(usuarioId),
        idpersonaje: personajeActual?.idpersonaje || 0,
        nombre: nick || estatus,
        mensaje,
        estatus,
        imagenurl: imagenurl || '',
        nick: nick || "",
        tipo: esTirada ? "tirada" : "chat",
      };

      socket.emit('chat-chat', msgEnviar);
      setInput('');
    }
  };

  const abrirGaleria = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: false,
    });

    if (!result.canceled && result.assets.length > 0) {
      const imagenUri = result.assets[0].uri;
      setImagenPreview(imagenUri);
    }
  };

  const renderMensajesMemo = useMemo(() => {
    return historialChat.map((item, index) => {
      const esPropio = item.usuarioId == usuarioId;
      const esNarrador = item.estatus === 'narrador';
      const anterior = historialChat[index - 1];
      const mismoRemitenteAnterior =
        anterior &&
        anterior.usuarioId === item.usuarioId &&
        anterior.nombre === item.nombre;
      const mostrarAvatar = !mismoRemitenteAnterior;
      const estilos = [styles.mensaje];

      if (esNarrador) estilos.push(styles.mensajeNarrador);
      else if (esPropio) estilos.push(styles.mensajePropio);
      estilos.push(esPropio ? styles.alinearDerecha : styles.alinearIzquierda);

      const esImagen = typeof item.mensaje === 'string' &&
        item.mensaje.startsWith('http') &&
        (item.mensaje.endsWith('.jpg') ||
          item.mensaje.endsWith('.jpeg') ||
          item.mensaje.endsWith('.png') ||
          item.mensaje.endsWith('.webp'));

      const avatarUrlOptimizada = optimizarAvatarUrl(
        item.imagenPjUrl ? item.imagenPjUrl : item.imagenurl
      );

      const esUltimo = index === historialChat.length - 1;
      const animacion = esUltimo ? animacionPorTipo[item.tipo] || 'fadeIn' : undefined;

      return (
        <Animatable.View
          animation={animacion}
          duration={1000}
          easing="ease-out"
          key={`comp1-${Number(item.id) || index.toString()}`}
          style={[estilos, { paddingRight: 6, marginBottom: mostrarAvatar ? 6 : 2 }]}
        >
          {mostrarAvatar && (
            <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: 200 }}>
              <Image
                source={avatarUrlOptimizada ? { uri: avatarUrlOptimizada } : imagenBase}
                style={{ width: 32, height: 32, borderRadius: 15, marginRight: 4 }}
              />
              <Text style={{ color: 'aliceblue', fontSize: 12 }}>
                {item.nombre || item.nick}
              </Text>
              <Text style={{ color: '#888', fontSize: 10, flex: 1, textAlign: 'right' }}>
                {item.timestamp
                  ? new Date(Number(item.timestamp)).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : ''}
              </Text>
            </View>
          )}

          {esImagen ? (
            <TouchableOpacity onPress={() => setImagenAmpliada(item.mensaje)}>
              <Image
                source={{ uri: item.mensaje }}
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: 8,
                  marginTop: 4,
                  marginRight: 2,
                }}
              />
            </TouchableOpacity>
          ) : (
            <Text
              style={[
                estilos.includes(styles.mensajeNarrador)
                  ? { color: 'yellow' }
                  : estilos.includes(styles.mensajePropio)
                    ? { color: 'greenyellow' }
                    : { color: '#f2f2f2c4' },
                { marginLeft: mostrarAvatar ? 30 : 6, minWidth: 180, marginTop: 2 },
              ]}
            >
              {item.mensaje}
            </Text>
          )}
        </Animatable.View>
      );
    });
  }, [historialChat, usuarioId, imagenBase]);

  return (

 <ImageBackground
            source={{ uri: fondoUrl  }}
            style={{ flex: 1, opacity:1, backgroundColor:"rgba(3, 3, 3, 0.59)" }}
            resizeMode='cover'
          >
              <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 80}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.chatBox}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        keyboardShouldPersistTaps="handled"
      >
        {renderMensajesMemo}
      </ScrollView>

      <View style={styles.inputBox}>
        {imagenPreview && (
          <TouchableOpacity onPress={() => setImagenPreview(null)}>
            <Image
              source={{ uri: imagenPreview }}
              style={{ width: 40, height: 40, borderRadius: 6, marginRight: 8 }}
            />
          </TouchableOpacity>
        )}
        <TextInput
          style={[styles.input, imagenPreview && { marginLeft: 0 }]}
          value={input}
          onChangeText={setInput}
          placeholder="Escribe un mensaje"
          placeholderTextColor="#aaa"
          onSubmitEditing={enviar}
          returnKeyType="send"
        />
        <TouchableOpacity onPress={abrirGaleria}>
          <MaterialCommunityIcons name="image-outline" size={28} color="#00e0ff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={enviar}>
          <Text style={styles.enviar}>➤</Text>
        </TouchableOpacity>
      </View>

      {/* 🩵 Modal para imagen ampliada con zoom compatible con Expo Go */}
      {imagenAmpliada && (
        <ScrollView
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.95)',
            zIndex: 999,
          }}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 60,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setImagenAmpliada(null);
              scale.value = 1;
            }}
            style={{
              position: 'absolute',
              top: 40,
              right: 20,
              zIndex: 1000,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 20,
              padding: 2,
            }}
          >
            <MaterialCommunityIcons name="close-circle" size={36} color="white" />
          </TouchableOpacity>

          <GestureDetector gesture={pinchGesture}>
            <Animated.Image
              source={{ uri: imagenAmpliada }}
              style={[
                {
                  width: '90%',
                  height: 500,
                  resizeMode: 'contain',
                },
                animatedStyle,
              ]}
            />
          </GestureDetector>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
    </ImageBackground>
  
  );
}

const styles = StyleSheet.create({
  container: { flex: 1,
     //backgroundColor: '#0d0d0d',
     padding: 13 },
  chatBox: { paddingBottom: 40 },
  mensaje: {
    color: "#f2f2f2c4",
    backgroundColor: 'black',
    padding: 8,
    marginVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    maxWidth: '95%',
    borderWidth: 0.2,
    borderColor: "white"
  },
  mensajePropio: {
    backgroundColor: '#222',
    color: 'greenyellow',
    alignSelf: 'flex-end',
    borderWidth: 0.5,
    borderColor: "cyan",
    borderRadius: 8,
  },
  mensajeNarrador: {
    backgroundColor: '#333',
    color: 'yellow',
    fontStyle: 'italic',
    borderWidth: 0.5,
    borderColor: "cyan",
    borderRadius: 8,
    paddingRight: 2,
  },
  inputBox: {
    flexDirection: 'row',
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 5,
  },
  input: { flex: 1, color: 'white', fontSize: 16, paddingHorizontal: 10 },
  enviar: { fontSize: 22, color: '#00e0ff', marginLeft: 10 },
  alinearDerecha: { alignSelf: 'flex-end' },
  alinearIzquierda: { alignSelf: 'flex-start' },
});
