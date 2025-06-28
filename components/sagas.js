import React, { useContext, useEffect, useState } from 'react';
import { showMessage } from 'react-native-flash-message';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';

export const Sagas = () => {
  const route = useRoute();
  const { sagas, estatus, fetchSagas } = useContext(AuthContext);
  const { sagaId } = route.params;

  const [sagaSeleccionada, setSagaSeleccionada] = useState(null);
  const [secciones, setSecciones] = useState([]);
  const [cargandoSecciones, setCargandoSecciones] = useState(true);

  const esNarrador = estatus === 'narrador';

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
        console.error('Error al obtener secciones:', error.message);
      } finally {
        setCargandoSecciones(false);
      }
    };

    obtenerSecciones();
  }, [sagaId]);

  // Seleccionar imagen para una sección específica
  const seleccionarImagenSeccion = async (index) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const base64 = result.assets[0].base64;
        const uri = result.assets[0].uri;

        const updatedSecciones = [...secciones];
        updatedSecciones[index] = {
          ...updatedSecciones[index],
          imagen: `data:image/jpeg;base64,${base64}`, // base64 para backend
          imagenurl: uri, // url para render
        };
        setSecciones(updatedSecciones);
      }
      
    } catch (error) {
      console.error('Error al seleccionar imagen para sección:', error.message);
    }
  };

  const seleccionarImagen = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const base64 = result.assets[0].base64;
        const uri = result.assets[0].uri;

        setSagaSeleccionada((prev) => ({
          ...prev,
          imagensaga: `data:image/jpeg;base64,${base64}`,
          imagenurl: uri,
        }));
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error.message);
    }
  };

  const handleInputChange = (field, value) => {
    setSagaSeleccionada({ ...sagaSeleccionada, [field]: value });
  };

  const actualizarSaga = async () => {
    //console.log('FUNCIONA BOTÓN DE GUARDAR CAMBIOS');

    if (!sagaSeleccionada) return;

    try {
      const datosActualizados = {
        titulo: sagaSeleccionada.titulo,
        presentacion: sagaSeleccionada.presentacion,
      };

      if (
        sagaSeleccionada.imagensaga &&
        sagaSeleccionada.imagensaga.startsWith('data:image/')
      ) {
        datosActualizados.imagensaga = sagaSeleccionada.imagensaga;
      }

      // Preparamos secciones para enviar al backend
      // Enviamos campo `imagen` (base64) que es el que el backend espera para actualizar imagen
      const seccionesParaEnviar = secciones.map(
        ({ idseccion, titulo, presentacion, imagen, imagenurl, imagencludid }) => ({
          // NO enviamos idseccion si no existe (nuevo registro)
          ...(idseccion ? { idseccion } : {}),
          titulo,
          presentacion,
          imagen: imagen && imagen.startsWith('data:image/') ? imagen : null,
        })
      );

      // Enviamos todo junto al backend
      const payload = {
        ...datosActualizados,
        secciones: seccionesParaEnviar,
      };

      const response = await axios.put(
        `http://192.168.0.38:3000/updateSagaCompleta/${sagaSeleccionada.idsaga}`,
        payload
      );

      //console.log('Saga y secciones actualizadas correctamente:', response.data);

      // Actualizar estado local con los nuevos ids que haya asignado el backend
      if (response.data.secciones) {
        setSecciones((oldSecciones) =>
          oldSecciones.map((sec) => {
            if (!sec.idseccion) {
              // Buscar la sección recién insertada por título y presentación para asignarle el id nuevo
              const match = response.data.secciones.find(
                (s) =>
                  s.titulo === sec.titulo &&
                  s.presentacion === sec.presentacion &&
                  (!s.imagen || s.imagen === sec.imagen) // Opcional comparar imagen
              );
              if (match && match.idseccion) {
                return { ...sec, idseccion: match.idseccion };
              }
            }
            return sec;
          })
        );
      }
     
      //actualizamos SAGAS
      await fetchSagas()
        setTimeout(() => {
            showMessage({
              message: 'Cambios de Saga guardados',
              description: 'Tus datos de Saga se han actualizado correctamente.',
              type: 'success',
              icon: 'success',
              duration: 3000
            });
          }, 500);
    } catch (error) {
      console.error('Error al actualizar saga y secciones:', error.message);
    }
  };

  const renderSeccion = ({ item, index }) => (
    <View style={styles.card}>
      {item.imagenurl ? (
        <Image source={{ uri: item.imagenurl }} style={styles.sectionImage} />
      ) : null}

      {esNarrador && (
        <TouchableOpacity
          style={[styles.button, { marginBottom: 10, alignSelf: 'flex-start' }]}
          onPress={() => seleccionarImagenSeccion(index)}
        >
          <Text style={styles.buttonText}>
            {item.imagenurl ? 'Cambiar Imagen' : 'Agregar Imagen'}
          </Text>
        </TouchableOpacity>
      )}

      {esNarrador ? (
        <>
          <TextInput
            style={styles.inputTitle}
            value={item.titulo}
            onChangeText={(text) => {
              const updated = [...secciones];
              updated[index].titulo = text;
              setSecciones(updated);
            }}
          />
          <TextInput
            style={styles.inputDesc}
            value={item.presentacion}
            multiline
            onChangeText={(text) => {
              const updated = [...secciones];
              updated[index].presentacion = text;
              setSecciones(updated);
            }}
          />
        </>
      ) : (
        <>
          <Text style={styles.cardTitle}>{item.titulo}</Text>
          <Text style={styles.cardDescription}>{item.presentacion}</Text>
        </>
      )}
    </View>
  );

  if (!sagaSeleccionada) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Cargando saga...</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <FlatList
        ListHeaderComponent={
          <>
            {esNarrador ? (
              <>
                <TextInput
                  style={styles.title}
                  value={sagaSeleccionada.titulo}
                  onChangeText={(text) => handleInputChange('titulo', text)}
                />
                {sagaSeleccionada.imagenurl && (
                  <Image
                    source={{ uri: sagaSeleccionada.imagenurl }}
                    style={styles.image}
                  />
                )}
                <TouchableOpacity
                  onPress={seleccionarImagen}
                  style={[styles.button, { marginBottom: 15 }]}
                >
                  <Text style={styles.buttonText}>Cambiar Imagen</Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.description}
                  value={sagaSeleccionada.presentacion}
                  multiline
                  onChangeText={(text) =>
                    handleInputChange('presentacion', text)
                  }
                />
              </>
            ) : (
              <>
                <Text style={styles.title}>{sagaSeleccionada.titulo}</Text>
                {sagaSeleccionada.imagenurl && (
                  <Image
                    source={{ uri: sagaSeleccionada.imagenurl }}
                    style={styles.image}
                  />
                )}
                <Text style={styles.description}>
                  {sagaSeleccionada.presentacion}
                </Text>
              </>
            )}
            <Text style={styles.sectionTitle}>Secciones</Text>
            {cargandoSecciones && (
              <Text style={styles.text}>Cargando secciones...</Text>
            )}
          </>
        }
        data={secciones}
        keyExtractor={(item, index) =>
          item.idseccion?.toString() || `temp-${index}`
        }
        renderItem={renderSeccion}
        ListEmptyComponent={
          !cargandoSecciones && (
            <Text style={styles.text}>No hay secciones disponibles.</Text>
          )
        }
        contentContainerStyle={styles.container}
      />

      {esNarrador && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              // No ponemos idseccion para que backend lo asigne
              const nuevaSeccion = {
                titulo: '',
                presentacion: '',
                imagenurl: '',
                imagen: null,
              };
              setSecciones([...secciones, nuevaSeccion]);
            }}
          >
            <Text style={styles.buttonText}>+ Nueva Sección</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#28a745' }]}
            onPress={actualizarSaga}
          >
            <Text style={styles.buttonText}>Guardar Cambios</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#000',
  },
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
    marginTop: 15,
    backgroundColor: '#111',
    padding: 10,
    borderRadius: 8,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    marginBottom: 15,
    marginTop: 15,
  },
  description: {
    fontSize: 16,
    color: '#ddd',
    marginBottom: 20,
    backgroundColor: '#111',
    padding: 10,
    borderRadius: 8,
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
  inputTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    backgroundColor: '#222',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  inputDesc: {
    fontSize: 15,
    color: '#ccc',
    backgroundColor: '#222',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonsContainer: {
    padding: 20,
    backgroundColor: '#000',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 80,
  },
  button: {
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
