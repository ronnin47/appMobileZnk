import React, { useContext, useEffect, useState } from 'react';
import {
  FlatList,
  Text,
  View,
  Image,
  StyleSheet,
  Pressable
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from './AuthContext';
import * as Animatable from 'react-native-animatable';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';


export const Carrusel = ({ personajes }) => {
  const { setPjSeleccionado } = useContext(AuthContext);
  const navigation = useNavigation();
  const imagenBase = require('../assets/imagenBase.jpeg');
  const [animados, setAnimados] = useState({});
  const [personajesOrdenados, setPersonajesOrdenados] = useState([]);
  const [ordenInicialAplicado, setOrdenInicialAplicado] = useState(false);
const [sound, setSound] = useState(null);
  /*
  const handlePress = (pj) => {
    setPjSeleccionado(pj.idpersonaje);
    navigation.navigate('PantallaDeslizable');
  };
*/

useEffect(() => {
  let sonido;

  const cargarSonido = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/seleccion.mp3'),
        { volume: 0.1 }
      );

      sonido = sound;
      setSound(sound);
    } catch (error) {
      console.log("Error cargando sonido:", error);
    }
  };

  cargarSonido();

  return () => {
    if (sonido) {
      sonido.unloadAsync();
    }
  };
}, []);


const handlePress = async (pj) => {
  try {
    const data = await AsyncStorage.getItem("rankingPersonajes");
    const ranking = data ? JSON.parse(data) : {};

    ranking[pj.idpersonaje] = (ranking[pj.idpersonaje] || 0) + 1;

    await AsyncStorage.setItem("rankingPersonajes", JSON.stringify(ranking));
    await AsyncStorage.setItem("ultimoUsado", pj.idpersonaje.toString());

  } catch (err) {
    console.log("Error guardando ranking:", err);
  }

  setPjSeleccionado(pj.idpersonaje);
  navigation.navigate('PantallaDeslizable');
};

const reproducirSonidoSeleccion = async () => {
  if (sound) {
    try {
      await sound.replayAsync();
    } catch (error) {
      console.log("Error reproduciendo sonido:", error);
    }
  }
};

useEffect(() => {
  const ordenar = async () => {
    try {
      const rankingData = await AsyncStorage.getItem("rankingPersonajes");
      const ranking = rankingData ? JSON.parse(rankingData) : {};

      const ultimoUsado = await AsyncStorage.getItem("ultimoUsado");
      const ultimoCreado = await AsyncStorage.getItem("ultimoCreado");

      const ordenados = [...(personajes || [])].sort((a, b) => {

        if (a.idpersonaje.toString() === ultimoCreado) return -1;
        if (b.idpersonaje.toString() === ultimoCreado) return 1;

        if (a.idpersonaje.toString() === ultimoUsado) return -1;
        if (b.idpersonaje.toString() === ultimoUsado) return 1;

        const aCount = ranking[a.idpersonaje] || 0;
        const bCount = ranking[b.idpersonaje] || 0;

        return bCount - aCount;
      });

      setPersonajesOrdenados(ordenados);

    } catch (err) {
      console.log("Error ordenando carrusel", err);
      setPersonajesOrdenados(personajes);
    }
  };

  ordenar();
}, [personajes]);






  const renderItem = ({ item }) => {
    const id = item.idpersonaje;
    const animar = animados[id];

    const onPress = () => {
      reproducirSonidoSeleccion();
        
      setAnimados(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setAnimados(prev => ({ ...prev, [id]: false }));
        handlePress(item);
      }, 400);
    };


  

    return (
      <Animatable.View
        animation={animar ? 'swing' : undefined}
        duration={800}
        useNativeDriver
      >
        <Pressable
          style={({ pressed }) => [
            styles.card,
            pressed && styles.cardPressed
          ]}
          onPress={onPress}
        >
          <ImageWrapper
            uri={
  item.imagen && item.imagen.startsWith('data:image')
    ? item.imagen
    : item.imagenurl
}
            fallback={imagenBase}
          />
          <View style={styles.overlay}>
            <Text style={styles.text}>{item.nombre}</Text>
          </View>
        </Pressable>
      </Animatable.View>
    );
  };




  return (
    <View style={styles.carruselContainer}>
      <FlatList
        horizontal
 data={personajesOrdenados.length ? personajesOrdenados : (personajes || [])}
        keyExtractor={(item) => item.idpersonaje.toString()}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        snapToInterval={150}
        decelerationRate="fast"
        contentContainerStyle={styles.row}
      />
    </View>
  );
};

const ImageWrapper = ({ uri, fallback }) => {
  const [source, setSource] = useState(fallback);

  useEffect(() => {
    if (uri && typeof uri === 'string' && uri.trim() !== '') setSource({ uri });
    else setSource(fallback);
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
  carruselContainer: {
    height: 190,
    justifyContent: 'center',
    marginBottom: 12,
    marginTop: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
  },
  card: {
    marginHorizontal: 8,
    alignItems: 'center',
    borderRadius: 14, // bordes suaves y elegantes
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    shadowColor: '#f0a400c7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 2.3,
    borderColor: '#1d1c19d7', // borde glow suave
  },
  cardPressed: {
    transform: [{ scale: 0.96 }],
    shadowOpacity: 0.9,
    shadowRadius: 25,
  },
  imagen: {
    width: 130,
    height: 180,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#161316fd',
    backgroundColor: '#161316c0',
  },
  overlay: {
  position: 'absolute',
  bottom: 0,
  width: '100%',
  paddingVertical: 6,
  // Gradiente tipo DaisyUI
  backgroundColor:'rgba(43, 177, 155, 0.34)',
  alignItems: 'center',
  borderBottomLeftRadius: 14,
  borderBottomRightRadius: 14,
},
  text: {
    color: '#fffde7', // blanco cremoso
    fontSize: 14,
    fontWeight: '900',
    textShadowColor: '#110910f6',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    textAlign: 'center',
  },
});
