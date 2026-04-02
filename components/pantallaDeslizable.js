import React, { useContext, useState, useEffect, useRef, useMemo } from 'react';
import { AuthContext } from './AuthContext';
import { View, StyleSheet, ActivityIndicator, Alert,Text } from 'react-native';
import PagerView from 'react-native-pager-view';
import { FichaPersonaje } from './fichaPersonaje';
import { Tiradas } from './tiradas';



import { Party } from './party';


import { NotasUsuario } from './notasUsuario';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import axios from 'axios';
import { API_BASE_URL } from './config';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';


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
const primerEvento = useRef(true);
const swipeSound = useRef(null);
const reproducirSonidoPantallaDeslizable = async () => {
  try {
    if (swipeSound.current) {
      await swipeSound.current.replayAsync();
    }
  } catch (error) {
    console.log("Error reproduciendo sonido de pantalla deslizable:", error);
  }
};


const [tiradasGuardadasPj, setTiradasGuardadasPj] = useState([]);
/*
  // 🔹 Cargar desde AsyncStorage al inicio
  useEffect(() => {
    const cargarTiradasPj = async () => {
      try {
        const datos = await AsyncStorage.getItem('tiradasGuardadasPj');
        if (datos) {
          setTiradasGuardadasPj(JSON.parse(datos));
        }


        
      } catch (e) {
        console.error('Error al cargar tiradas:', e);
      }
    };
    cargarTiradasPj();
  }, []);
*/

  useEffect(() => {
  const cargarTiradasBase = async () => {
    try {
      const datos = await AsyncStorage.getItem('tiradasGuardadasPj');
      let tiradas = datos ? JSON.parse(datos) : [];

      // Tiradas del personaje actual
      let tiradasDelPj = tiradas.filter(t => t.ippersonajes === pjSeleccionado);

      // Revisar si el bloque base ya existe
      const tieneBloqueBase = tiradasDelPj.some(t => t.esBase);

     
      if (!tieneBloqueBase && pjSeleccionado) {
     /*
     const caracteristicasSecundariasBase = [
  'academisismo',
  'alerta',
  'atletismo',
  'conBakemono',
  'mentir',
  'pilotear',
  'artesMarciales',
  'medicina',
  'conObjMagicos',
  'sigilo',
  'conEsferas',
  'conLeyendas',
  'forja',
  'conDemonio',
  'conEspiritual',
  'manejoBlaster',
  'manejoSombras',
  'tratoBakemono',
  'conHechiceria',
  'medVital',
  'medEspiritual',
  'rayo',
  'fuego',
  'frio',
  'veneno',
  'corte',
  'energia',
  'fuerza',"fortaleza", 'destreza', 'agilidad', 'sentidos', 'presencia',"principio","sabiduria"
];
     */
        const tiradasBase = [
          { 
            idtirada: uuidv4(), 
            ippersonajes: pjSeleccionado, 
            nombre: "Alerta", 
            principal: "sentidos", 
            secundaria: "alerta", 
            modificador: 0, 
            esBase: true, 
            dadosD20: 0,
            dadosD10Bono: 0,
            dadosD10: 0,
            dadosD4Bono: 0,
            dadosD6Bono: 0,
            dadosD12Bono: 0,
            nombrePrincipal: "sentidos",
            nombreAptitud: "alerta",
          },
          { 
            idtirada: uuidv4(), 
            ippersonajes: pjSeleccionado, 
            nombre: "Bloqueo Art. Marciales", 
            principal: "fortaleza", 
            secundaria: "artesMarciales", 
            modificador: 0, 
            esBase: true, 
            dadosD20:  0,
            dadosD10Bono:  0,
            dadosD10: 0,
            dadosD4Bono: 0,
            dadosD6Bono: 0,
            dadosD12Bono: 0,
            nombrePrincipal: "fortaleza",
            nombreAptitud: "Art. Marciales",
          },
          { 
            idtirada: uuidv4(), 
            ippersonajes: pjSeleccionado, 
            nombre: "Leer mapas", 
            principal: "sabiduria", 
            secundaria: "academisismo", 
            modificador: 0, 
            esBase: true, 
            dadosD20:  0,
            dadosD10Bono:  0,
            dadosD10: 0,
            dadosD4Bono: 0,
            dadosD6Bono: 0,
            dadosD12Bono: 0,
            nombrePrincipal: "sabiduria",
            nombreAptitud: "academisismo",
          },
          { 
            idtirada: uuidv4(), 
            ippersonajes: pjSeleccionado, 
            nombre: "Medicina", 
            principal: "sabiduria", 
            secundaria: "medicina", 
            modificador: 0, 
            esBase: true, 
            dadosD20:  0,
            dadosD10Bono:  0,
            dadosD10: 0,
            dadosD4Bono: 0,
            dadosD6Bono: 0,
            dadosD12Bono: 0,
            nombrePrincipal: "sabiduria",
            nombreAptitud: "medicina",
          },
           { 
            idtirada: uuidv4(), 
            ippersonajes: pjSeleccionado, 
            nombre: "Cazar", 
            principal: "destreza", 
            secundaria: "alerta", 
            modificador: 0, 
            esBase: true, 
            dadosD20:  0,
            dadosD10Bono:  0,
            dadosD10: 0,
            dadosD4Bono: 0,
            dadosD6Bono: 0,
            dadosD12Bono: 0,
            nombrePrincipal: "destreza",
            nombreAptitud: "alerta",
          },
           { 
            idtirada: uuidv4(), 
            ippersonajes: pjSeleccionado, 
            nombre: "Saltos y caidas", 
            principal: "agilidad", 
            secundaria: "atletismo", 
            modificador: 0, 
            esBase: true, 
            dadosD20:  0,
            dadosD10Bono:  0,
            dadosD10: 0,
            dadosD4Bono: 0,
            dadosD6Bono: 0,
            dadosD12Bono: 0,
            nombrePrincipal: "agilidad",
            nombreAptitud: "atletismo",
          },
           { 
            idtirada: uuidv4(), 
            ippersonajes: pjSeleccionado, 
            nombre: "Trepar", 
            principal: "destreza", 
            secundaria: "atletismo", 
            modificador: 0, 
            esBase: true, 
            dadosD20:  0,
            dadosD10Bono:  0,
            dadosD10: 0,
            dadosD4Bono: 0,
            dadosD6Bono: 0,
            dadosD12Bono: 0,
            nombrePrincipal: "destreza",
            nombreAptitud: "atletismo",
          },
           { 
            idtirada: uuidv4(), 
            ippersonajes: pjSeleccionado, 
            nombre: "Robar", 
            principal: "agilidad", 
            secundaria: "sigilo", 
            modificador: 0, 
            esBase: true, 
            dadosD20:  0,
            dadosD10Bono:  0,
            dadosD10: 0,
            dadosD4Bono: 0,
            dadosD6Bono: 0,
            dadosD12Bono: 0,
            nombrePrincipal: "agilidad",
            nombreAptitud: "sigilo",
          },
           { 
            idtirada: uuidv4(), 
            ippersonajes: pjSeleccionado, 
            nombre: "Esquiva atletismo", 
            principal: "agilidad", 
            secundaria: "atletismo", 
            modificador: 0, 
            esBase: true, 
            dadosD20:  0,
            dadosD10Bono:  0,
            dadosD10: 0,
            dadosD4Bono: 0,
            dadosD6Bono: 0,
            dadosD12Bono: 0,
            nombrePrincipal: "agilidad",
            nombreAptitud: "atletismo",
          },
           { 
            idtirada: uuidv4(), 
            ippersonajes: pjSeleccionado, 
            nombre: "Esquiva Art. Marciales", 
            principal: "agilidad", 
            secundaria: "artesMarciales", 
            modificador: 0, 
            esBase: true, 
            dadosD20:  0,
            dadosD10Bono:  0,
            dadosD10: 0,
            dadosD4Bono: 0,
            dadosD6Bono: 0,
            dadosD12Bono: 0,
            nombrePrincipal: "agilidad",
            nombreAptitud: "artesMarciales",
          },
           { 
            idtirada: uuidv4(), 
            ippersonajes: pjSeleccionado, 
            nombre: "Fuerza", 
            principal: "fuerza", 
            secundaria: 0, 
            modificador: 0, 
            esBase: true, 
            dadosD20:  0,
            dadosD10Bono:  0,
            dadosD10: 0,
            dadosD4Bono: 0,
            dadosD6Bono: 0,
            dadosD12Bono: 0,
            nombrePrincipal: "fuerza",
            nombreAptitud: "",
          },
           { 
            idtirada: uuidv4(), 
            ippersonajes: pjSeleccionado, 
            nombre: "Carrera", 
            principal: "agilidad", 
            secundaria: 0, 
            modificador: 0, 
            esBase: true, 
            dadosD20:  0,
            dadosD10Bono:  0,
            dadosD10: 0,
            dadosD4Bono: 0,
            dadosD6Bono: 0,
            dadosD12Bono: 0,
            nombrePrincipal: "agilidad",
            nombreAptitud: "",
          },
           { 
            idtirada: uuidv4(), 
            ippersonajes: pjSeleccionado, 
            nombre: "Forja", 
            principal: "fuerza", 
            secundaria: "forja", 
            modificador: 0, 
            esBase: true, 
            dadosD20:  0,
            dadosD10Bono:  0,
            dadosD10: 0,
            dadosD4Bono: 0,
            dadosD6Bono: 0,
            dadosD12Bono: 0,
            nombrePrincipal: "fuerza",
            nombreAptitud: "forja",
          },
           { 
            idtirada: uuidv4(), 
            ippersonajes: pjSeleccionado, 
            nombre: "Desvio Art. Marciales", 
            principal: "destreza", 
            secundaria: "artesMarciales", 
            modificador: 0, 
            esBase: true, 
            dadosD20:  0,
            dadosD10Bono:  0,
            dadosD10: 0,
            dadosD4Bono: 0,
            dadosD6Bono: 0,
            dadosD12Bono: 0,
            nombrePrincipal: "destreza",
            nombreAptitud: "artesMarciales",
          },
           { 
            idtirada: uuidv4(), 
            ippersonajes: pjSeleccionado, 
            nombre: "Reconocer bestias", 
            principal: "sabiduria", 
            secundaria: "conBakemono", 
            modificador: 0, 
            esBase: true, 
            dadosD20:  0,
            dadosD10Bono:  0,
            dadosD10: 0,
            dadosD4Bono: 0,
            dadosD6Bono: 0,
            dadosD12Bono: 0,
            nombrePrincipal: "sabiduria",
            nombreAptitud: "con. bakemono",
          },
           { 
            idtirada: uuidv4(), 
            ippersonajes: pjSeleccionado, 
            nombre: "Iniciativa", 
            principal: "sentidos", 
            secundaria: "agilidad", 
            modificador: 0, 
            esBase: true, 
            dadosD20:  0,
            dadosD10Bono:  0,
            dadosD10: 0,
            dadosD4Bono: 0,
            dadosD6Bono: 0,
            dadosD12Bono: 0,
            nombrePrincipal: "sentidos",
            nombreAptitud: "agilidad",
          },

        ];

        tiradas = [...tiradas, ...tiradasBase];
        tiradasDelPj = [...tiradasDelPj, ...tiradasBase];

        await AsyncStorage.setItem('tiradasGuardadasPj', JSON.stringify(tiradas));
      }

      setTiradasGuardadasPj(tiradasDelPj);

    } catch (e) {
      console.error('Error al cargar tiradas base:', e);
    }
  };

  cargarTiradasBase();
}, [pjSeleccionado]);




