import { View, Text, TextInput, Button, StyleSheet, ScrollView,TouchableOpacity,ImageBackground} from 'react-native';


export const ItemVentaja = ({ itemVentaja, handleVentaja }) => {
  return (
    <View style={stylesItem.inputContainer}>
      <TextInput
        style={stylesItem.input}
        value={itemVentaja}
        onChangeText={handleVentaja}
        placeholder="Escribe una ventaja..."
        placeholderTextColor="#999"
        multiline={true}
      />
    </View>
  );
};

const stylesItem = StyleSheet.create({
  inputContainer: {
    marginVertical: 6,
    paddingHorizontal: 10,
  },
  input: {
    borderColor: 'rgba(78, 85, 85, 0.48)',
    borderWidth: 1,
    padding: 6,
    color: '#fac414ff',
    backgroundColor: '#00000085',
    borderRadius: 6,
    minHeight: 40,           // altura base
    textAlignVertical: 'top', // para que el texto empiece arriba
    textAlign:"center"
  },
});

export const Ventajas = ({ ventajas, setVentajas }) => {
  const btnAgregarVentaja = () => {
    setVentajas([...ventajas, '']);
  };

  const handleVentaja = (index, value) => {
    const nuevas = [...ventajas];
    if (value === '') {
      nuevas.splice(index, 1);
    } else {
      nuevas[index] = value;
    }
    setVentajas(nuevas);
  };
 const fondoUrl = "https://res.cloudinary.com/dzul1hatw/image/upload/v1762217941/fdba42d97ab74544c3c4a7456954c0f8_utm7a2.jpg";
  return (

     <ImageBackground
                  source={{ uri: fondoUrl  }}
                  style={{ flex: 1, opacity:1, backgroundColor:"rgba(3, 3, 3, 0.58)" }}
                  resizeMode='cover'
                >

                  <View style={styles.container}>
      <ScrollView>
        {ventajas.map((item, index) => (
          <ItemVentaja
            key={index}
            itemVentaja={item}
            handleVentaja={(value) => handleVentaja(index, value)}
          />
        ))}
      </ScrollView>
    

       <View style={{ marginTop: 10, alignItems: 'center' }}>
              <View style={{ width: 140 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#339CFF',
                    paddingVertical: 10,
                    borderRadius: 6,
                    alignItems: 'center',
                  }}
                  onPress={btnAgregarVentaja}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                    + Ventaja
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
        
    </View>

                </ImageBackground>
    
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0000004d',
    padding: 6,
    borderRadius: 8,
  }
});
