import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

export const Item = ({ id, itemValues, handleItemChange }) => {
  const handleChange = (field, value) => {
    const newValues = { ...itemValues, [field]: value };
    handleItemChange(id, newValues);
  };

  return (
    <View style={styles.itemContainer}>
      {/* Nombre: ocupa toda la fila */}
      <TextInput
        style={[styles.inputDominio, styles.nombreInput]}
        value={itemValues.nombre}
        onChangeText={(text) => handleChange('nombre', text)}
        placeholder="Nombre"
        placeholderTextColor="#aaa"
      />

      {/* Fila: Nivel de Ki y Arte */}
      <View style={styles.row}>
        <TextInput
          style={[styles.inputDominio, styles.smallInput]}
          value={itemValues.nivelKi}
          onChangeText={(text) => handleChange('nivelKi', text)}
          placeholder="Nivel de Ki"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.inputDominio, styles.smallInput]}
          value={itemValues.dominio}
          onChangeText={(text) => handleChange('dominio', text)}
          placeholder="Arte"
          placeholderTextColor="#aaa"
        />
      </View>

      {/* Áreas de texto: Descripción y Sistema */}
      <TextInput
        style={styles.inputArea}
        value={itemValues.descripcion}
        onChangeText={(text) => handleChange('descripcion', text)}
        placeholder="Descripción"
        placeholderTextColor="#aaa"
        multiline={true}
        numberOfLines={4}
        textAlignVertical="top"
      />
      <TextInput
        style={[styles.inputArea, { marginTop: 10 }]}
        value={itemValues.sistema}
        onChangeText={(text) => handleChange('sistema', text)}
        placeholder="Sistema"
        placeholderTextColor="#aaa"
        multiline={true}
        numberOfLines={4}
        textAlignVertical="top"
      />

      {/* Fila: Coste de Ki y Tiempo Invocación */}
      <View style={[styles.row, { marginTop: 10 }]}>
        <TextInput
          style={[styles.inputDominio, styles.smallInput]}
          value={itemValues.costeKi}
          onChangeText={(text) => handleChange('costeKi', text)}
          placeholder="Coste de Ki"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.inputDominio, styles.smallInput]}
          value={itemValues.invo}
          onChangeText={(text) => handleChange('invo', text)}
          placeholder="Tiempo Invocación"
          placeholderTextColor="#aaa"
        />
      </View>
    </View>
  );
};

export const Dominios = ({ dominios, setDominios }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(
      dominios.map((dominio, index) => ({
        id: index,
        values: {
          dominio: dominio.dominio || '',
          nombre: dominio.nombre || '',
          nivelKi: dominio.nivelKi || '',
          descripcion: dominio.descripcion || '',
          sistema: dominio.sistema || '',
          costeKi: dominio.costeKi || '',
          invo: dominio.invo || '',
        },
      }))
    );
  }, [dominios]);

  const handleItemChange = (id, newValues) => {
    const isEmpty = Object.values(newValues).every((value) => value === '');

    if (isEmpty) {
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
      setDominios((prevDominios) => prevDominios.filter((_, index) => index !== id));
    } else {
      setItems((prevItems) =>
        prevItems.map((item) => (item.id === id ? { ...item, values: newValues } : item))
      );

      setDominios((prevDominios) =>
        prevDominios.map((dominio, index) => (index === id ? newValues : dominio))
      );
    }
  };

  const btnAgregarItem = () => {
    setItems((prevItems) => [
      ...prevItems,
      {
        id: prevItems.length,
        values: {
          dominio: '',
          nombre: '',
          nivelKi: '',
          descripcion: '',
          sistema: '',
          costeKi: '',
          invo: '',
        },
      },
    ]);
    setDominios((prevDominios) => [
      ...prevDominios,
      {
        dominio: '',
        nombre: '',
        nivelKi: '',
        descripcion: '',
        sistema: '',
        costeKi: '',
        invo: '',
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {items.map((item) => (
        <Item
          key={item.id}
          id={item.id}
          itemValues={item.values}
          handleItemChange={handleItemChange}
        />
      ))}

      <TouchableOpacity style={styles.btnAgregar} onPress={btnAgregarItem}>
        <Text style={styles.btnTexto}>+ Técnica</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#000',
  },
  itemContainer: {
    backgroundColor: '#111',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    padding: 10,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputDominio: {
    backgroundColor: '#222',
    color: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  nombreInput: {
    fontFamily: 'cursive',
    fontSize: 18,
    color: 'yellow',
    textAlign: 'center',
    marginBottom: 10,
  },
  smallInput: {
    flex: 1,
    textAlign: 'center',
  },
  inputArea: {
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 6,
    padding: 10,
    minHeight: 80,
    marginTop: 10,
  },
  btnAgregar: {
    backgroundColor: '#339CFF',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 15,
  },
  btnTexto: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
