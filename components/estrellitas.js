import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

export const Estrellitas = ({ ken }) => {
  const nDestino = Math.floor(parseInt(ken) / 100);

  // Cargamos la imagen correcta
  const getEstrellaSrc = (ken) => {
    return ken >= 200
      ? require('../assets/estrellaDorada.png')
      : require('../assets/estrellaGris.png');
  };

  // Tamaño base
  const baseSize = 20;

  // Cálculo dinámico de tamaño (máximo 10 estrellas por fila)
  const maxEstrellas = 10;
  const dynamicSize = nDestino > maxEstrellas ? baseSize * (maxEstrellas / nDestino) : baseSize;

  return (
    <View style={styles.container}>
      {Array.from({ length: nDestino }).map((_, index) => (
        <Image
          key={index}
          source={getEstrellaSrc(ken)}
          style={{
            width: dynamicSize,
            height: dynamicSize,
            marginHorizontal: 2,
          }}
          resizeMode="contain"
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxWidth: 220, // Limita el espacio total disponible para las estrellas
    justifyContent: 'center',
    marginTop:10,
  },
});