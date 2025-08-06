import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState,useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import PagerView from 'react-native-pager-view';
import Chat from './chat';
import { PageDerechaChat } from './pageDerechaChat';
import { PageDerechaChat2 } from './pageDerechaChat2';

export const PagerChat = () => {
  const [tiradasGuardadas, setTiradasGuardadas] = useState([]);

  // 🔹 Cargar desde AsyncStorage al inicio
  useEffect(() => {
    const cargarTiradas = async () => {
      try {
        const datos = await AsyncStorage.getItem('tiradasGuardadas');
        if (datos) {
          setTiradasGuardadas(JSON.parse(datos));
        }
      } catch (e) {
        console.error('Error al cargar tiradas:', e);
      }
    };
    cargarTiradas();
  }, []);

  // 🔹 Guardar nueva tirada
  const agregarTirada = async (nueva) => {
    const actualizadas = [...tiradasGuardadas, nueva];
    setTiradasGuardadas(actualizadas);
    try {
      await AsyncStorage.setItem('tiradasGuardadas', JSON.stringify(actualizadas));
    } catch (e) {
      console.error('Error guardando tiradas:', e);
    }
  };

  // 🔹 Eliminar una tirada
  const eliminarTiradas = async (nombre) => {
    const filtradas = tiradasGuardadas.filter(t => t.nombre !== nombre);
    setTiradasGuardadas(filtradas);
    try {
      await AsyncStorage.setItem('tiradasGuardadas', JSON.stringify(filtradas));
    } catch (e) {
      console.error('Error eliminando tirada:', e);
    }
  };

  return (
    <PagerView style={styles.pagerView} initialPage={0}>
      <View key="1" style={styles.page}>
        <Chat tiradasGuardadas={tiradasGuardadas} />
      </View>
      <View key="2" style={styles.page}>
        <PageDerechaChat
        />
       
      </View>
       <View key="3" style={styles.page}>
        <PageDerechaChat2
          agregarTirada={agregarTirada}
          eliminarTiradas={eliminarTiradas}
          tiradasGuardadas={tiradasGuardadas}
        />
      </View>
    </PagerView>
  );
};

const styles = StyleSheet.create({
  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
});