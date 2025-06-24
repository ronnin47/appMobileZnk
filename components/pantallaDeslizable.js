import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import PagerView from 'react-native-pager-view';
import { FichaPersonaje } from './fichaPersonaje';
import { Tiradas } from './tiradas';
import { useRoute, useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import axios from 'axios';
import { Alert } from 'react-native';
export const PantallaDeslizable = () => {
  const { personajes, savePersonajes } = useContext(AuthContext);
  const route = useRoute();
  const navigation = useNavigation();

  const { pj } = route.params;

  // 🔒 Si el personaje ya fue eliminado, no renderizar nada
  const personajeActual = personajes.find(per => per.idpersonaje === pj.idpersonaje);
  if (!personajeActual) {
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  // 📌 Estados compartidos
  const [ki, setKi] = useState(pj.ki != null ? String(pj.ki) : '');
  const [fortaleza, setFortaleza] = useState(pj.fortaleza != null ? String(pj.fortaleza) : '');
  const [ken, setKen] = useState(pj.ken != null ? String(pj.ken) : '');

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
    };
    savePersonajes(nuevosPersonajes);
  };

  useEffect(() => {
    guardarCambios();
  }, [ken, ki, fortaleza]);




// 🗑️ Lógica de eliminación segura con delay para evitar errores de hooks
const eliminarPersonaje = (idpersonaje) => {
  Alert.alert(
    'Confirmar eliminación',
    `¿Querés eliminar el personaje ${pj.nombre}?`,
    [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await axios.delete(`http://192.168.0.38:3000/deletePersonaje/${idpersonaje}`);

            if (response.status === 200) {
              const nuevosPersonajes = personajes.filter(pj => pj.idpersonaje !== idpersonaje);
              savePersonajes(nuevosPersonajes);

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


  return (
    <PagerView style={styles.pagerView} initialPage={0}>
      <View key="1" style={styles.page}>
        <FichaPersonaje
          eliminarPersonaje={eliminarPersonaje}
          pj={pj}
          ki={ki}
          setKi={setKi}
          fortaleza={fortaleza}
          setFortaleza={setFortaleza}
          ken={ken}
          setKen={setKen}
        />
      </View>
      <View key="2" style={styles.page}>
        <Tiradas
          pj={pj}
          ki={ki}
          setKi={setKi}
          fortaleza={fortaleza}
          setFortaleza={setFortaleza}
          ken={ken}
          setKen={setKen}
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