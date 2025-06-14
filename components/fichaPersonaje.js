// FichaDePersonaje.js

import React, { useContext,useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { View, Text, StyleSheet, Image,ScrollView,TextInput,TouchableOpacity  } from 'react-native';

import * as ImagePicker from 'expo-image-picker';


import { KeyboardAvoidingView, Platform } from 'react-native';



export const FichaPersonaje = ({ route }) => {

  
  
  const { personajes, savePersonajes } = useContext(AuthContext);
  const { pj } = route.params;
  const imagenBase = require('../assets/imagenBase.jpeg');

  //aca extrae el personaje
  const p = personajes.find(p => p.idpersonaje === pj.idpersonaje);
   
  //console.log("PERSONAJE: ",p)
    if (!p) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Personaje no encontrado</Text>
      </View>
    );
  }

  const getImageSource = () => {
  if (imagen && typeof imagen === 'string') {
    return { uri: imagen };
  } else {
    return imagenBase;
  }
};

  
  const seleccionarImagen = async () => {
  const resultado = await ImagePicker.launchImageLibraryAsync({
    //mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //esta opcion de picker da advertencia de deprecada
    mediaTypes: ImagePicker.Images,
    allowsEditing: true,
    quality: 1,
   
  });

  if (!resultado.canceled) {
     const uri = resultado.assets[0].uri;
    setImagen(uri);

    console.log("se guardo la imagen")
  }
  };



//ACA LOS STATES
  const [nombre,setNombre]=useState(p.nombre);
  const [imagen,setImagen]=useState(p.imagen);
  const [dominio,setDominio]=useState(p.dominio);
  const [raza,setRaza]=useState(p.raza);
  const [naturaleza,setNaturaleza]=useState(p.naturaleza);
  const [edad,setEdad]=useState(p.edad); 
  const [ken,setKen]=useState(p.ken);
  const [ki,setKi]=useState(p.ki);
  const [destino,setDestino]=useState(p.destino);
  const [pDestino,setPdestino]=useState(p.Destino); 
  const [fuerza,setFuerza]=useState(p.fuerza);
  const [fortaleza,setFortaleza]=useState(p.fortaleza);
  const [destreza,setDestreza]=useState(p.destreza);
  const [agilidad,setAgilidad]=useState(p.agilidad);
  const [sabiduria,setSabiduria]=useState(p.sabiduria);
  const [presencia,setPresencia]=useState(p.presencia);
  const [principio,setPrincipio]=useState(p.principio);
  const [sentidos,setSentidos]=useState(p.sentidos);
  const [academisismo,setAcademisismo]=useState(p.academisismo);
  const [alerta,setAlerta]=useState(p.alerta);
  const [atletismo,setAtletismo]=useState(p.atletismo);
  const [conBakemono,setConBakemono]=useState(p.conBakemono);
  const [mentir,setMentir]=useState(p.mentir);
  const [pilotear,setPilotear]=useState(p.pilotear);
  const [artesMarciales,setArtesMarciales]=useState(p.artesMarciales);
  const [medicina,setMedicina]=useState(p.medicina);
  const [conObjMagicos,setConObjMagicos]=useState(p.conObjMagicos);
  const [sigilo,setSigilo]=useState(p.sigilo);
  const [conEsferas,setConEsferas]=useState(p.conEsferas);
  const [conLeyendas,setConLeyendas]=useState(p.conLeyendas);
  const [forja,setForja]=useState(p.forja);
  const [conDemonio,setConDemonio]=useState(p.conDemonio);
  const [conEspiritual,setConEspiritual]=useState(p.conEspiritual);
  const [manejoBlaster,setManejoBlaster]=useState(p.manejoBlaster);
  const [manejoSombras,setManejoSombras]=useState(p.manejoSombras);
  const [tratoBakemono,setTratoBakemono]=useState(p.tratoBakemono);
  const [conHechiceria,setConHechiceria]=useState(p.conHechiceria);
  const [medVital,setMedVital]=useState(p.medVital);
  const [medEspiritual,setMedEspiritual]=useState(p.medEspiritual);
  const [rayo,setRayo]=useState(p.rayo);
  const [fuego,setFuego]=useState(p.fuego);
  const [frio,setFrio]=useState(p.frio);
  const [veneno,setVeneno]=useState(p.veneno);
  const [corte,setCorte]=useState(p.corte);
  const [energia,setEnergia]=useState(p.energia);
  const [ventajas, setVentajas] = useState(p.ventajas);
  const [inventario, setInventario] = useState(p.inventario);
  const [dominios, setDominios] = useState(p.dominios);
  const [hechizos, setHechizos] = useState(p.hechizos);
  const [kenActual,setKenActual]=useState(p.kenActual);
  const [kiActual,setKiActual]=useState(p.kiActual);
  const [positiva,setPositiva]=useState(p.positiva);
  const [negativa,setNegativa]=useState(p.negativa);

  //const [damageActual, setDamageActual] = useState(p.vidaActual);
  const [vidaActual, setVidaActual] = useState(p.vidaActual);
  const [consumision,setConsumision]=useState(p.consumision);
  const [apCombate,setApCombate]=useState(p.apCombate);
  const [valCombate,setValCombate]=useState(p.valCombate);
  const [apCombate2,setApCombate2]=useState(p.apCombate2);
  const [valCombate2,setValCombate2]=useState(p.valCombate2);
  const [add1,setAdd1]=useState(p.add1);
  const [valAdd1,setValAdd1]=useState(p.valAdd1);
  const [add2,setAdd2]=useState(p.add2);
  const [valAdd2,setValAdd2]=useState(p.valAdd2);
  const [add3,setAdd3]=useState(p.add3);
  const [valAdd3,setValAdd3]=useState(p.valAdd3);
  const [add4,setAdd4]=useState(p.add4);
  const [valAdd4,setValAdd4]=useState(p.valAdd4);
  const [iniciativa,setIniciativa]=useState(p.iniciativa); 
  const [historia,setHistoria]=useState(p.historia);
  const [tecEspecial,setTecEspecial]=useState(p.tecEspecial);
  const [conviccion,setConviccion]=useState(p.conviccion);
  const [cicatriz,setCicatriz]=useState(p.cicatriz);
  const [resistencia,setResistencia]=useState(p.resistencia);
  const [pjPnj,setPjPnj]=useState(p.pjPnj);




