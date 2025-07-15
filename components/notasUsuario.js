import React, { useContext } from 'react';
import { View, Text, TextInput, StyleSheet, Image } from 'react-native';
import { AuthContext } from './AuthContext';

export const NotasUsuario = () => {
  const { personajes, notasUsuario, setNotasUsuario, pjSeleccionado } = useContext(AuthContext);

  const personaje = personajes?.find(p => p.idpersonaje === pjSeleccionado);
    const imagenBase = require('../assets/imagenBase.jpeg');
  return (
    <View style={styles.container}>
      {personaje && (
        <View style={styles.card}>
             
          <Image source={personaje.imagenurl ? { uri: personaje.imagenurl } : imagenBase} style={styles.avatar} />
          <View style={styles.info}>
            <Text style={styles.nombre}>{personaje.nombre}</Text>
            <Text style={styles.conviccion}>{personaje.conviccion || "Sin convicción"}</Text>
          </View>
        </View>
      )}

      <View style={styles.textareaWrapper}>
        <TextInput
          style={styles.textarea}
          multiline
          placeholder="Escribí tus notas acá..."
          placeholderTextColor="#aaa"
          value={notasUsuario}
          onChangeText={setNotasUsuario}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    padding: 10,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',  // Aquí el layout horizontal
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  info: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  nombre: {
    color: '#FFD700',
    fontSize: 22,
    fontWeight: 'bold',
  },
  conviccion: {
    color: 'yellow',
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
  textareaWrapper: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 12,
    flex: 1,
    borderWidth: 1,
    borderColor: '#333',
  },
  textarea: {
    flex: 1,
    color: 'aliceblue',
    fontSize: 16,
    textAlignVertical: 'top',
  },
});