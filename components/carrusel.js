import React, { useContext, useEffect, useState } from 'react';
import {
  FlatList,
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Pressable
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from './AuthContext';
import * as Animatable from 'react-native-animatable';

export const Carrusel = ({ personajes }) => {
  const { setPjSeleccionado } = useContext(AuthContext);
  const imagenBase = require('../assets/imagenBase.jpeg');
  const navigation = useNavigation();
  const [animados, setAnimados] = useState({});

  const handlePress = (pj) => {
    setPjSeleccionado(pj.idpersonaje);
    navigation.navigate('PantallaDeslizable');
  };

  const renderItem = ({ item }) => {
    const id = item.idpersonaje;
    const animar = animados[id];

    const onPress = () => {
      setAnimados((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setAnimados((prev) => ({ ...prev, [id]: false }));
        handlePress(item);
      }, 300); // espera un poco antes de navegar
    };

    return (
      <Animatable.View
        animation={animar ? 'swing' : undefined}
        duration={1600}
        useNativeDriver
      >
       

        <Pressable
          style={({ pressed }) => [
              styles.card,
              pressed && {
              transform: [{ scale: 0.97 }],
              opacity: 0.8,
              borderWidth: 3,
              padding:0.9,
              borderColor: "white", // cyan
              borderRadius: 6,
              backgroundColor: '#0a0a0a', // un fondo oscuro elegante
              shadowColor: '#00ffff',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 6,
            } 
            ]}
            onPress={onPress}
          >
          <ImageWrapper
            uri={
              item.imagen?.startsWith?.('data:image')
                ? item.imagen
                : item.imagenurl
            }
            fallback={imagenBase}
          />
          
          <Text
            style={styles.text}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.5}
            ellipsizeMode="tail"
          >
            {item.nombre}
          </Text>
          </Pressable>
        
      </Animatable.View>
    );
  };

  return (
    <View style={styles.carruselContainer}>
      <FlatList
        horizontal
        data={[...personajes].reverse()}
        keyExtractor={(item) =>
          item.idpersonaje?.toString() || Math.random().toString()
        }
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        snapToInterval={136}
        decelerationRate="fast"
        contentContainerStyle={styles.row}
        getItemLayout={(data, index) => ({
          length: 136,
          offset: 136 * index,
          index,
        })}
        initialNumToRender={5}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </View>
  );
};

const ImageWrapper = ({ uri, fallback }) => {
  const [source, setSource] = useState(fallback);

  useEffect(() => {
    if (uri && typeof uri === 'string' && uri.trim() !== '') {
      setSource({ uri });
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
  carruselContainer: {
    height: 220,
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    color: '#fff',
    marginTop: -5,
    width: 120,
  },
  imagen: {
    width: 120,
    height: 160,
    borderWidth: 0.35,
    borderColor: 'white',
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  card: {
    marginHorizontal: 8,
    alignItems: 'center',
  },
});
