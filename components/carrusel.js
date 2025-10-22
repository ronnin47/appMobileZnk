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

export const Carrusel = ({ personajes }) => {
  const { setPjSeleccionado } = useContext(AuthContext);
  const navigation = useNavigation();
  const imagenBase = require('../assets/imagenBase.jpeg');
  const [animados, setAnimados] = useState({});

  const handlePress = (pj) => {
    setPjSeleccionado(pj.idpersonaje);
    navigation.navigate('PantallaDeslizable');
  };

  const renderItem = ({ item }) => {
    const id = item.idpersonaje;
    const animar = animados[id];

    const onPress = () => {
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
            uri={item.imagen?.startsWith('data:image') ? item.imagen : item.imagenurl}
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
        data={[...personajes].reverse()}
        keyExtractor={(item) => item.idpersonaje?.toString() || Math.random().toString()}
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
    height: 200,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
  },
  card: {
    marginHorizontal: 8,
    alignItems: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#121212',
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  cardPressed: {
    transform: [{ scale: 0.96 }],
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  imagen: {
    width: 140,
    height: 180,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#00ffff',
    backgroundColor: '#000',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingVertical: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  text: {
    color: '#ffd900bd',
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    textAlign: 'center',
  },
});
