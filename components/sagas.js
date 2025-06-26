import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { AuthContext } from './AuthContext';

export const Sagas = () => {
  const route = useRoute();
    const { sagas } = useContext(AuthContext);
  const { sagaId } = route.params;


  const [sagaSeleccionada, setSagaSeleccionada] = useState(null);

  useEffect(() => {
    const encontrada = sagas.find((s) => s.idsaga === sagaId);
    if (encontrada) {
      setSagaSeleccionada(encontrada);
    } else {
      Alert.alert('Error', 'Saga no encontrada en contexto');
    }
  }, [sagaId, sagas]);

  if (!sagaSeleccionada) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Cargando saga...</Text>
      </View>
    );
  }




  console.log("IMAGEN DE SAGA: ",sagaSeleccionada.imagenurl)

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{sagaSeleccionada.titulo}</Text>
     { sagaSeleccionada.imagenurl ? (
  <Image source={{ uri: sagaSeleccionada.imagenurl }} style={styles.image} />
) : null }
      <Text style={styles.description}>{sagaSeleccionada.presentacion}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    padding: 20,
  },
  center: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#ddd',
  },
  text: {
    color: '#fff',
    fontSize: 18,
  },
});
