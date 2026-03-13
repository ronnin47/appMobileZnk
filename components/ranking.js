import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, Modal, StyleSheet, FlatList, BackHandler, ScrollView,ImageBackground } from 'react-native';
import { AuthContext } from './AuthContext';
import { Estrellitas } from './estrellitas';
//import { ImageBackground } from 'react-native-web';

const Cartita = ({ item, rank }) => {
  const [showModal, setShowModal] = useState(false);
  const isLeyenda = parseInt(item.ken) >= 400;
  const imagenBase = require('../assets/imagenBase.jpeg');

  useEffect(() => {
    if (showModal) {
      const backAction = () => {
        setShowModal(false);
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => backHandler.remove();
    }
  }, [showModal]);

  return (
    <>
      <TouchableOpacity onPress={() => setShowModal(true)} style={styles.cardContainer}>
  {isLeyenda ? (
    <View style={styles.glowBorder}>
      <View style={styles.card}>
        <Image
          source={item.imagenurl ? { uri: item.imagenurl } : imagenBase}
          style={styles.cardImage}
        />

        {/* Número de ranking grande arriba a la izquierda */}
        <View style={styles.rankContainer}>
          <Text style={styles.rankNumber}>{rank}</Text>
        </View>

        <View style={styles.overlay}>
          <Text style={styles.name}>{item.nombre}</Text>
          <Text style={styles.domain}>{item.dominio}</Text>
          <Estrellitas ken={parseInt(item.ken) || 0} />
        </View>
      </View>
    </View>
  ) : (
    <View style={styles.card}>
      <Image
        source={item.imagenurl ? { uri: item.imagenurl } : imagenBase}
        style={styles.cardImage}
      />
      <View style={styles.rankContainer}>
        <Text style={styles.rankNumber}>{rank}</Text>
      </View>
      <View style={styles.overlay}>
        <Text style={styles.name}>{item.nombre}</Text>
        <Text style={styles.domain}>{item.dominio}</Text>
        <Estrellitas ken={parseInt(item.ken) || 0} />
      </View>
    </View>
  )}
</TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <CartaUnica item={item} onClose={() => setShowModal(false)} />
      </Modal>
    </>
  );
};




const CartaUnica = ({ item, onClose }) => {
  const imagenBase = require('../assets/imagenBase.jpeg');

  const fondoUrl = "https://res.cloudinary.com/dzul1hatw/image/upload/v1761596815/1536017df259933671623c69beaae925_pwz9t7.jpg";

  return (
    <ScrollView style={styles.modalContainer} contentContainerStyle={{ paddingBottom: 20 }}>
     <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
    <Text style={styles.closeButtonText}>✕</Text>
  </TouchableOpacity>
</View>



        
     <View style={{ position: 'relative', alignItems: 'center', marginBottom: 10 }}>
  <Image
    source={item.imagenurl ? { uri: item.imagenurl } : imagenBase}
    style={styles.modalImage}
    resizeMode="cover" // <- esto es clave para que la imagen no se deforme
  />

  {/* 🔹 Estrellitas sobre la imagen */}
  <View style={styles.modalEstrellitas}>
    <Estrellitas ken={parseInt(item.ken) || 0} />
  </View>
</View>

<Text style={styles.modalTitle}>{item.nombre}</Text>
<Text style={styles.modalText}>Dominio: {item.dominio}</Text>
<Text style={styles.modalText}>Ken: {item.ken}</Text>
<Text style={styles.modalText}>Naturaleza: {item.naturaleza}</Text>
<Text style={styles.modalText}>Convicción: {item.conviccion}</Text>

<ImageBackground
  source={{ uri: fondoUrl }}
  style={{
    flex: 1,
    backgroundColor: 'rgba(3, 3, 3, 0.88)',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 10,
  }}
  resizeMode="cover"
>
  <View
    style={{
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.45)', // overlay para contraste
    }}
  />
  <View style={{ padding: 10 }}>
    <Text style={styles.modalHistoria}>
      {item.historia && item.historia.trim().length > 0
        ? item.historia
        : 'Historia desconocida'}
    </Text>
  </View>
</ImageBackground>
    
    </ScrollView>
  );
};





