// Logros.js
import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import { showMessage } from 'react-native-flash-message';
import { API_BASE_URL } from './config';

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
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';

const imagenBase = require('../assets/imagenBase.jpeg');

export const Logros = () => {
  const [logros, setLogros] = useState([]);
  const { userToken,coleccionPersonajes } = useContext(AuthContext);

  // nuevos estados para el insert
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [descripcionNueva, setDescripcionNueva] = useState('');
  const [loadingInsert, setLoadingInsert] = useState(false);

  const [categoriaNueva, setCategoriaNueva] = useState('');
  const [nivel, setNivel] = useState('');
  const [imagen, setImagen] = useState(null);
  const [imagenUrl, setImagenUrl] = useState(Image.resolveAssetSource(imagenBase).uri); // para previsualizar

  const [modalVisible, setModalVisible] = useState(false);


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

  const consumirLogros = async () => {
    if (!userToken) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/consumirLogros`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const { logrosConsumidos } = response.data;

      if (!Array.isArray(logrosConsumidos)) {
        console.error('El formato de datos no es un array/ aca esta el error.');
        return;
      }

      setLogros(logrosConsumidos);
    } catch (error) {
      console.error('Cliente: Fallo al consumir logros', error.message);
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

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header / Título */}
        <Text style={styles.titulo}>Logros</Text>

       {/* Listado de logros */}
<ScrollView style={{ width: '100%' }} contentContainerStyle={{ padding: 16 }}>
  {logros.length > 0 ? (
    logros.map((logro, index) => (
      <View key={logro.id || index} style={styles.logroItem}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={{ uri: logro.imagen || logro.imagenurl || Image.resolveAssetSource(imagenBase).uri }}
            style={styles.objetoImagenMini}
          />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={styles.logroTitulo}>{logro.nombre}</Text>
            {logro.descripcion ? <Text style={styles.logroDesc}>{logro.descripcion}</Text> : null}
            {logro.categoria ? <Text style={[styles.label, { marginTop: 6 }]}>{logro.categoria}</Text> : null}





            {/* Personajes asociados */}
           {/* Personajes asociados */}
{logro.personajesids && logro.personajesids.length > 0 && (
  <ScrollView horizontal style={{ marginTop: 8 }}>
    {logro.personajesids.map((idPers) => {
      const personaje = coleccionPersonajes.find(p => p.idpersonaje === idPers);
      if (!personaje) return null;
      return (
        <View key={personaje.idpersonaje} style={{ alignItems: 'center', marginRight: 8 }}>
          <Image
            source={{ uri: personaje.imagenurl || Image.resolveAssetSource(imagenBase).uri }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
          <Text style={{ color: '#fff', fontSize: 12 }}>{personaje.nombre}</Text>
        </View>
      );
    })}
  </ScrollView>
)}
          </View>
        </View>
      </View>
    ))
  ) : (
    <View>
      <Text style={styles.noResultados}>Este será el nuevo componente de logros</Text>
    </View>
  )}
</ScrollView>
      </ScrollView>

      {/* Floating Button moderno para "Nuevo Logro" */}
      <TouchableOpacity style={styles.fab} onPress={openModal} activeOpacity={0.8}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal para crear logro */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none" // usamos Animated para el fade
        onRequestClose={closeModal}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <View style={[styles.modalContainer, { maxHeight: windowHeight * 0.92 }]}>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{nombreNuevo ? nombreNuevo : 'Nuevo logro'}</Text>
                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </View>

              {/* Formulario (igual que antes) */}
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
{/* Personajes seleccionados */}
{personajesids.length > 0 && (
  <ScrollView horizontal style={{ marginVertical: 6 }}>
    {personajesids.map((id) => {
      console.log("Id:",id)
      const p = coleccionPersonajes.find((x) => x.idpersonaje === id);
      if (!p) return null;
      return (
        <View key={p.idpersonaje} style={{ alignItems: 'center', marginRight: 8 }}>
          <Image
            source={{ uri: p.imagenurl || Image.resolveAssetSource(imagenBase).uri }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
          <Text style={{ color: '#fff', fontSize: 12 }}>{p.nombre}</Text>
          <TouchableOpacity
            onPress={() =>
              setPersonajesids(prev => prev.filter(pid => pid !== p.idpersonaje))
            }
          >
            <Text style={{ color: 'red', fontSize: 10 }}>X</Text>
          </TouchableOpacity>
        </View>
      );
    })}
  </ScrollView>
)}

{/* Buscador */}
<TextInput
  placeholder="Buscar personaje..."
  placeholderTextColor="#888"
  value={busquedaPersonaje}
  onChangeText={setBusquedaPersonaje}
  style={styles.input}
/>

<ScrollView style={{ maxHeight: 200, marginTop: 6 }}>
  {resultadosPersonajes.map((p) => (
    <TouchableOpacity
      key={p.idpersonaje}
      onPress={() => {
        if (!personajesids.includes(p.idpersonaje)) {
          setPersonajesids(prev => [...prev, p.idpersonaje]);
        }
        setBusquedaPersonaje('');       // limpia input
        setResultadosPersonajes([]);    // limpia resultados
      }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 6,
        marginVertical: 2,
        borderRadius: 6,
        backgroundColor: personajesids.includes(p.idpersonaje) ? '#28a745' : '#222',
      }}
    >
      <Image
        source={{ uri: p.imagenurl || Image.resolveAssetSource(imagenBase).uri }}
        style={{ width: 40, height: 40, borderRadius: 20, marginRight: 8 }}
      />
      <Text style={{ color: '#fff', fontWeight: '600' }}>{p.nombre}</Text>
    </TouchableOpacity>
  ))}

  {busquedaPersonaje && resultadosPersonajes.length === 0 && (
    <Text style={{ color: '#888', fontStyle: 'italic', marginTop: 6 }}>No se encontraron personajes</Text>
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
                  <Text style={styles.subtitulo}>{nombreNuevo || 'Nuevo logro'}</Text>
                  <Image
                    source={{ uri: imagenUrl || Image.resolveAssetSource(imagenBase).uri }}
                    style={styles.imagenCargar}
                  />

                  <View style={{ alignItems: 'center', marginTop: 8 }}>
                    <TouchableOpacity style={styles.boton} onPress={abrirGaleria}>
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
                    <Text style={[styles.buttonText, { color: '#fff' }]}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={insertarLogro}
                    style={[styles.button, styles.saveButton]}
                    disabled={loadingInsert}
                  >
                    {loadingInsert ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Guardar</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      </Modal>
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

  // FAB (botón flotante)
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1e90ff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 34,
    lineHeight: Platform.OS === 'ios' ? 36 : 34,
    fontWeight: '700',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#0b0b0b',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    alignSelf: 'center',
    width: '100%',
  },
  modalScroll: {
    paddingBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  closeButtonText: {
    color: '#ccc',
    fontWeight: '600',
  },

  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  cancelButton: {
    backgroundColor: '#444',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#28a745',
    flex: 1,
  },

  noResultados: {
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 10,
    paddingLeft: 6,
  },
});



