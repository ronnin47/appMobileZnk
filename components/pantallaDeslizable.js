import React, { useContext, useState, useEffect, useRef, useMemo } from 'react';
import { AuthContext } from './AuthContext';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import PagerView from 'react-native-pager-view';
import { FichaPersonaje } from './fichaPersonaje';
import { Tiradas } from './tiradas';
import { NotasUsuario } from './notasUsuario';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import axios from 'axios';
import { API_BASE_URL } from './config';

export const PantallaDeslizable = () => {
  const {
    personajes,
    savePersonajes,
    pjSeleccionado,
    tiempoSeleccionCarita,
    setPjSeleccionado,
  } = useContext(AuthContext);

  const navigation = useNavigation();

  // Obtener personaje seleccionado
  const pj = useMemo(() => {
    return personajes.find(per => per.idpersonaje === pjSeleccionado);
  }, [pjSeleccionado, personajes]);

  // 🪝 Hooks de estado - SIEMPRE ANTES DE CUALQUIER RETURN
  const [ki, setKi] = useState('');
  const [fortaleza, setFortaleza] = useState('');
  const [ken, setKen] = useState('');
  const [kenActual, setKenActual] = useState('');
  const [kiActual, setKiActual] = useState('');
  const [vidaActual, setVidaActual] = useState('');
  const [positiva, setPositiva] = useState('');
  const [negativa, setNegativa] = useState('');
  const [cicatriz, setCicatriz] = useState('');
  const [consumision, setConsumision] = useState('');

  const isInitialMount = useRef(true);

  // ⚡ Sincroniza valores del personaje seleccionado
  useEffect(() => {
    if (pj) {
      setKi(String(pj.ki ?? ''));
      setFortaleza(String(pj.fortaleza ?? ''));
      setKen(String(pj.ken ?? ''));
      setKenActual(String(pj.kenActual ?? ''));
      setKiActual(String(pj.kiActual ?? ''));
      setVidaActual(String(pj.vidaActual ?? ''));
      setPositiva(String(pj.positiva ?? ''));
      setNegativa(String(pj.negativa ?? ''));
      setCicatriz(String(pj.cicatriz ?? ''));
      setConsumision(String(pj.consumision ?? ''));
    }
  }, [pjSeleccionado]);

  // 🔄 Guardar cambios en el contexto al modificar valores
  const guardarCambios = () => {
    const index = personajes.findIndex(per => per.idpersonaje === pj.idpersonaje);
    if (index === -1) return;

    const nuevosPersonajes = [...personajes];
    nuevosPersonajes[index] = {
      ...nuevosPersonajes[index],
      ken,
      ki,
      fortaleza,
      vidaActual,
      kiActual,
      kenActual,
      positiva,
      negativa,
      cicatriz,
      consumision,
    };
    savePersonajes(nuevosPersonajes);
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    guardarCambios();
  }, [ken, ki, fortaleza, vidaActual, kenActual, kiActual, positiva, negativa, cicatriz, consumision]);

  // 🗑️ Lógica de eliminación segura
  const eliminarPersonaje = (idpersonaje) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Querés eliminar el personaje ${pj.nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await axios.delete(`${API_BASE_URL}/deletePersonaje/${idpersonaje}`);
              if (response.status === 200) {
                const nuevosPersonajes = personajes.filter(p => p.idpersonaje !== idpersonaje);
                savePersonajes(nuevosPersonajes);

                if (pjSeleccionado === idpersonaje) {
                  setPjSeleccionado(null);
                }

                showMessage({
                  message: 'Personaje eliminado',
                  description: 'El personaje fue eliminado correctamente.',
                  type: 'danger',
                  icon: 'danger',
                  duration: 3000,
                });

                setTimeout(() => {
                  navigation.navigate('Home', { screen: 'Principal' });
                }, 100);
              } else {
                console.warn('No se pudo eliminar el personaje');
              }
            } catch (error) {
              console.error('Error al eliminar el personaje:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // ⚠️ Mostrar cargando si pj no está disponible
  if (!pj) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <PagerView style={styles.pagerView} initialPage={0}>
      <View key="1" style={styles.page}>
        <FichaPersonaje
          eliminarPersonaje={eliminarPersonaje}
          key={pjSeleccionado}
          pj={pj}
          ki={ki} setKi={setKi}
          fortaleza={fortaleza} setFortaleza={setFortaleza}
          ken={ken} setKen={setKen}
          kenActual={kenActual} setKenActual={setKenActual}
          kiActual={kiActual} setKiActual={setKiActual}
          vidaActual={vidaActual} setVidaActual={setVidaActual}
          positiva={positiva} setPositiva={setPositiva}
          negativa={negativa} setNegativa={setNegativa}
          cicatriz={cicatriz} setCicatriz={setCicatriz}
          consumision={consumision} setConsumision={setConsumision}
        />
      </View>

      <View key="2" style={styles.page}>
        <Tiradas
          key={pjSeleccionado}
          pj={pj}
          ki={ki} setKi={setKi}
          fortaleza={fortaleza} setFortaleza={setFortaleza}
          ken={ken} setKen={setKen}
          kenActual={kenActual} setKenActual={setKenActual}
          kiActual={kiActual} setKiActual={setKiActual}
          vidaActual={vidaActual} setVidaActual={setVidaActual}
          positiva={positiva} setPositiva={setPositiva}
          negativa={negativa} setNegativa={setNegativa}
          cicatriz={cicatriz} setCicatriz={setCicatriz}
          consumision={consumision} setConsumision={setConsumision}
        />
      </View>

      <View key="3" style={styles.page}>
        <NotasUsuario />
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
