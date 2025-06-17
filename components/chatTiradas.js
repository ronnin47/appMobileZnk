
import React, { useEffect, useRef,useContext } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { AuthContext } from './AuthContext';

import socket from './socket';

export const ChatTiradas = ({p}) => {
  const scrollViewRef = useRef();

  

 //necesito que cuando el mendaje que recibe tenga el mismo idpersonaje que este sea de otro color


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

  socket.on('chat-message', (mensaje) => {
    setHistorialChat(prev => [...prev, mensaje]);
  });

  return () => {
    socket.off('chat-message');
  };
}, []);
  return (
    <View style={styles.panelHistorial}>
      <ScrollView ref={scrollViewRef} style={styles.scrollHistorial}>
        {historialChat.length === 0 ? (
          <></>
        ) : (
         historialChat.map((msg, idx) => (
                  <Text
                    key={idx}
                    style={[
                      styles.textoHistorial,
                      msg.idpersonaje === p.idpersonaje && styles.mensajePropio
                    ]}
                  >
                    {typeof msg === 'string'
                      ? msg
                      : `${msg.nombre}: ${msg.mensaje}`}
                  </Text>
                ))
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
    height: 200,
    backgroundColor: "#111827",
    paddingHorizontal: 10,
    paddingVertical: 8,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ADFF2F",
  },
  scrollHistorial: {
    flex: 1,
  },
  textoHistorial: {
    color: "#FFFFFF", 
    fontSize: 12,
    marginBottom: 6,
  },
  textoHistorialVacio: {
    color: "#ADFF2F",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 20,
  },
  mensajePropio: {
  color: "#00FF00", // Verde para el personaje actual
},
});


