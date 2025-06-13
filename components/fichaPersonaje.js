// FichaDePersonaje.js

import React, { useContext,useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { View, Text, StyleSheet, Image } from 'react-native';
import { TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { TouchableOpacity } from 'react-native';


export const FichaPersonaje = ({ route }) => {

  
  
  const { personajes, savePersonajes } = useContext(AuthContext);
  const { pj } = route.params;
  const imagenBase = require('../assets/imagenBase.jpeg');

  //aca extrae el personaje
  const p = personajes.find(p => p.idpersonaje === pj.idpersonaje);

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
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

  /*
  const [destinoN,setDestinoN]=useState(destino);
  const [pDestinoN,setPdestinoN]=useState(pDestino); 
  const [fuerzaN,setFuerzaN]=useState(fuerza);
  const [fortalezaN,setFortalezaN]=useState(fortaleza);
  const [destrezaN,setDestrezaN]=useState(destreza);
  const [agilidadN,setAgilidadN]=useState(agilidad);
  const [sabiduriaN,setSabiduriaN]=useState(sabiduria);
  const [presenciaN,setPresenciaN]=useState(presencia);
  const [principioN,setPrincipioN]=useState(principio);
  const [sentidosN,setSentidosN]=useState(sentidos);
  const [academisismoN,setAcademisismoN]=useState(academisismo);
  const [alertaN,setAlertaN]=useState(alerta);
  const [atletismoN,setAtletismoN]=useState(atletismo);
  const [conBakemonoN,setConBakemonoN]=useState(conBakemono);
  const [mentirN,setMentirN]=useState(mentir);
  const [pilotearN,setPilotearN]=useState(pilotear);
  const [artesMarcialesN,setArtesMarcialesN]=useState(artesMarciales);
  const [medicinaN,setMedicinaN]=useState(medicina);
  const [conObjMagicosN,setConObjMagicosN]=useState(conObjMagicos);
  const [sigiloN,setSigiloN]=useState(sigilo);
  const [conEsferasN,setConEsferasN]=useState(conEsferas);
  const [conLeyendasN,setConLeyendasN]=useState(conLeyendas);
  const [forjaN,setForjaN]=useState(forja);
  const [conDemonioN,setConDemonioN]=useState(conDemonio);
  const [conEspiritualN,setConEspiritualN]=useState(conEspiritual);
  const [manejoBlasterN,setManejoBlasterN]=useState(manejoBlaster);
  const [manejoSombrasN,setManejoSombrasN]=useState(manejoSombras);
  const [tratoBakemonoN,setTratoBakemonoN]=useState(tratoBakemono);
  const [conHechiceriaN,setConHechiceriaN]=useState(conHechiceria);
  const [medVitalN,setMedVitalN]=useState(medVital);
  const [medEspiritualN,setMedEspiritualN]=useState(medEspiritual);
  const [rayoN,setRayoN]=useState(rayo);
  const [fuegoN,setFuegoN]=useState(fuego);
  const [frioN,setFrioN]=useState(frio);
  const [venenoN,setVenenoN]=useState(veneno);
  const [corteN,setCorteN]=useState(corte);
  const [energiaN,setEnergiaN]=useState(energia);
  const [ventajasN, setVentajasN] = useState(ventajas);
  const [inventarioN, setInventarioN] = useState(inventario);
  const [dominiosN, setDominiosN] = useState(dominios);
  const [hechizosN, setHechizosN] = useState(hechizos);
  const [kenActualN,setKenActualN]=useState(kenActual);
  const [kiActualN,setKiActualN]=useState(kiActual);
  const [positivaN,setPositivaN]=useState(positiva);
  const [negativaN,setNegativaN]=useState(negativa);
  const [damageActualN,setDamageActualN]=useState(vidaActual);
  const [consumisionN,setConsumisionN]=useState(consumision);
  const [apCombateN,setApCombateN]=useState(apCombate);
  const [valCombateN,setValCombateN]=useState(valCombate);
  const [apCombate2N,setApCombate2N]=useState(apCombate2);
  const [valCombate2N,setValCombate2N]=useState(valCombate2);
  const [add1N,setAdd1N]=useState(add1);
  const [valAdd1N,setValAdd1N]=useState(valAdd1);
  const [add2N,setAdd2N]=useState(add2);
  const [valAdd2N,setValAdd2N]=useState(valAdd2);
  const [add3N,setAdd3N]=useState(add3);
  const [valAdd3N,setValAdd3N]=useState(valAdd3);
  const [add4N,setAdd4N]=useState(add4);
  const [valAdd4N,setValAdd4N]=useState(valAdd4);
  const [iniciativaN,setIniciativaN]=useState(iniciativa); 
  const [historiaN,setHistoriaN]=useState(historia);
  const [tecEspecialN,setTecEspecialN]=useState(tecEspecial);
  const [conviccionN,setConviccionN]=useState(conviccion);
  const [cicatrizN,setCicatrizN]=useState(cicatriz);
  const [resistenciaN,setResistenciaN]=useState(resistencia);
  const [pjPnjN,setPjPnjN]=useState(pjPnj);

*/



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

 const btnGuardarCambios = () => {
   

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
   /*
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
    */
  };


  savePersonajes(nuevosPersonajes);
 
}

useEffect(() => {
 btnGuardarCambios();
}, [ 
  nombre,
  dominio,
  raza,
  edad,
  imagen,
  ken,
  ki,
  /*
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
  damageActual,
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
  */
  naturaleza,
  /*
  tecEspecial,
  conviccion,
  cicatriz,
  resistencia,
  pjPnj,
  */
]);


  return (
    <View style={styles.container}>
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
      
   
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000',
    alignItems: 'center',
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