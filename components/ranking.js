import React, { useState, useEffect, useContext} from 'react';
import { AuthContext } from './AuthContext';
import { View, Text, TextInput, ScrollView, Image, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Estrellitas } from './estrellitas'; // adaptado también

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

  return (
    <>
      <TouchableOpacity onPress={() => setShowModal(true)} style={[styles.card, isLeyenda && styles.cardLeyenda]}>
        <Text style={styles.rankNumber}>{rank}</Text>
        <Image source={{ uri: imagenurl }} style={styles.cardImage} />
        <Estrellitas ken={ken} />
        <Text style={styles.name}>{nombre}</Text>
        <Text style={styles.domain}>{dominio}</Text>
      </TouchableOpacity>

      <Modal visible={showModal} transparent={false} animationType="slide">
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


const CartaUnica = ({ onClose, nombre, dominio, ken, imagenurl, historia, naturaleza, conviccion }) => {
  const [tab, setTab] = useState('personaje');

  return (
    <ScrollView style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>{nombre}</Text>
       <Estrellitas ken={parseInt(ken) || 0} />
      </View>

      <Image source={{ uri: imagenurl }} style={styles.modalImage} />

      <View style={styles.modalInfo}>
        {tab === 'personaje' ? (
          <>
            <Text style={styles.modalText}>Dominio: {dominio}</Text>
            <Text style={styles.modalText}>Ken: {ken}</Text>
            <Text style={styles.modalText}>Naturaleza: {naturaleza}</Text>
            <Text style={styles.modalText}>Convicción: {conviccion}</Text>
          </>
        ) : (
          <Text style={styles.modalText}>{historia}</Text>
        )}
      </View>

      <View style={styles.tabButtons}>
        <TouchableOpacity onPress={() => setTab('personaje')}>
          <Text style={[styles.tabButton, tab === 'personaje' && styles.activeTab]}>Personaje</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab('historia')}>
          <Text style={[styles.tabButton, tab === 'historia' && styles.activeTab]}>Historia</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeText}>Cerrar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export const Ranking = () => {
  const { coleccionPersonajes } = useContext(AuthContext);



  const nombres = coleccionPersonajes.map(pj => pj.nombre);
console.log("Nombres de los personajes:", nombres);
  const [pjBuscado, setPjBuscado] = useState("");

  const personajesFiltrados = coleccionPersonajes
    .filter((pj) => {
      const vidaTotal =
        ((parseInt(pj.ki) || 0) + (parseInt(pj.fortaleza) || 0)) *
        ((parseInt(pj.positiva) || 0) + (parseInt(pj.negativa) || 0));
      return (
        pj.pjPnj === true &&
        pj.nombre.toLowerCase().includes(pjBuscado.toLowerCase()) &&
        pj.ken >= 40 &&
        (pj.vidaActual <= vidaTotal || pj.ken >= 400)
      );
    })
    .sort((a, b) => b.ken - a.ken);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Ingrese nombre del PJ"
        value={pjBuscado}
        onChangeText={setPjBuscado}
        placeholderTextColor="#ccc"
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {personajesFiltrados.length > 0 ? (
          <View style={styles.cardsContainer}>
            {personajesFiltrados.map((pj, index) => (
              <Cartita
                key={pj.idpersonaje}
                rank={index + 1}
                {...pj}
                vidaTotal={(pj.ki + pj.fortaleza) * (pj.positiva + pj.negativa)}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.noResults}>No se encontraron personajes</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
 container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 10,
    marginTop:5,
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
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  paddingHorizontal: 10,
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
},
  cardLeyenda: {
    borderColor: 'gold',
    borderWidth: 2,
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
  paddingHorizontal: 6,
  paddingVertical: 4,
  fontWeight: 'bold',
  fontSize: 12,
  zIndex: 10,
},
  modalContainer: {
    backgroundColor: '#000',
    flex: 1,
    padding: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    color: 'yellow',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    resizeMode: 'contain',
  },
  modalInfo: {
    marginTop: 20,
  },
  modalText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
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