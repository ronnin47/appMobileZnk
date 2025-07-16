import React, { useContext, useEffect, useState } from 'react';
import {
  FlatList,
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from './AuthContext';

export const Carrusel = ({ personajes }) => {
  const { setPjSeleccionado } = useContext(AuthContext);
  const imagenBase = require('../assets/imagenBase.jpeg');
  const navigation = useNavigation();

  const handlePress = (pj) => {
    setPjSeleccionado(pj.idpersonaje);
    navigation.navigate('PantallaDeslizable');
  };

  return (
    <View style={styles.carruselContainer}>
      <FlatList
        horizontal
        data={[...personajes].reverse()}
        keyExtractor={(item) =>
          item.idpersonaje?.toString() || Math.random().toString()
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handlePress(item)}
            style={styles.card}
            activeOpacity={0.9}
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
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        snapToInterval={136} // 120 imagen + 16 margen horizontal
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
