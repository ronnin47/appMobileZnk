
import { StyleSheet, Text, View, Dimensions, ScrollView, } from 'react-native';
import React, { useContext } from 'react';
import { useState } from 'react';
import 'react-native-gesture-handler';
import { Carrusel } from './carrusel';
import { AuthContext } from './AuthContext';

const windowWidth = Dimensions.get('window').width;

export default function Principal() {
  
  const { personajes } = useContext(AuthContext);
  
//const imagenes = personajes.map(p => p.imagen);
const imagenes = personajes.map(p => ({
  imagen: p.imagen.startsWith('data:image') ? p.imagen : `data:image/jpeg;base64,${p.imagen}`,
  nombre: p.nombre
}));

const imagenesBasicas = [
  { imagen: '../assets/imagenBase.jpeg', nombre: 'Imagen Base' },
  { imagen: '../assets/imagenFondo.jpeg', nombre: 'Otra Imagen' },
  { imagen: '../assets/imagenBase.jpeg', nombre: 'Imagen Base' },
  { imagen: '../assets/imagenFondo.jpeg', nombre: 'Otra Imagen' },
];
//console.log(imagenes)

  return (
    <ScrollView 
      style={styles.container}
      horizontal={false}
      pagingEnabled={false}
      showsHorizontalScrollIndicator={false}
    
      >
    
  
    
      
      <View style={styles.contenedorPrincipal}>
        <Text style={styles.tituloSeccion}>Mis Personajes</Text>
      <Carrusel imagenes={imagenes}></Carrusel>
      </View>

      <View style={styles.contenedorPrincipal}>
        <Text style={styles.tituloSeccion}>Seccion 2</Text>
        <Carrusel imagenes={imagenesBasicas} />
      </View>
  
      <View style={styles.contenedorPrincipal}>
        <Text style={styles.tituloSeccion}>Seccion 3</Text>
      <Carrusel imagenes={imagenesBasicas} />
      </View>

      <View style={styles.contenedorPrincipal}>
        <Text style={styles.tituloSeccion}>Seccion 4</Text>
  <Carrusel imagenes={imagenesBasicas} />
      </View>

      <View style={styles.contenedorPrincipal}>
        <Text style={styles.tituloSeccion}>Seccion 5</Text>
      <Carrusel imagenes={imagenesBasicas} />
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
  tituloSeccion:{
    color:"#fff",
     textAlign: "center",
     margin:2

  }
});

