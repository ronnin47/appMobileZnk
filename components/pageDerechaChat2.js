import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet,Pressable } from 'react-native';

export const PageDerechaChat2 = ({ agregarTirada,eliminarTiradas, tiradasGuardadas }) => {
  const [clave, setClave] = useState('');
  const [formula, setFormula] = useState('');

  const guardarTirada = () => {
    if (!clave || !formula) return alert('Faltan datos');

    const nueva = {
      nombre: clave.toLowerCase(),
      tirada: formula.replace(/\s+/g, ''), // limpiar espacios
    };

    agregarTirada(nueva); // ✅ correcto
    setClave('');
    setFormula('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nombre clave (#nombre):</Text>
      <TextInput
        style={styles.input}
        placeholder="ej. espada"
        value={clave}
        onChangeText={setClave}
        placeholderTextColor="#777"
      />

      <Text style={styles.label}>Tirada (ej. 30+3d10+1d6+5):</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. 30+3d10+10+1d6+200d20"
        value={formula}
        onChangeText={setFormula}
        placeholderTextColor="#777"
      />

   <Pressable style={styles.botonGuardar} onPress={guardarTirada}>
   <Text style={styles.textoBoton}>Guardar tirada</Text>
   </Pressable>

    <Text style={[styles.label, {marginTop:20, marginBottom:10}]}>Tiradas guardadas:</Text>
     <FlatList
      data={tiradasGuardadas}
      keyExtractor={(item) => item.nombre}
     renderItem={({ item }) => (
  <View style={styles.itemContainer}>
    <View style={styles.textContainer}>
      <Text
        style={styles.saved}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {`#${item.nombre} → ${item.tirada}`}
      </Text>
    </View>
    <Text style={styles.deleteBtn} onPress={() => eliminarTiradas(item.nombre)}>
      ❌
    </Text>
  </View>
)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 26,
  },
  label: {
    color: 'white',
    marginTop: 10,
  },
  input: {
    borderColor: '#999',
    borderWidth: 0.3,
    color: 'white',
    padding: 8,
    marginTop: 4,
    marginBottom: 10,
    borderColor:"cyan",
    borderRadius:10,
  },



itemContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginVertical: 5,
  borderWidth: 0.2,
  borderColor: "cyan",
  borderRadius: 5,
  padding: 4,
},

textContainer: {
  flex: 1,
  marginRight: 8,
},

saved: {
  color: '#facc15',
  flexShrink: 1,
},

deleteBtn: {
  color: '#f87171',
  fontSize: 18,
  paddingHorizontal: 8,
},
botonGuardar: {
backgroundColor: '#22d3ee',
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 10,
  alignItems: 'center',
  marginTop: 10,
  opacity:0.7
},

textoBoton: {
  color: 'black',
  fontSize: 16,
  fontWeight: 'bold',
},
});