import React, { useContext, useState, useRef, useEffect,useMemo } from 'react';
import { AuthContext } from './AuthContext';
import { Dimensions,Animated, View,Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,Image,Modal,Pressable,FlatList, Button } from 'react-native';
import { ChatTiradas } from './chatTiradas';
import { BarraVida } from './barraVida';
import { BarraKi } from './barraKi';
import { BarraKen } from './barraKen';
import socket from './socket';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { Vibration } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { TouchableWithoutFeedback, Keyboard } from 'react-native';


const generarNumerosAzarSinRangoMin=(cantidad, rangoMax)=> {
  var numeros = [];
  for (var i = 0; i < cantidad; i++) {
    var numero = Math.floor(Math.random() * rangoMax) + 1;
    numeros.push(numero);
  }
  return numeros;
}

export const Tiradas = ({ pj,ki,setKi,fortaleza,setFortaleza,ken,setKen,
            kenActual,
            setKenActual,
            kiActual,
            setKiActual,
            vidaActual,
            setVidaActual,
            positiva,
            setPositiva,
            negativa,
            setNegativa,
            cicatriz,
            setCicatriz,
            consumision,
            setConsumision,



            tiradasGuardadasPj,
            setTiradasGuardadasPj,
            agregarTiradaPj,
            eliminarTiradasPj,
           }) => {



 
  const { personajes, historialChat, setHistorialChat,savePersonajes,estatus,favoritos,setFavoritos,pjSeleccionado,setPjSeleccionado,nick} = useContext(AuthContext);
  
  const imagenBase = require('../assets/imagenBase.jpeg');
 
  //const p = personajes.find((p) => p.idpersonaje === pj.idpersonaje);
  const p = personajes.find(p => p.idpersonaje === pjSeleccionado);
  
  //BUSCA EN PERSOANJES LOS QUE ESTAN ACTIVOS COMO FAVORITOS
/*
    const personajesFavoritos = (favoritos ?? [])
  .map(id => (personajes ?? []).find(p => p.idpersonaje == id))
  .filter(p => p);
*/



const botonAnimRef = useRef(null);

  const [valTirada, setValTirada] = useState("");
  const [sumaTirada, setSumaTirada] = useState("");
  const [valTiradaD6, setValTiradaD6] = useState("");
  const [valTiradaD4, setValTiradaD4] = useState("");
  const [valTiradaD12, setValTiradaD12] = useState("");
  const [valTiradaD10, setValTiradaD10] = useState("");
  const [valTiradaD20, setValTiradaD20] = useState("");
  const [valTiradaD10Bono, setValTiradaD10Bono] = useState("");
  const [principal, setPrincipal] = useState("");
  const [secundaria, setSecundaria] = useState("");
  const [modificador,setModificador]=useState("");

  const [valPrincipal, setValPrincipal] = useState("");
  const [valSecundaria, setValSecundaria] = useState("");
  const [valModificador,setValModificador]=useState("");

  const [dadosD12Bono, setDadosD12Bono] = useState(0);
  const [dadosD6Bono, setDadosD6Bono] = useState(0);
  const [dadosD4Bono, setDadosD4Bono] = useState(0);
  const [dadosD10, setDadosD10] = useState(0);
  const [dadosD20, setDadosD20] = useState(0);
  const [dadosD10Bono, setDadosD10Bono] = useState(0);
  const [abierto, setAbierto] = useState(false);
 
  const [mostrarResultadosTirada,setMostrarResultadosTirada]=useState(false)
   
 
 const scrollRef = useRef(null);
  const windowWidth = Dimensions.get('window').width;
 //MEJORA
    if (!pj || !pj.nombre) {
    return <ActivityIndicator size="large" />;
  }          
  if (!p) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Personaje no encontrado</Text>
      </View>
    );
  }

  
const personajesFavoritos = useMemo(() => {
  return (favoritos ?? [])
    .map(id => (personajes ?? []).find(p => p.idpersonaje == id))
    .filter(p => p);
}, [favoritos, personajes]);
  


 useEffect(() => {
  socket.emit('user-connected', { usuarioId: p.usuarioId, sesion: 'algo' });
}, []);
 

  const scrollViewRef = useRef();

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [historialChat]);

    useEffect(() => {
   guardarCambios();
  }, [ 
    positiva,
    negativa,
    cicatriz,
  ]);