/*
const guardarCambiosBBDD = async () => {
  try { 
    const personaje = {
      nombre: nombre,
      dominio: dominio,
      raza:raza,
      naturaleza:naturaleza,
      edad:edad,
      ken:ken || 0,
      ki:ki || 0,
      destino:destino || 0,
      pDestino:pDestino || 0,
      fuerza: fuerza|| 0,
      fortaleza: fortaleza || 0,
      destreza: destreza || 0,
      agilidad: agilidad || 0,
      sabiduria:sabiduria || 0,
      presencia:presencia || 0,
      principio:principio ||0,
      sentidos:sentidos ||0,
      academisismo:academisismo ||0,
      alerta:alerta ||0,
      atletismo:atletismo||0,
      conBakemono:conBakemono ||0,
      mentir:mentir ||0,
      pilotear:pilotear||0,
      artesMarciales:artesMarciales ||0,
      medicina:medicina ||0,
      conObjMagicos:conObjMagicos ||0,
      sigilo:sigilo ||0,
      conEsferas:conEsferas ||0,
      conLeyendas:conLeyendas ||0,
      forja:forja ||0,
      conDemonio:conDemonio ||0,
      conEspiritual:conEspiritual ||0,
      manejoBlaster:manejoBlaster ||0,
      manejoSombras:manejoSombras ||0,
      tratoBakemono:tratoBakemono ||0,
      conHechiceria:conHechiceria ||0,
      medVital:medVital ||0,
      medEspiritual:medEspiritual ||0,
      rayo:rayo ||0,
      fuego:fuego ||0,
      frio:frio ||0,
      veneno:veneno ||0,
      corte:corte ||0,
      energia:energia ||0,
      ventajas:ventajas,    
      apCombate: apCombate,
      valCombate: valCombate ||0,
      apCombate2:apCombate2,
      valCombate2:valCombate2 ||0,
      add1:add1 ||"",
      valAdd1: valAdd1 || 0,
      add2:add2,
      valAdd2: valAdd2 || 0,
      add3:add3,
      valAdd3: valAdd3 || 0,
      add4:add4,
      valAdd4: valAdd4 || 0,
      imagen: imagen,
      inventario: inventario,//JSON
      dominios: dominios,//JASON

      kenActual:kenActual || 0,
      kiActual:kiActual || 0,    
      positiva:positiva,
      negativa:negativa,
      vidaActual:vidaActual,

      hechizos:hechizos,//JSON

      consumision:consumision || 0,

      iniciativa: iniciativa || 0,
      historia:historia,
      usuarioId: usuarioId,
      tecEspecial: tecEspecial,
      conviccion: conviccion || "",

      cicatriz: cicatriz || 0,
      resistencia: resistencia || 0,
      pjPnj:pjPnj,
    };
    
    //const response = await axios.put(`http://localhost:4000/update-personaje/${idpersonaje}`, personaje, {
    const response = await axios.put(`${apiUrl}/update-personaje/${idpersonaje}`, personaje, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('Cambios guardados exitosamente:', response.data);

    Swal.fire({
      icon: 'success',
      title: '¡Cambios!',
      text: 'Los cambios se han guardado correctamente.',
      confirmButtonText: 'Aceptar'
    });

  } catch (error) {
    console.error('Error al guardar cambios:', error);
  }
};
*/


