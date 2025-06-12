// FichaDePersonaje.js
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export const FichaPersonaje = ({ route }) => {
  const { pj } = route.params;
  const imagenBase = require('../assets/imagenBase.jpeg');

  const getImageSource = () => {
    if (pj.imagen && typeof pj.imagen === 'string') {
      return { uri: pj.imagen };
    } else {
      return imagenBase;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{pj.nombre}</Text>
      <Text style={styles.titulo}>{pj.idpersonaje}</Text>
      <Image source={getImageSource()} style={styles.imagen} resizeMode="cover" />
      {/* Puedes mostrar más atributos aquí */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  imagen: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
});
