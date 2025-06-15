import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';


export const ItemVentaja = ({ itemVentaja, handleVentaja }) => {
  return (
    <View style={stylesItem.inputContainer}>
      <TextInput
        style={stylesItem.input}
        value={itemVentaja}
        onChangeText={handleVentaja}
        placeholder="Escribe una ventaja..."
        placeholderTextColor="#999"
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
    borderColor: '#0ff',
    borderWidth: 1,
    padding: 10,
    color: '#fff',
    backgroundColor: '#111',
    borderRadius: 6,
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

  return (
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
            <Button title="+ Ventaja" onPress={btnAgregarVentaja} color="#339CFF" />
        </View>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    padding: 6,
    borderRadius: 8,
  },
  title: {
    fontSize: 22,
    color: 'aliceblue',
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'sans-serif-condensed',
    textAlign: 'center',
  },
});