//**************aca seguro */
 const tirarDados = () => {
  const principalValue = principal === "" ? 0 : parseInt(principal);
  const secundariaValue = secundaria === "" ? 0 : parseInt(secundaria);
  const nombre = nombreTirada ? nombreTirada : "";
  const modificadorValue = modificador === "" ? 0 : parseInt(modificador);

  let base = 1;
  if (principal == 0) {
    base = 0;
  }

  let cantD10 = Math.floor(principal / 10) + base;
  let tirada = generarNumerosAzarSinRangoMin(cantD10, 10);
  let d12 = generarNumerosAzarSinRangoMin(dadosD12Bono, 12);
  let d6 = generarNumerosAzarSinRangoMin(dadosD6Bono, 6);
  let d4 = generarNumerosAzarSinRangoMin(dadosD4Bono, 4);
  let d10 = generarNumerosAzarSinRangoMin(dadosD10, 10);
  let d20 = generarNumerosAzarSinRangoMin(dadosD20, 20);
  let d10Bono = generarNumerosAzarSinRangoMin(dadosD10Bono, 10);

  let sumaTirada = tirada.reduce((a, v) => a + v, 0);
  let sumaD12 = d12.reduce((a, v) => a + v, 0);
  let sumaD6 = d6.reduce((a, v) => a + v, 0);
  let sumaD4 = d4.reduce((a, v) => a + v, 0);
  let sumaD10 = d10.reduce((a, v) => a + v, 0);
  let sumaD20 = d20.reduce((a, v) => a + v, 0);
  let sumaD10Bono = d10Bono.reduce((a, v) => a + v, 0);

  let total =
    sumaTirada +
    principalValue +
    secundariaValue +
    sumaD10 +
    sumaD20 +
    sumaD10Bono +
    sumaD6 +
    sumaD4 +
    sumaD12 +
    modificadorValue; // ✅ Se suma el modificador

  setValTirada(tirada.join(", "));
  setValTiradaD12(d12.join(", "));
  setValTiradaD6(d6.join(", "));
  setValTiradaD4(d4.join(", "));
  setValTiradaD10(d10.join(", "));
  setValTiradaD20(d20.join(", "));
  setValTiradaD10Bono(d10Bono.join(", "));
  setSumaTirada(total);

  setValPrincipal(principalValue);
 setValSecundaria(secundariaValue);
setValModificador(modificadorValue);


  const baset = principalValue + secundariaValue;
  let partes = [];

  if (baset > 0) partes.push(`Base: ${baset}`);
  if (modificadorValue !== 0) partes.push(`Modificador: ${modificadorValue}`); // ✅ Se muestra si existe
  if (tirada.length > 0) partes.push(`D10 esfuerzo: ${tirada.join(", ")}`);
  if (d10.length > 0) partes.push(`D10 Ken: ${d10.join(", ")}`);
  if (d10Bono.length > 0) partes.push(`D10 bono: ${d10Bono.join(", ")}`);
  if (d20.length > 0) partes.push(`D20: ${d20.join(", ")}`);
  if (d6.length > 0) partes.push(`D6: ${d6.join(", ")}`);
  if (d4.length > 0) partes.push(`D4: ${d4.join(", ")}`);
  if (d12.length > 0) partes.push(`D12: ${d12.join(", ")}`);

  const mensajeChat = `🎲 Tirada ${nombre?.trim() ? `"${nombre.toUpperCase()}"` : ""}  ${partes.join("   ")}                        Total: ${total}`;

  const mensaje = {
    usuarioId: p.usuarioId,
    idpersonaje: p.idpersonaje,
    nombre: p.nombre,
    mensaje: mensajeChat,
    estatus: estatus,
    imagenPjUrl: p.imagenurl || "",
    nick: nick || "",
    tipo: "tirada",
  };

  socket.emit('chat-chat', mensaje);
  setTiradaSeleccionada(null);
};


const limpiarCamposTirada = () => {
  setPrincipal("");
  setSecundaria("");
  setModificador("");
  setDadosD12Bono(0);
  setDadosD6Bono(0);
  setDadosD4Bono(0);
  setDadosD10(0);
  setDadosD20(0);
  setDadosD10Bono(0);
};
//ESTO ES PARA LA LOGICA INTERNA DE GUARDAR sobre el array que esta en el context
    const guardarCambios = () => {
    const index = personajes.findIndex(per => per.idpersonaje === pj.idpersonaje);
    if (index === -1) return;

    const nuevosPersonajes = [...personajes];

    nuevosPersonajes[index] = {
      ...nuevosPersonajes[index],
      positiva: positiva,
      negativa: negativa,
      cicatriz: cicatriz,
    };

    savePersonajes(nuevosPersonajes);
  };
  

  //se refiere a la cantidad de vida por fase 
  const faseSalud = parseInt(ki) + parseInt(fortaleza);






  // Ordenar personajes de mayor a menor id

