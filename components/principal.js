
import { StyleSheet, Text, View, Dimensions, ScrollView, } from 'react-native';
import React, { useContext } from 'react';
import { useState } from 'react';
import 'react-native-gesture-handler';
import { Carrusel } from './carrusel';
import { AuthContext } from './AuthContext';
import { TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const windowWidth = Dimensions.get('window').width;



export default function Principal() {
  
  const { personajes, savePersonajes } = useContext(AuthContext);

  
  
//const imagenes = personajes.map(p => p.imagen);
const pjs = personajes.map(p => {
  const img = p.imagen || '';
  return {
    idpersonaje: p.idpersonaje,
    imagen: img.startsWith('data:image') ? img : `data:image/jpeg;base64,${img}`,
    nombre: p.nombre || 'Sin Nombre',
  };
});





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
    imagen: "../assets/imagenBase.jpeg",
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
    conviccion: "",
    cicatriz: 0,
    notaSaga: [],
    resistencia: 0,
    pjPnj: true,
    usuarioId: usuarioId
  };

  try {
    const response = await axios.post(`http://192.168.0.38:3000/insert-personaje`, pjNew, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const { idpersonaje } = response.data;

    // Puedes guardar el personaje en el estado o redirigir al formulario de edición
     // Actualiza la lista con el nuevo personaje, añadiendo el id recibido
    savePersonajes(prevPersonajes => [
      ...prevPersonajes,
      { ...pjNew, idpersonaje }
    ]);

    

  } catch (error) {
    console.error("Error al crear personaje vacío:", error.message);
 
  }
};


  return (
    <ScrollView 
      style={styles.container}
      horizontal={false}
      pagingEnabled={false}
      showsHorizontalScrollIndicator={false}
    
      >
    
  
    
      
      <View style={styles.contenedorPrincipal}>
        <Text style={styles.tituloSeccion}>Mis Personajes</Text>

        <TouchableOpacity
          style={styles.botonCrear}
          onPress={crearFichaPersonaje} // Asegúrate de tener esta función disponible aquí o pasarla como prop
        >
          <Text style={styles.textoBoton}>+ Crear Ficha</Text>
        </TouchableOpacity>

        <Carrusel pjs={pjs} />
      </View>

     
  
    

      
      
      
    

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // fondo negro
    paddingLeft:6,
    paddingTop:20
  },
  screen: {
    width: windowWidth,
    paddingTop: 30,
    paddingHorizontal: 10,
    paddingBottom: 40,
    backgroundColor: '#000', // también negro para cada pantalla
  },
  textoGrande: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff', // texto blanco
  },
  contenedorPrincipal: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#fff', // texto blanco
   
    padding: 5, // para darle algo de espacio dentro del contenedor
  
  },
  tituloSeccion: {
  color: "#fff",
  textAlign: "center",
  margin: 2,
  fontFamily: "sans-serif", // Compatible en Android, Roboto
  fontSize: 18,
  fontWeight: "bold",       // Para hacerlo más destacado
   marginBottom: 12,
},
botonCrear: {
  backgroundColor: '#1e90ff',
  paddingVertical: 8,
  paddingHorizontal: 20,
  borderRadius: 10,
  alignSelf: 'center',
  marginBottom: 10,
},

textoBoton: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},
});

