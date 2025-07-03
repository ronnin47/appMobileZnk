
import { StyleSheet, Text, View } from 'react-native';
import React, { useContext,useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';

export const Nuevo = () => {
  const { coleccionPersonajes } = useContext(AuthContext);
/*
  useEffect(() => {
    console.log("📦 personajes en Nuevo:", coleccionPersonajes.length);
    coleccionPersonajes.forEach((pj) => {
      console.log(`🧙 id: ${pj.idpersonaje} - ${pj.nombre}`);
    });
  }, [coleccionPersonajes]);
*/
  return (
    <View >
      <Text style={{ color: 'white', marginBottom:100, }}>Aca está el nuevo</Text>
    </View>
  );
};

/* ESTE ES DE PRUEBAS
import { StyleSheet, Text, View, Image, FlatList } from 'react-native';
import React, { useContext, useEffect } from 'react';
import { AuthContext } from './AuthContext';

export const Nuevo = () => {
  const { coleccionPersonajes } = useContext(AuthContext);
const imagenBase = require('../assets/imagenBase.jpeg');


  useEffect(() => {
    console.log("📦 personajes en Nuevo:", coleccionPersonajes.length);
    coleccionPersonajes.forEach((pj) => {
      console.log(`🧙 id: ${pj.idpersonaje} - ${pj.nombre}- ${pj.imagenurl}`);
    });
  }, [coleccionPersonajes]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
     <Image
  source={
    item.imagenurl
      ? { uri: item.imagenurl } // URL remota
      : imagenBase              // Imagen local (require)
  }
  style={styles.image}
/>
      <Text style={styles.name}>{item.nombre}</Text>
    </View>
  );

  return (
    <FlatList
      data={coleccionPersonajes}
      renderItem={renderItem}
      keyExtractor={(item) => item.idpersonaje.toString()}
      horizontal
      contentContainerStyle={styles.container}
      showsHorizontalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 20,
    backgroundColor: '#000',
  },
  card: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 32, // 🔵 Imagen circular
    borderWidth: 2,
    borderColor: 'white',
  },
  name: {
    marginTop: 6,
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
});
*/