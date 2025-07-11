import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform,Image
} from 'react-native';
import socket from './socket';
import { AuthContext } from './AuthContext';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { MaterialCommunityIcons } from '@expo/vector-icons';


export default function Chat() {
const scrollViewRef = useRef();
const [input, setInput] = useState('');
const [imagenPreview, setImagenPreview] = useState(null);
const { historialChat, setHistorialChat, userToken, personajeActual, estatus } = useContext(AuthContext);

  
const usuarioId = userToken ? userToken.split("-")[1] : null;
  

useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [historialChat]);



//***********ACA ESTAMOS TRABAJANDO ********************************* */

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

  return `${textoAntes} ${resultadoTexto.trim()}\nTotal final: ${totalFinal}`;
};


const enviar = async () => {
  // Si hay imagen para enviar
  if (imagenPreview) {
    try {
      const imagenBase64 = await FileSystem.readAsStringAsync(imagenPreview, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const mensajeImagen = {
        id: Date.now().toString() + Math.random().toString(36).substring(2),
        usuarioId: Number(usuarioId),
        idpersonaje: personajeActual?.idpersonaje || 0,
        nombre: personajeActual?.nombre || estatus,
        estatus: estatus,
        imagenBase64: `data:image/jpeg;base64,${imagenBase64}`,
      };

      socket.emit('chat-chat', mensajeImagen);
      setImagenPreview(null); // Limpia el preview después de enviar
      // Espera un pequeño tiempo para asegurar el orden
      await new Promise(res => setTimeout(res, 100));
    } catch (error) {
      console.error('❌ Error al convertir imagen a base64:', error);
      return;
    }
  }

  // Si hay texto para enviar
  if (input.trim()) {

    
    //aca estamos*******************
    const mensaje=activarTirada(input)




    const msgEnviar = {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      usuarioId: Number(usuarioId),
      idpersonaje: personajeActual?.idpersonaje || 0,
      nombre: personajeActual?.nombre || estatus,
      mensaje: mensaje,
      estatus: estatus,
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
    setImagenPreview(imagenUri); // Solo guarda la URI para el preview
    // No envíes nada aquí
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
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={styles.container}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 80} // Puedes ajustar el offset si lo necesitas
  >
    <ScrollView
      ref={scrollViewRef}
      contentContainerStyle={styles.chatBox}
      onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      keyboardShouldPersistTaps="handled"
    >
      {renderMensajes()}
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
          imagenPreview && { marginLeft: 0 } // Ajusta si quieres menos espacio cuando hay imagen
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
    paddingBottom: 40,
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
  //  position: 'absolute',
   // bottom: 10,
    //left: 10,
    //right: 10,
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
