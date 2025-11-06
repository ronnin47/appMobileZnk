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
  ImageBackground,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL } from './config';








export const Sagas = () => {
  const route = useRoute();
  const { sagas, estatus, fetchSagas, coleccionPersonajes,saveColeccionPersonajes, personajes,userToken,savePersonajes,savePersonajeUno } = useContext(AuthContext);
  
  
  
useEffect(() => {
  
}, [coleccionPersonajes]);
  const { sagaId } = route.params;
  const [sagaSeleccionada, setSagaSeleccionada] = useState(null);
  const [secciones, setSecciones] = useState([]);
  const [cargandoSecciones, setCargandoSecciones] = useState(true);
  const [notasEditables, setNotasEditables] = useState([]);
  const esNarrador = estatus === 'narrador';

const puedeEditarNotas = (personaje) => {
   if (!personaje) {
    console.log("Personaje es null o undefined");
    return false;
  }
 // console.log("Personaje id usuario ",typeof personaje.usuarioId)
  // Extraigo el número del userToken, asumiendo formato "usuario-1"
  const userIdNumber = userToken?.split('-')[1]; // "1"
  //console.log("puedeEditarNotas:", personaje?.usuarioId, userIdNumber, personaje?.usuarioId == userIdNumber);
  return personaje?.usuarioId == userIdNumber; // == para permitir comparación string/número
};

  const imagenBase = require('../assets/imagenBase.jpeg');
  const [mostrarSelector, setMostrarSelector] = useState(false);
  const [personajeSeleccionado, setPersonajeSeleccionado] = useState(null);
  // Estados para mostrar notas en modal
  const [modalVisible, setModalVisible] = useState(false);
  const [notasSeleccionadas, setNotasSeleccionadas] = useState([]);
  const [personajeSeleccionadoModal, setPersonajeSeleccionadoModal] = useState(null);


  const [busqueda, setBusqueda] = useState('');

/*
  useEffect(() => {
  if (sagaSeleccionada?.personajes) {
    console.log("🆕 Cambiaron los personajes de la saga:");
    console.log("➡️ Nuevos IDs:", sagaSeleccionada.personajes);
  }
}, [sagaSeleccionada?.personajes]);
*/

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
      await axios.put(`${API_BASE_URL}/agregarPersonajeSaga/${sagaSeleccionada.idsaga}`, {
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
          `${API_BASE_URL}/consumirSecciones?idsaga=${sagaId}`
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
        `${API_BASE_URL}/updateSagaCompleta/${sagaSeleccionada.idsaga}`,
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
    <View style={styles.imageContainer}>
      {item.imagenurl && (
        <Image source={{ uri: item.imagenurl }} style={styles.sectionImage} />
      )}

      {esNarrador && (
        <TouchableOpacity
          style={styles.overlayButton}
          onPress={() => seleccionarImagenSeccion(index)}
        >
          <Text style={styles.imageButtonText}>
            {item.imagenurl ? 'Cambiar Imagen' : 'Agregar Imagen'}
          </Text>
        </TouchableOpacity>
      )}
    </View>

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


const eliminarPersonajeDeSaga = async (idpersonaje) => {
  if (!sagaSeleccionada) return;

  try {
    // Filtrar los personajes dejando fuera el que querés eliminar
    const nuevosPersonajes = sagaSeleccionada.personajes.filter(
      (id) => id !== idpersonaje
    );

    // Enviar actualización al backend
    await axios.put(`${API_BASE_URL}/eliminarPersonajeSaga/${sagaSeleccionada.idsaga}`, {
      personajes: nuevosPersonajes,
    });

    // Actualizar localmente
    setSagaSeleccionada((prev) => ({
      ...prev,
      personajes: nuevosPersonajes,
    }));

   

     setTimeout(() => {
        showMessage({
          message: 'Personaje eliminado de la Saga',
          description: 'Tus datos de Saga se han actualizado correctamente.',
          type: 'success',
          icon: 'success',
          duration: 3000,
        });
      }, 500);

    fetchSagas();
  } catch (error) {
    console.error('Error al eliminar personaje de saga:', error.message);
    showMessage({
      message: 'Error al eliminar personaje',
      description: error.message,
      type: 'danger',
    });


  }
};



if (!sagaSeleccionada) {
  return (
    <View style={styles.center}>
      <Text style={styles.text}>Cargando saga...</Text>
    </View>
  );
}


  const personajesSaga = coleccionPersonajes
    .filter((pj) => sagaSeleccionada.personajes?.includes(pj.idpersonaje))
    .sort((a, b) => {
      return a.idpersonaje - b.idpersonaje;
    });

const guardarNotaSaga = async (notasEditables, personaje, savePersonajes,savePersonajeUno) => {


      //console.log("entra en guardar nota")
      //console.log("guardarNotaSaga llamada", { notasEditables, personaje });
      
    if (!personaje || !notasEditables || notasEditables.length === 0) {
      console.log("NO ENTRA: personaje o notasEditables inválidos", { personaje, notasEditables });
      return;
    }

      const notaEditada = notasEditables[0];
      //const nuevasNotas = personaje.notasaga ? [...personaje.notasaga] : [];
      const nuevasNotas = Array.isArray(personaje.notasaga) ? [...personaje.notasaga] : [];
      

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



      // Actualizar la colección global de personajes con las nuevas notas
      const indexColeccion = coleccionPersonajes.findIndex(pj => pj.idpersonaje === personaje.idpersonaje);

      if (indexColeccion !== -1) {
        const nuevaColeccion = [...coleccionPersonajes];
        nuevaColeccion[indexColeccion] = {
          ...nuevaColeccion[indexColeccion],
          notasaga: nuevasNotas,
        };
        saveColeccionPersonajes(nuevaColeccion);
      }

      //CON saveColeccionPersonajes() guardo en el contexto, y tengoq eu guardar las notas dentro 
      //console.log("Enviando notasaga al backend:", nuevasNotas);
      // Enviar SOLO notasaga al backend
      try {
        const response = await fetch(`${API_BASE_URL}/personajes/${personaje.idpersonaje}/notasaga`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ notasaga: nuevasNotas }),
        });

        if (response.ok) {
          //console.log("Notasaga actualizada con éxito");

          
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
                
                {/*ACA LAS CARITAS DE LOS PERSONAJES */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap',    justifyContent: 'center', marginBottom: 5 }}>
                 {personajesSaga.map((pj) => {
  
                      return (
                         <View key={pj.idpersonaje} style={{ position: 'relative', marginRight: 8, marginBottom: 8 }}>
                          <TouchableOpacity onPress={() => abrirNotasPersonaje(pj)}>
                            <Image
                              source={pj.imagenurl ? { uri: pj.imagenurl } : imagenBase}
                              style={{
                                width: 50,
                                height: 50,
                                borderRadius: 25,
                                borderWidth: 1,
                                borderColor: '#fff',
                              }}
                            />
                          </TouchableOpacity>

                          {esNarrador && (
                            <TouchableOpacity
                              onPress={() =>
                                Alert.alert(
                                  'Confirmar eliminación',
                                  `¿Eliminar a ${pj.nombre} de esta saga?`,
                                  [
                                    { text: 'Cancelar', style: 'cancel' },
                                    {
                                      text: 'Eliminar',
                                      style: 'destructive',
                                      onPress: () => eliminarPersonajeDeSaga(pj.idpersonaje),
                                    },
                                  ]
                                )
                              }
                              style={{
                                position: 'absolute',
                                top: -5,
                                right: -5,
                                backgroundColor: 'rgba(255, 0, 0, 0.8)',
                                borderRadius: 10,
                                paddingHorizontal: 5,
                                paddingVertical: 1,
                              }}
                            >
                              <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>X</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                    
                    );
                    })}
                </View>
                

                 {/*ACA LA IMAGEN DE LA SAGA + EL BOTON DE CAMBIAR IMAGEN */}

                <View style={styles.imageContainer}>
                  {sagaSeleccionada.imagenurl && (
                    <Image source={{ uri: sagaSeleccionada.imagenurl }} style={styles.image} />
                  )}
                  <TouchableOpacity onPress={seleccionarImagen} style={styles.overlayButtonSaga}>
                    <Text style={styles.imageButtonTextSaga}>Cambiar Imagen</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.description}
                  value={sagaSeleccionada.presentacion}
                  multiline
                  onChangeText={(text) => handleInputChange('presentacion', text)}
                />

                <>
  <TouchableOpacity
  onPress={() => setMostrarSelector(!mostrarSelector)}
  activeOpacity={0.8}
  style={{
    alignSelf: 'flex-end', // o 'center' si lo querés centrado
    paddingVertical: 1,
    paddingHorizontal: 1,
    marginVertical: 1,
    borderRadius: 6,
    backgroundColor: 'transparent', // 🔥 sin fondo
  }}
>
  <Text style={styles.imageButtonTextSaga}>Sumar PJ a saga</Text>
</TouchableOpacity>

                {mostrarSelector && (
  <View
    style={{
      marginBottom: 15,
      backgroundColor: '#1a1a1a',
      borderRadius: 8,
      padding: 10,
      position: 'relative',
    }}
  >
    {/* ❌ Botón de cierre */}
    <TouchableOpacity
      onPress={() => setMostrarSelector(false)}
      style={{
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 10,
        padding: 4,
        
      }}
    >
      
      <Text style={{ color: 'red', fontSize: 18, fontWeight: 'bold', marginRight:4, }}>✕</Text>
    </TouchableOpacity>

    {/* 🔍 Buscador */}
    <TextInput
      placeholder="Buscar personaje..."
      placeholderTextColor="#777"
      style={{
        backgroundColor: '#2a2a2a',
        color: '#fff',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 10,
      }}
      value={busqueda}
      onChangeText={(text) => setBusqueda(text)}
    />

    {/* 🔁 Lista filtrada (solo si hay algo escrito) */}
    {busqueda.length > 0 && (
      <>
        {coleccionPersonajes
          ?.filter((pj) =>
            pj.nombre.toLowerCase().includes(busqueda.toLowerCase())
          )
          .slice(0, 5) // 👈 solo los primeros 5 resultados
          .map((pj) => {
            const yaEstaEnSaga = sagaSeleccionada.personajes?.includes(pj.idpersonaje);
            const seleccionado = personajeSeleccionado === pj.idpersonaje;

            return (
              <TouchableOpacity
                key={pj.idpersonaje}
                disabled={yaEstaEnSaga}
                onPress={() => {
                  if (!yaEstaEnSaga) setPersonajeSeleccionado(pj.idpersonaje);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: yaEstaEnSaga
                    ? '#333'
                    : seleccionado
                    ? '#3b82f6'
                    : '#222',
                  padding: 8,
                  borderRadius: 6,
                  marginBottom: 6,
                }}
              >
                {/* 🧑 Imagen del personaje */}
                {pj.imagenurl ? (
                  <Image
                    source={{ uri: pj.imagenurl }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      marginRight: 10,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#555',
                      marginRight: 10,
                    }}
                  />
                )}

                <Text
                  style={{
                    color: yaEstaEnSaga ? '#aaa' : '#fff',
                    fontWeight: seleccionado ? 'bold' : 'normal',
                  }}
                >
                  {pj.nombre}
                  {yaEstaEnSaga ? ' (ya en saga)' : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
      </>
    )}

    {/* ✅ Botón de confirmación */}
    {personajeSeleccionado && (
      <TouchableOpacity
        onPress={agregarPersonajeASaga}
        style={[
          styles.button,
          { backgroundColor: '#28a745', marginTop: 10, borderRadius: 8 },
        ]}
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
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15, justifyContent:"center", }}>
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

                  <Image
                        source={
                          personajeSeleccionadoModal?.imagenurl
                            ? { uri: personajeSeleccionadoModal.imagenurl }
                            : imagenBase
                        }
                        style={styles.personajeImagenFull}
                        resizeMode="cover"
                      />

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
                        minHeight: 200,
                        borderWidth: 1,
                        borderColor: '#555',
                        textAlignVertical: 'top',
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
                        if (!notasEditables || notasEditables.length === 0) {
                          console.log("No hay notas editables para guardar");
                          return; // salir sin llamar a guardarNotaSaga
                        }
                        setNotasSeleccionadas(notasEditables);
                        setModalVisible(false); // mejor cerrar modal al guardar
                        guardarNotaSaga(notasEditables, personajeSeleccionadoModal, savePersonajes, savePersonajeUno);
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
    padding: 10,
  },
  center: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
  fontSize: 24,
  color: '#FFD700',
  fontWeight: 'bold',
  fontFamily: 'serif', // o 'sans-serif-light' si lo preferís más moderno
  marginBottom: 12,
  marginTop: 12,

  paddingVertical: 4,
  paddingHorizontal: 18,
  borderRadius: 10,
  textAlign: 'center',
  shadowColor: '#fff8dc',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.5,
  shadowRadius: 4,
  elevation: 4,
},
image: {
  width: '100%',
  height: 300,
  borderRadius: 12,              // 🔹 Bordes más suaves
  marginBottom: 12,
  marginTop: 4,
  borderWidth: 1.2,              // 🔹 Un poco más definido
  borderColor: 'rgba(255, 255, 255, 0.8)', // 🔹 Blanco sutil con transparencia
  shadowColor: '#000',           // 🔹 Sombra para resaltar sobre fondos claros
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 6,
  elevation: 5,                  // 🔹 Sombra en Android
},
  description: {
    fontSize: 14,
    color: '#ddd',
    marginBottom: 10,
    backgroundColor: '#111',
    padding: 10,
    borderRadius: 8,
  },
  text: {
    color: '#fff',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
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
    height: 280,
    borderRadius: 10,
    marginBottom: 4,
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
    marginBottom: 60,
  },
  button: {
    backgroundColor: '#B0C4DE',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 0.75,
    borderColor: '#FFF8E1', 
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 14,
    alignSelf: 'flex-start'
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
     color: '#FFA726',
    marginBottom: 15,
    textAlign: 'center',
  },
  personajeImagenFull: {
    width: '100%',
    height: 300,
    borderRadius: 5,
    marginBottom: 15,
     borderWidth: 0.7,           // grosor del borde
   borderColor: '#ffffff', 
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

  





 overlayButtonSaga: {
  position: 'absolute',
  bottom: 10,   // pegado abajo
 // left: 4,     
  paddingVertical: 8,
  paddingHorizontal: 6,
 
},
imageButtonTextSaga: {
  color: '#FFD700',
  fontSize: 12,
  fontWeight: 'bold',
  backgroundColor: 'rgba(0,0,0,0.6)',
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 4,
  borderWidth: 1,
  borderColor: '#FFD700',
},



 card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  sectionImage: {
    width: '100%',
    height: 180,
    borderRadius: 10,
  },
  overlayButton: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  overlayButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  inputTitle: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    fontSize: 16,
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },
  inputDesc: {
    backgroundColor: '#2a2a2a',
    color: '#ddd',
    fontSize: 14,
    borderRadius: 8,
    padding: 8,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  cardTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: '#ccc',
  },

    card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },

  imageContainer: {
    position: 'relative',
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },

  sectionImage: {
    width: '100%',
    height: 280,
    borderRadius: 10,
  },

  overlayButton: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
  },

  imageButtonText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  inputTitle: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    fontSize: 16,
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },

  inputDesc: {
    backgroundColor: '#2a2a2a',
    color: '#ddd',
    fontSize: 14,
    borderRadius: 8,
    padding: 8,
    minHeight: 60,
    textAlignVertical: 'top',
  },

  cardTitle: {
    fontSize: 18,
    color: '#f3eb77ff',
    fontWeight: 'bold',
    marginBottom: 6,
  },

  cardDescription: {
    fontSize: 14,
    color: '#ccc',
  },
});
