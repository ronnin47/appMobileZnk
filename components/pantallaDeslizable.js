import React, { useContext, useState, useEffect,useRef,useMemo } from 'react';
import { AuthContext } from './AuthContext';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import PagerView from 'react-native-pager-view';
import { FichaPersonaje } from './fichaPersonaje';
import { Tiradas } from './tiradas';
import { useRoute, useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import axios from 'axios';
import { Alert } from 'react-native';
import { NotasUsuario } from './notasUsuario';


export const PantallaDeslizable = () => {
  const { personajes, savePersonajes, pjSeleccionado, tiempoSeleccionCarita,} = useContext(AuthContext);
  
  const navigation = useNavigation();
  /* YA NO USAMOS MAS ROUTE PARAMS
  const route = useRoute();


  const { pj } = route.params;

  // 🔒 Si el personaje ya fue eliminado, no renderizar nada
  const personajeActual = personajes.find(per => per.idpersonaje === pj.idpersonaje);
  if (!personajeActual) {
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
  }
*/

//OBTENEMOS DEL PERSONAJE DEL PJ SELECIOANDO QUE VIENE DEL CONTEXTO
//const pj = personajes.find(per => per.idpersonaje === pjSeleccionado);
const pj = useMemo(() => {
  return personajes.find(per => per.idpersonaje === pjSeleccionado);
}, [pjSeleccionado, personajes]);





 if (!pj) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}


/*
useEffect(() => {
  if (pj && tiempoSeleccionCarita) {
    const tiempoTotal = Date.now() - tiempoSeleccionCarita;
    console.log(`Tiempo desde toque hasta carga personaje: ${tiempoTotal} ms`);
  }
}, [pj, tiempoSeleccionCarita]);
*/

//ACA PONEMOS LOS STATES QUE USAREMOS EN FICHA PERSONAJE Y EN TIRADAS
// 📌 Estados compartidos
const [ki, setKi] = useState(pj.ki != null ? String(pj.ki) : '');
const [fortaleza, setFortaleza] = useState(pj.fortaleza != null ? String(pj.fortaleza) : '');
const [ken, setKen] = useState(pj.ken != null ? String(pj.ken) : '');
// 📌 Estado actual trabajado con formato unificado también
const [kenActual, setKenActual] = useState(pj.kenActual != null ? String(pj.kenActual) : '');
const [kiActual, setKiActual] = useState(pj.kiActual != null ? String(pj.kiActual) : '');
const [vidaActual, setVidaActual] = useState(pj.vidaActual != null ? String(pj.vidaActual) : '');
const [positiva, setPositiva] = useState(pj.positiva != null ? String(pj.positiva) : '');
const [negativa, setNegativa] = useState(pj.negativa != null ? String(pj.negativa) : '');
const [cicatriz, setCicatriz] = useState(pj.cicatriz != null ? String(pj.cicatriz) : '');
const [consumision, setConsumision] = useState(pj.consumision != null ? String(pj.consumision) : '');


useEffect(() => {
  if (!pj) return;

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
    cicatriz,//***********************ESTO NO ESTABA ANTES */
    consumision,
  };
  savePersonajes(nuevosPersonajes);
};

const isInitialMount = useRef(true);

useEffect(() => {
  if (isInitialMount.current) {
    isInitialMount.current = false;
    return;
  }
  guardarCambios();
}, [ken, ki, fortaleza, vidaActual, kenActual, kiActual, positiva, negativa, cicatriz, consumision]);


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
        key={pjSeleccionado} 
        pj={pj}
        ki={ki}
        setKi={setKi}
        fortaleza={fortaleza}
        setFortaleza={setFortaleza}
        ken={ken}
        setKen={setKen}
        kenActual={kenActual}
        setKenActual={setKenActual}
        kiActual={kiActual}
        setKiActual={setKiActual}
        vidaActual={vidaActual}
        setVidaActual={setVidaActual}
        positiva={positiva}
        negativa={negativa}
        setNegativa={setNegativa}
        setPositiva={setPositiva}
        cicatriz={cicatriz}
        setCicatriz={setCicatriz}
        consumision={consumision}
        setConsumision={setConsumision}
      />
    </View>
    
    <View key="2" style={styles.page}>
      <Tiradas
        key={pjSeleccionado} 
        pj={pj}
        ki={ki}
        setKi={setKi}
        fortaleza={fortaleza}
        setFortaleza={setFortaleza}
        ken={ken}
        setKen={setKen}
        kenActual={kenActual}
        setKenActual={setKenActual}
        kiActual={kiActual}
        setKiActual={setKiActual}
        vidaActual={vidaActual}
        setVidaActual={setVidaActual}
        positiva={positiva}
        negativa={negativa}
        setNegativa={setNegativa}
        setPositiva={setPositiva}
        cicatriz={cicatriz}
        setCicatriz={setCicatriz}
        consumision={consumision}
        setConsumision={setConsumision}
      />
    </View>

    <View key="3" style={styles.page}>
      <NotasUsuario></NotasUsuario>
      
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