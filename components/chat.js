import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform,Image
} from 'react-native';
import socket from './socket';
import { AuthContext } from './AuthContext';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';




export default function Chat() {
  const scrollViewRef = useRef();
  const [input, setInput] = useState('');
  const { historialChat, setHistorialChat, userToken, personajeActual, estatus } = useContext(AuthContext);

  
const usuarioId = userToken ? userToken.split("-")[1] : null;
  

useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [historialChat]);

  const enviar = () => {
    if (!input.trim()) return;

    const msgEnviar = {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      usuarioId: Number(usuarioId),
      idpersonaje: personajeActual?.idpersonaje || 0,
      nombre: personajeActual?.nombre || estatus,
      mensaje: input,
      estatus: estatus,
    };

    socket.emit('chat-chat', msgEnviar); // solo emite
    setInput('');
  };




  const abrirGaleria = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.7,
    base64: false, // no lo usamos aquí, usamos FileSystem
  });

  if (!result.canceled && result.assets.length > 0) {
    const imagenUri = result.assets[0].uri;

    try {
      // Convertir a base64
      const imagenBase64 = await FileSystem.readAsStringAsync(imagenUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const mensajeImagen = {
        id: Date.now().toString() + Math.random().toString(36).substring(2),
        usuarioId: Number(usuarioId),
        idpersonaje: personajeActual?.idpersonaje || 0,
        nombre: personajeActual?.nombre || estatus,
        estatus: estatus,
        imagenBase64: `data:image/jpeg;base64,${imagenBase64}`, // 🔹 así lo reconoce Cloudinary
      };

      // Emitimos al socket
      socket.emit('chat-chat', mensajeImagen);
      console.log('📤 Imagen emitida al servidor');

    } catch (error) {
      console.error('❌ Error al convertir imagen a base64:', error);
    }
  }
};

const renderMensajes = () => {
  return historialChat.map((item, index) => {
    const esPropio = item.usuarioId == usuarioId;
    const esNarrador = item.estatus === 'narrador';

    const estilos = [styles.mensaje];

    // Primero se decide color
    if (esNarrador) {
      estilos.push(styles.mensajeNarrador);
    } else if (esPropio) {
      estilos.push(styles.mensajePropio);
    }

    // Luego se decide alineación
    if (esPropio) {
      estilos.push(styles.alinearDerecha);
    } else {
      estilos.push(styles.alinearIzquierda);
    }


    const esImagen = typeof item.mensaje === 'string' && item.mensaje.startsWith('http') &&
        (item.mensaje.endsWith('.jpg') || item.mensaje.endsWith('.jpeg') || item.mensaje.endsWith('.png') || item.mensaje.endsWith('.webp'));



    return (
        <View key={item.id || index.toString()} style={estilos}>
          <Text style={{ color: 'gray', fontSize: 10 }}>{item.nombre}</Text>
          {esImagen ? (
            <Image source={{ uri: item.mensaje }} style={{ width: 200, height: 200, borderRadius: 8 }} />
          ) : (
            <Text style={{ color: estilos.includes(styles.mensajeNarrador) ? 'yellow' : estilos.includes(styles.mensajePropio) ? 'greenyellow' : '#e0e0ff' }}>
              {item.mensaje}
            </Text>
          )}
        </View>
    );
  });
};






  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.chatBox}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {renderMensajes()}
      </ScrollView>

      <View style={styles.inputBox}>
        
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Escribe un mensaje"
          placeholderTextColor="#aaa"
          onSubmitEditing={enviar}
          returnKeyType="send"
        />
         <TouchableOpacity onPress={abrirGaleria}>
          <Text style={styles.enviar}>🖼️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={enviar}>
          <Text style={styles.enviar}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    padding: 10,
  },
  chatBox: {
    paddingBottom: 80,
  },
  mensaje: {
  color: '#e0e0ff',
  backgroundColor: '#222',
  padding: 8,
  marginVertical: 4,
  borderRadius: 6,
  alignSelf: 'flex-start',
  maxWidth: '95%',
},

mensajePropio: {
  backgroundColor: '#222',
 color: 'greenyellow',
  alignSelf: 'flex-end',
},

mensajeNarrador: {
  backgroundColor: '#333',
  color: 'yellow',
  fontStyle: 'italic',
 
},
  inputBox: {
    flexDirection: 'row',
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
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
