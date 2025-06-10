
import { StyleSheet, Text, View, Dimensions, ScrollView, } from 'react-native';

import { useState } from 'react';
import 'react-native-gesture-handler';
import { Carrusel } from './carrusel';

const windowWidth = Dimensions.get('window').width;

export default function Principal() {
  const elements = [
    { id: 1, nombre: "dragon", imagen: require('../assets/dragonHelado.jpg') },
    { id: 2, nombre: "herbolaria", imagen: require('../assets/herbolaria.jpg') },
    { id: 3, nombre: "viejo Dragon", imagen: require('../assets/viejoDragon.jpg') },
    { id: 4, nombre: "dragon", imagen: require('../assets/dragonHelado.jpg') },
    { id: 5, nombre: "herbolaria", imagen: require('../assets/herbolaria.jpg') },
    { id: 6, nombre: "viejo Dragon", imagen: require('../assets/viejoDragon.jpg') },
    { id: 7, nombre: "dragon", imagen: require('../assets/dragonHelado.jpg') },
    { id: 8, nombre: "herbolaria", imagen: require('../assets/herbolaria.jpg') },
    { id: 9, nombre: "viejo Dragon", imagen: require('../assets/viejoDragon.jpg') },
    { id: 10, nombre: "dragon", imagen: require('../assets/dragonHelado.jpg') },
    { id: 12, nombre: "herbolaria", imagen: require('../assets/herbolaria.jpg') },
    { id: 13, nombre: "viejo Dragon", imagen: require('../assets/viejoDragon.jpg') },
    { id: 14, nombre: "dragon", imagen: require('../assets/dragonHelado.jpg') },
    { id: 15, nombre: "herbolaria", imagen: require('../assets/herbolaria.jpg') },
    { id: 16, nombre: "viejo Dragon", imagen: require('../assets/viejoDragon.jpg') },
    { id: 17, nombre: "dragon", imagen: require('../assets/dragonHelado.jpg') },
    { id: 18, nombre: "herbolaria", imagen: require('../assets/herbolaria.jpg') },
    { id: 19, nombre: "viejo Dragon", imagen: require('../assets/viejoDragon.jpg') },
    { id: 20, nombre: "dragon", imagen: require('../assets/dragonHelado.jpg') },
    { id: 21, nombre: "dragon", imagen: require('../assets/dragonHelado.jpg') },
    { id: 22, nombre: "herbolaria", imagen: require('../assets/herbolaria.jpg') },
    { id: 23, nombre: "viejo Dragon", imagen: require('../assets/viejoDragon.jpg') },
    { id: 24, nombre: "dragon", imagen: require('../assets/dragonHelado.jpg') },
    { id: 25, nombre: "herbolaria", imagen: require('../assets/herbolaria.jpg') },
    { id: 26, nombre: "viejo Dragon", imagen: require('../assets/viejoDragon.jpg') },
    { id: 27, nombre: "dragon", imagen: require('../assets/dragonHelado.jpg') },
    { id: 28, nombre: "herbolaria", imagen: require('../assets/herbolaria.jpg') },
    { id: 29, nombre: "viejo Dragon", imagen: require('../assets/viejoDragon.jpg') },
  ];

  const [personaje, setPersonaje] = useState("Matashiro");
  const [imagenes, setImagenes] = useState(elements);

  return (
    <ScrollView 
      style={styles.container}
      horizontal={false}
      pagingEnabled={false}
      showsHorizontalScrollIndicator={false}
    
      >
    
  
    
      
      <View style={styles.contenedorPrincipal}>
        <Text style={styles.tituloSeccion}>Seccion 1</Text>
      <Carrusel imagenes={imagenes}></Carrusel>
      </View>

      <View style={styles.contenedorPrincipal}>
        <Text style={styles.tituloSeccion}>Seccion 2</Text>
      <Carrusel imagenes={imagenes}></Carrusel>
      </View>
  
      <View style={styles.contenedorPrincipal}>
        <Text style={styles.tituloSeccion}>Seccion 3</Text>
      <Carrusel imagenes={imagenes}></Carrusel>
      </View>

      <View style={styles.contenedorPrincipal}>
        <Text style={styles.tituloSeccion}>Seccion 4</Text>
      <Carrusel imagenes={imagenes}></Carrusel>
      </View>

      <View style={styles.contenedorPrincipal}>
        <Text style={styles.tituloSeccion}>Seccion 5</Text>
      <Carrusel imagenes={imagenes}></Carrusel>
      </View>

      <View style={styles.contenedorPrincipal}>
        <Text style={styles.tituloSeccion}>Seccion 6</Text>
      <Carrusel imagenes={imagenes}></Carrusel>
      </View>

      <View style={styles.contenedorPrincipal}>
        <Text style={styles.tituloSeccion}>Seccion 7</Text>
      <Carrusel imagenes={imagenes}></Carrusel>
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

