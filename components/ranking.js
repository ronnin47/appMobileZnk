import React, { useState, useEffect, useContext} from 'react';
import { AuthContext } from './AuthContext';
import { View, Text, TextInput, ScrollView, Image, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Estrellitas } from './estrellitas'; // adaptado también
import { FlatList } from 'react-native';
import { BackHandler } from 'react-native'; // 👈 asegurate de importar esto

const Cartita = ({
  idpersonaje,
  nombre,
  dominio,
  ken,
  imagenurl,
  historia,
  naturaleza,
  conviccion,
  rank,
  vidaActual,
  vidaTotal
}) => {
  const [showModal, setShowModal] = useState(false);
  const isLeyenda = ken >= 400;


    // 👇 Efecto para manejar el botón "Atrás"
  useEffect(() => {
    if (showModal) {
      const backAction = () => {
        setShowModal(false); // cierra el modal
        return true; // evita que el sistema cierre la app
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );

      return () => backHandler.remove(); // limpia el listener
    }
  }, [showModal]); // solo se activa cuando showModal cambia

  return (
    <>
      <TouchableOpacity onPress={() => setShowModal(true)} style={[styles.card, isLeyenda && styles.cardLeyenda]}>
        <Text style={styles.rankNumber}>{rank}</Text>
        <Image source={{ uri: imagenurl }} style={styles.cardImage} />
        <Estrellitas ken={ken} />
        <Text style={styles.name}>{nombre}</Text>
        <Text style={styles.domain}>{dominio}</Text>
      </TouchableOpacity>
        <Modal
          visible={showModal}
          transparent={false}
          animationType="fade"
          onRequestClose={() => setShowModal(false)} // 👈 ¡agregá esto!
        >
        <CartaUnica
          onClose={() => setShowModal(false)}
          nombre={nombre}
          dominio={dominio}
          ken={ken}
          imagenurl={imagenurl}
          historia={historia}
          naturaleza={naturaleza}
          conviccion={conviccion}
        />
      </Modal>
    </>
  );
};


const CartaUnica = ({ nombre, dominio, ken, imagenurl, historia, naturaleza, conviccion }) => {
  return (
    <ScrollView style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>{nombre}</Text>
        <Estrellitas ken={parseInt(ken) || 0} />
      </View>

      <Image source={{ uri: imagenurl }} style={styles.modalImage} />

      <View style={styles.modalInfo}>
        <Text style={styles.modalText}>Dominio: {dominio}</Text>
        <Text style={styles.modalText}>Ken: {ken}</Text>
        <Text style={styles.modalText}>Naturaleza: {naturaleza}</Text>
        <Text style={styles.modalText}>
          Convicción: <Text style={styles.modalConviccion}>{conviccion}</Text>
        </Text>
      </View>
      <View style={styles.modalHistoria}>
        <Text style={styles.modalText}>
          {historia && historia.trim().length > 0 ? historia : 'Historia desconocida'}
        </Text>
      </View>
    </ScrollView>
  );
};

export const Ranking = () => {
  const { coleccionPersonajes } = useContext(AuthContext);
  const [pjBuscado, setPjBuscado] = useState("");

  // Ordenar toda la colección por ken descendente
  const coleccionOrdenada = [...coleccionPersonajes].sort((a, b) => b.ken - a.ken);

  // Crear un diccionario para rankear cada personaje según su posición en el ranking global
  const rankingMap = {};
  coleccionOrdenada.forEach((pj, index) => {
    rankingMap[pj.idpersonaje] = index + 1;
  });

  // Filtrar la colección según la búsqueda y otros criterios
  const personajesFiltrados = coleccionOrdenada.filter((pj) => {
    const vidaTotal =
      ((parseInt(pj.ki) || 0) + (parseInt(pj.fortaleza) || 0)) *
      ((parseInt(pj.positiva) || 0) + (parseInt(pj.negativa) || 0));

    return (
      pj.pjPnj === true &&
      pj.nombre.toLowerCase().includes(pjBuscado.toLowerCase()) &&
      pj.ken >= 40 &&
      (pj.vidaActual <= vidaTotal || pj.ken >= 400)
    );
  });

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Ingrese nombre del PJ"
        value={pjBuscado}
        onChangeText={setPjBuscado}
        placeholderTextColor="#ccc"
      />

      <FlatList
        data={personajesFiltrados}
        keyExtractor={(item) => item.idpersonaje.toString()}
        numColumns={2}
        renderItem={({ item }) => (
          <Cartita
            rank={rankingMap[item.idpersonaje]} // ranking real aquí
            {...item}
            vidaTotal={(item.ki + item.fortaleza) * (item.positiva + item.negativa)}
          />
        )}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={styles.cardsContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
 container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 10,
  
  },
  searchInput: {
    backgroundColor: '#222',
    color: 'white',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  scrollContainer: {
    // alignItems removed para evitar interferencia con flexWrap
  },
 cardsContainer: {
   paddingHorizontal: 10,
  paddingBottom: 20,
  paddingHorizontal: 10,
  paddingTop: 10, // <--- nuevo
},
  card: {
  backgroundColor: '#111',
  borderRadius: 10,
  padding: 6, // menos padding para que la imagen esté más cerca
  marginBottom: 12,
  marginHorizontal: 5, // simula gap horizontal
  width: '47%', // permite dos por fila con espacio para rankNumber
  alignItems: 'center',
  position: 'relative', // necesario para que rankNumber se posicione bien
     borderColor:  '#7baedc',
    borderWidth: 0.3,

},
  cardLeyenda: {
    borderColor: 'gold',
    borderWidth: 3,
   
  },
  cardImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
  name: {
    color: 'yellow',
    fontSize: 18,
    marginTop: 5,
  },
  domain: {
    color: 'white',
    fontSize: 14,
  },
rankNumber: {
  position: 'absolute',
  top: -8,
  left: -8,
  backgroundColor: '#f1c40f',
  color: 'black',
  borderRadius: 20,
  paddingVertical: 4,
  fontWeight: 'bold',
  fontSize: 12,
  width: 30,           // ancho fijo igual para todos
  textAlign: 'center', // para centrar el número
  zIndex: 10,
},
 modalContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#000', // Fondo negro
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff', // Texto blanco
    marginBottom: 6,
  },
  modalImage: {
    width: '100%',
    height: 300, // Imagen más alta
    resizeMode: 'cover',
    borderRadius: 12,
    marginBottom: 20,
  },
  modalInfo: {
    backgroundColor: '#111', // Fondo gris oscuro
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 6,
    color: '#eee', // Texto claro para buen contraste
  },
  modalHistoria: {
    padding: 14,
    backgroundColor: '#1a1a1a', // Gris más claro para distinguir la historia
    borderRadius: 8,
    marginBottom: 32,
  },
  tabButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  tabButton: {
    fontSize: 16,
    color: 'white',
  },
  activeTab: {
    color: 'yellow',
    textDecorationLine: 'underline',
  },
  closeButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noResults: {
    color: 'yellow',
    marginTop: 20,
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'cursive',
  },
  modalConviccion: {
  fontSize: 16,
  marginBottom: 6,
  color: '#00FFFF', // Cian brillante
  fontWeight: 'bold', // Opcional, para destacarlo más
},
});

/*
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Ranking = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ranking</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
*/