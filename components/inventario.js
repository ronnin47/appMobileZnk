import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,ImageBackground } from 'react-native';

export const Item = ({ id, itemValues, handleItemChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (field, value) => {
    const newValues = { ...itemValues, [field]: value };
    handleItemChange(id, newValues);
  };
    const fondoUrl = "https://res.cloudinary.com/dzul1hatw/image/upload/v1761596815/1536017df259933671623c69beaae925_pwz9t7.jpg";
  return (

     <ImageBackground
                  source={{ uri: fondoUrl  }}
                  style={{ flex: 1, opacity:1, backgroundColor:"rgba(3, 3, 3, 0.66)" }}
                  resizeMode='cover'
                >

<View style={styles.itemContainer}>
      {/* HEADER — solo visible cuando está CERRADO */}
      {!isOpen && (
        <TouchableOpacity
          onPress={() => setIsOpen(true)}
          style={styles.headerRow}
          activeOpacity={0.7}
        >
          <Text style={styles.headerNombre}>
            {itemValues.nombre || "Sin nombre"}
          </Text>

          <Text style={styles.headerCantidad}>
            {itemValues.cantidad || "0"}
          </Text>

          <Text style={styles.headerFlecha}>▼</Text>
        </TouchableOpacity>
      )}

      {/* CONTENIDO — solo visible cuando está ABIERTO */}
      {isOpen && (
        <View>
          <TouchableOpacity
            onPress={() => setIsOpen(false)}
            style={styles.flechaCerrar}
          >
            <Text style={styles.headerFlecha}>▲</Text>
          </TouchableOpacity>

          <View style={styles.rowTop}>
            <TextInput
              style={[styles.input, styles.nombre]}
              value={itemValues.nombre}
              onChangeText={(text) => handleChange('nombre', text)}
              placeholder="Nombre"
              placeholderTextColor="#aaa"
              multiline
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
            multiline
            textAlignVertical="top"
          />
        </View>
      )}
    </View>

                </ImageBackground>
    
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
    backgroundColor: '#000000d7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#816b6b49',
    marginBottom: 10,
    padding: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },

  rowTop: {
    flexDirection: 'row',
    marginBottom: 4,
  },

  input: {
    backgroundColor: '#1a1a1a',
    color: '#e6e6e6',
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 15,
  },

 nombre: {
  flex: 3,
  borderWidth: 1,
  borderColor: '#f3f1f183',
  borderTopLeftRadius: 6,
  borderBottomLeftRadius: 6,
  borderRightWidth: 0,
   color: '#fac414ff',
    backgroundColor: '#000000ff',
  paddingVertical: 8,
  textAlignVertical: 'top', // ← permite expandir hacia abajo
  minHeight: 40,
  maxHeight: 80,            // evita que se vuelva enorme
},

cantidad: {
  flex: 1,                 // campo chico
  maxWidth: 25,            // ← tamaño ideal para un número
  borderWidth: 1,
  borderColor: '#ddd2d2ff',
  borderTopRightRadius: 6,
  borderBottomRightRadius: 6,
  borderLeftWidth: 0,
  textAlign: 'center',     // para que el número quede centrado
  color: '#030303ff',
  backgroundColor:'#c7b341ff',
  paddingHorizontal: 0,    // menos padding, más compacto
},
  descripcion: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 90,
    color: '#dcdcdc',
    textAlignVertical: 'top',
    fontSize: 14,
    marginTop: 4,
  },

  container: {
    padding: 2,
    backgroundColor: '#00000050',
  },

  btnAgregar: {
    backgroundColor: '#339CFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#0077ff',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 4,
    width: 150,
  },

  btnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 17,
  },
  headerRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: 6,
  paddingHorizontal: 8,
  backgroundColor: "#00000010",
  borderRadius: 6,
  borderWidth: 1,
  borderColor: "#816b6b49",
},

headerNombre: {
  color: "#fdd462",
  fontSize: 16,
  fontWeight: "bold",
  flex: 3,
},

headerCantidad: {
  color: "#fff",
  fontSize: 16,
  textAlign: "center",
  flex: 1,
},

headerFlecha: {
  fontSize: 18,
  color: "#ffffffcc",
  marginLeft: 10,
},

flechaCerrar: {
  alignItems: "flex-end",
  paddingRight: 6,
  marginBottom: 4,
},
});