//const personajesOrdenados = [...(personajesFavoritos || [])].sort((a, b) => b.idpersonaje - a.idpersonaje);
const personajesOrdenados = useMemo(() => {
  return [...(personajesFavoritos || [])].sort((a, b) => b.idpersonaje - a.idpersonaje);
}, [personajesFavoritos]);

  // Ancho fijo del avatar card (ajusta según tu estilo real)
  const avatarWidth = 80;
  const avatarMargin = 10; // margen horizontal por avatarCard

  // Scroll para centrar avatar seleccionado
  useEffect(() => {
    if (!scrollRef.current || personajesOrdenados.length === 0) return;

    const index = personajesOrdenados.findIndex(pj => pj.idpersonaje === pjSeleccionado);
    if (index >= 0) {
      const scrollToX = index * (avatarWidth + avatarMargin) - windowWidth / 2 + (avatarWidth + avatarMargin) / 2;
      scrollRef.current.scrollTo({ x: scrollToX > 0 ? scrollToX : 0, animated: true });
    }
  }, [pjSeleccionado, personajesFavoritos]);

  // Animaciones para cada avatar: fade+scale cuando están seleccionados
  // Guardamos un map de Animated.Values para cada personaje
  const animValues = useRef(new Map()).current;

  personajesOrdenados.forEach(pj => {
    if (!animValues.has(pj.idpersonaje)) {
      animValues.set(pj.idpersonaje, new Animated.Value(0));
    }
  });

  useEffect(() => {
    // Animar solo el avatar seleccionado a 1 y los otros a 0
    personajesOrdenados.forEach(pj => {
      Animated.timing(animValues.get(pj.idpersonaje), {
        toValue: pj.idpersonaje === pjSeleccionado ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  }, [pjSeleccionado, personajesOrdenados]);

const [modalVisibleTirada, setModalVisibleTirada] = useState(false);




const [nombreTirada, setNombreTirada] = useState('');
const [tiradaSeleccionada, setTiradaSeleccionada] = useState(null);
const [mostrarSelectorPrincipal, setMostrarSelectorPrincipal] = useState(false);
const [mostrarSelectorSecundaria, setMostrarSelectorSecundaria] = useState(false);

const obtenerValorPersonalizado = (nombre, p) => {
  if (!nombre || !p) return 0;

  // Pares add / valAdd
  const adds = ['add1', 'add2', 'add3', 'add4'];
  const vals = ['valAdd1', 'valAdd2', 'valAdd3', 'valAdd4'];

  for (let i = 0; i < adds.length; i++) {
    if (p[adds[i]] && p[adds[i]].toLowerCase() === nombre.toLowerCase()) {
      return p[vals[i]] != null ? p[vals[i]] : 0;
    }
  }

  // Pares apCombate / valCombate
  const apCombates = ['apCombate', 'apCombate2'];
  const valCombates = ['valCombate', 'valCombate2'];

  for (let i = 0; i < apCombates.length; i++) {
    if (p[apCombates[i]] && p[apCombates[i]].toLowerCase() === nombre.toLowerCase()) {
      return p[valCombates[i]] != null ? p[valCombates[i]] : 0;
    }
  }

  // Propiedad directa
  if (p.hasOwnProperty(nombre) && p[nombre] != null) {
    return p[nombre];
  }

  // Si es un número, retornar número
  const valorNum = Number(nombre);
  if (!isNaN(valorNum)) return valorNum;

  // Retornar el nombre si no encontró nada más
  return nombre;
};
const setearTiradas = (item) => {
  if (tiradaSeleccionada && tiradaSeleccionada.idtirada === item.idtirada) {
    // Deselecciona y limpia todo
    setTiradaSeleccionada(null);
    //console.log("Tirada deseleccionada");

    setNombreTirada("");
    
    setPrincipal(0);
    setSecundaria(0);

    setModificador(0);

    setDadosD12Bono(0);
    setDadosD6Bono(0);
    setDadosD4Bono(0);
    setDadosD10(0);
    setDadosD20(0);
    setDadosD10Bono(0);
    
    return;
  }

  // Si no está seleccionada, seleccionarla y setear los valores
  setTiradaSeleccionada(item);
  //console.log("Tirada seleccionada: ", item);

  setNombreTirada(item.nombre || "");


const valorPrincipal = typeof item.principal === 'string' && p && p[item.principal] != null
      ? p[item.principal]
      : item.principal || 0;
    setPrincipal(String(valorPrincipal));

   const valorSecundaria = obtenerValorPersonalizado(item.secundaria, p);
setSecundaria(String(valorSecundaria));

setModificador(item.modificador || 0);
  
  setDadosD12Bono(item.dadosD12Bono || 0);
  setDadosD6Bono(item.dadosD6Bono || 0);
  setDadosD4Bono(item.dadosD4Bono || 0);
  setDadosD10(item.dadosD10 || 0);
  setDadosD20(item.dadosD20 || 0);
  setDadosD10Bono(item.dadosD10Bono || 0);
};

useEffect(() => {
  if (!tiradaSeleccionada) {
    setNombreTirada("");
  }
}, [tiradaSeleccionada]);


const caracteristicasPrinciaples = ['fuerza',"fortaleza", 'destreza', 'agilidad', 'sentidos', 'presencia',"principio","sabiduria" ];
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
// Objeto con los nombres personalizados que el jugador puso
const extras = ['add1', 'add2', 'add3', 'add4', 'apCombate', 'apCombate2'];

// Función que extrae nombres personalizados no vacíos de 'p' y los agrega al array base
function obtenerCaracteristicasSecundariasConExtras(pj) {
  const caracteristicasExtras = extras
    .map((clave) => pj[clave])   // extraigo el valor en p.add1, p.add2...
    .filter((nombre) => nombre && nombre.trim() !== ''); // filtro los que no están vacíos o nulos

  // Combino las bases + extras sin duplicados (por si hay nombres repetidos)
  const combinado = [...new Set([...caracteristicasSecundariasBase, ...caracteristicasExtras.map(n => n.toLowerCase())])];

  return combinado;
}

const caracteristicasSecundarias = obtenerCaracteristicasSecundariasConExtras(pj);




const etiquetasLegibles = {
  academisismo: 'Academisismo',
  alerta: 'Alerta',
  atletismo: 'Atletismo',
  conBakemono: 'Conocimiento Bakemono',
  mentir: 'Mentir',
  pilotear: 'Pilotear',
  artesMarciales: 'Artes Marciales',
  medicina: 'Medicina',
  conObjMagicos: 'Conocimiento de Objetos Mágicos',
  sigilo: 'Sigilo',
  conEsferas: 'Conocimiento de Esferas',
  conLeyendas: 'Conocimiento de Leyendas',
  forja: 'Forja',
  conDemonio: 'Conocimiento Demonio',
  conEspiritual: 'Conocimiento Espiritual',
  manejoBlaster: 'Manejo de Blaster',
  manejoSombras: 'Manejo de Sombras',
  tratoBakemono: 'Trato Bakemono',
  conHechiceria: 'Conocimiento de Hechicería',
  medVital: 'Medición Vital',
  medEspiritual: 'Medición Espiritual',
  rayo: 'Rayo',
  fuego: 'Fuego',
  frio: 'Frío',
  veneno: 'Veneno',
  corte: 'Corte',
  energia: 'Energía',
};

  return (
    <>
   <View style={styles.containerAvatares}>
  {personajesOrdenados.length === 0 ? (
    <></>
  ) : (
    <ScrollView
      horizontal
      ref={scrollRef}
      contentContainerStyle={styles.avatarContainer}
      showsHorizontalScrollIndicator={false}
    >
      {personajesOrdenados.map((pj) => {
        const isSelected = pj.idpersonaje === pjSeleccionado;
        return (
          <TouchableOpacity
            key={pj.idpersonaje}
            style={styles.avatarCard}
            onPress={() => setPjSeleccionado(pj.idpersonaje)}
          >
            <Image
              source={pj.imagenurl ? { uri: pj.imagenurl } : imagenBase}
              style={[
                styles.avatarImagen,
                {
                  opacity: isSelected ? 1 : 0.7,  // Opacidad total para seleccionado, 50% para los demás
                },
                isSelected && {
                  borderWidth: 3,
                  borderColor: 'cyan',
                  shadowColor: 'black',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 6,
                  elevation: 8,
                  backgroundColor: 'white',
                },
              ]}
            />
            <Text
              style={[
                styles.avatarNombre,
                {
                  opacity: isSelected ? 1 : 0.5,
                },
                isSelected && { borderWidth: 0.9, color: 'cyan' },
              ]}
            >
              {pj.nombre}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  )}
   </View>



     <ChatTiradas p={p}/>

      <ScrollView style={styles.container}>

          <View style={styles.barras}>
            <View >
              <BarraVida            
              setKenActual={setKenActual}
              vidaActual={Number(vidaActual)||0}
              setVidaActual={setVidaActual}
              pj={p} ki={ki} setKi={setKi} fortaleza={fortaleza} setFortaleza={setFortaleza}  positiva={Number(positiva) || 0} negativa={Number(negativa) || 0} cicatriz={Number(cicatriz) || 0}>
             </BarraVida>
            </View>

            <View>
              <BarraKi 
                kiActual={Number(kiActual)||0}
                setKiActual={setKiActual}
                consumision={consumision}
                setConsumision={setConsumision}
                pj={p} ki={ki} setKi={setKi}>
              </BarraKi>
            </View>

            <View>
              <BarraKen
              kenActual={Number(kenActual)||0}
              setKenActual={setKenActual}
              pj={p} ken={ken} setKen={setKen}></BarraKen>
            </View>       
        </View>
      
        
        <TextInput
          style={styles.input}
          placeholder="Caracteristica principal"
          placeholderTextColor="#ccc"
          keyboardType="default"
          value={principal}
          onChangeText={setPrincipal}
        />
        <TextInput
          style={styles.input}
          placeholder="Caracteristica secundaria"
          placeholderTextColor="#ccc"
          keyboardType="default"
          value={secundaria}
          onChangeText={setSecundaria}
        />

        <TextInput
          style={styles.input}
          placeholder="Modificadores"
          placeholderTextColor="#ccc"
          keyboardType="default"
          value={modificador}
          onChangeText={setModificador}
        />

        <View style={styles.dadosContainer}>
  {/* Primera columna con primeros 3 dados */}
  <View style={styles.columna}>
    {[
       { label: "D10 bono", valor: dadosD10Bono, add: () => setDadosD10Bono(d => d + 1), rest: () => setDadosD10Bono(d => Math.max(0, d - 1)) },
      { label: "D12 bono", valor: dadosD12Bono, add: () => setDadosD12Bono(d => d + 1), rest: () => setDadosD12Bono(d => Math.max(0, d - 1)) },
      { label: "D4 bono", valor: dadosD4Bono, add: () => setDadosD4Bono(d => d + 1), rest: () => setDadosD4Bono(d => Math.max(0, d - 1)) },
      
     
     
    ].map((dado, idx) => (
      <View key={idx} style={styles.dadoRow}>
        <Text style={styles.dadoLabel}>
          {dado.label}:{' '}
           <Text style={{
              color: dado.valor > 0 ? 'yellow' : 'white',
              fontWeight: 'bold',
              
            }}>{dado.valor}</Text>
        </Text>
        <View style={styles.botones}>
          <TouchableOpacity style={styles.boton} onPress={dado.rest}>
            <Text style={styles.botonTexto}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.boton} onPress={dado.add}>
            <Text style={styles.botonTexto}>+</Text>
          </TouchableOpacity>         
        </View>
      </View>
    ))}
  </View>

  {/* Segunda columna con los otros 3 dados */}
  <View style={styles.columna}>
    {[
       { label: "D10 Ken", valor: dadosD10, add: () => setDadosD10(d => d + 1), rest: () => setDadosD10(d => Math.max(0, d - 1)) },
      { label: "D20", valor: dadosD20, add: () => setDadosD20(d => d + 1), rest: () => setDadosD20(d => Math.max(0, d - 1)) },
      { label: "D6 bono", valor: dadosD6Bono, add: () => setDadosD6Bono(d => d + 1), rest: () => setDadosD6Bono(d => Math.max(0, d - 1)) },
      
      
    ].map((dado, idx) => (
      <View key={idx} style={styles.dadoRow}>
        <Text style={styles.dadoLabel}>
          {dado.label}:{' '}
          <Text style={{
              color: dado.valor > 0 ? 'yellow' : 'white',
              fontWeight: 'bold'
            }}>{dado.valor}</Text>
        </Text>
        <View style={styles.botones}>
           <TouchableOpacity style={styles.boton} onPress={dado.rest}>
            <Text style={styles.botonTexto}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.boton} onPress={dado.add}>
            <Text style={styles.botonTexto}>+</Text>
          </TouchableOpacity>
         
        </View>
      </View>
    ))}
  </View>
</View>






<Modal
  visible={modalVisibleTirada}
  animationType="slide"
  transparent={true}
  onRequestClose={() => {
    setTiradaSeleccionada(null);
    setModalVisibleTirada(false);
  }}
>
  {/* TouchableWithoutFeedback solo en el fondo para detectar toque fuera */}
  <TouchableWithoutFeedback
    onPress={() => {
      Keyboard.dismiss(); // opcional, para cerrar teclado si está abierto
      setModalVisibleTirada(false);
      setTiradaSeleccionada(null); // limpiar selección al cerrar tocando fuera
    }}
  >
    <View style={styles.modalFondo}>
      {/* Este TouchableWithoutFeedback absorbe los toques dentro del modal para que no propaguen */}
      <TouchableWithoutFeedback onPress={() => { /* no hace nada para bloquear cierre */ }}>
        <View style={styles.modalContenidoGrande}>
          <Text style={styles.modalTitulo}>⚔️ Armar Tirada</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre de la tirada"
            placeholderTextColor="#ccc"
            keyboardType="default"
            value={nombreTirada}
            onChangeText={setNombreTirada}
          />

          <View style={{ marginBottom: 16 }}>
            <Text style={styles.label}>Caracteristica Principal</Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#555',
              borderRadius: 8,
              paddingHorizontal: 10,
              backgroundColor: '#1a1a1a'
            }}>
              <TextInput
                style={{
                  flex: 1,
                  color: 'white',
                  paddingVertical: 8,
                  fontSize: 16,
                }}
                placeholder="Caracteristica principal"
                placeholderTextColor="#888"
                value={principal}
                onChangeText={setPrincipal}
              />
              <TouchableOpacity
                onPress={() => setMostrarSelectorPrincipal(!mostrarSelectorPrincipal)}
                style={{ paddingHorizontal: 8 }}
              >
                <Text style={{ fontSize: 18, color: 'white' }}>▼</Text>
              </TouchableOpacity>
            </View>
            {mostrarSelectorPrincipal && (
              <View style={{
                marginTop: 6,
                backgroundColor: '#003b5c',
                borderRadius: 6,
                borderWidth: 1,
                borderColor: '#00b4d8',
                maxHeight: 140
              }}>
                <FlatList
                  data={caracteristicasPrinciaples}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        setPrincipal(item);
                        setMostrarSelectorPrincipal(false);
                      }}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: '#0077a6'
                      }}
                    >
                      <Text style={{ color: 'white', fontSize: 15 }}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={styles.label}>Característica secundaria</Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#555',
              borderRadius: 8,
              paddingHorizontal: 10,
              backgroundColor: '#1a1a1a'
            }}>
             <TextInput
  style={{
    flex: 1,
    color: 'white',
    paddingVertical: 8,
    fontSize: 16,
  }}
  placeholder="Caracteristica secundaria"
  placeholderTextColor="#888"
  value={secundaria}
  onChangeText={setSecundaria}
/>
              <TouchableOpacity
                onPress={() => setMostrarSelectorSecundaria(!mostrarSelectorSecundaria)}
                style={{ paddingHorizontal: 8 }}
              >
                <Text style={{ fontSize: 18, color: 'white' }}>▼</Text>
              </TouchableOpacity>
            </View>
            {mostrarSelectorSecundaria && (
              <View style={{
                marginTop: 6,
                backgroundColor: '#003b5c',
                borderRadius: 6,
                borderWidth: 1,
                borderColor: '#00b4d8',
                maxHeight: 140
              }}>
                <FlatList
                  data={caracteristicasSecundarias}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        setSecundaria(item);
                        setMostrarSelectorSecundaria(false);
                      }}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: '#0077a6'
                      }}
                    >
                      <Text style={{ color: 'white', fontSize: 15 }}>
                        {etiquetasLegibles[item] || item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Modificador"
            placeholderTextColor="#ccc"
            keyboardType="default"
            value={modificador}
            onChangeText={setModificador}
          />

          <View style={styles.dadosContainer}>
            {/* Columna izquierda */}
            <View style={styles.columna}>
              {[{ label: "D10 bono", valor: dadosD10Bono, add: () => setDadosD10Bono(d => d + 1), rest: () => setDadosD10Bono(d => Math.max(0, d - 1)) },
                { label: "D12 bono", valor: dadosD12Bono, add: () => setDadosD12Bono(d => d + 1), rest: () => setDadosD12Bono(d => Math.max(0, d - 1)) },
                { label: "D4 bono", valor: dadosD4Bono, add: () => setDadosD4Bono(d => d + 1), rest: () => setDadosD4Bono(d => Math.max(0, d - 1)) },
              ].map((dado, idx) => (
                <View key={idx} style={styles.dadoRow}>
                  <Text style={styles.dadoLabel}>
                    {dado.label}:{' '}
                    <Text style={{
                      color: dado.valor > 0 ? 'yellow' : 'white',
                      fontWeight: 'bold',
                    }}>{dado.valor}</Text>
                  </Text>
                  <View style={styles.botones}>
                    <TouchableOpacity style={styles.boton} onPress={dado.rest}>
                      <Text style={styles.botonTexto}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.boton} onPress={dado.add}>
                      <Text style={styles.botonTexto}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* Columna derecha */}
            <View style={styles.columna}>
              {[{ label: "D10 Ken", valor: dadosD10, add: () => setDadosD10(d => d + 1), rest: () => setDadosD10(d => Math.max(0, d - 1)) },
                { label: "D20", valor: dadosD20, add: () => setDadosD20(d => d + 1), rest: () => setDadosD20(d => Math.max(0, d - 1)) },
                { label: "D6 bono", valor: dadosD6Bono, add: () => setDadosD6Bono(d => d + 1), rest: () => setDadosD6Bono(d => Math.max(0, d - 1)) },
              ].map((dado, idx) => (
                <View key={idx} style={styles.dadoRow}>
                  <Text style={styles.dadoLabel}>
                    {dado.label}:{' '}
                    <Text style={{
                      color: dado.valor > 0 ? 'yellow' : 'white',
                      fontWeight: 'bold'
                    }}>{dado.valor}</Text>
                  </Text>
                  <View style={styles.botones}>
                    <TouchableOpacity style={styles.boton} onPress={dado.rest}>
                      <Text style={styles.botonTexto}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.boton} onPress={dado.add}>
                      <Text style={styles.botonTexto}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>

            <Pressable
              style={({ pressed }) => [
                styles.confirmarBoton,
                pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] } // efecto al presionar
              ]}
              onPress={() => {
                // Aquí ejecutás la lógica de tirada
                //console.log("Guardando tirada con:",nombreTirada, principal, secundaria, dadosD20, dadosD10Bono);
                const idtirada = tiradaSeleccionada ? tiradaSeleccionada.idtirada : Date.now();
                const tiradaPj = {
                  idtirada,
                  ippersonajes: p.idpersonaje,
                  nombre: nombreTirada || "",
                  principal: principal || 0,
                  secundaria: secundaria || 0,
                  modificador:modificador || 0,
                  dadosD20: dadosD20 || 0,
                  dadosD10Bono: dadosD10Bono || 0,
                  dadosD10: dadosD10 || 0,
                  dadosD4Bono: dadosD4Bono || 0,
                  dadosD6Bono: dadosD6Bono || 0,
                  dadosD12Bono: dadosD12Bono || 0,
                 
                }
                agregarTiradaPj(tiradaPj)
                setTiradaSeleccionada(null);
                limpiarCamposTirada();
                setNombreTirada("")
                setModalVisibleTirada(false);
              }}
            >
              <Text
                style={[
                  styles.confirmarTexto,
                  tiradaSeleccionada && { color: '#000', } // cambia color de texto si está editando
                ]}
              >
                {tiradaSeleccionada ? '✏️ Editar Tirada' : '🎲 Guardar Tirada'}
              </Text>
            </Pressable>

            {tiradaSeleccionada && (
              <Pressable
                style={({ pressed }) => [
                  styles.confirmarBoton,
                  pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] },
                  , { backgroundColor: '#dd302abd', marginTop: 12, borderWidth: 1, borderColor: "gray" }
                ]}
                onPress={() => {
                  eliminarTiradasPj(tiradaSeleccionada.idtirada);
                  setTiradaSeleccionada(null);
                  setModalVisibleTirada(false);
                }}
              >
                <Text style={[styles.confirmarTexto, { color: '#fff' }]}>🗑️ Eliminar Tirada</Text>
              </Pressable>
            )}

          </View>

          {/* 
          <Pressable onPress={() => setModalVisibleTirada(false)} style={{ marginTop: 10 }}>
            <Text style={{ color: '#aaa' }}>Cancelar</Text>
          </Pressable> 
          */}

        </View>
      </TouchableWithoutFeedback>
    </View>
  </TouchableWithoutFeedback>
