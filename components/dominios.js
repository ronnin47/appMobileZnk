import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ImageBackground
} from 'react-native';

/* ===========================================================
   ITEM (ACORDEÓN)
   =========================================================== */
export const Item = ({ id, itemValues, handleItemChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (field, value) => {
    const newValues = { ...itemValues, [field]: value };
    handleItemChange(id, newValues);
  };

  return (
    <View style={styles.itemContainer}>

      {/* HEADER: nombre + flecha */}
 <TouchableOpacity
  style={styles.headerRow}
  onPress={() => setIsOpen(!isOpen)}
  activeOpacity={0.7}
>
  {/* Nombre solo visible si está cerrado, sino espacio invisible */}
  {!isOpen ? (
    <Text style={styles.headerNombre}>
      {itemValues.nombre || "Sin nombre"}
    </Text>
  ) : (
    <View style={{ flex: 1 }} />  // placeholder para mantener la flecha a la derecha
  )}

  {/* Flecha siempre a la derecha */}
  <Text style={styles.headerFlecha}>
    {isOpen ? "▲" : "▼"}
  </Text>
</TouchableOpacity>

      {/* CUERPO DEL ITEM (solo se muestra si está abierto) */}
      {!isOpen ? null : (
        <View>

          {/* Nombre editable */}
          <TextInput
            style={[styles.inputDominio, styles.nombreInput]}
            value={itemValues.nombre}
            onChangeText={(text) => handleChange('nombre', text)}
            placeholder="Nombre"
            placeholderTextColor="#aaa"
            textAlign="center"
            multiline
          />

          {/* Nivel Ki + Arte */}
          <View style={styles.row}>
            <TextInput
              style={[styles.inputDominio, styles.smallInput]}
              value={itemValues.nivelKi}
              onChangeText={(text) => handleChange('nivelKi', text)}
              placeholder="Nivel de Ki"
              placeholderTextColor="#aaa"
              keyboardType="default"
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
            numberOfLines={15}
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
            numberOfLines={15}
            textAlignVertical="top"
          />

          {/* Coste Ki + Tiempo Invocación */}
          <View style={[styles.row, { marginTop: 10 }]}>
            <TextInput
              style={[styles.inputDominio, styles.smallInput]}
              value={itemValues.costeKi}
              onChangeText={(text) => handleChange('costeKi', text)}
              placeholder="Coste de Ki"
              placeholderTextColor="#aaa"
              keyboardType="default"
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
      )}
    </View>
  );
};

/* ===========================================================
   LISTA DE DOMINIOS
   =========================================================== */
export const Dominios = ({ dominios, setDominios }) => {
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

  const handleItemChange = (id, newValues) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, values: newValues } : item
    );

    const empty = Object.values(newValues).every((v) => v === '');

    const finalItems = empty
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


      const fondoUrl = "https://res.cloudinary.com/dzul1hatw/image/upload/v1762214718/899adabe7c5876547f19c629581fae24_p5ybkk.jpg";

  return (


      <ImageBackground
                      source={{ uri: fondoUrl  }}
                      style={{ flex: 1, opacity:1, backgroundColor:"rgba(3, 3, 3, 0.66)" }}
                      resizeMode='cover'
                    >

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
            style={styles.btnAgregar}
            onPress={btnAgregarItem}
          >
            <Text style={styles.btnTexto}>+ Técnica</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>

                    </ImageBackground>
   
  );
};

/* ===========================================================
   ESTILOS
   =========================================================== */
const styles = StyleSheet.create({
 container: {
  padding: 4,
  backgroundColor: '#0a0a0a6b', // fondo negro intenso
},
itemContainer: {
  backgroundColor: '#00000067', // gris oscuro uniforme
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#1f1f1fff', // borde más oscuro para contraste
  padding: 6,
  marginBottom: 12,
},

/* --- Header del acordeón --- */
headerRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 6,
  backgroundColor: '#06060796', // un tono ligeramente distinto para resaltar el header
  borderRadius: 6,
  paddingHorizontal: 6,
},
headerNombre: {
 color: '#fdee20b7',
  fontSize: 16,
  fontWeight: 'bold',
  flex: 1,
},
headerFlecha: {
  color: '#ffffff', // blanca para que siempre resalte
  fontSize: 16,
  paddingHorizontal: 8,
},

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  inputDominio: {
    backgroundColor: '#222',
    color: '#a893e7ff',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  nombreInput: {
    flex: 1,
    fontFamily: 'sans-serif',
    fontSize: 18,
color: '#fdee20ff',
    backgroundColor: '#0000006e',
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
