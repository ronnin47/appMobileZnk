import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Alert, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { AuthContext } from './AuthContext';
import axios from 'axios';

export const Sagas = () => {
  const route = useRoute();
  const { sagas,estatus } = useContext(AuthContext);
  const { sagaId } = route.params;

  const [sagaSeleccionada, setSagaSeleccionada] = useState(null);
  const [secciones, setSecciones] = useState([]);
  const [cargandoSecciones, setCargandoSecciones] = useState(true);

  useEffect(() => {
    const encontrada = sagas.find((s) => s.idsaga === sagaId);
    if (encontrada) {
      setSagaSeleccionada(encontrada);
    } else {
      Alert.alert('Error', 'Saga no encontrada en contexto');
    }
  }, [sagaId, sagas]);

  useEffect(() => {
    const obtenerSecciones = async () => {
      try {
        const response = await axios.get(
          `http://192.168.0.38:3000/consumirSecciones?idsaga=${sagaId}`
        );
        setSecciones(response.data.coleccionSecciones);
      } catch (error) {
        console.error("Error al obtener secciones:", error.message);
      } finally {
        setCargandoSecciones(false);
      }
    };

    obtenerSecciones();
  }, [sagaId]);

  if (!sagaSeleccionada) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Cargando saga...</Text>
      </View>
    );
  }

  const renderSeccion = ({ item }) => (
    <View style={styles.card}>
      {item.imagenurl ? (
        <Image source={{ uri: item.imagenurl }} style={styles.sectionImage} />
      ) : null}
      <Text style={styles.cardTitle}>{item.titulo}</Text>
      <Text style={styles.cardDescription}>{item.presentacion}</Text>
    </View>
  );


  console.log("Estatus del clientes es : ",estatus)

  return (
    <FlatList
      ListHeaderComponent={
        <>
          <Text style={styles.title}>{sagaSeleccionada.titulo}</Text>
          {sagaSeleccionada.imagenurl ? (
            <Image source={{ uri: sagaSeleccionada.imagenurl }} style={styles.image} />
          ) : null}
          <Text style={styles.description}>{sagaSeleccionada.presentacion}</Text>
          <Text style={styles.sectionTitle}>Secciones</Text>
          {cargandoSecciones && <Text style={styles.text}>Cargando secciones...</Text>}
        </>
      }
      data={secciones}
      keyExtractor={(item) => item.idseccion.toString()}
      renderItem={renderSeccion}
      contentContainerStyle={styles.container}
    />
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
    marginTop:15,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    marginBottom: 15,
       marginTop:15,
  },
  description: {
    fontSize: 16,
    color: '#ddd',
    marginBottom: 20,
  },
  text: {
    color: '#fff',
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 15,
    marginBottom: 30,
  },
  sectionImage: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 15,
    color: '#ccc',
  },
});