//ESTO ES PARA LA LOGICA INTERNA DE GUARDAR LOS CAMBIOS EN CON STATES Y UN ARRAY CON USE CONTEXT
 const guardarCambios = () => {
   
  const index = personajes.findIndex(per => per.idpersonaje === p.idpersonaje);
  if (index === -1) return; // por seguridad, si no se encuentra el personaje
 
  const nuevosPersonajes = [...personajes];


  nuevosPersonajes[index] = {
    ...nuevosPersonajes[index],

    nombre: nombre,
    dominio: dominio,
    raza:raza,
    edad:edad,
    imagen:imagen,
    ken:ken,
    ki:ki,
   
    destino:destino,
    pDestino:pDestino,
    fuerza: fuerza,
    fortaleza: fortaleza,
    destreza: destreza,
    agilidad: agilidad,
    sabiduria:sabiduria,
    presencia:presencia,
    principio:principio,
    sentidos:sentidos,
    academisismo:academisismo,
    alerta:alerta,
    atletismo:atletismo,
    conBakemono:conBakemono,
    mentir:mentir,
    pilotear:pilotear,
    artesMarciales:artesMarciales,
    medicina:medicina,
    conObjMagicos:conObjMagicos,
    sigilo:sigilo,
    conEsferas:conEsferas,
    conLeyendas:conLeyendas,
    forja:forja,
    conDemonio:conDemonio,
    conEspiritual:conEspiritual,
    manejoBlaster:manejoBlaster,
    manejoSombras:manejoSombras,
    tratoBakemono:tratoBakemono,
    conHechiceria:conHechiceria,
    medVital:medVital,
    medEspiritual:medEspiritual,
    rayo:rayo,
    fuego:fuego,
    frio:frio,
    veneno:veneno,
    corte:corte,
    energia:energia,
    apCombate: apCombate,
    valCombate: valCombate,
    apCombate2: apCombate2,
    valCombate2: valCombate2,
    ventajas: ventajas,
    inventario:inventario,
    dominios:dominios,
    hechizos:hechizos,

    kenActual:kenActual,
    kiActual:kiActual,
    positiva:positiva,
    negativa:negativa,
    vidaActual:vidaActual,

    add1:add1,
    valAdd1: valAdd1,
    add2:add2,
    valAdd2: valAdd2,
    add3:add3,
    valAdd3: valAdd3,
    add4:add4,
    valAdd4: valAdd4,

    consumision: consumision,
    
    iniciativa:iniciativa,
    historia:historia,
    naturaleza:naturaleza,
    tecEspecial:tecEspecial,
    conviccion: conviccion,
    cicatriz: cicatriz,  
    resistencia:resistencia,
    pjPnj:pjPnj,
 
  };

  savePersonajes(nuevosPersonajes); 
}

