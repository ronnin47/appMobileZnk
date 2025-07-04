import { ScrollView, Text, View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';

export const Carrusel = ({ personajes }) => {
  const imagenBase = require('../assets/imagenBase.jpeg');
  const navigation = useNavigation();

  const handlePress = (pj) => {
    navigation.navigate('PantallaDeslizable', { pj });
  };

  return (
    <ScrollView
      horizontal={true}
      pagingEnabled={true}
      showsHorizontalScrollIndicator={false}
    >
      <View style={styles.row}>
            {personajes.slice().reverse().map((pj, index) => (
              <TouchableOpacity
                key={pj.idpersonaje || index}
                onPress={() => handlePress(pj)}
                style={styles.card}
                activeOpacity={0.9}
              >
                <ImageWrapper 
                  uri={
                    pj.imagen && pj.imagen.startsWith && pj.imagen.startsWith('data:image')
                      ? pj.imagen
                      : pj.imagenurl
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
                  {pj.nombre}
                </Text>
              </TouchableOpacity>
            ))}
       </View>
      
    </ScrollView>
  );
};

const ImageWrapper = ({ uri, fallback }) => {
  const [source, setSource] = React.useState(fallback);

  React.useEffect(() => {
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
  container: {
    flex: 1,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
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
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    paddingHorizontal: 10,
  },
  card: {
    marginHorizontal: 8,
    alignItems: 'center',
  },
});
