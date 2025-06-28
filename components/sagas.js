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
  Modal,
  ScrollView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';

export const Sagas = () => {
  const route = useRoute();
  const { sagas, estatus, fetchSagas, coleccionPersonajes, personajes,userToken,savePersonajes,savePersonajeUno } = useContext(AuthContext);
  const { sagaId } = route.params;

  const [sagaSeleccionada, setSagaSeleccionada] = useState(null);
  const [secciones, setSecciones] = useState([]);
  const [cargandoSecciones, setCargandoSecciones] = useState(true);


  const [notasEditables, setNotasEditables] = useState([]);


  const esNarrador = estatus === 'narrador';

const puedeEditarNotas = (personaje) => {
  // Extraigo el número del userToken, asumiendo formato "usuario-1"
  const userIdNumber = userToken?.split('-')[1]; // "1"
  console.log("puedeEditarNotas:", personaje?.usuarioId, userIdNumber, personaje?.usuarioId == userIdNumber);
  return personaje?.usuarioId == userIdNumber; // == para permitir comparación string/número
};

  const imagenBase = require('../assets/imagenBase.jpeg');

  const [mostrarSelector, setMostrarSelector] = useState(false);
  const [personajeSeleccionado, setPersonajeSeleccionado] = useState(null);

  // Estados para mostrar notas en modal
  const [modalVisible, setModalVisible] = useState(false);
  const [notasSeleccionadas, setNotasSeleccionadas] = useState([]);
  const [personajeSeleccionadoModal, setPersonajeSeleccionadoModal] = useState(null);

const abrirNotasPersonaje = (personaje) => {
  if (!sagaSeleccionada || !sagaSeleccionada.idsaga) {
    console.warn("No hay saga seleccionada o falta el ID de la saga.");
    return;
  }

  const notasagaArray = Array.isArray(personaje.notasaga) ? personaje.notasaga : [];

  const notasParaEstaSaga = notasagaArray.filter(
    (nota) => nota.idsaga === sagaSeleccionada.idsaga
  );

  setNotasSeleccionadas(notasParaEstaSaga);

  if (puedeEditarNotas(personaje)) {
    // Si no tiene notas para esta saga, crear una nota vacía editable
    if (notasParaEstaSaga.length === 0) {
      setNotasEditables([{ idsaga: sagaSeleccionada.idsaga, nota: '' }]);
    } else {
      setNotasEditables(notasParaEstaSaga.map(nota => ({ ...nota })));
    }
  } else {
    // Usuario no puede editar, no hay notas editables
    setNotasEditables([]);
  }

  setPersonajeSeleccionadoModal(personaje);
  setModalVisible(true);
};


  const agregarPersonajeASaga = async () => {
    if (!personajeSeleccionado) return;

    try {
      const nuevosPersonajes = [...sagaSeleccionada.personajes, personajeSeleccionado];

      // Enviamos solo el array de personajes actualizado
      await axios.put(`http://192.168.0.38:3000/agregarPersonajeSaga/${sagaSeleccionada.idsaga}`, {
        personajes: nuevosPersonajes,
      });

      setMostrarSelector(false);
      setPersonajeSeleccionado(null);

      showMessage({
        message: 'Personaje agregado a la saga',
        type: 'success',
      });
      fetchSagas();
    } catch (error) {
      console.error('Error al agregar personaje a saga:', error.message);
      showMessage({
        message: 'Error al agregar personaje',
        description: error.message,
        type: 'danger',
      });
    }
  };

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

      const seccionesParaEnviar = secciones.map(
        ({ idseccion, titulo, presentacion, imagen, imagenurl, imagencludid }) => ({
          ...(idseccion ? { idseccion } : {}),
          titulo,
          presentacion,
          imagen: imagen && imagen.startsWith('data:image/') ? imagen : null,
        })
      );

      const payload = {
        ...datosActualizados,
        secciones: seccionesParaEnviar,
      };

      const response = await axios.put(
        `http://192.168.0.38:3000/updateSagaCompleta/${sagaSeleccionada.idsaga}`,
        payload
      );

      if (response.data.secciones) {
        setSecciones((oldSecciones) =>
          oldSecciones.map((sec) => {
            if (!sec.idseccion) {
              const match = response.data.secciones.find(
                (s) =>
                  s.titulo === sec.titulo &&
                  s.presentacion === sec.presentacion &&
                  (!s.imagen || s.imagen === sec.imagen)
              );
              if (match && match.idseccion) {
                return { ...sec, idseccion: match.idseccion };
              }
            }
            return sec;
          })
        );
      }

      await fetchSagas();
      setTimeout(() => {
        showMessage({
          message: 'Cambios de Saga guardados',
          description: 'Tus datos de Saga se han actualizado correctamente.',
          type: 'success',
          icon: 'success',
          duration: 3000,
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

  console.log('PERSONAJES EN LA SAGA: ', sagaSeleccionada.personajes);
  const personajesSaga = coleccionPersonajes
    .filter((pj) => sagaSeleccionada.personajes?.includes(pj.idpersonaje))
    .sort((a, b) => {
      return a.idpersonaje - b.idpersonaje;
    });





const guardarNotaSaga = async (notasEditables, personaje, savePersonajes,savePersonajeUno) => {

    console.log("guardarNotaSaga llamada", { notasEditables, personaje });
  
  if (!personaje || !notasEditables || notasEditables.length === 0) return;

  const notaEditada = notasEditables[0];
  const nuevasNotas = personaje.notasaga ? [...personaje.notasaga] : [];

  const indexExistente = nuevasNotas.findIndex(
    (n) => n.idsaga === notaEditada.idsaga
  );

  if (indexExistente !== -1) {
    nuevasNotas[indexExistente].nota = notaEditada.nota;
  } else {
    nuevasNotas.push({
      nota: notaEditada.nota,
      idsaga: notaEditada.idsaga,
      
    });
  }

  // Actualizar SOLO el campo notasaga localmente para el personaje correcto
  savePersonajeUno({
    idpersonaje: personaje.idpersonaje,
    notasaga: nuevasNotas,
  });


  console.log("Enviando notasaga al backend:", nuevasNotas);
  // Enviar SOLO notasaga al backend
  try {
    const response = await fetch(`http://192.168.0.38:3000/personajes/${personaje.idpersonaje}/notasaga`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notasaga: nuevasNotas }),
    });

    if (response.ok) {
      console.log("Notasaga actualizada con éxito");

      
    } else {
      const err = await response.text();
      console.error("Error al actualizar notasaga:", err);
    }
  } catch (error) {
    console.error("Error de red:", error);
  }
};



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

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 }}>
                  {personajesSaga.map((pj) => (
                    <TouchableOpacity
                      key={pj.idpersonaje}
                      onPress={() => abrirNotasPersonaje(pj)}
                    >
                      <Image
                        source={pj.imagenurl ? { uri: pj.imagenurl } : imagenBase}
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 25,
                          marginRight: 8,
                          marginBottom: 8,
                          borderWidth: 1,
                          borderColor: '#fff',
                        }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                {sagaSeleccionada.imagenurl && (
                  <Image source={{ uri: sagaSeleccionada.imagenurl }} style={styles.image} />
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
                  onChangeText={(text) => handleInputChange('presentacion', text)}
                />

                <>
                  <TouchableOpacity
                    onPress={() => setMostrarSelector(!mostrarSelector)}
                    style={[styles.button, { marginVertical: 10 }]}
                  >
                    <Text style={styles.buttonText}>Sumarse a saga</Text>
                  </TouchableOpacity>

                  {mostrarSelector && (
                    <View style={{ marginBottom: 15 }}>
                      {personajes?.map((pj) => {
                        const yaEstaEnSaga = sagaSeleccionada.personajes?.includes(
                          pj.idpersonaje
                        );
                        return (
                          <TouchableOpacity
                            key={pj.idpersonaje}
                            onPress={() => {
                              if (!yaEstaEnSaga) {
                                setPersonajeSeleccionado(pj.idpersonaje);
                              }
                            }}
                            style={{
                              backgroundColor:
                                personajeSeleccionado === pj.idpersonaje
                                  ? '#444'
                                  : yaEstaEnSaga
                                  ? '#666'
                                  : '#222',
                              padding: 10,
                              borderRadius: 5,
                              marginBottom: 5,
                            }}
                          >
                            <Text
                              style={{
                                color: yaEstaEnSaga ? '#aaa' : '#fff',
                              }}
                            >
                              {pj.nombre}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}

                      {personajeSeleccionado && (
                        <TouchableOpacity
                          onPress={agregarPersonajeASaga}
                          style={[styles.button, { backgroundColor: '#28a745', marginTop: 10 }]}
                        >
                          <Text style={styles.buttonText}>Confirmar</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </>
              </>
            ) : (
              <>
                <Text style={styles.title}>{sagaSeleccionada.titulo}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 }}>
                  {personajesSaga.map((pj) => (
                    <TouchableOpacity
                      key={pj.idpersonaje}
                      onPress={() => abrirNotasPersonaje(pj)}
                    >
                      <Image
                        source={pj.imagenurl ? { uri: pj.imagenurl } : imagenBase}
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 25,
                          marginRight: 8,
                          marginBottom: 8,
                          borderWidth: 1,
                          borderColor: '#fff',
                        }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                {sagaSeleccionada.imagenurl && (
                  <Image source={{ uri: sagaSeleccionada.imagenurl }} style={styles.image} />
                )}
                <Text style={styles.description}>{sagaSeleccionada.presentacion}</Text>

                <>
                  <TouchableOpacity
                    onPress={() => setMostrarSelector(!mostrarSelector)}
                    style={[styles.button, { marginVertical: 10 }]}
                  >
                    <Text style={styles.buttonText}>Sumarse a saga</Text>
                  </TouchableOpacity>

                  {mostrarSelector && (
                    <View style={{ marginBottom: 15 }}>
                      {personajes?.map((pj) => {
                        const yaEstaEnSaga = sagaSeleccionada.personajes?.includes(
                          pj.idpersonaje
                        );
                        return (
                          <TouchableOpacity
                            key={pj.idpersonaje}
                            onPress={() => {
                              if (!yaEstaEnSaga) {
                                setPersonajeSeleccionado(pj.idpersonaje);
                              }
                            }}
                            style={{
                              backgroundColor:
                                personajeSeleccionado === pj.idpersonaje
                                  ? '#444'
                                  : yaEstaEnSaga
                                  ? '#666'
                                  : '#222',
                              padding: 10,
                              borderRadius: 5,
                              marginBottom: 5,
                            }}
                          >
                            <Text
                              style={{
                                color: yaEstaEnSaga ? '#aaa' : '#fff',
                              }}
                            >
                              {pj.nombre}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}

                      {personajeSeleccionado && (
                        <TouchableOpacity
                          onPress={agregarPersonajeASaga}
                          style={[styles.button, { backgroundColor: '#28a745', marginTop: 10 }]}
                        >
                          <Text style={styles.buttonText}>Confirmar</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </>
              </>
            )}
            <Text style={styles.sectionTitle}>Secciones</Text>
            {cargandoSecciones && <Text style={styles.text}>Cargando secciones...</Text>}
          </>
        }
        data={secciones}
        keyExtractor={(item, index) => item.idseccion?.toString() || `temp-${index}`}
        renderItem={renderSeccion}
        ListEmptyComponent={
          !cargandoSecciones && <Text style={styles.text}>No hay secciones disponibles.</Text>
        }
        contentContainerStyle={styles.container}
      />

<Modal
  visible={modalVisible}
  animationType="slide"
  transparent={true}
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalBackgroundFull}>
    <ScrollView contentContainerStyle={styles.modalContainerFull}>
      <Text style={styles.modalTitle}>
        Notas de {personajeSeleccionadoModal?.nombre || 'personaje'}
      </Text>

      {personajeSeleccionadoModal?.imagenurl && (
        <Image
          source={{ uri: personajeSeleccionadoModal.imagenurl }}
          style={styles.personajeImagenFull}
          resizeMode="cover"
        />
      )}

      <View style={styles.datosContainer}>
        <Text style={styles.datoText}>
          <Text style={{ fontWeight: 'bold' }}>Dominio: </Text>
          {personajeSeleccionadoModal?.dominio || 'No definido'}
        </Text>
        <Text style={styles.datoText}>
          <Text style={{ fontWeight: 'bold' }}>Naturaleza: </Text>
          {personajeSeleccionadoModal?.naturaleza || 'No definida'}
        </Text>
      </View>

      {console.log('Modal render - puedeEditarNotas:', puedeEditarNotas(personajeSeleccionadoModal), 'notasEditables:', notasEditables)}

      {puedeEditarNotas(personajeSeleccionadoModal) ? (
        <>
          {notasEditables.map((nota, index) => (
            <TextInput
              key={index}
              style={{
                backgroundColor: '#222',
                color: '#fff',
                padding: 10,
                borderRadius: 6,
                marginBottom: 10,
                minHeight: 60,
                borderWidth: 1,
                borderColor: '#555',
              }}
              multiline
              value={nota.nota}
              onChangeText={(text) => {
                const nuevasNotas = [...notasEditables];
                nuevasNotas[index].nota = text;
                setNotasEditables(nuevasNotas);
              }}
            />
          ))}

         <TouchableOpacity
              style={{
                backgroundColor: '#4caf50',
                padding: 12,
                borderRadius: 8,
                alignItems: 'center',
                marginTop: 10,
              }}
              onPress={() => {
                console.log("Notas guardadas:", notasEditables);
                setNotasSeleccionadas(notasEditables);
                setModalVisible(false);

                // Llama a la función externa
               guardarNotaSaga(notasEditables, personajeSeleccionadoModal, savePersonajes,savePersonajeUno);
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Guardar cambios</Text>
            </TouchableOpacity>
        </>
      ) : (
        <>
          {notasSeleccionadas.length > 0 ? (
            notasSeleccionadas.map((nota, index) => (
              <Text key={index} style={styles.modalText}>
                {nota.nota}
              </Text>
            ))
          ) : (
            <Text style={styles.modalText}>No hay notas para esta saga.</Text>
          )}
        </>
      )}
    </ScrollView>
  </View>
</Modal>

      {esNarrador && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
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

          <TouchableOpacity style={[styles.button, { backgroundColor: '#28a745' }]} onPress={actualizarSaga}>
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
  modalBackgroundFull: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  modalContainerFull: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#111',
    minHeight: '100%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  personajeImagenFull: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 15,
  },
  datosContainer: {
    marginBottom: 15,
  },
  datoText: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 5,
  },
  modalText: {
    color: '#ddd',
    fontSize: 16,
    marginBottom: 12,
  },
});
