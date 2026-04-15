import React, { useContext, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Modal,
  Animated,
  Alert
} from "react-native";



import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "./AuthContext";
import * as ImagePicker from "expo-image-picker";
import { Image as ExpoImage } from "expo-image";
import { AnimacionModel } from "./animacionModel";
import { API_BASE_URL } from './config';
import axios from 'axios';
import { showMessage } from 'react-native-flash-message';


const imagenFondo="https://res.cloudinary.com/dzul1hatw/image/upload/v1775771291/af44fff87cc52df9db1bb26a243620ef_lpnyip.jpg"



// =====================
// MODAL
// =====================
const ModalPersonaje = ({ visible, personaje, onClose, updateAnimacionPersonaje, updateAnimacionPersonajeUsuario }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const [sprite, setSprite] = useState(null);
  const [filas, setFilas] = useState("3");
  const [columnas, setColumnas] = useState("4");
  const [fps, setFps] = useState("6");

  useEffect(() => {
    if (visible) {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
     
    //console.log("revisamos si recibe public_id:",personaje?.spriteurl);
    //console.log("revisamos si recibe public_id:",personaje?.public_id);


    if (visible && personaje) {
      setFilas(String(personaje.filas ?? 3));
      setColumnas(String(personaje.columnas ?? 4));
      setFps(String(personaje.fps ?? 6));

      if (personaje.spriteurl) {
        setSprite({
          uri: personaje.spriteurl,
          base64: null,
          mime: "image/png",
          width: 0,
          height: 0,
        });
      } else {
        setSprite(null);
      }
    }
  }, [visible, personaje]);

  const cerrar = () => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setSprite(null);
      onClose();
    });
  };

  const seleccionarSprite = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permiso.granted) {
      Alert.alert("Permiso requerido", "Habilitá la galería");
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      base64: true,
    });

    if (resultado.canceled) return;

    const asset = resultado.assets[0];

    setSprite({
      uri: asset.uri,
      base64: asset.base64,
      mime: asset.mimeType ?? "image/png",
      width: asset.width,
      height: asset.height,
    });
  };

  //peticion o fecth que la manda al servidor
  const guardarSprite = async () => {
    const f = Number(filas);
    const c = Number(columnas);
    const velocidad = Number(fps);

    if (!f || !c || !velocidad) {
      Alert.alert("Error", "Datos inválidos");
      return;
    }

    try {
      let imagen = null;

      if (sprite?.base64) {
        imagen = `data:${sprite.mime};base64,${sprite.base64}`;
      }

      const payload = {
        idpersonaje: personaje?.idpersonaje,
        imagen,
        filas: f,
        columnas: c,
        fps: velocidad,
      };

      const res = await axios.post(`${API_BASE_URL}/upload-sprite`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const animacion = res.data?.animacion;

      updateAnimacionPersonaje(personaje?.idpersonaje, {
        spriteurl: animacion.spriteurl,
        filas: animacion.filas,
        columnas: animacion.columnas,
        fps: animacion.fps,
        public_id: animacion.public_id,
      });

      updateAnimacionPersonajeUsuario(personaje?.idpersonaje, {
        spriteurl: animacion.spriteurl,
        filas: animacion.filas,
        columnas: animacion.columnas,
        fps: animacion.fps,
        public_id: animacion.public_id,
      });

    

      setTimeout(() => {
            showMessage({
              message: 'Sprite cargado',
              description: 'Tu nuevo sprite se ha guardado correctamente.',
              type: 'success',
              icon: 'success',
              duration: 3000
            });
          }, 500);

      onClose();

    } catch (error) {
      console.log("UPLOAD ERROR:", error?.response?.data || error.message);
      Alert.alert(
        "Error",
        error?.response?.data?.error || "No se pudo subir la imagen"
      );
    }
  };


   //peticion o fecth que elimina el sprite del personaje, seteando los campos a null o vacios en la base de datos
const eliminarSprite = async () => {
  console.log("public_id a eliminar:", personaje?.public_id);

  try {
    const res = await axios.put(
      `${API_BASE_URL}/eliminarSprite`,
      {
        idpersonaje: personaje?.idpersonaje,
        public_id: personaje?.public_id,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const animacion = res.data?.animacion;

    updateAnimacionPersonaje(personaje?.idpersonaje, {
      spriteurl: animacion.spriteurl,
      filas: animacion.filas,
      columnas: animacion.columnas,
      fps: animacion.fps,
      public_id: animacion.public_id,
    });

    updateAnimacionPersonajeUsuario(personaje?.idpersonaje, {
      spriteurl: animacion.spriteurl,
      filas: animacion.filas,
      columnas: animacion.columnas,
      fps: animacion.fps,
      public_id: animacion.public_id,
    });

    setSprite(null);

    //Alert.alert("OK", "Sprite eliminado correctamente");

    setTimeout(() => {
        showMessage({
          message: "Sprite eliminado",
          description: "La animación y la imagen fueron eliminadas correctamente.",
          type: "success",
          icon: "success",
          duration: 3000,
        });
      }, 500);

    onClose();


  } catch (error) {
    console.log(
      "Eliminar Sprite ERROR:",
      error?.response?.data || error.message
    );

    Alert.alert(
      "Error",
      error?.response?.data?.error || "No se pudo eliminar el sprite"
    );
  }
};


  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: anim,
              transform: [
                {
                  scale: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.85, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={cerrar} style={styles.closeBtn}>
              <Text style={styles.closeText}>X</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <TouchableOpacity
              style={styles.botonCargar}
              onPress={seleccionarSprite}
            >
              <Text style={styles.textoBoton}>Cargar Sprite</Text>
            </TouchableOpacity>

            {sprite && (
              <>
                <View style={{ flexDirection: "row", gap: 12 }}>

                  <View style={{ alignItems: "center" }}>
                    <Text style={{ color: "yellow", fontSize: 11 }}>Filas</Text>
                    <TextInput
                      value={filas}
                      onChangeText={setFilas}
                      keyboardType="numeric"
                      style={{
                        width: 60,
                        backgroundColor: "#222",
                        color: "white",
                        padding: 6,
                        borderRadius: 6,
                        textAlign: "center",
                      }}
                    />
                  </View>

                  <View style={{ alignItems: "center" }}>
                    <Text style={{ color: "yellow", fontSize: 11 }}>Columnas</Text>
                    <TextInput
                      value={columnas}
                      onChangeText={setColumnas}
                      keyboardType="numeric"
                      style={{
                        width: 60,
                        backgroundColor: "#222",
                        color: "white",
                        padding: 6,
                        borderRadius: 6,
                        textAlign: "center",
                      }}
                    />
                  </View>

                  <View style={{ alignItems: "center" }}>
                    <Text style={{ color: "yellow", fontSize: 11 }}>FPS</Text>
                    <TextInput
                      value={fps}
                      onChangeText={setFps}
                      keyboardType="numeric"
                      style={{
                        width: 60,
                        backgroundColor: "#222",
                        color: "white",
                        padding: 6,
                        borderRadius: 6,
                        textAlign: "center",
                      }}
                    />
                  </View>

                </View>

                <Text style={{ color: "white", fontSize: 12 }}>
                  {sprite.width} x {sprite.height}px
                </Text>

                <View style={styles.previewBox}>
                  <ExpoImage
                    source={{ uri: sprite.uri }}
                    style={styles.debugImage}
                    contentFit="contain"
                  />
                </View>

                <View style={styles.animBox}>
                  <AnimacionModel
                    source={{
                      uri: sprite.base64
                        ? `data:${sprite.mime};base64,${sprite.base64}`
                        : sprite.uri,
                    }}
                    scaleSize={0.8}
                    filas={Number(filas)}
                    columnas={Number(columnas)}
                    fps={Number(fps)}
                  />
                </View>
              </>
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.botonGuardar}
              onPress={guardarSprite}
            >
              <Text style={styles.textoBoton}>Guardar</Text>
            </TouchableOpacity>

            



            {personaje?.spriteurl && (
             <TouchableOpacity
                    style={styles.botonEliminarSprite}
                    onPress={() => {
                      Alert.alert(
                        "Eliminar sprite",
                        "¿Querés eliminar este sprite de forma permanente?",
                        [
                          {
                            text: "Cancelar",
                            style: "cancel",
                          },
                          {
                            text: "Eliminar",
                            style: "destructive",
                            onPress: eliminarSprite,
                          },
                        ]
                      );
                    }}
                  >
                    <Text style={styles.textoBoton}>Eliminar</Text>
                  </TouchableOpacity>
            )}

            
          

          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};






// =====================
// PANEL PRINCIPAL
// =====================
export const NarradorPanel = () => {
  
  const { coleccionPersonajes, updateAnimacionPersonaje, updateAnimacionPersonajeUsuario } = useContext(AuthContext);

  const [busqueda, setBusqueda] = useState("");
  const [seleccionados, setSeleccionados] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [personajeActivo, setPersonajeActivo] = useState(null);

  const STORAGE_KEY = "narrador_personajes";

  useEffect(() => {
    const cargar = async () => {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const ids = JSON.parse(data);
        const lista = coleccionPersonajes.filter(p =>
          ids.includes(p.idpersonaje)
        );
        setSeleccionados(lista);
      }
    };
    cargar();
  }, [coleccionPersonajes]);

  const guardar = async (lista) => {
    const ids = lista.map(p => p.idpersonaje);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  };

  const agregar = (pj) => {
    if (seleccionados.some(p => p.idpersonaje === pj.idpersonaje)) return;

    const nueva = [...seleccionados, pj];
    setSeleccionados(nueva);
    guardar(nueva);
    setBusqueda("");
  };

  const eliminar = (id) => {
    const nueva = seleccionados.filter(p => p.idpersonaje !== id);
    setSeleccionados(nueva);
    guardar(nueva);
  };

  const abrirModal = (pj) => {
  
    setPersonajeActivo(pj);
    setModalVisible(true);
  };

  const filtrados = coleccionPersonajes.filter(p =>
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <View style={styles.container}>

      {/* BUSCADOR */}
      <TextInput
        placeholder="Buscar personaje..."
        placeholderTextColor="#aaa"
        value={busqueda}
        onChangeText={setBusqueda}
        style={styles.buscador}
      />

      {/* RESULTADOS BUSQUEDA */}
      {busqueda.length > 0 && (
        <FlatList
          data={filtrados}
          keyExtractor={(item) => item.idpersonaje.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => agregar(item)}
            >
              <ExpoImage
                source={{ uri: item.imagenurl }}
                style={styles.avatar}
                contentFit="cover"
              />
              <Text style={styles.nombre}>{item.nombre}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* TÍTULO */}
      <Text style={styles.titulo}>Personajes seleccionados</Text>

      {/* LISTA SELECCIONADOS */}
      <FlatList
        data={seleccionados}
        keyExtractor={(item) => item.idpersonaje.toString()}
        renderItem={({ item }) => (
          <ImageBackground
           // source={{ uri: item.imagenurl }}
           source={{ uri: imagenFondo }}
            style={styles.cardSeleccionado}
            imageStyle={{ borderRadius: 10, opacity: 0.8, backgroundColor: "#000" ,borderWidth: 1, borderColor: "#ebe3e3"  }}
          >
            {/* OVERLAY */}
            <View style={styles.overlay} />

            {/* BOTONES */}
            <TouchableOpacity
              style={styles.botonEliminar}
              onPress={() => eliminar(item.idpersonaje)}
            >
              <Text style={{ color: "white" }}>×</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botonAccion}
               onPress={() => {
             
              abrirModal(item);
            }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>⚡</Text>
            </TouchableOpacity>

            {/* CONTENIDO PRINCIPAL */}
            <View style={{ flexDirection: "row"}}>

              {/* AVATAR + ANIMACIÓN */}
              <View style={{ alignItems: "start",maxWidth: 120, marginRight: 4 }}>
                <ExpoImage
                  source={{ uri: item.imagenurl }}
                  style={styles.avatarGrande}
                  contentFit="cover"
                />

                {/* ANIMACIÓN */}
               <View
                  style={{
                    marginTop: 3,
                    alignItems: "center",
                    justifyContent: "center",
                    width: 140,
                    height: 140,
                    backgroundColor: "rgba(0, 0, 0, 0.94)",
                    padding: 2,
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                 {item.spriteurl ? (
                  <AnimacionModel
                    source={{ uri: item.spriteurl }}
                    scaleSize={0.8}
                    filas={item.filas}
                    columnas={item.columnas}
                    fps={item.fps}
                  />
                ) : (
                  <Text style={{ color: "red", fontSize: 10 }}>
                    Sin animación
                  </Text>
                )}
                </View>
              </View>

  <View style={{
  marginLeft: 10,
  flex: 1,
  minWidth: 0,
}}>

  <Text style={{
    color: "#FFD700",
    fontWeight: "bold",
    flexWrap: "wrap",
  }}>
    {item.nombre}
  </Text>

  <Text style={{
    color: "#ccc",
    fontSize: 12,
    flexWrap: "wrap",
  }}>
    {item.dominio}
  </Text>

  <Text style={{
    color: "#ccc",
    fontSize: 12,
    flexWrap: "wrap",
  }}>
    {item.conviccion}
  </Text>

</View>

            </View>
          </ImageBackground>
        )}
      />

      {/* MODAL */}
      <ModalPersonaje
        visible={modalVisible}
        personaje={personajeActivo}
        
        onClose={() => {
          setModalVisible(false);
          setPersonajeActivo(null);
        }}
        updateAnimacionPersonaje={updateAnimacionPersonaje}
        updateAnimacionPersonajeUsuario={updateAnimacionPersonajeUsuario}
      />

    </View>
  );
};



// =====================
// STYLES
// =====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "black",
  },
  overlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(0,0,0,0.55)",
  borderRadius: 10,
},

  buscador: {
    backgroundColor: "#1a1a1a",
    color: "white",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10
  },

  titulo: {
    color: "gold",
    fontSize: 18,
    marginVertical: 10
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#111",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    alignItems: "center"
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10
  },

  avatarGrande: {
    width: 120,
    height: 115,
    borderRadius: 10
  },

  nombre: {
    color: "#FFD700",
    fontWeight: "bold"
  },

  sub: {
    color: "#ccc",
    fontSize: 12
  },

  cardSeleccionado: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  botonEliminar: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 6,
    zIndex: 10
  },

  botonAccion: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#007AFF",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    width: "85%",
    backgroundColor: "#1a1a1a",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },

  modalImagen: {
    width: 40,
    height: 40,
    borderRadius: 10,
    marginBottom: 10,
  },

  modalNombre: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "bold",
  },

  modalTexto: {
    color: "#ccc",
    marginTop: 5,
  },

  botonCerrar: {
    marginTop: 15,
    backgroundColor: "red",
    padding: 10,
    borderRadius: 8,
  },

  botonCargar: {
    marginTop: 10,
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
  },

  botonGuardar: {
    marginTop: 10,
    backgroundColor: "green",
    padding: 10,
    borderRadius: 8,
  },
    botonEliminarSprite: {
    width: "100%",
    backgroundColor: "#e62d20e0",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop:10,
    borderWidth:1,
    borderColor:"#f3db07da"
  },

  textoBoton: {
    color: "white",
    fontWeight: "bold"
  },

  debugBox: {
    marginTop: 10,
    width: 220,
    height: 220,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },

  debugImage: {
    width: 200,
    height: 200,
  },
 modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    width: "85%",
    maxHeight: "80%",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
  },



  header: {
    width: "100%",
    alignItems: "flex-end",
  },

  closeBtn: {
    padding: 5,
  },

  closeText: {
    fontSize: 22,
    color: "red",
  },

  body: {
    width: "100%",
    alignItems: "center",
    gap: 12,
  },

  botonCargar: {
    backgroundColor: "#2e86de",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  previewBox: {
    width: 150,
    height: 150,
    backgroundColor: "#000",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333",
  },

  debugImage: {
    width: "100%",
    height: "100%",
  },

  animBox: {
  width: 160,
  height: 160,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#111",
  borderRadius: 10,
  overflow: "hidden",
},

  footer: {
    width: "100%",
    marginTop: 15,
  },

  botonGuardar: {
    width: "100%",
    backgroundColor: "#20e673af",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth:1,
    borderColor:"#f3db07da"
  },

  textoBoton: {
    color: "white",
    fontWeight: "600",
  },
});