</Modal>








<View style={{ width: '100%', alignItems: 'center',padding:6 }}>
  <View style={{ flexDirection: 'row', width: '90%',alignItems: 'center' ,justifyContent:"center" }}>

    <LinearGradient
      colors={['#cfd396ff', '#1f6f94ff', '#383f7c36']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[
        styles.botonPrincipal,
        { width: '30%', marginLeft: 10 },
        tiradaSeleccionada && {
          borderWidth: 1.5,
          borderColor: '#00ff0dff',
          shadowColor: '#00ff0dff',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.9,
          shadowRadius: 20,
          elevation: 8,
        }
      ]}
    >
      <TouchableOpacity  
      onPress={() => {
        if (!tiradaSeleccionada) {
          limpiarCamposTirada();
        }
        setModalVisibleTirada(true);
      }}

       style={styles.botonToque}> 
        <Text style={styles.botonPrincipalTexto}>+🎲</Text>
      </TouchableOpacity>
    </LinearGradient>

   <Animatable.View ref={botonAnimRef} style={[styles.botonPrincipal, { width: '50%', marginLeft: 10 }]}>
  <LinearGradient
    colors={['#EF6C00', '#E65100', '#BF360C']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={{ flex: 1, borderRadius: 10, overflow: 'hidden' }} // Para que la animación respete bordes
  >
    <TouchableOpacity
      style={styles.botonToque}
      onPress={() => {
        tirarDados();
        limpiarCamposTirada();
        setTimeout(() => {
            botonAnimRef.current?.rubberBand(400); 
           Vibration.vibrate([80, 50, 80, 50, 150, 50, 300]);
        
        }, 1000);

      }}
    >
      <Text style={styles.botonPrincipalTexto}>Tirar Dados</Text>
    </TouchableOpacity>
  </LinearGradient>
</Animatable.View>

   
  </View>
</View>



{/* ACA ESTAN LOS BOTONES DE LAS TIRADAS*/}
{tiradasGuardadasPj.length > 0 && (
  <View style={{ 
    paddingTop: 20, 
    paddingLeft:10,
    paddingRight:10,
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between',
  }}>
    {tiradasGuardadasPj
      .filter((t) => t.ippersonajes === p.idpersonaje)
      .map((item, index) => {
        const estaSeleccionada =
          tiradaSeleccionada && item.idtirada === tiradaSeleccionada.idtirada;

        return (
          <Pressable
            key={item.idtirada + index}
            onPress={() => setearTiradas(item)}
            style={({ pressed }) => [
              {
                backgroundColor: estaSeleccionada ? "aliceblue" : '#333',
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: 20,
                marginBottom: 12,
                shadowColor: estaSeleccionada ? '#FFD700' : '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: pressed ? 0.3 : 0.6,
                shadowRadius: 5,
                elevation: estaSeleccionada ? 8 : 3,
                borderWidth: estaSeleccionada ? 2 : 0.2,
                borderColor: estaSeleccionada ? '#00ff0dff' : 'cyan',
                opacity: pressed ? 0.7 : 1,
                alignItems: 'center',
                width: '48%',       // para que haya espacio y dos por fila
              },
            ]}
          >
            <Text
              style={{
                color: estaSeleccionada ? '#222' : '#eee',
                fontWeight: estaSeleccionada ? '700' : '500',
                fontSize: 14,
              }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.nombre}
            </Text>
          </Pressable>
        );
      })}
  </View>
)}
 

      

      
     <View>
      <TouchableOpacity
  onPress={() => setMostrarResultadosTirada(prev => !prev)}
  activeOpacity={0.7}
 style={[styles.acordeonHeader,{borderWidth:0.2, borderColor:"gray", borderRadius:8}]}
>
  <Text style={styles.acordeonTitulo}>
    Resultado tirada {mostrarResultadosTirada ? '▲' : '▼'}
  </Text>
</TouchableOpacity>

      
      </View>   
       {mostrarResultadosTirada && (
          <View style={styles.resultado}>
          <Text style={styles.resultadoTexto}>Caracteristcia principal: {valPrincipal}</Text>
          <Text style={styles.resultadoTexto}>Caracteristcia secundaria: {valSecundaria}</Text>
          <Text style={styles.resultadoTexto}>Modificador: {valModificador}</Text>
          <Text style={styles.resultadoTexto}>D10 esfuerzo: {valTirada}</Text>
          <Text style={styles.resultadoTexto}>Bono D10 Ken: {valTiradaD10}</Text>
          <Text style={styles.resultadoTexto}>Bono D20 bono: {valTiradaD20}</Text>
          <Text style={styles.resultadoTexto}>Bono D10 bono: {valTiradaD10Bono}</Text>
          <Text style={styles.resultadoTexto}>Bono D12 bono: {valTiradaD12}</Text>
          <Text style={styles.resultadoTexto}>Bono D6 bono: {valTiradaD6}</Text>
          <Text style={styles.resultadoTexto}>Bono D4 bono: {valTiradaD4}</Text>
          
          
          <Text style={styles.resultadoTotal}>TOTAL: {sumaTirada}</Text>
        </View>
       )}

         <View style={styles.acordeonContainer}>
              <TouchableOpacity onPress={() => setAbierto(!abierto)} style={styles.acordeonHeader}>
                <Text style={styles.acordeonTitulo}>Fases y cicatrices {abierto ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {abierto && (
                <View style={styles.inputsContainer}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.labelFases}>Fases de Salud {faseSalud} pv</Text>
                    <Text style={styles.label}>Fases positivas</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Fases positivas"
                      placeholderTextColor="#aaa"
                      value={positiva}
                      onChangeText={setPositiva}
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Fases negativas</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Fases negativas"
                      placeholderTextColor="#aaa"
                      value={negativa}
                      onChangeText={setNegativa}
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Puntos de cicatrices</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Puntos de cicatrices"
                      placeholderTextColor="#aaa"
                      value={cicatriz}
                      onChangeText={setCicatriz}
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>
                </View>
              )}
         </View>

      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  panelHistorial: {
  top: 0,
  left: 0,
  right: 0,
  height: 200,
  backgroundColor: "#111827",       // Azul oscuro, buena elección para fondo
  color: "#ADFF2F",             // Este no tendrá efecto en View, solo en Text
  paddingHorizontal: 10,
  paddingVertical: 8,
  zIndex: 10,
  borderBottomWidth: 1,
  borderBottomColor: "#ADFF2F", // Resalta bien el borde
},
  scrollHistorial: {
    flex: 1,
  },
  textoHistorial: {
   color: "#ADFF2F",
    fontSize: 12,
    marginBottom: 6,
  },
  textoHistorialVacio: {
    color: "#ADFF2F",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 20,
  },
  container: {
    padding: 12,
    backgroundColor: "#1a1a1a",
    flex: 1,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#facc15",
    marginBottom: 12,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#2d2d2d",
    color: "#fff",
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#444",
  },
  dadoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dadoLabel: {
    color: "#ccc",
    fontSize: 16,
  },
  botones: {
    flexDirection: "row",
    gap: 6,
  },
  boton: {
    backgroundColor: "#28a745",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderColor:"gray",
    borderWidth: 2, 
  },
  botonTexto: {
    color: "#fff",
    fontSize: 24,
  },
  botonPrincipal: {
   backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
      borderColor:"white",
    borderWidth: 4,
  },
  botonPrincipalTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  resultado: {
    
    padding: 10,
    backgroundColor: "black",
    borderRadius: 6,  
  },
  resultadoTexto: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 4,
  },
  resultadoTotal: {
    color: "#facc15",
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 10,
  },
  dadosContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginVertical: 10,
},
columna: {
  flex: 1,
  marginHorizontal: 2,
},
dadoRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
},
barras: {
  marginBottom:20,
  marginTop:10,
},
 acordeonContainer: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    marginBottom:100, 
  },
  acordeonHeader: {
    backgroundColor: '#222',
    padding: 12,
  },
  acordeonTitulo: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputsContainer: {
    padding: 12,
    backgroundColor: '#111',
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#444',
  },
  inputGroup: {
  marginBottom: 12,
},
label: {
  color: '#ddd',
  fontSize: 13,
  marginBottom: 4,
  fontWeight: '500',
},
labelFases: {
  color: 'yellow',
  fontSize: 16,
  marginBottom: 4,
  fontWeight: '500',
  textAlign:"center",
},
botonPrincipal: {
  borderRadius: 10,
  overflow: 'hidden',
  width:"60%",
  borderWidth:1,
  borderColor:"gray",
   // sombra para iOS
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,

  // sombra para Android
  elevation: 5,
},

