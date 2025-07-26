
import { StyleSheet, Text, View, Dimensions, ScrollView,Image } from 'react-native';
import React, { useContext } from 'react';
import { useState } from 'react';
import 'react-native-gesture-handler';
import { Carrusel } from './carrusel';
import { AuthContext } from './AuthContext';
import { TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native'; // para navegar
//import { Nuevo } from './nuevo';

import { LinearGradient } from 'expo-linear-gradient';
const windowWidth = Dimensions.get('window').width;
import { API_BASE_URL } from './config';



export default function Principal() {
  
  const { personajes, savePersonajes,consumir,sagas, setSagas, estatus,coleccionPersonajes,saveColeccionPersonajes,fetchSagas} = useContext(AuthContext);

  const navigation = useNavigation();
//crear la nueva ficha
const crearFichaPersonaje = async () => {

  const usuarioId = await AsyncStorage.getItem('userId');

  const pjNew = {
    nombre: "Ficha Nueva",
    dominio: "",
    raza: "",
    naturaleza: "",
    edad: "",
    ken: 0,
    ki: 0,
    destino: 0,
    pDestino: 0,
    fuerza: 0,
    fortaleza: 0,
    destreza: 0,
    agilidad: 0,
    sabiduria: 0,
    presencia: 0,
    principio: 0,
    sentidos: 0,
    academisismo: 0,
    alerta: 0,
    atletismo: 0,
    conBakemono: 0,
    mentir: 0,
    pilotear: 0,
    artesMarciales: 0,
    medicina: 0,
    conObjMagicos: 0,
    sigilo: 0,
    conEsferas: 0,
    conLeyendas: 0,
    forja: 0,
    conDemonio: 0,
    conEspiritual: 0,
    manejoBlaster: 0,
    manejoSombras: 0,
    tratoBakemono: 0,
    conHechiceria: 0,
    medVital: 0,
    medEspiritual: 0,
    rayo: 0,
    fuego: 0,
    frio: 0,
    veneno: 0,
    corte: 0,
    energia: 0,
    ventajas: [],
    apCombate: "",
    valCombate: 0,
    apCombate2: "",
    valCombate2: 0,
    add1: "",
    valAdd1: 0,
    add2: "",
    valAdd2: 0,
    add3: "",
    valAdd3: 0,
    add4: "",
    valAdd4: 0,
    imagen: null,
    inventario: [],
    dominios: [],
    kenActual: 0,
    kiActual: 0,
    positiva: 3,
    negativa: 3,
    vidaActual: 0,
    hechizos: [],
    consumision: 0,
    iniciativa: 0,
    historia: "",
    tecEspecial:[],
    conviccion: "",
    cicatriz: 0,
    notasaga: [],
    resistencia: 0,
    pjPnj: true,
    usuarioId: usuarioId
  };

  try {
    const response = await axios.post(`${API_BASE_URL}/insert-personaje`, pjNew, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const { idpersonaje } = response.data;


    //console.log("+++++este es el id que RECIBE: ",idpersonaje)

    // Puedes guardar el personaje en el estado o redirigir al formulario de edición
     // Actualiza la lista con el nuevo personaje, añadiendo el id recibido
   /* savePersonajes(prevPersonajes => [
      ...prevPersonajes,
      { ...pjNew, idpersonaje }
    ]);
*/
// ... después de recibir idpersonaje
savePersonajes([...personajes, { ...pjNew, idpersonaje }]);
 saveColeccionPersonajes([...coleccionPersonajes, pjNew]);   

  // 🔄 En lugar de agregar manualmente, recarga todos
    await consumir();
 //fetchSagas()

  } catch (error) {
    console.error("Error al crear personaje vacío:", error.message);
 
  }
};


 const crearSaga = async () => {


  try {
    const datosSaga = {
      titulo: "Nueva Saga",
      presentacion: "Una introducción épica...",
      personajes: [], // o un array, según tu backend
      imagensaga: null, // algo tipo "data:image/png;base64,ABCDEF..."
    };

    const response = await axios.post(`${API_BASE_URL}/insert-saga`, datosSaga);

    if (response.status === 201) {
      const { idsaga, imagenurl, imagencloudid } = response.data;
      //console.log("Saga creada con ID:", idsaga);
      //console.log("URL imagen:", imagenurl);


      setSagas([...sagas, { ...datosSaga, idsaga }]);
    } else {
      console.warn("Algo salió mal al crear la saga:", response.data);
    }

  } catch (error) {
    console.error("Error en la creación de saga:", error.response?.data || error.message);
  }
};

  const universoCelesteItems = [
    { id: 'ranking', nombre: 'Ranking', imagen:"https://res.cloudinary.com/dzul1hatw/image/upload/v1753555471/puerta_mo6o6p.jpg"},
    { id: 'poderesUnicos', nombre: 'Poderes Unicos', imagen:"https://res.cloudinary.com/dzul1hatw/image/upload/v1753555606/tecnicaEspecial_e0glko.jpg" },
    { id: 'reglas', nombre: 'Reglas', imagen: "https://res.cloudinary.com/dzul1hatw/image/upload/v1753280092/tesoros/tesoro_24.jpg" },
  ];


    const componentesManual = [
    { id: 'objetosMagicos', nombre: 'Tesoros del universo', imagen:"https://res.cloudinary.com/dzul1hatw/image/upload/v1753555060/tesoros_mmmtau.jpg"  },
    { id: 'neotecnia', nombre: 'Neotecnia', imagen:"https://res.cloudinary.com/dzul1hatw/image/upload/v1753555392/neotecnia_yliqxe.jpg" },
    { id: 'herbolaria', nombre: 'Herbolaria', imagen: "https://res.cloudinary.com/dzul1hatw/image/upload/v1753555998/herbolaria_tnhxjw.jpg" },
  ];

  return (
    <ScrollView 
      style={styles.container}
      horizontal={false}
      pagingEnabled={false}
      showsHorizontalScrollIndicator={false}
      >
      
      <View style={styles.contenedorPrincipal}>
        <View style={styles.tituloYBotonContainer}>
          <Text style={styles.tituloSeccion}>Mis Personajes</Text>
           <TouchableOpacity onPress={crearFichaPersonaje} activeOpacity={0.8} style={styles.botonWrapper}>
              <LinearGradient
                colors={['#f6f7f8', '#d9d9d9', '#a3a3a3', '#eaeaea']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.botonCrear}
              >
                <Text style={styles.textoBoton}>+ Crear Ficha</Text>
              </LinearGradient>
            </TouchableOpacity>
         
        </View>

       

        <Carrusel personajes={personajes} />
      </View>

     <View style={[styles.contenedorPrincipal, { marginTop: 0 }]}>
  <Text style={styles.tituloSeccion}>Universo Celeste</Text>
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    <View style={styles.row}>
      {universoCelesteItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.card}
          activeOpacity={0.9}
          onPress={() => {
            if (item.id === 'ranking') {
              navigation.navigate('Ranking');
            } else if(item.id=="poderesUnicos") {
               navigation.navigate('Poderes Unicos');
            }else {
              alert(`Seleccionaste ${item.nombre}`);
            }
          }}
        >
          <ImageWrapper uri={item.imagen} fallback={require('../assets/imagenBase.jpeg')} />
          <Text
            style={styles.text}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}
            ellipsizeMode="tail"
          >
            {item.nombre}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </ScrollView>
     </View>


        {/* Contenedor de Sagas con botón Crear Saga */}
      <View style={[styles.contenedorPrincipal, { marginTop: 20}]}>
        <View style={styles.tituloYBotonContainer}>
          <Text style={styles.tituloSeccion}>Sagas</Text>

          {/* Mostrar botón sólo si estatus es narrador */}
         {estatus === 'narrador' && (
            <TouchableOpacity onPress={crearSaga} activeOpacity={0.8} style={styles.botonWrapper}>
              <LinearGradient
                colors={['#f6f7f8', '#d9d9d9', '#a3a3a3', '#eaeaea']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.botonCrear}
              >
                <Text style={styles.textoBoton}>+ Crear Saga</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.row}>
          {sagas.slice().reverse().map((saga) => (
  <TouchableOpacity
    key={saga.idsaga}
    style={styles.card}
    activeOpacity={0.9}
    onPress={() => navigation.navigate('Sagas', { sagaId: saga.idsaga })}
  >
    <ImageWrapper
      uri={saga.imagenurl}
      fallback={require('../assets/imagenBase.jpeg')}
    />
    <Text
      style={styles.text}
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.5}
      ellipsizeMode="tail"
    >
      {saga.titulo}
    </Text>
  </TouchableOpacity>
))}
          </View>
        </ScrollView>
      </View>

         {/* Contenedor de nuevos componentes orientado hacia Herbolaria, Neotecnia y Objetos Magicos*/}
       <View style={[styles.contenedorPrincipal, { marginTop: 20, marginBottom: 80 }]}>
       
          <Text style={styles.tituloSeccion}>Manual ZNK</Text>
           <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    <View style={styles.row}>
      {componentesManual.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.card}
          activeOpacity={0.9}
          onPress={() => {
            if (item.id === 'objetosMagicos') {
              navigation.navigate('Tesoros del universo');
            } else if(item.id=="neotecnia") {
               navigation.navigate('Neotecnia');
            }else if(item.id=="herbolaria") {
               navigation.navigate('Herbolaria');
            }else {
              alert(`Seleccionaste ${item.nombre}`);
            }
          }}
        >
          <ImageWrapper uri={item.imagen} fallback={require('../assets/imagenBase.jpeg')} />
          <Text
            style={styles.text}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}
            ellipsizeMode="tail"
          >
            {item.nombre}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </ScrollView>

        </View>

       

      
    
    </ScrollView>
  );
}



