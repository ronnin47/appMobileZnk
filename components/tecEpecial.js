import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

// Función simple para comparar arrays de objetos según los campos que usás
const areArraysEqual = (a, b) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const objA = a[i];
    const objB = b[i];
    if (
      objA.nombre !== objB.nombre ||
      objA.presentacion !== objB.presentacion ||
      objA.sistema !== objB.sistema
    ) {
      return false;
    }
  }
  return true;
};

export const Item = ({ id, itemValues, handleItemChange }) => {
  const [heightPresentacion, setHeightPresentacion] = useState(40);
  const [heightSistema, setHeightSistema] = useState(40);

  const handleChange = (field, value) => {
    const newValues = { ...itemValues, [field]: value };
    handleItemChange(id, newValues);
  };

  return (
    <View style={styles.itemContainer}>
      <TextInput
        style={styles.inputNombre}
        value={itemValues.nombre}
        onChangeText={(text) => handleChange("nombre", text)}
        placeholder="Nombre"
        placeholderTextColor="#aaa"
        multiline
        numberOfLines={2}
        textAlignVertical="top"
      />

      <TextInput
        style={[styles.textarea, { height: Math.max(40, heightPresentacion) }]}
        value={itemValues.presentacion}
        onChangeText={(text) => handleChange("presentacion", text)}
        placeholder="Presentación:"
        placeholderTextColor="#aaa"
        multiline
        onContentSizeChange={(e) =>
          setHeightPresentacion(e.nativeEvent.contentSize.height)
        }
      />

      <TextInput
        style={[styles.textarea, { height: Math.max(40, heightSistema) }]}
        value={itemValues.sistema}
        onChangeText={(text) => handleChange("sistema", text)}
        placeholder="Sistema:"
        placeholderTextColor="#aaa"
        multiline
        onContentSizeChange={(e) =>
          setHeightSistema(e.nativeEvent.contentSize.height)
        }
      />
    </View>
  );
};

export const TecnicaEspecial = ({ tecEspecial, setTecEspecial }) => {
  // Inicializo items vacío o desde tecEspecial
  const [items, setItems] = useState(() =>
    Array.isArray(tecEspecial)
      ? tecEspecial.map((item, index) => ({
          id: index,
          values: {
            nombre: item.nombre || "",
            presentacion: item.presentacion || "",
            sistema: item.sistema || "",
          },
        }))
      : []
  );

  // Sincronizo items cuando tecEspecial cambie y sea válido
  useEffect(() => {
    if (Array.isArray(tecEspecial)) {
      const newItems = tecEspecial.map((item, index) => ({
        id: index,
        values: {
          nombre: item.nombre || "",
          presentacion: item.presentacion || "",
          sistema: item.sistema || "",
        },
      }));

      // Solo actualizamos estado local si son distintos
      if (!areArraysEqual(items.map((i) => i.values), tecEspecial)) {
        setItems(newItems);
      }
    }
  }, [tecEspecial]);

  const handleItemChange = (id, newValues) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, values: newValues } : item
    );

    const areFieldsEmpty =
      !newValues.nombre && !newValues.presentacion && !newValues.sistema;

    const finalItems = areFieldsEmpty
      ? updatedItems.filter((item) => item.id !== id)
      : updatedItems;

    const finalValues = finalItems.map((item) => item.values);

    // Actualizamos solo si hay cambios reales para evitar parpadeo
    if (!areArraysEqual(finalValues, tecEspecial)) {
      setTecEspecial(finalValues);
    }

    setItems(finalItems);
  };

  const btnAgregarItem = () => {
    const newItem = {
      id: items.length,
      values: { nombre: "", presentacion: "", sistema: "" },
    };
    const newItems = [...items, newItem];
    setItems(newItems);
    setTecEspecial(newItems.map((item) => item.values));
  };

  if (!items.length) {
    return null;
  }


  const [showButton, setShowButton] = useState(false);

  // Cada vez que cambian los items, ocultamos el botón y lo mostramos luego con delay
  useEffect(() => {
    setShowButton(false); // ocultamos el botón
    const timeout = setTimeout(() => {
      setShowButton(true); // mostramos el botón luego del delay
    }, 100); // 100ms, podés ajustar este tiempo

    return () => clearTimeout(timeout); // limpieza
  }, [items]);
  return (
    <View style={styles.container}>
      {items.map((item) => (
        <Item
          key={item.id}
          id={item.id}
          itemValues={item.values}
          handleItemChange={handleItemChange}
        />
      ))}

      
      {showButton && (
        <TouchableOpacity style={styles.btnAgregar} onPress={btnAgregarItem}>
          <Text style={styles.btnTexto}>+ Técnica-Poder-Objeto especial</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#000",
    flex: 1,
  },
  title: {
    color: "aliceblue",
    fontSize: 30,
    fontFamily: "Impact",
    marginVertical: 10,
    textAlign: "center",
  },
  itemContainer: {
    backgroundColor: "#111",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
    padding: 10,
    marginBottom: 12,
  },
  inputNombre: {
    backgroundColor: "#222",
    color: "yellow",
    fontFamily: "Comic Sans MS",
    fontSize: 18,
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
    minHeight: 40,
    textAlignVertical: "top",
  },
  textarea: {
    backgroundColor: "#222",
    color: "#fff",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    textAlignVertical: "top",
  },
  btnAgregar: {
    backgroundColor: "#339CFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  btnTexto: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
});

