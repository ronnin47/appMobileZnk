import React, { useState, useContext, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Image
} from 'react-native';
import socket from './socket';
import { AuthContext } from './AuthContext';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { PinchGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

export default function Chat() {
  const scrollViewRef = useRef();
  const [input, setInput] = useState('');
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenAmpliada, setImagenAmpliada] = useState(null);
  const { historialChat, setHistorialChat, userToken, personajeActual, estatus, imagenurl, nick } = useContext(AuthContext);
  const imagenBase = require('../assets/imagenBase.jpeg');
  const usuarioId = userToken ? userToken.split("-")[1] : null;

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [historialChat]);

  // Función para optimizar URL de avatar (solo si es Cloudinary)
  const optimizarAvatarUrl = (url) => {
    if (!url) return null;
    if (url.includes('/upload/')) {
      return url.replace('/upload/', '/upload/w_64,h_64,c_fill/');
    }
    return url;
  };

  // Variables para mantener escala acumulada y punto inicial
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const pinchHandler = useAnimatedGestureHandler({
    onStart: (event, context) => {
      context.startScale = savedScale.value;
    },
    onActive: (event, context) => {
      scale.value = context.startScale * event.scale;
    },
    onEnd: () => {
      savedScale.value = scale.value;
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const activarTirada = (mensaje) => {
    if (!mensaje.includes('#')) return mensaje;

    const partes = mensaje.split('#');
    const textoAntes = partes[0].trim();
    const contenidoTirada = partes.slice(1).join('#').trim();

    const normalizado = contenidoTirada.replace(/\s+/g, '');
    const regex = /([+-]?)(\d+)(d(\d+))?/gi;

    let totalFinal = 0;
    let resultadoTexto = '';
    let match;
    let esPrimero = true;

    while ((match = regex.exec(normalizado)) !== null) {
      const signoStr = match[1] || '+';
      const signo = signoStr === '-' ? -1 : 1;
      const cantidad = parseInt(match[2], 10);
      const esDado = !!match[3];
      const caras = parseInt(match[4], 10);

      const prefix = esPrimero
        ? ''
        : signo === 1
          ? '+ '
          : '- ';

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

    if (!resultadoTexto) return mensaje;

    return `🎲 ${textoAntes} ${resultadoTexto.trim()}\nTotal final: ${totalFinal}`;
  };

  const enviar = async () => {
    if (imagenPreview) {
      try {
        const imagenBase64 = await FileSystem.readAsStringAsync(imagenPreview, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const mensajeImagen = {
          usuarioId: Number(usuarioId),
          idpersonaje: personajeActual?.idpersonaje || 0,
          nombre: nick || estatus,
          estatus: estatus,
          imagenBase64: `data:image/jpeg;base64,${imagenBase64}`,
          imagenurl: imagenurl || "",
          nick: nick || "",
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

      const msgEnviar = {
        usuarioId: Number(usuarioId),
        idpersonaje: personajeActual?.idpersonaje || 0,
        nombre: nick || estatus,
        mensaje: mensaje,
        estatus: estatus,
        imagenurl: imagenurl || '',
        nick: nick || "",
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

  // Aquí uso useMemo para memoizar la lista renderizada de mensajes
  const renderMensajesMemo = useMemo(() => {
    return historialChat.map((item, index) => {
      const esPropio = item.usuarioId == usuarioId;
      const esNarrador = item.estatus === 'narrador';

      const estilos = [styles.mensaje];
      if (esNarrador) {
        estilos.push(styles.mensajeNarrador);
      } else if (esPropio) {
        estilos.push(styles.mensajePropio);
      }
      if (esPropio) {
        estilos.push(styles.alinearDerecha);
      } else {
        estilos.push(styles.alinearIzquierda);
      }

      const esImagen = typeof item.mensaje === 'string' && item.mensaje.startsWith('http') &&
        (item.mensaje.endsWith('.jpg') || item.mensaje.endsWith('.jpeg') || item.mensaje.endsWith('.png') || item.mensaje.endsWith('.webp'));

      const avatarUrlOptimizada = optimizarAvatarUrl(
        item.imagenPjUrl ? item.imagenPjUrl : item.imagenurl
      );

      return (
        <View key={`comp1-${Number(item.id) || index.toString()}`} style={[estilos, { paddingRight: 6 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 200 }}>
            <Image
              source={
                avatarUrlOptimizada
                  ? { uri: avatarUrlOptimizada }
                  : imagenBase
              }
              style={{ width: 32, height: 32, borderRadius: 15 }}
            />
            <Text style={{ color: 'aliceblue', fontSize: 12 }}>{item.nombre || item.nick}</Text>
            <Text style={{ color: '#888', fontSize: 10, flex: 1, textAlign: 'right' }}>
              {item.timestamp
                ? new Date(Number(item.timestamp)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : ''}
            </Text>
          </View>
          {esImagen ? (
            <TouchableOpacity onPress={() => setImagenAmpliada(item.mensaje)}>
              <Image source={{ uri: item.mensaje }} style={{ width: 200, height: 200, borderRadius: 8, marginTop: 4, marginRight: 2 }} />
            </TouchableOpacity>
          ) : (
            <Text
              style={[
                estilos.includes(styles.mensajeNarrador)
                  ? { color: 'yellow' }
                  : estilos.includes(styles.mensajePropio)
                    ? { color: 'greenyellow' }
                    : { color: '#f2f2f2c4' },
                { marginLeft: 30, minWidth: 180 },
              ]}
            >
              {item.mensaje}
            </Text>
          )}
        </View>
      );
    });
  }, [historialChat, usuarioId, imagenBase]);

  return (
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
          style={[
            styles.input,
            imagenPreview && { marginLeft: 0 }
          ]}
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

      {/* Modal para imagen ampliada con zoom */}
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
              savedScale.value = 1;
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

          <PinchGestureHandler onGestureEvent={pinchHandler}>
            <Animated.Image
              source={{ uri: imagenAmpliada }}
              style={[{
                width: '90%',
                height: 500, // Altura fija o relativa si preferís
                resizeMode: 'contain',
              }, animatedStyle]}
            />
          </PinchGestureHandler>
        </ScrollView>
      )}

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    padding: 13,
  },
  chatBox: {
    paddingBottom: 40,
  },
  mensaje: {
    color: "#f2f2f2c4",
    backgroundColor: 'black',
    padding: 8,
    marginVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    maxWidth: '95%',
    borderRadius: 8,
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
    paddingRight: 2
  },
  inputBox: {
    flexDirection: 'row',
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 5,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    paddingHorizontal: 10,
  },
  enviar: {
    fontSize: 22,
    color: '#00e0ff',
    marginLeft: 10,
  },
  alinearDerecha: {
    alignSelf: 'flex-end',
  },

  alinearIzquierda: {
    alignSelf: 'flex-start',
  },
});