const ImageWrapper = ({ uri, fallback }) => {
  const [source, setSource] = React.useState(fallback);

  React.useEffect(() => {
   // console.log('Tipo de uri:', typeof uri, 'valor:', uri);

    if (uri) {
      if (typeof uri === 'string') {
        // URI remota (url)
        setSource({ uri });
      } else {
        // Imagen local (require devuelve número)
        setSource(uri);
      }
    } else {
      setSource(fallback);
    }
  }, [uri]);

  return (
    <Image
      source={source}
      onError={() => setSource(fallback)}
      style={styles.imagen}
    />
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingLeft: 6,
    paddingTop: 20,
  },
  screen: {
    width: windowWidth,
    paddingTop: 30,
    paddingHorizontal: 10,
    paddingBottom: 40,
    backgroundColor: '#000',
  },
  textoGrande: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  contenedorPrincipal: {
    marginBottom: 5,
    padding: 5,
  },
  tituloSeccion: {
    fontSize: 22,
    fontWeight: 'bold',
    marginRight: 10,
    color: '#fff',
    marginBottom:15,
  },
botonCrear: {
  backgroundColor: '#FFC107', // golden orange
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 6,
  borderWidth: 1,
  borderColor: '#FFF8E1', // borde dorado claro

  // Sombra glow blanca más intensa
  shadowColor: '#ffffff',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 1,
  shadowRadius: 12,
  elevation: 10,

  // Para que el contenido quede centrado y ordenado
  justifyContent: 'center',
  alignItems: 'center',
},
textoBoton: {
  color: 'black', 
  fontWeight: 'bold',
  fontSize: 14,
  textAlign: 'center',
  
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 40,
},
  tituloYBotonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  row: {
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: 10,
  paddingHorizontal: 10,
},

card: {
  marginHorizontal: 8,
  alignItems: 'center',
},

 imagen: {
    width: 120,
    height: 160,
    borderWidth: 0.35,
    borderColor: "white",
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#fff',
    shadowOffset: {
      width: 4,
      height: 8,
    },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 15,
    backgroundColor: '#000',
    overflow: 'hidden',
  },

text: {
  fontSize: 16,
  textAlign: 'center',
  color: '#fff',
  width: 120,
},
});