export const Ranking = () => {
  const { coleccionPersonajes } = useContext(AuthContext);
  const [pjBuscado, setPjBuscado] = useState('');

  const coleccionOrdenada = [...coleccionPersonajes].sort((a, b) => (parseInt(b.ken) || 0) - (parseInt(a.ken) || 0));
/*
  const rankingMap = {};
  coleccionOrdenada.forEach((pj, index) => {
    rankingMap[pj.idpersonaje] = index + 1;
  });
*/

/*
  const personajesFiltrados = coleccionOrdenada.filter(pj => {
    const ki = parseInt(pj.ki) || 0;
    const fortaleza = parseInt(pj.fortaleza) || 0;
    const positiva = parseInt(pj.positiva) || 0;
    const negativa = parseInt(pj.negativa) || 0;
    const vidaActual = parseInt(pj.vidaActual) || 0;
    const ken = parseInt(pj.ken) || 0;

    const vidaTotal = (ki + fortaleza) * (positiva + negativa);

    return (
      pj.pjPnj === true &&
      pj.nombre.toLowerCase().includes(pjBuscado.toLowerCase()) &&
      ken >= 40 &&
      (vidaActual <= vidaTotal || ken >= 400)
    );
  });
*/
const personajesFiltrados = coleccionOrdenada.filter(pj => {
  const ki = parseInt(pj.ki) || 0;
  const fortaleza = parseInt(pj.fortaleza) || 0;
  const positiva = parseInt(pj.positiva) || 0;
  const negativa = parseInt(pj.negativa) || 0;
  const vidaActual = parseInt(pj.vidaActual) || 0;
  const ken = parseInt(pj.ken) || 0;

  const vidaTotal = (ki + fortaleza) * (positiva + negativa);

  return (
    pj.pjPnj === true &&
    ken >= 40 &&
    (vidaActual <= vidaTotal || ken >= 400)
  );
});

const personajesMostrados = personajesFiltrados.filter(pj =>
  pj.nombre.toLowerCase().includes(pjBuscado.toLowerCase())
);

  const rankingMap = {};
personajesFiltrados.forEach((pj, index) => {
  rankingMap[pj.idpersonaje] = index + 1;
});


  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar personaje"
        value={pjBuscado}
        onChangeText={setPjBuscado}
        placeholderTextColor="#ccc"
      />

      <FlatList
        data={personajesMostrados}
        keyExtractor={(item) => item.idpersonaje.toString()}
        renderItem={({ item }) => <Cartita item={item} rank={rankingMap[item.idpersonaje]} />}
        contentContainerStyle={styles.cardsContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 10 },
  searchInput: { backgroundColor: '#222', color: '#fff', padding: 10, borderRadius: 8, marginBottom: 20 },
  cardsContainer: { paddingBottom: 20 },
  cardContainer: { marginBottom: 14, width: '100%' },

  // --- Tarjetas normales ---
  card: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#111',
    position: 'relative',
    borderWidth:1,
    borderColor:"gray"
    
  },

  // --- Tarjeta legendaria (borde dorado visible) ---
  cardLeyenda: {
    borderWidth: 4,
    borderColor: 'white',
    shadowColor: '#ffd90059',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 10,
    shadowRadius: 10,
    elevation: 10, // efecto brillante en Android
  },

  // --- Contenedor de brillo (si querés que rodee la tarjeta) ---
  glowBorder: {
    padding: 3,
    borderRadius: 14,
    backgroundColor: '#222', // fondo oscuro para contrastar
    borderWidth: 2,
    borderColor: '#ffd900a4',
    shadowColor: '#00ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
  },

  cardImage: {
  width: '100%',
  height: 160,
  borderRadius: 10,
  borderWidth: 3,
  borderColor: 'black',
  shadowColor: '#FFD700',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.8,
  shadowRadius: 8,
  elevation: 8,
  resizeMode: 'cover',   // cubrir todo el contenedor
  overflow: 'hidden',
  alignSelf: 'flex-start', // asegura que tome desde arriba
},

  // --- Overlay inferior con nombre y dominio ---
  overlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 6,
    alignItems: 'center',
  },
  name: { color: 'yellow', fontWeight: 'bold', fontSize: 16 },
  domain: { color: '#ccc', fontSize: 13 },

// --- Ranking global ---
rankContainer: {
  position: 'absolute',
  top: 8,
  left: 8,
  backgroundColor: 'rgba(10, 10, 10, 0.85)',
  borderWidth: 1.5,
  borderColor: '#b8860b', // dorado viejo, más serio
  borderRadius: 6,
  paddingHorizontal: 12,
  paddingVertical: 4,
  zIndex: 10,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.8,
  shadowRadius: 6,
  elevation: 8,
},

rankNumber: {
  fontSize: 26,
  fontWeight: '900',
  color: '#d4af37', // dorado opaco realista
  letterSpacing: 1.2,
  textShadowColor: '#1a1a1a', // sombra profunda, no roja
  textShadowOffset: { width: 2, height: 2 },
  textShadowRadius: 3,
  fontStyle: 'normal',
  textTransform: 'uppercase',
  includeFontPadding: false,
},

  // --- Modal ---
  modalContainer: { flex: 1, padding: 16, backgroundColor: '#000' },
  modalImage: { width: '100%', height: 300, marginBottom: 12, borderRadius:4,},

  // --- Fondo oscuro con estrellas ---
  modalEstrellitas: {
    position: 'absolute',
    bottom: 20,
    left: 8,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.54)',
    borderRadius: 10,
    padding: 10,
  },

  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  modalText: { fontSize: 16, color: '#eee', marginBottom: 4 },
  modalHistoria: { marginTop: 12, color: '#ccc' },

  // --- Botón cerrar (X roja) ---
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  closeButtonText: {
    color: 'red',
    fontSize: 20,
    fontWeight: 'bold',
  },
});


