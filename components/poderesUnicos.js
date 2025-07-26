import React, { useContext, useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Image } from 'react-native';
import { AuthContext } from './AuthContext';
import { Estrellitas } from './estrellitas';

export const PoderesUnicos = () => {
  const { coleccionPersonajes } = useContext(AuthContext);
  const [tecBuscar, setTecBuscar] = useState('');

  // Memoizamos el filtrado para que solo se recalculen los datos cuando cambie el filtro o la colección
  const poderesFiltrados = useMemo(() => {
    const filtro = tecBuscar.toLowerCase();

    return coleccionPersonajes.reduce((acc, personaje) => {
      const tecnicasActivas = (personaje.tecEspecial || []).filter(t => t.check === true);
      if (tecnicasActivas.length === 0) return acc;

      const coincideNombrePersonaje = personaje.nombre?.toLowerCase().includes(filtro);
      const tecnicasFiltradas = tecnicasActivas.filter(t =>
        t.nombre?.toLowerCase().includes(filtro)
      );

      if (coincideNombrePersonaje || tecnicasFiltradas.length > 0) {
        acc.push({
          ...personaje,
          tecEspecial: tecnicasFiltradas.length > 0 ? tecnicasFiltradas : tecnicasActivas,
        });
      }

      return acc;
    }, []);
  }, [tecBuscar, coleccionPersonajes]);

  // Renderizado individual para FlatList
  const renderPersonaje = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.nombreContenedor}>
          {item.imagenurl && (
            <Image source={{ uri: item.imagenurl }} style={styles.avatar} />
          )}
          <View style={styles.par}>
            <Text style={styles.nombre}>{item.nombre || 'Desconocido'}</Text>
            <View style={styles.estrellasAbajo}>
              <Estrellitas ken={item.ken} />
            </View>
          </View>
        </View>
      </View>

      {item.tecEspecial.map((tecnica, idx) => (
        <View key={idx} style={styles.tecnica}>
          <Text style={styles.tecnicaNombre}>{tecnica.nombre || 'Sin nombre'}</Text>
          <Text style={styles.tecnicaDesc}>
            <Text style={styles.label}>Descripción: </Text>
            {tecnica.presentacion || 'No disponible'}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#111' }}>
      <TextInput
        style={styles.input}
        value={tecBuscar}
        onChangeText={setTecBuscar}
        placeholder="Ingresa el nombre de personaje o del poder único"
        placeholderTextColor="#aaa"
      />

      {poderesFiltrados.length > 0 ? (
        <FlatList
          data={poderesFiltrados}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderPersonaje}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        />
      ) : (
        <Text style={styles.noEncontrado}>No se encontró la técnica especial buscada.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    margin: 16,
    borderWidth: 1,
    borderColor: '#555',
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: 'cyan',
    shadowColor: 'cyan',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 16,
  },
  header: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  nombreContenedor: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 4,
    borderColor: 'black',
  },
  nombre: {
    color: '#00FFB3',
    fontSize: 18,
    fontFamily: 'sans-serif',
  },
  tecnica: {
    marginTop: 8,
  },
  tecnicaNombre: {
    color: 'yellow',
    fontSize: 16,
    fontFamily: 'sans-serif',
  },
  tecnicaDesc: {
    color: 'aliceblue',
    marginTop: 4,
  },
  label: {
    color: 'orange',
  },
  noEncontrado: {
    color: 'yellow',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'sans-serif',
  },
  estrellasAbajo: {
    flexDirection: 'row',
    maxWidth: 150,
    overflow: 'hidden',
  },
  par: {
    flexDirection: 'column',
    marginTop: 6,
    marginLeft: 6,
    alignItems: 'center',
  },
});
