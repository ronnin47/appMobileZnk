import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import { useState, useEffect, useContext } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL } from './config';
import { AuthContext } from './AuthContext';

const imagenBase = require('../assets/imagenBase.jpeg'); // Asegúrate que esta ruta sea correcta

export const ObjetosMagicos = () => {
  const [objetosMagicos, setObjetosMagicos] = useState([]);
  const [nuevoObjeto, setNuevoObjeto] = useState(null);
  const { estatus } = useContext(AuthContext);
  const [filtro, setFiltro] = useState('');
  const [idExpandido, setIdExpandido] = useState(null);

  // Estados para controlar si cada grupo está expandido o no
  const [comunesExpandido, setComunesExpandido] = useState(false);
  const [pocoComunesExpandido, setPocoComunesExpandido] = useState(false);
  const [rarosExpandido, setRarosExpandido] = useState(false);
  const [unicosExpandido, setUnicosExpandido] = useState(false);

  useEffect(() => {
    consumirObjetosMagicos();
    pedirPermisoGaleria();
  }, []);

  const pedirPermisoGaleria = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Se necesita permiso para acceder a la galería.');
    }
  };

  const consumirObjetosMagicos = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/consumirObjetosMagicos`);
      const { objetosMagicos } = response.data;
      if (Array.isArray(objetosMagicos)) {
        const ordenadosPorNivel = [...objetosMagicos].sort((a, b) => {
          const nivelA = parseInt(a.nivel) || 0;
          const nivelB = parseInt(b.nivel) || 0;
          return nivelA - nivelB;
        });
        setObjetosMagicos(ordenadosPorNivel);
      }
    } catch (error) {
      console.error('Error al consumir objetos mágicos:', error.message);
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
        imagenurl: base64Img
      });
    } else {
      const defaultUri = Image.resolveAssetSource(imagenBase).uri;
      setNuevoObjeto({
        ...nuevoObjeto,
        imagen: null,
        imagenurl: defaultUri
      });
    }
  };

  const crearObjetoVacioEnDB = async () => {
    const objetoVacio = {
      nombre: 'Nuevo Objeto',
      rareza: '',
      nivel: '' || "1",
      costeVentaja: '',
      precio: "",
      descripcion: '',
      sistema: '',
      imagen: '',
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/insertObjetoMagico`, objetoVacio, {
        headers: { 'Content-Type': 'application/json' },
      });

      const { idobjeto, imagenurl } = response.data;

      const nuevo = { ...objetoVacio, idobjeto, imagen: imagenurl || '' };
      setObjetosMagicos(prev => [...prev, nuevo]);
      setNuevoObjeto(nuevo);
    } catch (error) {
      console.error('Error al crear objeto nuevo vacío:', error.message);
    }
  };

  const guardarCambiosObjeto = async () => {
    try {
      await axios.put(`${API_BASE_URL}/updateObjetoMagico/${nuevoObjeto.idobjeto}`, nuevoObjeto, {
        headers: { 'Content-Type': 'application/json' },
      });

      setObjetosMagicos(prev =>
        prev.map(obj =>
          obj.idobjeto === nuevoObjeto.idobjeto ? nuevoObjeto : obj
        )
      );

      alert('Objeto actualizado');
      consumirObjetosMagicos();
    } catch (error) {
      console.error('Error al actualizar el objeto mágico:', error.message);
    }
  };

  const eliminarObjeto = async (idobjeto) => {
    try {
      await axios.delete(`${API_BASE_URL}/deleteObjetoMagico/${idobjeto}`);
      setObjetosMagicos(prev => prev.filter(obj => obj.idobjeto !== idobjeto));
      setNuevoObjeto(null);
      alert('Objeto eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar objeto:', error.message);
      alert('No se pudo eliminar el objeto.');
    }
  };

  const colorPorNivel = (nivel) => {
    const n = parseInt(nivel) || 0;
    if (n === 1 || n === 2) return '#FFFFFF';         // Blanco para nivel 1 y 2
    if (n === 3 || n === 4) return '#4CAF50';         // Verde para nivel 3 y 4
    if (n >= 5 && n <= 7) return '#2196F3';           // Azul para nivel 5, 6 y 7
    if (n >= 8) return '#FF9800';                      // Naranja para nivel 8, 9, 10 y más
    return '#FFFFFF';                                  // Default blanco
  };

  // Filtrar y ordenar objetos según filtro
  const objetosFiltrados = objetosMagicos
    .filter(obj => {
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
  const comunes = objetosFiltrados.filter(obj => {
    const nivel = parseInt(obj.nivel) || 0;
    return nivel >= 1 && nivel <= 2;
  });

  const pocoComunes = objetosFiltrados.filter(obj => {
    const nivel = parseInt(obj.nivel) || 0;
    return nivel >= 3 && nivel <= 4;
  });

  const raros = objetosFiltrados.filter(obj => {
    const nivel = parseInt(obj.nivel) || 0;
    return nivel >= 5 && nivel <= 7;
  });

  const unicos = objetosFiltrados.filter(obj => {
    const nivel = parseInt(obj.nivel) || 0;
    return nivel >= 8;
  });

useEffect(() => {
  if (filtro.trim() === '') {
    // Si el filtro está vacío, no abrir automáticamente ningún grupo (los cerramos)
    setComunesExpandido(false);
    setPocoComunesExpandido(false);
    setRarosExpandido(false);
    setUnicosExpandido(false);
  } else {
    // Si hay texto en filtro, abrir grupos con resultados, cerrar sin resultados
    setComunesExpandido(comunes.length > 0);
    setPocoComunesExpandido(pocoComunes.length > 0);
    setRarosExpandido(raros.length > 0);
    setUnicosExpandido(unicos.length > 0);
  }
}, [filtro, objetosMagicos]);

  // Función para renderizar cada objeto
  const renderObjeto = (obj) => {
    const expandido = idExpandido === obj.idobjeto;
    return (
      <TouchableOpacity
         key={obj.idobjeto}
  onPress={() => {
    setIdExpandido(prev => (prev === obj.idobjeto ? null : obj.idobjeto));
    if (estatus === 'narrador') {
      setNuevoObjeto(obj);
    }
  }}
        style={[styles.objetoCard, { borderColor: colorPorNivel(obj.nivel) }]}
      >
        <View style={styles.objetoFila}>
          {obj.imagenurl ? (
            <Image source={{ uri: obj.imagenurl }} style={[styles.objetoImagenMini, { borderColor: colorPorNivel(obj.nivel) }]} />
          ) : (
            <Image source={imagenBase} style={[styles.objetoImagenMini, { borderColor: colorPorNivel(obj.nivel) }]} />
          )}
          <View style={{ flex: 1, paddingLeft: 10 }}>
            <Text style={[styles.objetoNombre, { color: colorPorNivel(obj.nivel), opacity: 0.8 }]}>{obj.nombre}</Text>
            <Text style={styles.objetoDetalle}>Rareza: {obj.rareza}</Text>
            <Text style={styles.objetoDetalle}>Nivel: {obj.nivel}</Text>
          </View>
        </View>

        {expandido && (
          <View style={{ marginTop: 10 }}>
            {obj.imagenurl ? (
              <Image source={{ uri: obj.imagenurl }} style={styles.objetoImagenExpandida} />
            ) : (
              <Image source={imagenBase} style={styles.objetoImagenExpandida} />
            )}
            <Text style={styles.objetoDetalle}>Descripción: {obj.descripcion}</Text>
            <Text style={styles.objetoDetalle}>Sistema: {obj.sistema}</Text>
            <Text style={styles.objetoDetalle}>Precio: {obj.precio}</Text>
            <Text style={styles.objetoDetalle}>Coste ventaja: {obj.costeVentaja}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Componente para los títulos de grupos con toggle y triángulo
  const TituloGrupoToggle = ({ titulo, expandido, setExpandido,style, color, fontSize }) => (
    <TouchableOpacity
      onPress={() => setExpandido(prev => !prev)}
      style={{ marginVertical: 10 }}
    >
      <Text style={{
      color: color ?? (expandido ? color : 'white'),
      fontSize: 18,
      fontWeight: 'bold',
    }}>
      {expandido ? '▼ ' : '▶ '}
      {titulo}
    </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 200 }}>
      <TextInput
        placeholder="Buscar por nombre, nivel, rareza o coste..."
        placeholderTextColor="#aaa"
        style={styles.input}
        value={filtro}
        onChangeText={setFiltro}
      />

      <TituloGrupoToggle
        titulo="Comunes (Nivel 1-2)"
        expandido={comunesExpandido}
        setExpandido={setComunesExpandido}
        color="white"
          
                
      />
      {comunesExpandido ? (
        comunes.length > 0 ? comunes.map(renderObjeto) : <Text style={styles.noResultados}>No hay objetos comunes.</Text>
      ) : null}

      <TituloGrupoToggle
        titulo="Poco Comunes (Nivel 3-4)"
        expandido={pocoComunesExpandido}
        setExpandido={setPocoComunesExpandido}
        color="#4CAF50"
     
      />
      {pocoComunesExpandido ? (
        pocoComunes.length > 0 ? pocoComunes.map(renderObjeto) : <Text style={styles.noResultados}>No hay objetos poco comunes.</Text>
      ) : null}

      <TituloGrupoToggle
        titulo="Raros (Nivel 5-7-8)"
        expandido={rarosExpandido}
        setExpandido={setRarosExpandido}
        color="#2196F3"
       
      />
      {rarosExpandido ? (
        raros.length > 0 ? raros.map(renderObjeto) : <Text style={styles.noResultados}>No hay objetos raros.</Text>
      ) : null}

      <TituloGrupoToggle
        titulo="Únicos (Nivel 8+)"
        expandido={unicosExpandido}
        setExpandido={setUnicosExpandido}
        color="#FF9800"
     
      />
      {unicosExpandido ? (
        unicos.length > 0 ? unicos.map(renderObjeto) : <Text style={styles.noResultados}>No hay objetos únicos.</Text>
      ) : null}

      {estatus === 'narrador' && (
        <>
          <View style={{ alignItems: 'center', marginTop: 10 }}>
            <TouchableOpacity
              style={[styles.boton, { backgroundColor:'#ffc107', width: '50%' }]}
              onPress={crearObjetoVacioEnDB}
            >
              <Text style={styles.botonTexto}>+ Objeto mágico</Text>
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

              
             

              {/* Inputs */}
              <TextInput
                placeholder="Nombre"
                style={styles.input}
                keyboardType="default"
                value={nuevoObjeto.nombre}
                onChangeText={text => setNuevoObjeto({ ...nuevoObjeto, nombre: text })}
              />
              <TextInput
                placeholder="Rareza"
                placeholderTextColor="#aaa"
                style={styles.input}
                keyboardType="default"
                value={nuevoObjeto.rareza}
                onChangeText={text => setNuevoObjeto({ ...nuevoObjeto, rareza: text })}
              />
              <TextInput
                placeholder="Nivel"
                placeholderTextColor="#aaa"
                style={styles.input}
                keyboardType="default"
                value={nuevoObjeto.nivel}
                onChangeText={text => setNuevoObjeto({ ...nuevoObjeto, nivel: text })}
              />
              <TextInput
                placeholder="Coste ventaja"
                placeholderTextColor="#aaa"
                style={styles.input}
                keyboardType="default"
                value={nuevoObjeto.costeVentaja}
                onChangeText={text => setNuevoObjeto({ ...nuevoObjeto, costeVentaja: text })}
              />
              <TextInput
                placeholder="Precio"
                placeholderTextColor="#aaa"
                style={styles.input}
                keyboardType="default"
                value={nuevoObjeto.precio.toString()}
                onChangeText={text => setNuevoObjeto({ ...nuevoObjeto, precio: text })}
              />
              <TextInput
                placeholder="Descripción"
                 placeholderTextColor="#aaa"
                style={styles.input}
                multiline
                keyboardType="default"
                numberOfLines={6}
                value={nuevoObjeto.descripcion}
                onChangeText={text => setNuevoObjeto({ ...nuevoObjeto, descripcion: text })}
              />
              <TextInput
                placeholder="Sistema"
                placeholderTextColor="#aaa"
                style={styles.input}
                keyboardType="default"
                multiline
                numberOfLines={6}
                value={nuevoObjeto.sistema}
                onChangeText={text => setNuevoObjeto({ ...nuevoObjeto, sistema: text })}
              />

            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 30,gap:40 }}>

               <TouchableOpacity
                style={[styles.boton, styles.botonGuardar,{ backgroundColor: '#dc3545' }]}
                onPress={() => {
                  if (nuevoObjeto?.idobjeto) {
                    Alert.alert(
                      'Confirmar eliminación',
                      '¿Seguro que querés eliminar este objeto?',
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Eliminar',
                          style: 'destructive',
                          onPress: () => eliminarObjeto(nuevoObjeto.idobjeto),
                        },
                      ]
                    );
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
    color: 'white',
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
    padding: 10,
    marginVertical: 6,
    borderWidth: 0.2,
  },
  objetoNombre: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
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
    height: 240,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
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
}
});