botonToque: {
  paddingVertical: 12,
  paddingHorizontal: 24,
  alignItems: 'center',
},

botonPrincipalTexto: {
  color: 'white',
  fontSize: 18,
  fontWeight: 'bold',

},
containerAvatares: {
    paddingVertical: 2,
    paddingHorizontal: 10,
    backgroundColor:"black",
    paddingTop:30,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: 'white',
  },
  noFavoritos: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 20,
  },
  avatarContainer: {
    flexDirection: 'row',
    gap: 6,
    marginBottom:0,
  },
  avatarCard: {
    alignItems: 'center',
    marginRight: 6,
  },
  avatarImagen: {
    width: 60,
    height: 60,
    borderRadius: 32,
    borderWidth:1,
    borderColor:"gray",
    backgroundColor: '#444',
    
  },
  avatarNombre: {
    marginTop: 3,
    fontSize: 10,
    color: 'white',
    maxWidth: 72,
    textAlign: 'center',
  },
    modalFondo: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContenido: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color:"aliceblue"
  },
  dadoRowT: {
    flexDirection: 'row',
    marginTop: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  dadoBoton: {
    backgroundColor: '#EF6C00',
    margin: 5,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dadoTexto: {
    color: 'white',
    fontWeight: 'bold',
  },
  cerrarBoton: {
    marginTop: 20,
  },
  cerrarTexto: {
    color: '#555',
  },
  modalContenidoGrande: {
  backgroundColor: '#1e1e1e',
  borderRadius: 10,
  padding: 10,
  width: '100%',
  maxHeight: '90%',
},

confirmarBoton: {
  backgroundColor: '#00efbbff',
  padding: 10,
  borderRadius: 8,
  marginTop: 20,
  width:"60%",
  borderWidth:1,
  borderColor:"gray"
},

confirmarTexto: {
  color: 'white',
  fontWeight: 'bold',
  textAlign: 'center',
},
dadoRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 10,
},

dadoLabel: {
  flex: 1.5, // deja espacio para el texto
  fontSize: 14,
  color: 'white',
},

botones: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 4, // si usás React Native 0.71+, si no usás marginRight
  borderWidth:1,
  backgroundColor:"white",
  borderColor:"white",
  borderRadius:18,
   shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 13,
},
boton: {
  backgroundColor: 'black',
  paddingHorizontal: 14,
  paddingVertical: 10,
  borderRadius: 18,
  width:40,
  borderWidth:1,
  borderColor:"green",
},

