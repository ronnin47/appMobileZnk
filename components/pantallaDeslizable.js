import React, { useContext,useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { View, StyleSheet, Dimensions } from 'react-native';
import PagerView from 'react-native-pager-view';
import {FichaPersonaje} from './fichaPersonaje';
import {Tiradas} from './tiradas';
import { useRoute } from '@react-navigation/native';

export const PantallaDeslizable = () => {

 const { personajes, savePersonajes } = useContext(AuthContext);

  const route = useRoute();
  
  const { pj } = route.params;


  //aca vamos a poner los states que se quieran compartir entre los componentes fichaPersoanje y Tiradas
  const [ki, setKi] = useState(pj.ki != null ? String(pj.ki) : '');
  const [fortaleza, setFortaleza] = useState(pj.fortaleza != null ? String(pj.fortaleza) : '');
  const [ken, setKen] = useState(pj.ken != null ? String(pj.ken) : '');



  //ESTO ES PARA LA LOGICA INTERNA DE GUARDAR sobre el array que esta en el context
    const guardarCambios = () => {
    const index = personajes.findIndex(per => per.idpersonaje === pj.idpersonaje);
    if (index === -1) return;

    const nuevosPersonajes = [...personajes];

    nuevosPersonajes[index] = {
      ...nuevosPersonajes[index],
      ken: ken,
      ki: ki,
      fortaleza: fortaleza,
    };

    savePersonajes(nuevosPersonajes);
  };
  
  useEffect(() => {
   guardarCambios();
  }, [ 
    ken,
    ki,
    fortaleza,
  ]);



  return (
    <PagerView style={styles.pagerView} initialPage={0}>
      <View key="1" style={styles.page}>
        <FichaPersonaje pj={pj} ki={ki} setKi={setKi} fortaleza={fortaleza} setFortaleza={setFortaleza} ken={ken} setKen={setKen}/>
      </View>
      <View key="2" style={styles.page}>
        <Tiradas pj={pj} ki={ki} setKi={setKi} fortaleza={fortaleza} setFortaleza={setFortaleza} ken={ken} setKen={setKen}/>
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
