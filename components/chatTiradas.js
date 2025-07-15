import React, { useEffect, useRef, useContext } from 'react';
import { View, ScrollView, Text, StyleSheet, Image } from 'react-native';
import { AuthContext } from './AuthContext';


export const ChatTiradas = ({ p }) => {
  const scrollViewRef = useRef();
  const { historialChat, setHistorialChat } = useContext(AuthContext);

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
            const esPropio = msg.idpersonaje === p.idpersonaje;
            const esImagen =
              typeof msg.mensaje === 'string' &&
              (msg.mensaje.startsWith('http://') || msg.mensaje.startsWith('https://')) &&
              (msg.mensaje.endsWith('.jpg') ||
                msg.mensaje.endsWith('.jpeg') ||
                msg.mensaje.endsWith('.png') ||
                msg.mensaje.includes('cloudinary'));

            return (
              <View key={idx}  style={{
                marginBottom: 4,
                backgroundColor: '#222',
                padding: 4,
                borderRadius: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.3,
                shadowRadius: 2,
                elevation: 3,  // para sombra en Android
                
              }}>
                <Text
                  style={[
                    styles.textoHistorial,
                    esPropio && styles.mensajePropio,
                  ]}
                >
                  {msg.nombre}:
                </Text>

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
    height: 245,
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
    color: "#FFFFFF",
    fontSize: 13,
    marginBottom: 1,
  },
  textoHistorialVacio: {
    color: "#ADFF2F",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 20,
  },
  mensajePropio: {
    color: "#00FF00",
  },
  imagenChat: {
    width: 180,
    height: 120,
    borderRadius: 8,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
});