botonTexto: {
  color: 'white',
  fontWeight: 'bold',
},
itemContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginVertical: 5,
  borderWidth: 0.2,
  borderColor: "cyan",
  borderRadius: 5,
  padding: 4,
},
textContainer: {
  flex: 1,
  marginRight: 8,

},



deleteBtn: {
  color: '#f87171',
  fontSize: 18,
  paddingHorizontal: 8,
},
botonGuardar: {
backgroundColor: '#22d3ee',
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 10,
  alignItems: 'center',
  marginTop: 10,
  opacity:0.7
},

textoBoton: {
  color: 'black',
  fontSize: 16,
  fontWeight: 'bold',
},

botonTirada: {
  paddingVertical: 6,
  paddingHorizontal: 10,
  backgroundColor: 'gray', // azul típico botón iOS
  borderRadius: 5,
  width:150,
  borderWidth:1,
  borderColor:"red",
},
saved: {
  color: 'white',
  fontSize: 16,
},
acordeonResults: {
  backgroundColor: '#333',       // fondo oscuro elegante
  color: '#fff',                 // texto blanco
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 16,
  fontSize: 14,
  fontWeight: 'bold',
  textAlign: 'center',
  overflow: 'hidden',
  elevation: 3,                  // sombra Android
  shadowColor: '#000',          // sombra iOS
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  borderWidth:0.5,
  borderColor:"white"
},
});
