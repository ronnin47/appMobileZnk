import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import { AuthContext } from './AuthContext';

export const ListaPersonajes = () => {
  const { personajes } = useContext(AuthContext);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black' }}>
        Personajes del Usuario
      </Text>

      {personajes.length > 0 ? (
        personajes.map((pj, index) => (
          <Text key={index} style={{ color: 'black', marginVertical: 4 }}>
            {pj.nombre}
            {pj.raza}
            {pj.dominio}
          </Text>
        ))
      ) : (
        <Text style={{ color: 'gray', marginTop: 10 }}>
          No hay personajes guardados.
        </Text>
      )}
    </View>
  );
};
