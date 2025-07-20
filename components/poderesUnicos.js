import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Image } from 'react-native';
import { AuthContext } from './AuthContext';
import { Estrellitas } from './estrellitas'; // Asegurate de tener este componente adaptado a React Native

export const PoderesUnicos = () => {
  const { coleccionPersonajes } = useContext(AuthContext);
  const [tecBuscar, setTecBuscar] = useState('');
  const [poderesFiltrados, setPoderesFiltrados] = useState([]);

  useEffect(() => {
    const filtrarPoderes = () => {
      const filtro = tecBuscar.toLowerCase();

      const filtrados = coleccionPersonajes.reduce((acc, personaje) => {
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

      setPoderesFiltrados(filtrados);
    };

    filtrarPoderes();
  }, [tecBuscar, coleccionPersonajes]);

  return (
    <ScrollView
      style={{ backgroundColor: '#111' }}
      contentContainerStyle={styles.container}>
    
      <TextInput
        style={styles.input}
        value={tecBuscar}
        onChangeText={setTecBuscar}
        placeholder="Ingresa el nombre de personaje o del poder único"
        placeholderTextColor="#aaa"
      />

      {poderesFiltrados.length > 0 ? (
        poderesFiltrados.map((personaje, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.header}>
              <View style={styles.nombreContenedor}>
                {personaje.imagenurl && (
                  <Image
                    source={{ uri: personaje.imagenurl }}
                    style={styles.avatar}
                  />
                )}
                    <View style={styles.par}>
                    <Text style={styles.nombre}>{personaje.nombre || 'Desconocido'}</Text>
                    <View style={styles.estrellasAbajo}>
                    <Estrellitas ken={personaje.ken} />
                    </View>
                
              </View>
             
              </View>
             
            </View>

            {personaje.tecEspecial.map((tecnica, idx) => (
              <View key={idx} style={styles.tecnica}>
                <Text style={styles.tecnicaNombre}>{tecnica.nombre || 'Sin nombre'}</Text>
                <Text style={styles.tecnicaDesc}>
                  <Text style={styles.label}>Descripción: </Text>
                  {tecnica.presentacion || 'No disponible'}
                </Text>
              </View>
            ))}
          </View>
        ))
      ) : (
        <Text style={styles.noEncontrado}>No se encontró la técnica especial buscada.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#111',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'yellow',
    fontFamily: 'sans-serif',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
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
    // Sombra en iOS
  shadowColor: 'cyan',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.4,
  shadowRadius: 6,

  // Sombra en Android
  elevation: 16,
  },
  header: {
  flexDirection: 'column',  // ahora apila verticalmente
  alignItems: 'start', // alineado al inicio (izquierda)
  marginBottom: 8,
},

nombreContenedor: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  marginBottom: 4,   // espacio abajo para separar del bloque estrellas

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
  flexDirection: 'row',     // fila para las estrellas
  maxWidth: 150,            // ancho máximo para que no desborden
  overflow: 'hidden',
},
par: {
  flexDirection: 'column',     // coloca los elementos en vertical
  marginTop: 6,
  marginLeft: 6,
  alignItems: 'center',  
     // centra horizontalmente
}

});
