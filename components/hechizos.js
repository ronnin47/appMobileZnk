import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

export const Item = ({ id, itemValues, handleItemChange }) => {
  const handleChange = (field, value) => {
    const newValues = { ...itemValues, [field]: value };
    handleItemChange(id, newValues);
  };

  return (
    <View style={styles.itemContainer}>
      {/* Fila 1: Nombre + Nivel Ki + Ryu */}
      <View style={styles.row}>
        <TextInput
          style={[styles.inputDominio, styles.nombreInput]}
          value={itemValues.nombre}
          onChangeText={(text) => handleChange("nombre", text)}
          placeholder="Nombre"
          placeholderTextColor="#aaa"
          textAlign="center"
        />
        <TextInput
          style={[styles.inputDominio, styles.smallInput]}
          value={itemValues.nivelKi}
          onChangeText={(text) => handleChange("nivelKi", text)}
          placeholder="Nivel arcano"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
          textAlign="center"
        />
        <TextInput
          style={[styles.inputDominio, styles.smallInput]}
          value={itemValues.ryu}
          onChangeText={(text) => handleChange("ryu", text)}
          placeholder="Ryu"
          placeholderTextColor="#aaa"
          textAlign="center"
        />
      </View>

      {/* Fila 2: Descripción */}
      <TextInput
        style={[styles.inputArea, { marginTop: 10 }]}
        value={itemValues.descripcion}
        onChangeText={(text) => handleChange("descripcion", text)}
        placeholder="Descripción"
        placeholderTextColor="#aaa"
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />

      {/* Fila 3: Sistema */}
      <TextInput
        style={[styles.inputArea, { marginTop: 10 }]}
        value={itemValues.sistema}
        onChangeText={(text) => handleChange("sistema", text)}
        placeholder="Sistema"
        placeholderTextColor="#aaa"
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />

      {/* Fila 4: Tiempo Invocación + Coste Ki */}
      <View style={[styles.row, { marginTop: 10 }]}>
        <TextInput
          style={[styles.inputDominio, styles.smallInput]}
          value={itemValues.invo}
          onChangeText={(text) => handleChange("invo", text)}
          placeholder="Tiempo Invocación"
          placeholderTextColor="#aaa"
          textAlign="center"
        />
        <TextInput
          style={[styles.inputDominio, styles.smallInput]}
          value={itemValues.costeKi}
          onChangeText={(text) => handleChange("costeKi", text)}
          placeholder="Coste de Ki"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
          textAlign="center"
        />
      </View>
    </View>
  );
};

export const Hechizos = ({ hechizos, setHechizos }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const nuevosItems = hechizos.map((hc, index) => ({
      id: index,
      values: {
        ryu: hc.ryu || "",
        nombre: hc.nombre || "",
        nivelKi: hc.nivelKi || "",
        descripcion: hc.descripcion || "",
        sistema: hc.sistema || "",
        costeKi: hc.costeKi || "",
        invo: hc.invo || "",
      },
    }));
    setItems(nuevosItems);
    setLoading(false);
  }, [hechizos]);

  const handleItemChange = (id, newValues) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, values: newValues } : item
    );

    const areFieldsEmpty =
      !newValues.ryu &&
      !newValues.nombre &&
      !newValues.nivelKi &&
      !newValues.descripcion &&
      !newValues.sistema &&
      !newValues.costeKi &&
      !newValues.invo;

    const finalItems = areFieldsEmpty
      ? updatedItems.filter((item) => item.id !== id)
      : updatedItems;

    setItems(finalItems);
    const newHechizos = finalItems.map((item) => item.values);
    setHechizos(newHechizos);
  };

  const btnAgregarItem = () => {
    const newItem = {
      id: items.length,
      values: {
        ryu: "",
        nombre: "",
        nivelKi: "",
        descripcion: "",
        sistema: "",
        costeKi: "",
        invo: "",
      },
    };

    const newItems = [...items, newItem];
    const newHechizos = newItems.map((item) => item.values);

    setItems(newItems);
    setHechizos(newHechizos);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!loading &&
        items.map((item) => (
          <Item
            key={item.id}
            id={item.id}
            itemValues={item.values}
            handleItemChange={handleItemChange}
          />
        ))}

      {!loading && (
        <TouchableOpacity style={styles.btnAgregar} onPress={btnAgregarItem}>
          <Text style={styles.btnTexto}>+ Hechizo</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#000",
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputDominio: {
    backgroundColor: "#222",
    color: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  nombreInput: {
    flex: 4,
    color: "yellow",
    fontFamily: "cursive",
    fontSize: 18,
    marginRight: 1,
  },
  smallInput: {
    flex: 1,
    marginLeft: 2,
  },
  inputArea: {
    backgroundColor: "#222",
    color: "#fff",
    borderRadius: 6,
    padding: 10,
    minHeight: 120,
  },
  btnAgregar: {
    backgroundColor: "#339CFF",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 15,
  },
  btnTexto: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
});
