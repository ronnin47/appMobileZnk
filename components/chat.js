import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform
} from 'react-native';
import socket from './socket';
import { AuthContext } from './AuthContext';

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

    return (
      <Text key={item.id || index.toString()} style={estilos}>
        {item.nombre}: {item.mensaje}
      </Text>
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
