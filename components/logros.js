// Logros.js
import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import { showMessage } from 'react-native-flash-message';
import { API_BASE_URL } from './config';
import { TouchableWithoutFeedback, Keyboard } from 'react-native';

import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Animated,
  Platform,
  Dimensions,
  SectionList,
  FlatList,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';

const imagenBase = require('../assets/imagenBase.jpeg');

export const Logros = () => {
  const [logros, setLogros] = useState([]);
  const { userToken,coleccionPersonajes,estatus } = useContext(AuthContext);

  // nuevos estados para el insert
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [descripcionNueva, setDescripcionNueva] = useState('');
  const [loadingInsert, setLoadingInsert] = useState(false);

  const [categoriaNueva, setCategoriaNueva] = useState('');
  const [nivel, setNivel] = useState('');
  const [imagen, setImagen] = useState(null);
  const [imagenUrl, setImagenUrl] = useState(Image.resolveAssetSource(imagenBase).uri); // para previsualizar

  const [modalVisible, setModalVisible] = useState(false);



  const [modalVerVisible, setModalVerVisible] = useState(false);
const [logroSeleccionado, setLogroSeleccionado] = useState(null);


const [busquedaPersonaje, setBusquedaPersonaje] = useState('');
const [resultadosPersonajes, setResultadosPersonajes] = useState([]);
const [personajesids, setPersonajesids] = useState([]);

useEffect(() => {
  if (!busquedaPersonaje.trim()) {
    setResultadosPersonajes([]);
    return;
  }

  const filtrados = coleccionPersonajes.filter(p =>
    p.nombre.toLowerCase().includes(busquedaPersonaje.toLowerCase())
  );
  setResultadosPersonajes(filtrados);
}, [busquedaPersonaje, coleccionPersonajes]);


  // Animated value for fade
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  const [loading, setLoading] = useState(false); // <-- nuevo estado

const consumirLogros = async () => {
  if (!userToken) return;
  setLoading(true); // <-- mostrar spinner
  try {
    const response = await axios.get(`${API_BASE_URL}/consumirLogros`, {
      headers: { 'Content-Type': 'application/json' },
    });

    const { logrosConsumidos } = response.data;

    if (!Array.isArray(logrosConsumidos)) {
      console.error('El formato de datos no es un array/ aca esta el error.');
      setLogros([]);
      return;
    }

    setLogros(logrosConsumidos);
  } catch (error) {
    console.error('Cliente: Fallo al consumir logros', error.message);
    setLogros([]);
  } finally {
    setLoading(false); // <-- ocultar spinner
  }
};

  useEffect(() => {
    consumirLogros();
  }, []);

  // Animaciones del modal
  const openModal = () => {
    
    
    setPersonajesids([]);
setBusquedaPersonaje('');
setResultadosPersonajes([]);
    // reset preview image if needed




    setImagenUrl(Image.resolveAssetSource(imagenBase).uri);
    setImagen(null);
    setNombreNuevo('');
    setDescripcionNueva('');
    setCategoriaNueva('');
    setNivel('');
    setModalVisible(true);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  // FUNCION PARA INSERTAR
  const insertarLogro = async () => {
    if (!nombreNuevo.trim()) {
      showMessage({ message: 'El nombre es requerido', type: 'danger' });
      return;
    }

    setLoadingInsert(true);

    try {
      const nuevoLogro = {
        nombre: nombreNuevo.trim(),
        descripcion: descripcionNueva.trim(),
        categoria: categoriaNueva,
        nivel: nivel,
        imagen: imagen,
        personajesids: personajesids, 
      };

      const headers = {
        'Content-Type': 'application/json',
      };

      if (userToken) headers.Authorization = `Bearer ${userToken}`;

      const res = await axios.post(`${API_BASE_URL}/insertarLogro`, nuevoLogro, { headers });

      // suponer que el endpoint devuelve el logro insertado en res.data.logro
      const nuevo = res.data?.logro ?? null;

      if (nuevo) {
        setLogros(prev => [nuevo, ...prev]); // agregar arriba
        setNombreNuevo('');
        setDescripcionNueva('');
        showMessage({ message: 'Logro creado', type: 'success' });
        // cerrar modal después de success
        closeModal();
      } else {
        // si no devuelve el objeto, refrescar la lista
        await consumirLogros();
        showMessage({ message: 'Logro guardado', type: 'success' });
        closeModal();
      }
    } catch (error) {
      console.error('Error al insertar logro', error);
      showMessage({ message: 'Error al guardar logro', type: 'danger' });
    } finally {
      setLoadingInsert(false);
    }
  };

  const abrirGaleria = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.6,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      const base64Img = `data:image/jpeg;base64,${asset.base64}`;
      setImagen(base64Img);
      setImagenUrl(base64Img);
    } else {
      setImagen(null);
      setImagenUrl(Image.resolveAssetSource(imagenBase).uri);
    }
  };

