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
  Alert,
  ScrollView,
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




// estos dos los podriamos usar en la party
const ModalCaracteristicas = ({ visible, personaje, onClose }) => {
  const cerrar = () => {
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalOverlayFicha}>
        <View
          style={{
            width: "94%",
            maxHeight: "88%",
            backgroundColor: "#101010",
            borderRadius: 18,
            borderWidth: 1,
            borderColor: "#2a2a2a",
            overflow: "hidden",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: "#222",
            }}
          >
            <Text
              style={{
                color: "#e5e5e5",
                fontSize: 20,
                fontWeight: "700",
                flex: 1,
              }}
              numberOfLines={1}
            >
              {personaje?.nombre}
            </Text>

            <TouchableOpacity
              onPress={cerrar}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "#e91515",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#cfcfcf",
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                X
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 24,
            }}
          >
            <View
              style={{
                paddingHorizontal: 16,
                paddingTop: 16,
              }}
            >
              <Text
                style={{
                  color: "#8c8c8c",
                  fontSize: 13,
                  marginBottom: 10,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Características principales
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                }}
              >
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Fuerza</Text>
                  <Text style={styles.statValue}>{personaje?.fuerza}</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Fortaleza</Text>
                  <Text style={styles.statValue}>{personaje?.fortaleza}</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Destreza</Text>
                  <Text style={styles.statValue}>{personaje?.destreza}</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Agilidad</Text>
                  <Text style={styles.statValue}>{personaje?.agilidad}</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Sentidos</Text>
                  <Text style={styles.statValue}>{personaje?.sentidos}</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Sabiduría</Text>
                  <Text style={styles.statValue}>{personaje?.sabiduria}</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Principio</Text>
                  <Text style={styles.statValue}>{personaje?.principio}</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Presencia</Text>
                  <Text style={styles.statValue}>{personaje?.presencia}</Text>
                </View>
              </View>

              <Text
                style={{
                  color: "#8c8c8c",
                  fontSize: 13,
                  marginTop: 18,
                  marginBottom: 10,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Características secundarias
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                }}
              >
                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>Academicismo</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.academisismo}</Text>
                </View>

                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>Alerta</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.alerta}</Text>
                </View>

                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>Atletismo</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.atletismo}</Text>
                </View>

                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>Con. Bakemono</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.conBakemono}</Text>
                </View>

                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>Mentir</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.mentir}</Text>
                </View>

                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>Pilotear</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.pilotear}</Text>
                </View>

                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>Artes Marciales</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.artesMarciales}</Text>
                </View>

                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>Medicina</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.medicina}</Text>
                </View>

                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>Obj. Mágicos</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.conObjMagicos}</Text>
                </View>

                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>Sigilo</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.sigilo}</Text>
                </View>

                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>Con. Esferas</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.conEsferas}</Text>
                </View>

                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>Con. Leyendas</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.conLeyendas}</Text>
                </View>

                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>Forja</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.forja}</Text>
                </View>

                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>Con. Demonio</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.conDemonio}</Text>
                </View>

                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>Con. Espiritual</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.conEspiritual}</Text>
                </View>

                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>Blaster</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.manejoBlaster}</Text>
                </View>

                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>Sombras</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.manejoSombras}</Text>
                </View>

                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>Trato Bakemono</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.tratoBakemono}</Text>
                </View>

                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>Hechicería</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.conHechiceria}</Text>
                </View>

                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>Med. Vital</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.medVital}</Text>
                </View>

                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>Med. Espiritual</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.medEspiritual}</Text>
                </View>

                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>Rayo</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.rayo}</Text>
                </View>

                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>Fuego</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.fuego}</Text>
                </View>

                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>Frío</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.frio}</Text>
                </View>

                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>Veneno</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.veneno}</Text>
                </View>

                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>Corte</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.corte}</Text>
                </View>

                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>Energía</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.energia}</Text>
                </View>

                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>{personaje?.apCombate || "Aptitud nueva"}</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.valCombate}</Text>
                </View>

               

                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>{personaje?.apCombate2 || "Aptitud nueva"}</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.valCombate2}</Text>
                </View>

                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>{personaje?.add1 || "Aptitud nueva"}</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.valAdd1 ?? "0"}</Text>
                </View>

                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>{personaje?.add2 || "Aptitud nueva"}</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.valAdd2 ?? "0"}</Text>
                </View>

                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>{personaje?.add3 || "Aptitud nueva"}</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.valAdd3 ?? "0"}</Text>
                </View>

                <View style={styles.secundariaCard}>
                  <Text style={styles.secundariaTitulo}>{personaje?.add4 || "Aptitud nueva"}</Text>
                  <Text style={styles.secundariaNumero}>{personaje?.valAdd4 ?? "0"}</Text>
                </View>

               
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

