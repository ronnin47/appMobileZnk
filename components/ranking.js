import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, Modal, StyleSheet, FlatList, BackHandler, ScrollView,ImageBackground } from 'react-native';
import { AuthContext } from './AuthContext';
import { Estrellitas } from './estrellitas';
//import { ImageBackground } from 'react-native-web';
import { Audio } from 'expo-av';



const Cartita = ({ item, rank }) => {
  const [showModal, setShowModal] = useState(false);
  const isLeyenda = parseInt(item.ken) >= 400;
  const imagenBase = require('../assets/imagenBase.jpeg');


  



const reproducirSonidoSeleccion = async () => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/seleccionB.mp3'),
      { volume: 0.5 }
    );

    await sound.playAsync();

    // liberar memoria después de reproducir
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
      }
    });

  } catch (error) {
    console.log("Error reproduciendo sonido:", error);
  }
};





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
      <TouchableOpacity onPress={() => {
        setShowModal(true)
        reproducirSonidoSeleccion()
        }} style={styles.cardContainer}>
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

  const fondoUrl =
    "https://res.cloudinary.com/dzul1hatw/image/upload/v1761596815/1536017df259933671623c69beaae925_pwz9t7.jpg";

  const ken = parseInt(item.ken) || 0;
  const esLeyenda = ken >= 400;



 
  return (
    <ScrollView
      style={[styles.modalContainer, { backgroundColor: '#000' }]}
      contentContainerStyle={{ paddingBottom: 30 }}
    >

      {/* CERRAR */}
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>X</Text>
      </TouchableOpacity>

      {/* HEADER NOMBRE */}
      <View style={{
        alignItems: 'center',
        marginBottom: 10
      }}>
        <Text style={{
          fontSize: 26,
          fontWeight: '900',
          color: esLeyenda ? '#FFD700' : '#fff',
          letterSpacing: 2,
          textTransform: 'uppercase',
          textShadowColor: esLeyenda ? '#FFD700' : '#000',
          textShadowRadius: esLeyenda ? 10 : 4
        }}>
          {item.nombre}
        </Text>

        <View style={{
          height: 2,
          width: '60%',
          backgroundColor: esLeyenda ? '#FFD700' : '#555',
          marginTop: 4
        }} />
      </View>

      {/* IMAGEN + AURA */}
      <View style={{
        borderRadius: 14,
        padding: esLeyenda ? 3 : 0,
        backgroundColor: esLeyenda ? '#FFD700' : 'transparent',
        shadowColor: esLeyenda ? '#FFD700' : '#000',
        shadowOpacity: esLeyenda ? 1 : 0.4,
        shadowRadius: esLeyenda ? 15 : 6,
        elevation: esLeyenda ? 15 : 6,
      }}>
        <View style={{ position: 'relative' }}>
          <Image
            source={item.imagenurl ? { uri: item.imagenurl } : imagenBase}
            style={{
              width: '100%',
              height: 290,
              borderRadius: 12,
            }}
          />

          {/* Overlay cinematic */}
          <View style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.25)',
            borderRadius: 12
          }} />

          {/* ESTRELLAS */}
          <View style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: 8,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: esLeyenda ? '#FFD700' : '#555'
          }}>
            <Estrellitas ken={ken} />
          </View>
        </View>
      </View>

      {/* STATS (HUD ANIME) */}
      <View style={{
        marginTop: 12,
        backgroundColor: '#0f1117',
        borderRadius: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#222'
      }}>

        {[
          { label: 'DOMINIO', value: item.dominio },
          { label: 'KEN', value: item.ken },
          { label: 'NATURALEZA', value: item.naturaleza },
        ].map((f, i) => (
          <View key={i} style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 6
          }}>
            <Text style={{
              color: '#888',
              fontSize: 12,
              letterSpacing: 1
            }}>
              {f.label}
            </Text>

            <Text style={{
              color: '#ffffff',
              fontWeight: 'bold'
            }}>
              {f.value}
            </Text>
          </View>
        ))}

        {/* 🔥 CONVICCIÓN = FRASE PROTAGONISTA */}
        <View style={{
          marginTop: 10,
          padding: 10,
          borderRadius: 10,
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderLeftWidth: 3,
          borderLeftColor: esLeyenda ? '#FFD700' : '#6c63ff'
        }}>
          <Text style={{
            color: '#aaa',
            fontSize: 11,
            marginBottom: 4
          }}>
            CONVICCIÓN
          </Text>

          <Text style={{
            color: '#fff',
            fontStyle: 'italic',
            fontSize: 14
          }}>
            “{item.conviccion}”
          </Text>
        </View>

      </View>

      {/* HISTORIA (LORE ANIME) */}
      <ImageBackground
        source={{ uri: fondoUrl }}
        style={{
          marginTop: 14,
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <View style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(0,0,0,0.7)',
        }} />

        <View style={{ padding: 14 }}>
          <Text style={{
            color: esLeyenda ? '#FFD700' : '#6c63ff',
            fontWeight: 'bold',
            marginBottom: 6,
            letterSpacing: 1
          }}>
            HISTORIA
          </Text>

          <Text style={{
            color: '#ddd',
            fontSize: 14,
            lineHeight: 22,
            marginBottom:30,          }}>
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


const [soundOpen, setSoundOpen] = useState(null);



 useEffect(() => {
  let sonido;

  const reproducir = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/ranking3.mp3'), // 🔥 TU NUEVO SONIDO
        { volume: 0.05 }
      );

      sonido = sound;
      setSoundOpen(sound);

      await sound.playAsync(); // 🔥 SE REPRODUCE AL ENTRAR
    } catch (error) {
      console.log("Error sonido modal:", error);
    }
  };

  reproducir();

  return () => {
    if (sonido) {
      sonido.unloadAsync();
    }
  };
}, []);



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
    shadowColor: '#f5d10959',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 10,
    shadowRadius: 10,
    elevation: 10, // efecto brillante en Android
  },

 // --- Contenedor de brillo que rodea la tarjeta ---
glowBorder: {
  padding: 3,
  borderRadius: 14,
  backgroundColor: '#222', // fondo oscuro para contraste
  borderWidth: 8,
  borderColor: '#f7f6f0', // dorado brillante
  shadowColor: '#FFD700',   // brillo dorado
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

  modalTitle: { fontSize: 24, fontWeight: 'bold', color:  '#eec230', marginBottom: 6 },
  modalText: { fontSize: 16, color: '#eee', marginBottom: 4 },
  modalHistoria: { marginTop: 12, color: '#ccc' },

  // --- Botón cerrar (X roja) ---
  closeButton: {
    position: 'absolute',
    top: 2,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    width: 32,
    height: 32,
    marginLeft:1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  closeButtonText: {
    color: 'red',
    fontSize: 20,
    fontWeight: 'bold',
  },


  
  fieldContainer: {
  flexDirection: 'row',       // label y valor en horizontal
  marginBottom: 4,

},

fieldLabel: {
  color:  '#e9d6d6',          // dorado para el label
  fontWeight: 'bold',
  fontSize: 16,
  width: 110,                 // ancho fijo para alinear los labels
},

fieldValue: {
  color: '#fcdd30ef',              // valor en blanco
  fontSize: 16,
  flexShrink: 1,              // que se adapte si es texto largo
},
});