// Dentro de Logros.js, antes del return:
const eliminarLogro = async (id) => {
  // Confirmación
  const confirm = window.confirm
    ? window.confirm('¿Seguro que quieres eliminar este logro?')
    : true; // para dispositivos móviles donde window.confirm no existe, podrías usar un Alert

  if (!confirm) return;

  try {
    // Llamada al backend sin token
    await axios.delete(`${API_BASE_URL}/eliminarLogro/${id}`);

    // Actualizar estado local
    setLogros((prev) => prev.filter((l) => l.id !== id));

    // Cerrar modal
    setModalVerVisible(false);

    showMessage({ message: 'Logro eliminado', type: 'success' });
  } catch (error) {
    console.error('Error al eliminar logro:', error);
    showMessage({ message: 'No se pudo eliminar el logro', type: 'danger' });
  }
};

// Ordenar logros por categoría alfabéticamente sin cambiar el diseño
const logrosOrdenados = Array.isArray(logros)
  ? [...logros].sort((a, b) => {
      if (!a.categoria) return 1;
      if (!b.categoria) return -1;
      return a.categoria.localeCompare(b.categoria);
    })
  : [];


  // reemplazar el bloque que renderiza la lista con ScrollViews anidados
// por este SectionList + FlatList para mejor virtualización:
const groupedObj = logrosOrdenados.reduce((acc, logro) => {
  const rawCat = logro.categoria || 'Sin categoría';
  const catKey = rawCat.toLowerCase();
  if (!acc[catKey]) {
    acc[catKey] = {
      displayName:
        rawCat.charAt(0).toUpperCase() + rawCat.slice(1).toLowerCase(),
      items: [],
    };
  }
  acc[catKey].items.push(logro);
  return acc;
}, {});

