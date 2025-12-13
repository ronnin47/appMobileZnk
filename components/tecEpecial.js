import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground
} from "react-native";

const areArraysEqual = (a, b) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const objA = a[i];
    const objB = b[i];
    if (
      objA.nombre !== objB.nombre ||
      objA.presentacion !== objB.presentacion ||
      objA.sistema !== objB.sistema ||
      objA.check !== objB.check
    ) {
      return false;
    }
  }
  return true;
};

export const Item = ({ id, itemValues, handleItemChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [heightPresentacion, setHeightPresentacion] = useState(40);
  const [heightSistema, setHeightSistema] = useState(40);

  const handleChange = (field, value) => {
    const newValues = { ...itemValues, [field]: value };
    handleItemChange(id, newValues);
  };

  return (
    <View style={styles.itemContainer}>
      {/* HEADER / FLECHA */}
      <TouchableOpacity
        style={styles.headerRow}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        {/* Nombre solo visible si está cerrado */}
        {!isOpen ? (
          <Text style={styles.headerNombre}>
            {itemValues.nombre || "Sin nombre"}
          </Text>
        ) : (
          <View style={{ flex: 1 }} /> // placeholder para mantener la flecha a la derecha
        )}

        {/* Flecha siempre visible */}
        <Text style={styles.headerFlecha}>{isOpen ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {/* CUERPO SOLO SI ESTA ABIERTO */}
      {isOpen && (
        <View style={{ marginTop: 10 }}>
          {/* Nombre editable */}
          <TextInput
            style={styles.inputNombreFlex}
            value={itemValues.nombre}
            onChangeText={(text) => handleChange("nombre", text)}
            placeholder="Nombre"
            placeholderTextColor="#aaa"
            multiline
            numberOfLines={15}
            textAlignVertical="top"
          />

        

          {/* Presentación */}
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

          {/* Sistema */}
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


            {/* Check */}
          <TouchableOpacity
            onPress={() => handleChange("check", !itemValues.check)}
            style={styles.checkContainer}
          >
            <Text
              style={{ color: itemValues.check ? "lime" : "#ccc", fontSize: 16 }}
            >
              {itemValues.check ? "✅" : "⬜"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export const TecnicaEspecial = ({ tecEspecial, setTecEspecial }) => {
  const [items, setItems] = useState(() =>
    Array.isArray(tecEspecial)
      ? tecEspecial.map((item, index) => ({
          id: index,
          values: {
            nombre: item.nombre || "",
            presentacion: item.presentacion || "",
            sistema: item.sistema || "",
            check: item.check ?? false,
          },
        }))
      : []
  );

  useEffect(() => {
    if (Array.isArray(tecEspecial)) {
      const newItems = tecEspecial.map((item, index) => ({
        id: index,
        values: {
          nombre: item.nombre || "",
          presentacion: item.presentacion || "",
          sistema: item.sistema || "",
          check: item.check ?? false,
        },
      }));

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

    if (!areArraysEqual(finalValues, tecEspecial)) {
      setTecEspecial(finalValues);
    }

    setItems(finalItems);
  };

  const btnAgregarItem = () => {
    const newItem = {
      id: items.length,
      values: {
        nombre: "",
        presentacion: "",
        sistema: "",
        check: false,
      },
    };
    const newItems = [...items, newItem];
    setItems(newItems);
    setTecEspecial(newItems.map((item) => item.values));
  };

  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    setShowButton(false);
    const timeout = setTimeout(() => {
      setShowButton(true);
    }, 100);

    return () => clearTimeout(timeout);
  }, [items]);

    const fondoUrl = "https://res.cloudinary.com/dzul1hatw/image/upload/v1763045782/e035634455ab0076414882815f661711_fczp0b.jpg";

  return (     
    <ImageBackground
              source={{ uri: fondoUrl  }}
              style={{ flex: 1, opacity:1, backgroundColor:"rgba(3, 3, 3, 0.66)" }}
              resizeMode='cover'
            >
    <View style={styles.container}>
      {items.length === 0 && (
        <Text style={{ color: "#ccc", textAlign: "center", marginBottom: 10 }}>
          No hay poderes únicos aún.
        </Text>
      )}

      {items.map((item) => (
        <Item
          key={item.id}
          id={item.id}
          itemValues={item.values}
          handleItemChange={handleItemChange}
        />
      ))}

      {showButton && (
        <View style={{ marginTop: 10, alignItems: "center" }}>
          <View style={{ width: 140 }}>
            <TouchableOpacity
              style={{
                backgroundColor: "#339CFF",
                paddingVertical: 10,
                borderRadius: 6,
                alignItems: "center",
              }}
              onPress={btnAgregarItem}
            >
              <Text
                style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
              >
                + Poder Único
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
  // backgroundColor: "#00000048",
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
    backgroundColor: "#11111128",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
    padding: 10,
    marginBottom: 12,
  },
  nombreCheckContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  inputNombreFlex: {
    backgroundColor: "#0000008c",
    color: "yellow",
    fontFamily: "Comic Sans MS",
    fontSize: 18,
    padding: 8,
    borderRadius: 6,
    flex: 1,
   marginBottom:4,
    minHeight: 40,
    textAlignVertical: "top",
  },
  textarea: {
    backgroundColor: "#000000a8",
    color: "#e0dcd1ff",
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
  checkContainer: {
    backgroundColor: "#00000075",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems:"center"
  },
   headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#0606073d", // un tono oscuro para el header
    borderRadius: 6,
  },
  headerNombre: {
    flex: 1,
    color: "#f7dc44ff", // amarillo dorado
    fontSize: 16,
    fontWeight: "bold",
  },
  headerFlecha: {
    fontSize: 18,
    color: "#ffffff",
    paddingHorizontal: 6,
  },
});