//ESTO ES LO QUE DEBEREMOS EN TEORIA USAR PARA QUE CARGUE AUTOMATICAMENTE
//pantalla deslizable es el padre, vamos a crear aca los botones en el storage   


  useEffect(() => {
  const cargarSonido = async () => {
    try {
        const { sound } = await Audio.Sound.createAsync(
        require('../assets/pasarPantalla.mp3'),
        { volume: 0.05 }
      );
      

      swipeSound.current = sound;
    } catch (error) {
      console.log("Error cargando sonido:", error);
    }
  };

  cargarSonido();

  return () => {
    swipeSound.current?.unloadAsync();
  };
}, []);

 const agregarTiradaPj = async (nueva) => {
  const existe = tiradasGuardadasPj.find(t => t.idtirada === nueva.idtirada);

  let actualizadas;
  if (existe) {
    // Reemplazar tirada existente (editar)
    actualizadas = tiradasGuardadasPj.map(t =>
      t.idtirada === nueva.idtirada ? nueva : t
    );
     showMessage({
                  message: 'Tirada actualizada',
                  description: 'Los cambios de tirada se actualizaron correctamente.',
                  type: 'success',
                  icon: 'success',
                  duration: 3000,
                });
  } else {
    // Agregar nueva tirada
    actualizadas = [...tiradasGuardadasPj, nueva];
     showMessage({
                  message: 'Nueva irada agregada',
                  description: 'Se guardo una nueva tirada.',
                  type: 'success',
                  icon: 'success',
                  duration: 3000,
                });
  }
 

  setTiradasGuardadasPj(actualizadas);

  try {
    await AsyncStorage.setItem('tiradasGuardadasPj', JSON.stringify(actualizadas));
  } catch (e) {
    console.error('Error guardando tiradas:', e);
  }
};

  // 🔹 Eliminar una tirada
  const eliminarTiradasPj = async (idtirada) => {
    const filtradas = tiradasGuardadasPj.filter(t => t.idtirada !== idtirada);
    setTiradasGuardadasPj(filtradas);
    try {
      await AsyncStorage.setItem('tiradasGuardadasPj', JSON.stringify(filtradas));
       showMessage({
                  message: 'Tirada eliminada',
                  description: 'La tirada se borro de tu lista.',
                  type: 'danger',
                  icon: 'danger',
                  duration: 3000,
                });
    } catch (e) {
      console.error('Error eliminando tirada:', e);
    }
  };


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



  const limpiarStoragePersonaje = async (idpersonaje) => {
  try {
    const rankingData = await AsyncStorage.getItem("rankingPersonajes");
    const ranking = rankingData ? JSON.parse(rankingData) : {};

    delete ranking[idpersonaje];

    await AsyncStorage.setItem("rankingPersonajes", JSON.stringify(ranking));

    const ultimoUsado = await AsyncStorage.getItem("ultimoUsado");
    if (ultimoUsado === idpersonaje.toString()) {
      await AsyncStorage.removeItem("ultimoUsado");
    }

    const ultimoCreado = await AsyncStorage.getItem("ultimoCreado");
    if (ultimoCreado === idpersonaje.toString()) {
      await AsyncStorage.removeItem("ultimoCreado");
    }

  } catch (error) {
    console.log("Error limpiando storage personaje:", error);
  }
};
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
                await limpiarStoragePersonaje(idpersonaje);
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

                /*
                setTimeout(() => {
                  navigation.navigate('Home', { screen: 'Principal' });
                }, 100);
*/

 // Reset completo de la navegación para evitar stacking de pantallas
               navigation.reset({
                  index: 0,
                  routes: [{ name: 'Home', params: { screen: 'Principal' } }],
                });

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
       <ActivityIndicator size="large" color="#ffffff" />
       <Text style={{ color: 'white', marginTop: 10 }}>Cargando personaje...</Text>
      </View>
    );
  }

  return (
   <PagerView
  style={styles.pagerView}
  initialPage={0}
  onPageSelected={() => {
    if (primerEvento.current) {
      primerEvento.current = false;
      return;
    }

    reproducirSonidoPantallaDeslizable();
  }}
>
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


          tiradasGuardadasPj={tiradasGuardadasPj}
          setTiradasGuardadasPj={setTiradasGuardadasPj}
          agregarTiradaPj={agregarTiradaPj}
          eliminarTiradasPj={eliminarTiradasPj}

        />
      </View>

    
      <View key="3" style={styles.page}>
       <Party
       key={pjSeleccionado}
          pj={pj}
       />
      </View>

        <View key="4" style={styles.page}>
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
