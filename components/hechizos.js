import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ImageBackground
} from "react-native";

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
      {/* HEADER: flecha siempre a la derecha */}
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
      {isOpen && (
        <View>
          {/* Nombre editable */}
          <TextInput
            style={[styles.inputDominio, styles.nombreInput]}
            value={itemValues.nombre}
            onChangeText={(text) => handleChange("nombre", text)}
            placeholder="Nombre"
            placeholderTextColor="#aaa"
            textAlign="center"
            multiline
          />

          {/* Nivel Ki + Ryu */}
          <View style={[styles.row, { justifyContent: "center", gap: 6, marginTop: 4 }]}>
            <TextInput
              style={[styles.inputDominio, styles.smallInput, { width: 120 }]}
              value={itemValues.nivelKi}
              onChangeText={(text) => handleChange("nivelKi", text)}
              placeholder="Nivel arcano"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
              textAlign="center"
            />
            <TextInput
              style={[styles.inputDominio, styles.smallInput, { width: 120 }]}
              value={itemValues.ryu}
              onChangeText={(text) => handleChange("ryu", text)}
              placeholder="Ryu"
              placeholderTextColor="#aaa"
              textAlign="center"
            />
          </View>

          {/* Descripción */}
          <TextInput
            style={[styles.inputArea, { marginTop: 10 }]}
            value={itemValues.descripcion}
            onChangeText={(text) => handleChange("descripcion", text)}
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
            onChangeText={(text) => handleChange("sistema", text)}
            placeholder="Sistema"
            placeholderTextColor="#aaa"
            multiline
            numberOfLines={15}
            textAlignVertical="top"
          />

          {/* Tiempo Invocación + Coste Ki */}
          <View style={[styles.row, { marginTop: 10, gap: 6 }]}>
            <TextInput
              style={[styles.inputDominio, styles.smallInput, { flex: 1 }]}
              value={itemValues.invo}
              onChangeText={(text) => handleChange("invo", text)}
              placeholder="Tiempo Invocación"
              placeholderTextColor="#aaa"
              textAlign="center"
            />
            <TextInput
              style={[styles.inputDominio, styles.smallInput, { flex: 1 }]}
              value={itemValues.costeKi}
              onChangeText={(text) => handleChange("costeKi", text)}
              placeholder="Coste de Ki"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
              textAlign="center"
            />
          </View>
        </View>
      )}
    </View>
  );
};

/* ===========================================================
   LISTA DE HECHIZOS
   =========================================================== */
export const Hechizos = ({ hechizos, setHechizos }) => {
  const [items, setItems] = useState(() =>
    hechizos.map((hc, index) => ({
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
    }))
  );

  useEffect(() => {
    setItems(
      hechizos.map((hc, index) => ({
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
      }))
    );
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
    setHechizos(finalItems.map((item) => item.values));
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

    setItems(newItems);
    setHechizos(newItems.map((item) => item.values));
  };


    const fondoUrl = "https://res.cloudinary.com/dzul1hatw/image/upload/v1763665314/d76c7ab6833c3b76143f66f2a12ac8b3_bcmguw.jpg";
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

      <View style={{ marginTop: 10, alignItems: "center" }}>
        <View style={{ width: 140 }}>
          <TouchableOpacity style={styles.btnAgregar} onPress={btnAgregarItem}>
            <Text style={styles.btnTexto}>+ Hechizo</Text>
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
    backgroundColor: "#0a0a0a3a",
  },
  itemContainer: {
    backgroundColor: "#000000e5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1f1f1fff",
    padding: 6,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    backgroundColor: "#06060773",
    borderRadius: 6,
    paddingHorizontal: 6,
  },
  headerNombre: {
   color: "#715fa5ff",
    fontSize: 16,
    fontWeight: "bold",
     backgroundColor: "#060607b4",
    flex: 1,
  },
  headerFlecha: {
    color: "#ffffff",
    fontSize: 16,
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputDominio: {
    backgroundColor: "#222",
    color: "#715fa5ff",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  nombreInput: {
    flex: 1,
    fontFamily: "sans-serif",
    fontSize: 18,
    color: "#f7dc44ff",
    backgroundColor: "#0000006e",
    marginBottom: 10,
    textAlign: "center",
  },
  smallInput: {
    flex: 1,
    marginHorizontal: 2,
  },
  inputArea: {
    backgroundColor: "#222222e5",
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