const sections = Object.keys(groupedObj).map(catKey => ({
  title: groupedObj[catKey].displayName,
  data: [ groupedObj[catKey].items.sort((a,b) => (b.nivel||0)-(a.nivel||0)) ] // cada section contiene 1 elemento: el array de items
}));


 return (
  <>
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => (item.id || item.nombre || index).toString()}
        renderSectionHeader={({ section: { title } }) => (
          <View style={{ paddingHorizontal: 12, paddingTop: 6 }}>
            <Text
              style={{
                marginTop: 6,
                marginBottom: 12,
                fontSize: 16,
                color: '#fff',
                backgroundColor: '#6c63ff',
                alignSelf: 'flex-start',
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 6,
                overflow: 'hidden',
              }}
            >
              {title}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <FlatList
            data={item}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(logro) => (logro.id || logro.nombre || Math.random()).toString()}
            renderItem={({ item: logro }) => (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setLogroSeleccionado(logro);
                  setModalVerVisible(true);
                }}
                style={{
                  backgroundColor: '#1b1d23',
                  marginRight: 12,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: 'gray',
                  overflow: 'hidden',
                  width: 250,
                }}
              >
                <Image
                  source={{ uri: logro.imagenurl || Image.resolveAssetSource(imagenBase).uri }}
                  style={{ width: '100%', height: 120, resizeMode: 'cover' }}
                />

                <View style={{ padding: 12 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#ffd343ff' }}>
                    {logro.nombre}
                  </Text>
                  {logro.descripcion ? (
                    <Text style={{ fontSize: 13, color: '#c4c4c4', marginTop: 4 }} numberOfLines={3}>
                      {logro.descripcion}
                    </Text>
                  ) : null}

                  {Array.isArray(logro.personajesids) && logro.personajesids.length > 0 && (
                    <View style={{ marginTop: 10 }}>
                      <Text style={{ color: '#889de0ff', marginBottom: 6 }}>Protagonistas:</Text>

                      {/* Scroll horizontal con alineación consistente */}
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: 4,
                        }}
                      >
                        {logro.personajesids.map((idPers) => {
                          const personaje = coleccionPersonajes.find((p) => p.idpersonaje === idPers);
                          if (!personaje) return null;
                          return (
                            <View
                              key={personaje.idpersonaje}
                              style={{
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 10,
                                width: 70,
                              }}
                            >
                              <Image
                                source={{
                                  uri: personaje.imagenurl || Image.resolveAssetSource(imagenBase).uri,
                                }}
                                style={{
                                  width: 45,
                                  height: 45,
                                  borderRadius: 25,
                                  borderWidth: 2,
                                  borderColor: '#6c63ff',
                                }}
                              />
                              <Text
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                style={{
                                  color: 'aliceblue',
                                  fontSize: 11,
                                  marginTop: 4,
                                  textAlign: 'center',
                                  width: 68,
                                }}
                              >
                                {personaje.nombre.length > 12
                                  ? personaje.nombre.slice(0, 12) + '...'
                                  : personaje.nombre}
                              </Text>
                            </View>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        )}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 6 }}
       ListEmptyComponent={() => (
  <View style={{ padding: 12, alignItems: 'center', justifyContent: 'center' }}>
    {loading ? (
      <ActivityIndicator size="large" color="#6c63ff" />
    ) : (
      <Text style={{ color: '#ccc', textAlign: 'center', marginTop: 20 }}>
        No hay logros cargados todavía...
      </Text>
    )}
  </View>
)}
        stickySectionHeadersEnabled={false}
      />

      {estatus == 'narrador' ? (
        <TouchableOpacity style={styles.fab} onPress={openModal} activeOpacity={0.85}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      ) : null}

      {/* Modal para crear logro */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
             <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <View style={[styles.modalContainer, { maxHeight: windowHeight * 0.92 }]}>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {nombreNuevo ? nombreNuevo : 'Nuevo logro'}
                </Text>
                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.form}>
                <TextInput
                  placeholder="Nombre del logro"
                  placeholderTextColor="#888"
                  value={nombreNuevo}
                  onChangeText={setNombreNuevo}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Descripción (opcional)"
                  placeholderTextColor="#888"
                  value={descripcionNueva}
                  onChangeText={setDescripcionNueva}
                  style={[styles.input, { height: 80 }]}
                  multiline
                />

                {personajesids.length > 0 && (
                  <ScrollView horizontal style={{ marginVertical: 6 }}>
                    {personajesids.map((id) => {
                      const p = coleccionPersonajes.find(
                        (x) => x.idpersonaje === id
                      );
                      if (!p) return null;

                      return (
                        <View
                          key={p.idpersonaje}
                          style={{ alignItems: 'center', marginRight: 8, width: 60 }}
                        >
                          <Image
                            source={{
                              uri:
                                p.imagenurl ||
                                Image.resolveAssetSource(imagenBase).uri,
                            }}
                            style={{ width: 40, height: 40, borderRadius: 20 }}
                          />
                          <Text
                            style={{
                              color: '#fff',
                              fontSize: 10,
                              textAlign: 'center',
                              flexWrap: 'wrap',
                            }}
                          >
                            {p.nombre}
                          </Text>

                          <TouchableOpacity
                            onPress={() =>
                              setPersonajesids((prev) =>
                                prev.filter((pid) => pid !== p.idpersonaje)
                              )
                            }
                          >
                            <Text style={{ color: 'red', fontSize: 14 }}>X</Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </ScrollView>
                )}

                <TextInput
                  placeholder="Buscar personaje..."
                  placeholderTextColor="#888"
                  value={busquedaPersonaje}
                  onChangeText={setBusquedaPersonaje}
                  style={styles.input}
                />

                <ScrollView style={{ maxHeight: 285, marginTop: 6 }}>
                  {resultadosPersonajes.slice(0, 5).map((p) => (
                    <TouchableOpacity
                      key={p.idpersonaje}
                      onPress={() => {
                        if (!personajesids.includes(p.idpersonaje)) {
                          setPersonajesids((prev) => [...prev, p.idpersonaje]);
                        }
                        setBusquedaPersonaje('');
                        setResultadosPersonajes([]);
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 6,
                        marginVertical: 2,
                        borderRadius: 6,
                        backgroundColor: personajesids.includes(p.idpersonaje)
                          ? '#28a745'
                          : '#222',
                      }}
                    >
                      <Image
                        source={{
                          uri:
                            p.imagenurl ||
                            Image.resolveAssetSource(imagenBase).uri,
                        }}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          marginRight: 8,
                        }}
                      />
                      <Text style={{ color: '#fff', fontWeight: '600' }}>
                        {p.nombre}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  {busquedaPersonaje && resultadosPersonajes.length === 0 && (
                    <Text
                      style={{
                        color: '#888',
                        fontStyle: 'italic',
                        marginTop: 6,
                      }}
                    >
                      No se encontraron personajes
                    </Text>
                  )}
                </ScrollView>

                <TextInput
                  placeholder="Categoría"
                  placeholderTextColor="#888"
                  value={categoriaNueva}
                  onChangeText={setCategoriaNueva}
                  style={styles.input}
                />

                <TextInput
                  placeholder="Nivel"
                  placeholderTextColor="#888"
                  value={nivel}
                  onChangeText={setNivel}
                  keyboardType="default"
                  style={styles.input}
                />

                <View style={styles.cargarImagen}>
                  <Text style={styles.subtitulo}>
                    {nombreNuevo || 'Nuevo logro'}
                  </Text>
                  <Image
                    source={{
                      uri:
                        imagenUrl ||
                        Image.resolveAssetSource(imagenBase).uri,
                    }}
                    style={styles.imagenCargar}
                  />

                  <View style={{ alignItems: 'center', marginTop: 8 }}>
                    <TouchableOpacity
                      style={styles.boton}
                      onPress={abrirGaleria}
                    >
                      <Text style={styles.botonTexto}>Seleccionar imagen</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    onPress={closeModal}
                    style={[styles.button, styles.cancelButton]}
                    disabled={loadingInsert}
                  >
                    <Text style={[styles.buttonText, { color: '#fff' }]}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={insertarLogro}
                    style={[styles.button, styles.saveButton]}
                    disabled={loadingInsert}
                  >
                    {loadingInsert ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Guardar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </Animated.View>
        </TouchableWithoutFeedback>
        
      </Modal>

   <Modal
  visible={modalVerVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setModalVerVisible(false)}
>
  <TouchableWithoutFeedback onPress={() => setModalVerVisible(false)}>
    <View style={styles.modalOverlay}>
      <TouchableWithoutFeedback>
        <View
          style={[
            styles.modalContainer,
            {
              maxHeight: windowHeight * 0.95,
              paddingBottom: 12,
            },
          ]}
        >
          {logroSeleccionado && (
            <ScrollView
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{
                paddingBottom: 40,
              }}
            >
              {/* ENCABEZADO */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{logroSeleccionado.nombre}</Text>
                <TouchableOpacity
                  onPress={() => setModalVerVisible(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>x</Text>
                </TouchableOpacity>
              </View>

              {/* IMAGEN PRINCIPAL */}
              <Image
                source={{
                  uri:
                    logroSeleccionado.imagenurl ||
                    Image.resolveAssetSource(imagenBase).uri,
                }}
                style={{
                  width: '100%',
                  height: 260,
                  borderRadius: 8,
                  marginBottom: 12,
                }}
              />

              {/* DESCRIPCIÓN */}
              <Text style={{ color: '#ddd', fontSize: 15, marginBottom: 10 }}>
                {logroSeleccionado.descripcion || 'Sin descripción'}
              </Text>

              <Text style={{ color: '#6c63ff', marginBottom: 8 }}>
                Categoría: {logroSeleccionado.categoria || 'N/A'}
              </Text>
              <Text style={{ color: '#bbb', marginBottom: 15 }}>
                Nivel: {logroSeleccionado.nivel || 'N/A'}
              </Text>

              {/* PERSONAJES EN FILA */}
              {Array.isArray(logroSeleccionado.personajesids) &&
                logroSeleccionado.personajesids.length > 0 && (
                  <>
                    <Text
                      style={{
                        color: '#ffd343ff',
                        marginBottom: 6,
                      }}
                    >
                      Protagonistas:
                    </Text>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 4,
                      }}
                    >
                      {logroSeleccionado.personajesids.map((idPers) => {
                        const personaje = coleccionPersonajes.find(
                          (p) => p.idpersonaje === idPers
                        );
                        if (!personaje) return null;

                        return (
                          <View
                            key={idPers}
                            style={{
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 12,
                              width: 70,
                            }}
                          >
                            <Image
                              source={{
                                uri:
                                  personaje.imagenurl ||
                                  Image.resolveAssetSource(imagenBase).uri,
                              }}
                              style={{
                                width: 50,
                                height: 50,
                                borderRadius: 25,
                                borderWidth: 2,
                                borderColor: '#6c63ff',
                              }}
                            />
                            <Text
                              style={{
                                color: '#fff',
                                fontSize: 10,
                                textAlign: 'center',
                                marginTop: 3,
                                lineHeight: 12,
                              }}
                              numberOfLines={2}
                            >
                              {personaje.nombre}
                            </Text>
                          </View>
                        );
                      })}
                    </ScrollView>
                  </>
                )}

              {/* BOTONES PARA NARRADOR */}
              {estatus === 'narrador' && (
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: 20,
                    justifyContent: 'center',
                  }}
                >
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#00ccffc2' }]}
                    onPress={() => {
                      // función futura editar
                    }}
                  >
                    <Text style={styles.buttonText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.button,
                      { backgroundColor: '#ff4444b2', marginLeft: 8 },
                    ]}
                    onPress={() => eliminarLogro(logroSeleccionado.id)}
                  >
                    <Text style={styles.buttonText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </TouchableWithoutFeedback>
    </View>
  </TouchableWithoutFeedback>
</Modal>
    </View>
  </>
);
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    padding: 10,
    flex: 1,
  },
  form: {
    width: '100%',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#222',
    color: 'white',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    textAlignVertical: 'top', // asegura que el texto comience arriba
  },
  button: {
    backgroundColor: '#1e90ff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  logroItem: {
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  logroTitulo: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  logroDesc: {
    color: '#ccc',
    marginTop: 6,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitulo: {
    fontSize: 18,
    color: 'yellow',
    fontStyle: 'italic',
    marginTop: 10,
    marginBottom: 5,
  },
  boton: {
    backgroundColor: '#444',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  botonTexto: {
    color: 'white',
    fontWeight: 'bold',
  },
  imagen: {
    width: 150,
    height: 150,
    marginTop: 10,
    borderRadius: 25,
  },
  imagenCargar: {
    width: 220,
    height: 220,
    marginTop: 10,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 16,
  },
  objetoCard: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 8,
    paddingBottom: 0,
    marginVertical: 6,
    borderWidth: 0.2,
  },
  objetoNombre: {
    fontSize: 17,
    color: 'white',
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  objetoDetalle: {
    fontSize: 14,
    color: '#ccc',
  },
  botonGuardar: {
    marginBottom: 30,
    backgroundColor: '#28a745',
  },
  objetoFila: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  objetoImagenMini: {
    width: 65,
    height: 65,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'yellow',
  },
  objetoImagenExpandida: {
    width: '100%',
    height: 260,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: 'gray',
  },
  cargarObjeto: {
    borderWidth: 1,
    borderColor: 'cyan',
    padding: 10,
    borderRadius: 10,
    marginTop: 30,
    backgroundColor: '#111',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  cargarImagen: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  objetoDetalle: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 3,
  },
  label: {
    color: '#D4AF37',
    fontWeight: 'bold',
  },

 fab: {
  position: 'absolute',
  bottom: 85, // ← Subido para que no quede tan abajo
  right: 22,
  backgroundColor: '#6c63ff',
  width: 65,
  height: 65,
  borderRadius: 35,
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.35,
  shadowRadius: 6,
  elevation: 10,
  borderWidth: 2,
  borderColor: '#a29bfe',
},

fabText: {
  color: '#fff',
  fontSize: 34,
  fontWeight: 'bold',
  marginTop: -2,
},

  // Modal
 modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.85)',
  justifyContent: 'center',
  padding: 12,
},

modalContainer: {
  backgroundColor: '#1f232e',
  borderRadius: 14,
  padding: 16,
  borderWidth: 1,
  borderColor: '#32384a',
  width: '100%',
  alignSelf: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.5,
  shadowRadius: 12,
  elevation: 12,
},

modalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
  borderBottomWidth: 1,
  borderBottomColor: '#333',
  paddingBottom: 6,
},

modalTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#f8f8f8',
},

closeButton: {
  backgroundColor: '#ff4747',
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 6,
},

closeButtonText: {
  color: '#fff',
  fontWeight: 'bold',
  opacity:0.65,
},

input: {
  backgroundColor: '#2a2f3a',
  color: '#fff',
  padding: 10,
  borderRadius: 6,
  borderWidth: 1,
  borderColor: '#3b4252',
  marginBottom: 10,
},

actionsRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 15,
},

button: {
  flex: 1,
  paddingVertical: 10,
  marginHorizontal: 6,
  borderRadius: 6,
  alignItems: 'center',
},

cancelButton: {
  backgroundColor: '#444',
},

saveButton: {
  backgroundColor: '#6c63ff',
},

buttonText: {
  color: '#fff',
  fontWeight: 'bold',
},

modalScroll: {
  paddingBottom: 20,
},

cargarImagen: {
  marginTop: 15,
  alignItems: 'center',
  backgroundColor: '#2a2f3a',
  padding: 12,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#3b4252',
},

imagenCargar: {
  width: 120,
  height: 120,
  borderRadius: 12,
  borderWidth: 2,
  borderColor: '#040313ff',
  marginTop: 10,
},

boton: {
  backgroundColor: '#6c63ff',
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 6,
},

botonTexto: {
  color: '#fff',
  fontWeight: '500',
},
});