useEffect(() => {
 guardarCambios();
}, [ 
  nombre,
  dominio,
  raza,
  edad,
  imagen,
  ken,
  ki,
  destino,
  pDestino,
  fuerza,
  fortaleza,
  destreza,
  agilidad,
  sabiduria,
  presencia,
  principio,
  sentidos,
  academisismo,
  alerta,
  atletismo,
  conBakemono,
  mentir,
  pilotear,
  artesMarciales,
  medicina,
  conObjMagicos,
  sigilo,
  conEsferas,
  conLeyendas,
  forja,
  conDemonio,
  conEspiritual,
  manejoBlaster,
  manejoSombras,
  tratoBakemono,
  conHechiceria,
  medVital,
  medEspiritual,
  rayo,
  fuego,
  frio,
  veneno,
  corte,
  energia,
  apCombate,
  valCombate,
  apCombate2,
  valCombate2,
  ventajas,
  inventario,
  dominios,
  hechizos,
  kenActual,
  kiActual,
  positiva,
  negativa,
  vidaActual,
  add1,
  valAdd1,
  add2,
  valAdd2,
  add3,
  valAdd3,
  add4,
  valAdd4,
  consumision,
  iniciativa,
  historia,
  naturaleza,
  tecEspecial,
  conviccion,
  cicatriz,
  resistencia,
  pjPnj,

]);


  return (

    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
   <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.container, { paddingBottom: 600, flexGrow: 1 }]}
      >

      <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />
      <Image source={getImageSource()} style={styles.imagen} resizeMode="cover"/>
         <TouchableOpacity onPress={seleccionarImagen} style={{ marginBottom: 10 }}>
         <Text style={{ color: 'cyan' }}>Cambiar imagen</Text>
      </TouchableOpacity>
      <TextInput style={styles.input} value={raza} onChangeText={setRaza} />
      <TextInput style={styles.input} value={dominio} onChangeText={setDominio} />
      <TextInput style={styles.input} value={edad} onChangeText={setEdad} />
      <TextInput style={styles.input} value={naturaleza} onChangeText={setNaturaleza} />
      <TextInput style={styles.input} value={ki} onChangeText={setKi} />
      <TextInput style={styles.input} value={ken} onChangeText={setKen} />
      <TextInput style={styles.input} value={destino} onChangeText={setDestino} />
      <TextInput style={styles.input} value={pDestino} onChangeText={setPdestino} />
      <TextInput style={styles.input} value={fuerza} onChangeText={setFuerza} /> 
       <TextInput style={styles.input} value={fortaleza} onChangeText={setFortaleza} />
       <TextInput style={styles.input} value={destreza} onChangeText={setDestreza} />
      <TextInput style={styles.input} value={agilidad} onChangeText={setAgilidad} />
       <TextInput style={styles.input} value={sabiduria} onChangeText={setSabiduria} />
       <TextInput style={styles.input} value={presencia} onChangeText={setPresencia} />  
        <TextInput style={styles.input} value={principio} onChangeText={setPrincipio} />
       <TextInput style={styles.input} value={sentidos} onChangeText={setSentidos} />
      <TextInput style={styles.input} value={academisismo} onChangeText={setAcademisismo} />
       <TextInput style={styles.input} value={alerta} onChangeText={setAlerta} />
       <TextInput style={styles.input} value={atletismo} onChangeText={setAtletismo} />      
        <TextInput style={styles.input} value={conBakemono} onChangeText={setConBakemono} />
       <TextInput style={styles.input} value={mentir} onChangeText={setMentir} />
      <TextInput style={styles.input} value={pilotear} onChangeText={setPilotear} />
       <TextInput style={styles.input} value={artesMarciales} onChangeText={setArtesMarciales} />
       <TextInput style={styles.input} value={medicina} onChangeText={setMedicina} /> 
       <TextInput style={styles.input} value={conObjMagicos} onChangeText={setConObjMagicos} /> 
       <TextInput style={styles.input} value={sigilo} onChangeText={setSigilo} />     
       <TextInput style={styles.input} value={conEsferas} onChangeText={setConEsferas} />     
       <TextInput style={styles.input} value={conLeyendas} onChangeText={setConLeyendas} />     
       <TextInput style={styles.input} value={forja} onChangeText={setForja} />     
       <TextInput style={styles.input} value={conDemonio} onChangeText={setConDemonio} />     
       <TextInput style={styles.input} value={conEspiritual} onChangeText={setConEspiritual} />     
       <TextInput style={styles.input} value={manejoBlaster} onChangeText={setManejoBlaster} />     
       <TextInput style={styles.input} value={manejoSombras} onChangeText={setManejoSombras} />     
       <TextInput style={styles.input} value={tratoBakemono} onChangeText={setTratoBakemono} />     
       <TextInput style={styles.input} value={conHechiceria} onChangeText={setConHechiceria} />    
       <TextInput style={styles.input} value={medVital} onChangeText={setMedVital} />    
       <TextInput style={styles.input} value={medEspiritual} onChangeText={setMedEspiritual} />    
       <TextInput style={styles.input} value={rayo} onChangeText={setRayo} />    
       <TextInput style={styles.input} value={fuego} onChangeText={setFuego} />   
       <TextInput style={styles.input} value={frio} onChangeText={setFrio} />    
       <TextInput style={styles.input} value={veneno} onChangeText={setVeneno} />    
       <TextInput style={styles.input} value={corte} onChangeText={setCorte} />    
       <TextInput style={styles.input} value={energia} onChangeText={setEnergia} />    
       <TextInput style={styles.input} value={apCombate} onChangeText={setApCombate} />        
       <TextInput style={styles.input} value={apCombate2} onChangeText={setApCombate2} />
      <TextInput style={styles.input} value={valCombate2} onChangeText={setValCombate2} />
      <TextInput style={styles.input} value={ventajas} onChangeText={setVentajas} />
      <TextInput style={styles.input} value={inventario} onChangeText={setInventario} />
      <TextInput style={styles.input} value={dominios} onChangeText={setDominios} />
      <TextInput style={styles.input} value={hechizos} onChangeText={setHechizos} />
      <TextInput style={styles.input} value={kenActual} onChangeText={setKenActual} />
      <TextInput style={styles.input} value={kiActual} onChangeText={setKiActual} />
      <TextInput style={styles.input} value={positiva} onChangeText={setPositiva} />
      <TextInput style={styles.input} value={negativa} onChangeText={setNegativa} />
      <TextInput style={styles.input} value={vidaActual} onChangeText={setVidaActual} />
      <TextInput style={styles.input} value={add1} onChangeText={setAdd1} />
      <TextInput style={styles.input} value={valAdd1} onChangeText={setValAdd1} />
      <TextInput style={styles.input} value={add2} onChangeText={setAdd2} />
      <TextInput style={styles.input} value={valAdd2} onChangeText={setValAdd2} />
      <TextInput style={styles.input} value={add3} onChangeText={setAdd3} />
      <TextInput style={styles.input} value={valAdd3} onChangeText={setValAdd3} />
      <TextInput style={styles.input} value={add4} onChangeText={setAdd4} />
      <TextInput style={styles.input} value={valAdd4} onChangeText={setValAdd4} />
      <TextInput style={styles.input} value={consumision} onChangeText={setConsumision} />
      <TextInput style={styles.input} value={iniciativa} onChangeText={setIniciativa} />
      <TextInput style={styles.input} value={historia} onChangeText={setHistoria} />
      <TextInput style={styles.input} value={naturaleza} onChangeText={setNaturaleza} />
      <TextInput style={styles.input} value={tecEspecial} onChangeText={setTecEspecial} />
      <TextInput style={styles.input} value={conviccion} onChangeText={setConviccion} />
      <TextInput style={styles.input} value={cicatriz} onChangeText={setCicatriz} />
      <TextInput style={styles.input} value={resistencia} onChangeText={setResistencia} />
      <TextInput style={styles.input} value={pjPnj} onChangeText={setPjPnj} />    
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
container: {
  padding: 20,
  backgroundColor: '#000',
  justifyContent: 'flex-start',
},
  titulo: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  imagen: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
  },
  info: {
    fontSize: 16,
    color: '#eee',
    marginTop: 5,
  },
  error: {
    color: 'red',
    fontSize: 18,
    marginTop: 20,
  },
  input: {
  height: 40,
  borderColor: '#ccc',
  borderWidth: 1,
  color: '#fff',
  backgroundColor: '#222',
  paddingHorizontal: 10,
  borderRadius: 5,
  width: '80%',
  marginBottom: 10,
},
});