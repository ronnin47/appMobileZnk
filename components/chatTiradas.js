import React, { useEffect, useRef, useContext } from 'react';
import { View, ScrollView, Text, StyleSheet, Image } from 'react-native';
import { AuthContext } from './AuthContext';


export const ChatTiradas = ({ p }) => {
  const scrollViewRef = useRef();
  const { historialChat, setHistorialChat } = useContext(AuthContext);
const imagenBase = require('../assets/imagenBase.jpeg');
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

  return (
    <View style={styles.panelHistorial}>
      <ScrollView ref={scrollViewRef} style={styles.scrollHistorial}>
        {historialChat.length === 0 ? (
          <></>
        ) : (
          historialChat.map((msg, idx) => {
            const esPropio = msg.idpersonaje == p.idpersonaje;
            const esImagen =
              typeof msg.mensaje === 'string' &&
              (msg.mensaje.startsWith('http://') || msg.mensaje.startsWith('https://')) &&
              (msg.mensaje.endsWith('.jpg') ||
                msg.mensaje.endsWith('.jpeg') ||
                msg.mensaje.endsWith('.png') ||
                msg.mensaje.includes('cloudinary'));

            return (
              <View
                key={`comp2-${Number(msg.id) || idx.toString()}`}
                style={{
                  marginBottom: 6,
                  backgroundColor: esPropio ? "#222" : 'black',
                  padding: 4,
                  borderRadius: 10,
                  borderWidth: esPropio ? 0.5 : 0.1,
                  borderColor: esPropio ? "cyan": 'cyan',
                  shadowColor: esPropio ? 'white' : '#000',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: esPropio ? 0.9 : 0.2,
                  shadowRadius: esPropio ? 18 : 4,
                  elevation: esPropio ? 18 : 4,
                }}
              >
             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                     <Image
                    source={
                      msg.imagenPjUrl
                        ? { uri: msg.imagenPjUrl }
                        : msg.imagenurl
                        ? { uri: msg.imagenurl }
                        : imagenBase
                    }
                    style={{ width: 32, height: 32, borderRadius: 15 }}
                  />
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
                        ? new Date(Number(msg.timestamp)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
                      esPropio && styles.mensajePropio,
                        { marginLeft: 40 }
                    ]}
                  >
                    {msg.mensaje}
                  </Text>
                  
                )}
              </View>
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
  imagenChat: {
    width: 180,
    height: 120,
    borderRadius: 8,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
});
