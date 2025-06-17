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
      {/* Nombre */}
      <TextInput
        style={[styles.inputDominio, styles.nombreInput]}
        value={itemValues.nombre}
        onChangeText={(text) => handleChange('nombre', text)}
        placeholder="Nombre"
        placeholderTextColor="#aaa"
        textAlign="center"
      />

      {/* Nivel Ki + Arte */}
      <View style={styles.row}>
        <TextInput
          style={[styles.inputDominio, styles.smallInput]}
          value={itemValues.nivelKi}
          onChangeText={(text) => handleChange('nivelKi', text)}
          placeholder="Nivel de Ki"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
          textAlign="center"
        />
        <TextInput
          style={[styles.inputDominio, styles.smallInput]}
          value={itemValues.dominio}
          onChangeText={(text) => handleChange('dominio', text)}
          placeholder="Arte"
          placeholderTextColor="#aaa"
          textAlign="center"
        />
      </View>

      {/* Descripción */}
      <TextInput
        style={[styles.inputArea, { marginTop: 10 }]}
        value={itemValues.descripcion}
        onChangeText={(text) => handleChange('descripcion', text)}
        placeholder="Descripción"
        placeholderTextColor="#aaa"
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />

      {/* Sistema */}
      <TextInput
        style={[styles.inputArea, { marginTop: 10 }]}
        value={itemValues.sistema}
        onChangeText={(text) => handleChange('sistema', text)}
        placeholder="Sistema"
        placeholderTextColor="#aaa"
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />

      {/* Coste de Ki + Tiempo Invocación */}
      <View style={[styles.row, { marginTop: 10 }]}>
        <TextInput
          style={[styles.inputDominio, styles.smallInput]}
          value={itemValues.costeKi}
          onChangeText={(text) => handleChange('costeKi', text)}
          placeholder="Coste de Ki"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
          textAlign="center"
        />
        <TextInput
          style={[styles.inputDominio, styles.smallInput]}
          value={itemValues.invo}
          onChangeText={(text) => handleChange('invo', text)}
          placeholder="Tiempo Invocación"
          placeholderTextColor="#aaa"
          textAlign="center"
        />
      </View>
    </View>
  );
};

export const Dominios = ({ dominios, setDominios }) => {
  // Inicializamos items con la transformación de dominios para evitar render vacío
  const [items, setItems] = useState(
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

  // Ya no hace falta el useEffect que sincronizaba items con dominios porque se inicializa bien

  const handleItemChange = (id, newValues) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, values: newValues } : item
    );

    const areFieldsEmpty = Object.values(newValues).every((v) => v === '');

    const finalItems = areFieldsEmpty
      ? updatedItems.filter((item) => item.id !== id)
      : updatedItems;

    setItems(finalItems);
    setDominios(finalItems.map((item) => item.values));
  };

  const btnAgregarItem = () => {
    const newItem = {
      id: items.length,
      values: {
        dominio: '',
        nombre: '',
        nivelKi: '',
        descripcion: '',
        sistema: '',
        costeKi: '',
        invo: '',
      },
    };
    setItems([...items, newItem]);
    setDominios([...dominios, newItem.values]);
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

     


     <View style={{ marginTop: 10, alignItems: 'center' }}>
              <View style={{ width: 140 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#339CFF',
                    paddingVertical: 10,
                    borderRadius: 6,
                    alignItems: 'center',
                  }}
                  onPress={btnAgregarItem}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                    + Tecnica
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
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
    alignItems: 'center',
  },
  inputDominio: {
    backgroundColor: '#222',
    color: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  nombreInput: {
    flex: 1,
    fontFamily: 'sans-serif',
    fontSize: 18,
    color: 'yellow',
    marginBottom: 10,
    textAlign: 'center',
  },
  smallInput: {
    flex: 1,
    marginHorizontal: 2,
  },
  inputArea: {
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 6,
    padding: 10,
    minHeight: 120,
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
