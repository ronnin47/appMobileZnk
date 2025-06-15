import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export const Item = ({ id, itemValues, handleItemChange }) => {
  const handleChange = (field, value) => {
    const newValues = { ...itemValues, [field]: value };
    handleItemChange(id, newValues);
  };

  return (
    <View style={styles.itemContainer}>
      <View style={styles.rowTop}>
        <TextInput
          style={[styles.input, styles.nombre]}
          value={itemValues.nombre}
          onChangeText={(text) => handleChange('nombre', text)}
          placeholder="Nombre"
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={[styles.input, styles.cantidad]}
          value={itemValues.cantidad.toString()}
          onChangeText={(text) => handleChange('cantidad', text)}
          placeholder="Cantidad"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
        />
      </View>
      <TextInput
        style={[styles.input, styles.descripcion]}
        value={itemValues.descripcion}
        onChangeText={(text) => handleChange('descripcion', text)}
        placeholder="Descripción"
        placeholderTextColor="#aaa"
        multiline={true}
        numberOfLines={4} // altura inicial
        textAlignVertical="top" // para que el texto empiece arriba
      />
    </View>
  );
};


export const Inventario = ({ inventario = [], setInventario }) => {
  const [items, setItems] = useState(() =>
    Array.isArray(inventario)
      ? inventario.map((item, index) => ({
          id: index,
          values: {
            nombre: item.nombre || '',
            cantidad: item.cantidad?.toString() || '',
            descripcion: item.descripcion || '',
          },
        }))
      : []
  );

  useEffect(() => {
    if (!Array.isArray(inventario)) return;
    setItems(
      inventario.map((item, index) => ({
        id: index,
        values: {
          nombre: item.nombre || '',
          cantidad: item.cantidad?.toString() || '',
          descripcion: item.descripcion || '',
        },
      }))
    );
  }, [inventario]);

  const handleItemChange = (id, newValues) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, values: newValues } : item
    );

    const isEmpty = Object.values(newValues).every((v) => v === '');
    const finalItems = isEmpty
      ? updatedItems.filter((item) => item.id !== id)
      : updatedItems;

    setItems(finalItems);
    setInventario(finalItems.map((item) => item.values));
  };

  const btnAgregarItem = () => {
    const newItem = { id: items.length, values: { nombre: '', cantidad: '', descripcion: '' } };
    const newItems = [...items, newItem];
    setItems(newItems);
    setInventario(newItems.map((item) => item.values));
  };

  return (
  <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 10 }]}>
      {items.length > 0 &&
        items.map((item) => (
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
              + Item
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: '#111',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    padding: 0,      // Sin padding para que queden pegados
    marginBottom: 6,
    overflow: 'hidden', // para que los bordes redondeados funcionen bien sin gaps
    marginTop:2,
  },

  rowTop: {
    flexDirection: 'row',
  },

  input: {
    backgroundColor: '#222',
    color: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 8,
    textAlign: 'left',
  },

  nombre: {
    flex: 2,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#444',
    borderRightWidth: 0,  // Sin borde derecho para que no se duplique con cantidad
    color:"cyan"
  },

  cantidad: {
    flex: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderLeftWidth: 0,  // Sin borde izquierdo para que no se duplique con nombre
    borderColor: '#444',
  },

  descripcion: {
    backgroundColor: '#222',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopWidth: 0,  // Sin borde superior para pegarse al row superior
    borderColor: '#444',
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: '#fff',
    minHeight: 80,
    textAlignVertical: 'top',
  },
   container: {
    padding: 5,
    backgroundColor: '#000',  // para que se note el fondo y se aplique padding
  },
});