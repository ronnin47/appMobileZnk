import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import { useState, useEffect, useContext } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL } from './config';
import { AuthContext } from './AuthContext';

const imagenBase = require('../assets/imagenBase.jpeg');

export const Herbolaria = () => {
  const [objetosH, setObjetosH] = useState([]);
  const [nuevoObjeto, setNuevoObjeto] = useState(null);
  const { estatus } = useContext(AuthContext);
  const [filtro, setFiltro] = useState('');
  const [idExpandido, setIdExpandido] = useState(null);

  // Un único estado para manejar qué grupos están expandido
  const [expandidoKeys, setExpandidoKeys] = useState([]);
  const [grupoExpandido, setGrupoExpandido] = useState(null);
  useEffect(() => {
    consumirObjetosH();
    pedirPermisoGaleria();
  }, []);

  const pedirPermisoGaleria = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Se necesita permiso para acceder a la galería.');
    }
  };

  const consumirObjetosH = async () => {
    try {
        //console.log('URL consumida:', `${API_BASE_URL}/consumirObjetosH`);
      const response = await axios.get(`${API_BASE_URL}/consumirObjetosH`);
      const { objetosH } = response.data;


    

      if (Array.isArray(objetosH)) {
        const ordenadosPorNivel = [...objetosH].sort((a, b) => {
          const nivelA = parseInt(a.nivel) || 0;
          const nivelB = parseInt(b.nivel) || 0;
          return nivelA - nivelB;
        });
        setObjetosH(ordenadosPorNivel);
      }
    } catch (error) {
      console.error('Error al consumir elementos de Herblaria:', error.message);
    }
  };

  const abrirGaleria = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.6,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const base64Img = `data:image/jpeg;base64,${asset.base64}`;
      setNuevoObjeto({
        ...nuevoObjeto,
        imagen: base64Img,
        imagenurl: base64Img,
      });
    } else {
      const defaultUri = Image.resolveAssetSource(imagenBase).uri;
      setNuevoObjeto({
        ...nuevoObjeto,
        imagen: null,
        imagenurl: defaultUri,
      });
    }
  };

  const crearObjetoVacioEnDB = async () => {
    const objetoVacio = {
      nombre: 'Nuevo Objeto',
      rareza: '',
      nivel: '' || '1',
      costeVentaja: '',
      precio: '',
      descripcion: '',
      sistema: '',
      imagen: '',
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/insertObjetoH`, objetoVacio, {
        headers: { 'Content-Type': 'application/json' },
      });

      const { idobjeto, imagenurl } = response.data;

      const nuevo = { ...objetoVacio, idobjeto, imagen: imagenurl || '' };
      setObjetosH((prev) => [...prev, nuevo]);
      setNuevoObjeto(nuevo);
    } catch (error) {
      console.error('Error al crear objeto Herbolaria nuevo vacío:', error.message);
    }
  };

  const guardarCambiosObjeto = async () => {
    try {
      await axios.put(`${API_BASE_URL}/updateObjetoH/${nuevoObjeto.idobjeto}`, nuevoObjeto, {
        headers: { 'Content-Type': 'application/json' },
      });

      setObjetosH((prev) =>
        prev.map((obj) => (obj.idobjeto === nuevoObjeto.idobjeto ? nuevoObjeto : obj))
      );

      alert('elemento de Herbolaria actualizado');
      consumirObjetosH();
    } catch (error) {
      console.error('Error al actualizar el elemento de Herbolaria:', error.message);
    }
  };

  const eliminarObjeto = async (idobjeto) => {
    try {
      await axios.delete(`${API_BASE_URL}/deleteObjetoH/${idobjeto}`);
      setObjetosH((prev) => prev.filter((obj) => obj.idobjeto !== idobjeto));
      setNuevoObjeto(null);
      alert('Objeto eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar elemento de Herbolaria:', error.message);
      alert('No se pudo eliminar el elemento de Herbolaria.');
    }
  };

  const colorPorNivel = (nivel) => {
    const n = parseInt(nivel) || 0;
    if (n === 1 || n === 2) return '#FFFFFF'; // Blanco para nivel 1 y 2
    if (n === 3 || n === 4) return '#4CAF50'; // Verde para nivel 3 y 4
    if (n >= 5 && n <= 7) return '#2196F3'; // Azul para nivel 5, 6 y 7
    if (n >= 8) return '#FF9800'; // Naranja para nivel 8, 9, 10 y más
    return '#FFFFFF'; // Default blanco
  };

  // Filtrar y ordenar objetos según filtro
  const objetosFiltrados = objetosH
    .filter((obj) => {
      const texto = filtro.toLowerCase();
      return (
        obj.nombre.toLowerCase().includes(texto) ||
        (obj.nivel && obj.nivel.toString().includes(texto)) ||
        (obj.rareza && obj.rareza.toLowerCase().includes(texto)) ||
        (obj.costeVentaja && obj.costeVentaja.toLowerCase().includes(texto))
      );
    })
    .sort((a, b) => {
      const nivelA = parseInt(a.nivel) || 0;
      const nivelB = parseInt(b.nivel) || 0;
      return nivelA - nivelB;
    });

  // Dividir en grupos por nivel
  const comunes = objetosFiltrados.filter((obj) => {
    const nivel = parseInt(obj.nivel) || 0;
    return nivel >= 1 && nivel <= 2;
  });

  const pocoComunes = objetosFiltrados.filter((obj) => {
    const nivel = parseInt(obj.nivel) || 0;
    return nivel >= 3 && nivel <= 4;
  });

  const raros = objetosFiltrados.filter((obj) => {
    const nivel = parseInt(obj.nivel) || 0;
    return nivel >= 5 && nivel <= 7;
  });

  const unicos = objetosFiltrados.filter((obj) => {
    const nivel = parseInt(obj.nivel) || 0;
    return nivel >= 8;
  });

  useEffect(() => {
  if (filtro.trim() === '') {
    setExpandidoKeys([]); // Todos cerrados
  } else {
    // Encontrar el primer grupo con datos para expandir sólo ese
    const primerGrupoConDatos = grupos.find(grupo => grupo.data.length > 0);
    if (primerGrupoConDatos) {
      setExpandidoKeys([primerGrupoConDatos.key]); // Sólo ese grupo expandido
    } else {
      setExpandidoKeys([]); // Ningún grupo si no hay datos
    }
  }
}, [filtro, objetosH]);

  // Armar array combinado para el FlatList
  const grupos = [
    {
      key: 'comunes',
      titulo: 'Comunes (Nivel 1-2)',
      color: 'white',
      data: comunes,
      textoNoHay: 'No hay elementos comunes.',
    },
    {
      key: 'pocoComunes',
      titulo: 'Poco Comunes (Nivel 3-4)',
      color: '#4CAF50',
      data: pocoComunes,
      textoNoHay: 'No hay elementos poco comunes.',
    },
    {
      key: 'raros',
      titulo: 'Raros (Nivel 5-6-7)',
      color: '#2196F3',
      data: raros,
      textoNoHay: 'No hay elementos raros.',
    },
    {
      key: 'unicos',
      titulo: 'Únicos (Nivel 8+)',
      color: '#FF9800',
      data: unicos,
      textoNoHay: 'No hay elementos únicos.',
    },
  ];

  const datosFlatList = [];
  grupos.forEach((grupo) => {
    datosFlatList.push({
      tipo: 'header',
      key: grupo.key,
      titulo: grupo.titulo,
      color: grupo.color,
      textoNoHay: grupo.textoNoHay,
    });
    if (expandidoKeys.includes(grupo.key)) {
      if (grupo.data.length === 0) {
        datosFlatList.push({
          tipo: 'noData',
          key: grupo.key + '-noData',
          texto: grupo.textoNoHay,
        });
      } else {
        grupo.data.forEach((objeto) => {
          datosFlatList.push({
            tipo: 'item',
            key: `${grupo.key}-${objeto.idobjeto}`,
            objeto,
          });
        });
      }
    }
  });

  // Tu renderObjeto sin cambios
  const renderObjeto = (obj) => {
    const expandido = idExpandido === obj.idobjeto;
    return (
      <TouchableOpacity
        activeOpacity={0.98}
        key={obj.idobjeto}
        onPress={() => {
          setIdExpandido((prev) => (prev === obj.idobjeto ? null : obj.idobjeto));
          if (estatus === 'narrador') {
            setNuevoObjeto(obj);
          }
        }}
        style={[styles.objetoCard, { borderColor: colorPorNivel(obj.nivel) }]}
      >
        <View style={styles.objetoFila}>
          {obj.imagenurl ? (
            <Image
              source={{ uri: obj.imagenurl }}
              style={[styles.objetoImagenMini, { borderColor: colorPorNivel(obj.nivel) }]}
            />
          ) : (
            <Image
              source={imagenBase}
              style={[styles.objetoImagenMini, { borderColor: colorPorNivel(obj.nivel) }]}
            />
          )}
          <View style={{ flex: 1, paddingLeft: 10 }}>
            <Text style={[styles.objetoNombre, { color: colorPorNivel(obj.nivel), opacity: 0.8 }]}>
              {obj.nombre}
            </Text>
            <Text style={styles.objetoDetalle}>
              <Text style={styles.label}>Rareza: </Text>
              {obj.rareza}
            </Text>

            <Text style={styles.objetoDetalle}>
              <Text style={styles.label}>Nivel: </Text>
              {obj.nivel}
            </Text>
          </View>
        </View>

        {expandido && (
          <View style={{ marginTop: 10 }}>
            {obj.imagenurl ? (
              <Image source={{ uri: obj.imagenurl }} style={styles.objetoImagenExpandida} />
            ) : (
              <Image source={imagenBase} style={styles.objetoImagenExpandida} />
            )}
            <Text style={styles.objetoDetalle}>
              <Text style={styles.label}>Descripción: </Text>
              {obj.descripcion}
            </Text>

            <Text style={styles.objetoDetalle}>
              <Text style={styles.label}>Sistema: </Text>
              {obj.sistema}
            </Text>

            <Text style={styles.objetoDetalle}>
              <Text style={styles.label}>Precio: </Text>
              {obj.precio}
            </Text>

            <Text style={styles.objetoDetalle}>
              <Text style={styles.label}>Coste ventaja: </Text>
              {obj.costeVentaja}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

 // Render para FlatList único
const renderItem = ({ item }) => {
  if (item.tipo === 'header') {
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => {
          setExpandidoKeys((prev) => {
            if (prev.includes(item.key)) {
              // Si el grupo ya está abierto, lo cerramos
              return [];
            } else {
              // Si no, cerramos otros y abrimos sólo este
              return [item.key];
            }
          });
        }}
        style={{ marginVertical: 10 }}
      >
        <Text style={{ color: item.color, fontSize: 18, fontWeight: 'bold' }}>
          {expandidoKeys.includes(item.key) ? '▼ ' : '▶ '}
          {item.titulo}
        </Text>
      </TouchableOpacity>
    );
  }
  if (item.tipo === 'item') {
    return renderObjeto(item.objeto);
  }
  if (item.tipo === 'noData') {
    return <Text style={styles.noResultados}>{item.texto}</Text>;
  }
  return null;
};

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 200 }}>
      <TextInput
        placeholder="Buscar por nombre, nivel, rareza o coste..."
        placeholderTextColor="#aaa"
        style={styles.input}
        value={filtro}
        onChangeText={setFiltro}
      />

      <FlatList
        data={datosFlatList}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        scrollEnabled={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
      />

      {estatus === 'narrador' && (
        <>
          <View style={{ alignItems: 'center', marginTop: 10 }}>
            <TouchableOpacity
              style={[styles.boton, { backgroundColor: '#D4AF37', width: '50%' }]}
              onPress={crearObjetoVacioEnDB}
            >
              <Text style={styles.botonTexto}>+ elemento</Text>
            </TouchableOpacity>
          </View>

          {nuevoObjeto && (
            <View style={styles.cargarObjeto}>
              <View style={styles.cargarImagen}>
                <Text style={styles.subtitulo}>{nuevoObjeto.nombre}</Text>
                <Image
                  source={{ uri: nuevoObjeto.imagenurl || Image.resolveAssetSource(imagenBase).uri }}
                  style={styles.imagenCargar}
                />
                <View style={{ alignItems: 'center', marginTop: 5 }}>
                  <TouchableOpacity style={styles.boton} onPress={abrirGaleria}>
                    <Text style={styles.botonTexto}>Seleccionar imagen</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TextInput
                placeholder="Nombre"
                style={styles.input}
                keyboardType="default"
                value={nuevoObjeto.nombre}
                onChangeText={(text) => setNuevoObjeto({ ...nuevoObjeto, nombre: text })}
              />
              <TextInput
                placeholder="Rareza"
                placeholderTextColor="#aaa"
                style={styles.input}
                keyboardType="default"
                value={nuevoObjeto.rareza}
                onChangeText={(text) => setNuevoObjeto({ ...nuevoObjeto, rareza: text })}
              />
              <TextInput
                placeholder="Nivel"
                placeholderTextColor="#aaa"
                style={styles.input}
                keyboardType="default"
                value={nuevoObjeto.nivel}
                onChangeText={(text) => setNuevoObjeto({ ...nuevoObjeto, nivel: text })}
              />
              <TextInput
                placeholder="Coste ventaja"
                placeholderTextColor="#aaa"
                style={styles.input}
                keyboardType="default"
                value={nuevoObjeto.costeVentaja}
                onChangeText={(text) => setNuevoObjeto({ ...nuevoObjeto, costeVentaja: text })}
              />
              <TextInput
                placeholder="Precio"
                placeholderTextColor="#aaa"
                style={styles.input}
                keyboardType="default"
                value={nuevoObjeto.precio.toString()}
                onChangeText={(text) => setNuevoObjeto({ ...nuevoObjeto, precio: text })}
              />
              <TextInput
                placeholder="Descripción"
                placeholderTextColor="#aaa"
                style={styles.input}
                multiline
                keyboardType="default"
                numberOfLines={6}
                value={nuevoObjeto.descripcion}
                onChangeText={(text) => setNuevoObjeto({ ...nuevoObjeto, descripcion: text })}
              />
              <TextInput
                placeholder="Sistema"
                placeholderTextColor="#aaa"
                style={styles.input}
                keyboardType="default"
                multiline
                numberOfLines={6}
                value={nuevoObjeto.sistema}
                onChangeText={(text) => setNuevoObjeto({ ...nuevoObjeto, sistema: text })}
              />

              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 30, gap: 40 }}>
                <TouchableOpacity
                  style={[styles.boton, styles.botonGuardar, { backgroundColor: '#dc3545' }]}
                  onPress={() => {
                    if (nuevoObjeto?.idobjeto) {
                      Alert.alert('Confirmar eliminación', '¿Seguro que querés eliminar este objeto?', [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Eliminar',
                          style: 'destructive',
                          onPress: () => eliminarObjeto(nuevoObjeto.idobjeto),
                        },
                      ]);
                    }
                  }}
                >
                  <Text style={styles.botonTexto}>Eliminar objeto</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.boton, styles.botonGuardar, { marginRight: 10 }]}
                  onPress={guardarCambiosObjeto}
                >
                  <Text style={styles.botonTexto}>Guardar cambios</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    padding: 10,
  },
  tituloGrupo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
    paddingBottom: 4,
  },
  noResultados: {
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 10,
    paddingLeft: 6,
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
    marginTop: 20,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#222',
    color: 'white',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    textAlignVertical: 'top', // ← asegura que el texto comience arriba
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
    borderWidth:2,
    borderColor:"white",
    borderRadius: 25,
  },
  objetoCard: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 8,
    paddingBottom:0,
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
    marginBottom: 30, // margen extra para que no quede abajo pegado
    backgroundColor:'#28a745'
  },
  objetoFila: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  objetoImagenMini: {
    width: 65,
    height: 65,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "yellow",
  },
  objetoImagenExpandida: {
    width: '100%',
    height: 260,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
    borderWidth:0.5,
    borderColor:"gray"
  },
 cargarObjeto: {
  borderWidth: 1,
  borderColor: "cyan",
  padding: 10,
  borderRadius: 10,
  marginTop: 30,
  backgroundColor: "#111", // Fondo opcional
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 3, // para Android
},
cargarImagen: {
  alignItems: "center",   // ← Centra horizontalmente los hijos
  justifyContent: "center", // ← Opcional, útil si querés centrar verticalmente también
},
objetoDetalle: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 3,
  },
  label: {
    color: '#D4AF37', // Dorado, o el color que prefieras
    fontWeight: 'bold',
  },
});