//modal para ver el inventario
const ModalInventario = ({ visible, personaje, onClose }) => {
  const [itemAbierto, setItemAbierto] = useState(null);

  const cerrar = () => {
    setItemAbierto(null);
    onClose();
  };

  const inventario = Array.isArray(personaje?.inventario)
    ? personaje.inventario
    : [];

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalOverlayFicha}>
        <View
          style={{
            width: "94%",
            maxHeight: "88%",
            backgroundColor: "#101010",
            borderRadius: 18,
            borderWidth: 1,
            borderColor: "#2a2a2a",
            overflow: "hidden",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: "#222",
            }}
          >
            <Text
              style={{
                color: "#e5e5e5",
                fontSize: 20,
                fontWeight: "700",
                flex: 1,
              }}
              numberOfLines={1}
            >
              Inventario
            </Text>

            <TouchableOpacity
              onPress={cerrar}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "#db1c1c",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                X
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              padding: 14,
              paddingBottom: 24,
            }}
          >
            {inventario.length === 0 ? (
              <View
                style={{
                  paddingVertical: 40,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#7a7a7a",
                    fontSize: 15,
                  }}
                >
                  El personaje no tiene objetos en el inventario.
                </Text>
              </View>
            ) : (
              inventario.map((item, index) => {
                const abierto = itemAbierto === index;

                return (
                  <View
                    key={index}
                    style={{
                      backgroundColor: "#171717",
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "#2a2a2a",
                      marginBottom: 10,
                      overflow: "hidden",
                    }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() =>
                        setItemAbierto(abierto ? null : index)
                      }
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 12,
                        paddingVertical: 12,
                        backgroundColor: abierto ? "#c041d17a" : "#151515",
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: "#fcce29",
                            fontSize: 16,
                            fontWeight: "700",
                          }}
                          numberOfLines={1}
                        >
                          {item?.nombre || "Objeto sin nombre"}
                        </Text>

                        <Text
                          style={{
                            color: "#f1eaea",
                            fontSize: 12,
                            marginTop: 2,
                          }}
                        >
                          Cantidad: {item?.cantidad || 0}
                        </Text>
                      </View>

                      <Text
                        style={{
                          color: "#cfcfcf",
                          fontSize: 18,
                          marginLeft: 10,
                        }}
                      >
                        {abierto ? "▲" : "▼"}
                      </Text>
                    </TouchableOpacity>

                    {abierto && (
                      <View
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 12,
                          borderTopWidth: 1,
                          borderTopColor: "#2a2a2a",
                          backgroundColor:"#c9db89e8",
                        }}
                      >
                      

                    

                        <View>
                          <Text
                            style={{
                              color: "#d12222",
                              fontSize: 11,
                              marginBottom: 6,
                              textTransform: "uppercase",
                            }}
                          >
                            Descripción
                          </Text>

                          <Text
                            style={{
                              color: "#111312",
                              fontSize: 14,
                              lineHeight: 20,
                            }}
                          >
                            {item?.descripcion?.trim()
                              ? item.descripcion
                              : "Sin descripción."}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const ModalTecnicas = ({ visible, personaje, onClose }) => {
  const [itemAbierto, setItemAbierto] = useState(null);

  const cerrar = () => {
    setItemAbierto(null);
    onClose();
  };

  const tecnicasNormales = Array.isArray(personaje?.dominios)
    ? personaje.dominios
    : [];

  

  const hechizos = Array.isArray(personaje?.hechizos)
    ? personaje.hechizos
    : [];

    const tecnicasEspeciales = Array.isArray(personaje?.tecEspecial)
    ? personaje.tecEspecial
    : [];

  const renderItem = (item, index, tipo) => {
    const key = `${tipo}-${index}`;
    const abierto = itemAbierto === key;

    const colores = {
      normal: {
        border: "#2a2a2a",
        header: "#241338",
        accent: "#b8a8ff",
        body: "#d9d1f0",
      },
      especial: {
        border: "#8b6b13",
        header: "#3a2a00",
        accent: "#9cff8d",
        body: "#d6c27d",
      },
      hechizo: {
        border: "#5a2d82",
        header: "#2b1740",
        accent: "#caa7ff",
        body: "#cdb6ff",
      },
    };

    const c = colores[tipo];

    return (
      <View
        key={key}
        style={{
          backgroundColor: "#171717",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: c.border,
          marginBottom: 10,
          overflow: "hidden",
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setItemAbierto(abierto ? null : key)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 12,
            backgroundColor: abierto ? c.header : "#151515",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#fcce29", fontSize: 16, fontWeight: "700" }}>
              {item?.nombre || "Sin nombre"}
            </Text>

            <Text style={{ color: c.accent, fontSize: 12, marginTop: 4 }}>
              {tipo === "normal"
                ? `${item?.dominio || "-"} • Ki ${item?.nivelKi || "-"}`
                : tipo === "especial"
                ? "Técnica especial"
                : `Ryu ${item?.ryu || "-"} • Nivel ${item?.nivelKi || "-"}`}
            </Text>
          </View>

          <Text style={{ color: "#ddd", fontSize: 18 }}>
            {abierto ? "▲" : "▼"}
          </Text>
        </TouchableOpacity>

        {abierto && (
          <View
            style={{
              padding: 14,
              borderTopWidth: 1,
              borderTopColor: "#2a2a2a",
              backgroundColor: c.body,
            }}
          >
            {tipo === "especial" ? (
              <>
                <Text style={{ color: "#6b1d1d", fontSize: 11, fontWeight: "700" }}>
                  Presentación
                </Text>
                <Text style={{ color: "#111", marginBottom: 10 }}>
                  {item?.presentacion || "Sin presentación"}
                </Text>

                <Text style={{ color: "#6b1d1d", fontSize: 11, fontWeight: "700" }}>
                  Sistema
                </Text>
                <Text style={{ color: "#111" }}>
                  {item?.sistema || "Sin sistema"}
                </Text>
              </>
            ) : (
              <>
                <Text style={{ color: "#6b1d1d", fontSize: 11, fontWeight: "700" }}>
                  Descripción
                </Text>
                <Text style={{ color: "#111", marginBottom: 10 }}>
                  {item?.descripcion || "Sin descripción"}
                </Text>

                <Text style={{ color: "#6b1d1d", fontSize: 11, fontWeight: "700" }}>
                  Sistema
                </Text>
                <Text style={{ color: "#111", marginBottom: 10 }}>
                  {item?.sistema || "Sin sistema"}
                </Text>

                <Text style={{ color: "#6b1d1d", fontSize: 11, fontWeight: "700" }}>
                  Coste / Invocación
                </Text>
                <Text style={{ color: "#111" }}>
                  Ki: {item?.costeKi || "-"} | Inv: {item?.invo || "-"}
                </Text>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalOverlayFicha}>
        <View
          style={{
            width: "94%",
            maxHeight: "88%",
            backgroundColor: "#101010",
            borderRadius: 18,
            borderWidth: 1,
            borderColor: "#2a2a2a",
            overflow: "hidden",
          }}
        >
          {/* HEADER */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: "#222",
            }}
          >
            <Text style={{ color: "#e5e5e5", fontSize: 20, fontWeight: "700" }}>
              Técnicas
            </Text>

            <TouchableOpacity
              onPress={cerrar}
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: "#cf2020",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff" }}>X</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 30 }}>
            {/* TECNICAS NORMALES */}
            <Text style={{ color: "#b8a8ff", marginBottom: 8, fontWeight: "700" }}>
              Técnicas
            </Text>
            {tecnicasNormales.length === 0
              ? <Text style={{ color: "#666" }}>Sin técnicas</Text>
              : tecnicasNormales.map((i, idx) => renderItem(i, idx, "normal"))}

           

            {/* HECHIZOS */}
            <Text style={{ color: "#caa7ff", marginTop: 16, marginBottom: 8, fontWeight: "700" }}>
              Hechizos
            </Text>
            {hechizos.length === 0
              ? <Text style={{ color: "#666" }}>Sin hechizos</Text>
              : hechizos.map((i, idx) => renderItem(i, idx, "hechizo"))}


               {/* ESPECIALES */}
            <Text style={{ color: "#9cff8d", marginTop: 16, marginBottom: 8, fontWeight: "700" }}>
              Poderes / Especiales
            </Text>
            {tecnicasEspeciales.length === 0
              ? <Text style={{ color: "#666" }}>Sin especiales</Text>
              : tecnicasEspeciales.map((i, idx) => renderItem(i, idx, "especial"))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};


// =====================
// PANEL PRINCIPAL
// =====================
export const NarradorPanel = () => {
  
  const { coleccionPersonajes, updateAnimacionPersonaje, updateAnimacionPersonajeUsuario } = useContext(AuthContext);



    const { historialChat, estatus, nick } = useContext(AuthContext);
    const [estadoTiempoReal, setEstadoTiempoReal] = useState({}); 



  const [busqueda, setBusqueda] = useState("");
  const [seleccionados, setSeleccionados] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [personajeActivo, setPersonajeActivo] = useState(null);



  
  const pulso = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(pulso, {
          toValue: 0,
          duration: 600,
          useNativeDriver: false,
        }),
      ])
    );
  
    loop.start();
  
    return () => loop.stop();
  }, []);
// REACCIONAR A CAMBIOS EN EL HISTORIAL DE CHAT
useEffect(() => {
  if (!historialChat.length) return;

  const nuevoEstado = {};

  // recorrer de atrás hacia adelante
  for (let i = historialChat.length - 1; i >= 0; i--) {
    const msg = historialChat[i];

    if (
      msg.tipo !== "vida" &&
      msg.tipo !== "ki" &&
      msg.tipo !== "ken"
    ) continue;

    const id = String(msg.idpersonaje);

    // si no es de mi lista, ignorar
    const esDeMiLista = seleccionados.some(
      p => String(p.idpersonaje) === id
    );
    if (!esDeMiLista) continue;

    if (!nuevoEstado[id]) {
      nuevoEstado[id] = {};
    }

    // solo setear si todavía no lo tenemos
    

        if (msg.tipo === "vida") {
        if (nuevoEstado[id].vidaActual == null && msg.vidaActual != null) {
            nuevoEstado[id].vidaActual = msg.vidaActual;
        }

        if (nuevoEstado[id].vidaTotal == null && msg.vidaTotal != null) {
            nuevoEstado[id].vidaTotal = msg.vidaTotal;
        }
    }
  

        if (msg.tipo === "ki") {
        if (nuevoEstado[id].kiActual == null && msg.kiActual != null) {
            nuevoEstado[id].kiActual = msg.kiActual;
        }

        if (nuevoEstado[id].kiTotal == null && msg.ki != null) {
  nuevoEstado[id].kiTotal = msg.ki;
}
    }


        if (msg.tipo === "ken") {
        if (nuevoEstado[id].kenActual == null && msg.kenActual != null) {
            nuevoEstado[id].kenActual = msg.kenActual;
        }

       if (nuevoEstado[id].kenTotal == null && msg.ken != null) {
  nuevoEstado[id].kenTotal = msg.ken;
}
    }
  }

  setEstadoTiempoReal(nuevoEstado);

}, [historialChat, seleccionados]);

  //modal de caracteriticas  
   const [modalVisibleCaracteristicas, setModalVisibleCaracteristicas] = useState(false);
   // modal inventario
    const [modalVisibleInventario, setModalVisibleInventario] = useState(false);

       // modal tecnicas
    const [modalVisibleTecnicas, setModalVisibleTecnicas] = useState(false);

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





   const calcularVidaTotal = (pj) => { 
    const ki = Number(pj.ki) || 0; const fortaleza = Number(pj.fortaleza) || 0; const positiva = Number(pj.positiva) || 0; const negativa = Number(pj.negativa) || 0; const faseSalud = ki >= 10 ? ki + fortaleza : fortaleza; 
    return faseSalud * (positiva + negativa); 
};



const calcularEstadoFase = (pj, vidaActual) => {
  const vida = Number(vidaActual) || 0;
  const ki = Number(pj.ki) || 0;
  const fortaleza = Number(pj.fortaleza) || 0;
  const positiva = Number(pj.positiva) || 0;
  const negativa = Number(pj.negativa) || 0;

  const faseSalud = ki >= 10 ? ki + fortaleza : fortaleza;

  const vidaTotalPositiva = faseSalud * positiva;
  const vidaTotal = faseSalud * (positiva + negativa);

  if (vida === 0) return "SIN HERIDAS";
  if (vida > vidaTotal) return "MUERTO";

  if (vida <= vidaTotalPositiva) {
    if (vida >= vidaTotalPositiva - faseSalud) return "MALHERIDO";
    if (vida >= vidaTotalPositiva - faseSalud * 2) return "MALTRECHO";
    return "RAZGADO";
  }

  const exceso = vida - vidaTotalPositiva;

  if (exceso <= faseSalud) {
    if (negativa === 1) return "MORIBUNDO";
    if (negativa === 2) return "INCAPACITADO";
    if (negativa >= 3) return "INCONCIENTE";
  }

  if (exceso <= faseSalud * 2) {
    if (negativa <= 2) return "MORIBUNDO";
    return "INCAPACITADO";
  }

  if (exceso <= faseSalud * 3) {
    if (negativa >= 3) return "MORIBUNDO";
  }

  return "MUERTO";
};

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
        renderItem={({ item }) => {


         const estado = estadoTiempoReal[String(item.idpersonaje)] || {};

            const vidaActual = estado.vidaActual ?? item.vidaActual ?? 0;
            const vidaTotal = estado.vidaTotal ?? calcularVidaTotal(item) ?? 1;


            
            const kiActual = estado.kiActual ?? item.kiActual ?? 0;
            const kiTotal = estado.kiTotal ?? item.ki ?? 1;
          

            const kenActual = estado.kenActual ?? item.kenActual ?? 0;
            const kenTotal = estado.kenTotal ?? item.ken ?? 1;
            
            const estadoFase = calcularEstadoFase(item, vidaActual);

            //si es una estrella del destino
           const esLeyenda = Number(item.ken) >= 400;

return(
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
    fontSize:18,
  }}>
    {item.nombre}
  </Text>

  <Text style={{
    color: "#0fd3ec",
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

                             <View style={{ marginTop: 6 }}>
                               <Text style={styles.textVida}> 
                                                                 vida: {vidaActual}/{vidaTotal || "??"}     {estadoFase}
                                                                 </Text> 

                                   <BarraVida 
                                    actual={vidaActual} 
                                    total={vidaTotal} 
                                    color="red"
                                    estadoFase={estadoFase}
                                    pulso={pulso} /> 
                                    
                                    <Text style={styles.textKi}> ki: {kiActual}/{kiTotal || "??"} </Text> 
                                    <Barra actual={kiActual} total={kiTotal} color="blue" /> 
                                    <Text style={styles.textKen}> ken: {kenActual}/{kenTotal || "??"} </Text> 
                                    
                                    <Barra actual={kenActual} total={kenTotal} color="green" />
                             </View>












  <TouchableOpacity
  onPress={() => {
    setPersonajeActivo(item);
    setModalVisibleCaracteristicas(true);
  }}
  activeOpacity={0.8}
  style={{
    backgroundColor: "#8c68e0",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth:1,
    borderColor:"#1a0842",
    width: 120,
    marginTop: 10,
    
  }}
>
  <Text
    style={{
      color: "#fff",
      fontSize: 12,
      fontWeight: "600",
    }}
  >
    Caracteristicas
  </Text>
</TouchableOpacity>

  <TouchableOpacity
  onPress={() => {
    setPersonajeActivo(item);
    setModalVisibleInventario(true);
  }}
  activeOpacity={0.8}
  style={{
    backgroundColor: "#e068a4",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth:1,
    borderColor:"#f4f4f5",
    width: 120,
    marginTop: 10,
    
  }}
>
  <Text
    style={{
      color: "#f8f8f8",
      fontSize: 12,
      fontWeight: "600",
    }}
  >
    Inventario
  </Text>
</TouchableOpacity>


  <TouchableOpacity
  onPress={() => {
    setPersonajeActivo(item);
    setModalVisibleTecnicas(true);
  }}
  activeOpacity={0.8}
  style={{
    backgroundColor: "#0acc81",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth:1,
    borderColor:"#f3eef3",
    width: 120,
    marginTop: 10,
    
  }}
>
  <Text
    style={{
      color: "#0f0e0e",
      fontSize: 12,
      fontWeight: "600",
     
    
    }}
  >
    Poderes
  </Text>
</TouchableOpacity>

</View>

            </View>
          </ImageBackground>
)


      
        }}
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





      <ModalCaracteristicas
        visible={modalVisibleCaracteristicas}
        personaje={personajeActivo}
        
        onClose={() => {
          setModalVisibleCaracteristicas(false);
          setPersonajeActivo(null);
        }}
      />


      <ModalInventario
        visible={modalVisibleInventario}
        personaje={personajeActivo}
        
        onClose={() => {
          setModalVisibleInventario(false);
          setPersonajeActivo(null);
        }}
      />

        <ModalTecnicas
        visible={modalVisibleTecnicas}
        personaje={personajeActivo}
        
        onClose={() => {
          setModalVisibleTecnicas(false);
          setPersonajeActivo(null);
        }}
      />

    </View>
  );
};





const Barra = ({ actual, total, color }) => { 
    const porcentaje = parseInt(total) ? (actual / parseInt(total)) * 100 : 0; 
    
    return ( 
    <View style={{ width: "100%", height: 10, backgroundColor: "#f3dc0eef", borderRadius: 5, overflow: "hidden" }}> 
    
    <View style={{ width: `${porcentaje}%`, height: "100%", backgroundColor: color }} /> 

    </View> 
    
); 
};



const BarraVida = ({ actual, total, color, estadoFase, pulso }) => {
  const porcentaje = parseInt(total) ? (actual / parseInt(total)) * 100 : 0;

  let intensidadMin = 0;
  let intensidadMax = 0;

  switch (estadoFase) {
    case "RAZGADO":
      intensidadMin = 0.05;
      intensidadMax = 0.25;
      color="red";
      break;
    case "MALTRECHO":
      intensidadMin = 0.08;
      intensidadMax = 0.33;
      color="red";
      break;
    case "MALHERIDO":
      intensidadMin = 0.08;
      intensidadMax = 0.42;
      color="red";
      break;
    case "INCONCIENTE":
      intensidadMin = 0.1;
      intensidadMax = 0.58;
        color = "#57007ada";
      break;
    case "INCAPACITADO":
      intensidadMin = 0.12;
      intensidadMax = 0.65;
       color = "#57007ada";
      break;
    case "MORIBUNDO":
      intensidadMin = 0.15;
      intensidadMax = 0.8;
       color = "#57007a7a";
      break;
    default:
      intensidadMin = 0;
      intensidadMax = 0;
  }

  const muerto = estadoFase === "MUERTO";

  const colorBarra = muerto ? "#131212d7" : color;
  const mostrarPulso = estadoFase !== "SIN HERIDAS" && !muerto;

  return (
    <View style={{ width: "100%", height: 10, borderRadius: 5, overflow: "hidden" }}>
      
      <View style={{ position: "absolute", width: "100%", height: "100%", backgroundColor: "#f3dc0eef" }} />

      <View style={{ width: `${porcentaje}%`, height: "100%", backgroundColor: colorBarra }} />

      {mostrarPulso && (
        <Animated.View
          pointerEvents="none"
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: pulso.interpolate({
              inputRange: [0, 1],
              outputRange: [
                `rgba(255,0,0,${intensidadMin})`,
                `rgba(255,0,0,${intensidadMax})`,
              ],
            }),
          }}
        />
      )}

    </View>
  );
};





// =====================
// STYLES
// =====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
   padding:10,
    backgroundColor: "black",
    paddingBottom: 40,
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
    fontWeight: "bold",
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
    borderColor:"#f3db07da",
    marginBottom: 10,
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
    backgroundColor: "rgb(0, 0, 0)",
    justifyContent: "center",
    alignItems: "center",
    
  },

  modalOverlayFicha: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.92)",
    //justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },

  modalContainer: {
    width: "85%",
    maxHeight: "90%",
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








  statBox: {
  width: "20%",
  backgroundColor: "#353333",
  borderRadius: 8,
  paddingVertical: 2,
  paddingHorizontal: 2,
  margin: 2,
  alignItems: "center",
},

statLabel: {
  color: "#ecd610",
  fontSize: 10,
  textAlign: "center",
},

statValue: {
  color: "white",
  fontSize: 16,
  fontWeight: "700",
  marginTop: 2,
},

secundariaCard: {
  width: "48%",
  backgroundColor: "#1d1d1d",
  borderRadius: 8,
  paddingVertical: 6,
  paddingHorizontal: 8,
  marginBottom: 6,
  borderWidth: 1,
  borderColor: "#2f2f2f",
},

secundariaTitulo: {
  color: "#aa92e4",
  fontSize: 12,
},

secundariaNumero: {
  color: "white",
  fontSize: 15,
  fontWeight: "700",
  marginTop: 2,
},




//BARRAS DE VIDA, KI Y KEN

textVida: { color: "#f7261fdc", fontSize: 13, fontWeight: "bold", width: "100%", }, 
textKi: { color: "#1762d1dc", fontSize: 13, fontWeight: "bold", width: "100%", }, 
textKen: { color: "#0bf00bec", fontSize: 13, fontWeight: "bold", width: "100%", },



tituloCampo :{
  color: "#6b1d1d",
  fontSize: 11,
  fontWeight: "700",
  marginBottom: 4,
  textTransform: "uppercase",
},

textoCampo : {
  color: "#111",
  fontSize: 14,
  lineHeight: 20,
}
});