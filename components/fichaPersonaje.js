import React, { useContext,useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { View, Text, StyleSheet, Image,ScrollView,TextInput,TouchableOpacity  } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { KeyboardAvoidingView, Platform } from 'react-native';

import axios from 'axios';
import { showMessage } from 'react-native-flash-message';
import { List } from 'react-native-paper';

import { Ventajas } from './ventajas';

import Icon from 'react-native-vector-icons/MaterialIcons';
import { Inventario } from './inventario';
import { Dominios } from './dominios';
import { Hechizos } from './hechizos';
import { Historia } from './historia';
import { TecnicaEspecial } from './tecEpecial';

export const FichaPersonaje = ({ pj }) => {
  
  const { personajes, savePersonajes } = useContext(AuthContext);
 
  const imagenBase = require('../assets/imagenBase.jpeg');

//PARA EL TEMA DE LOS COLAPSE
  const [expanded, setExpanded] = useState("caracteristicas");

  const handlePress = (key) => {
    setExpanded(expanded === key ? null : key);
  };


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
  
  const [ken, setKen] = useState(p.ken != null ? String(p.ken) : '');
  const [ki, setKi] = useState(p.ki != null ? String(p.ki) : '');
  const [destino, setDestino] = useState(p.destino != null ? String(p.destino) : '');
  const [pDestino, setPdestino] = useState(p.pDestino != null ? String(p.pDestino) : '');

  const [fuerza, setFuerza] = useState(p.fuerza != null ? String(p.fuerza) : '');
  const [fortaleza, setFortaleza] = useState(p.fortaleza != null ? String(p.fortaleza) : '');
  const [destreza, setDestreza] = useState(p.destreza != null ? String(p.destreza) : '');
  const [agilidad, setAgilidad] = useState(p.agilidad != null ? String(p.agilidad) : '');
  const [sabiduria, setSabiduria] = useState(p.sabiduria != null ? String(p.sabiduria) : '');
  const [presencia, setPresencia] = useState(p.presencia != null ? String(p.presencia) : '');
  const [principio, setPrincipio] = useState(p.principio != null ? String(p.principio) : '');
  const [sentidos, setSentidos] = useState(p.sentidos != null ? String(p.sentidos) : '');

  const [academisismo, setAcademisismo] = useState(p.academisismo != null ? String(p.academisismo) : '');
  const [alerta, setAlerta] = useState(p.alerta != null ? String(p.alerta) : '');
  const [atletismo, setAtletismo] = useState(p.atletismo != null ? String(p.atletismo) : '');
  const [conBakemono, setConBakemono] = useState(p.conBakemono != null ? String(p.conBakemono) : '');
  const [mentir, setMentir] = useState(p.mentir != null ? String(p.mentir) : '');
  const [pilotear, setPilotear] = useState(p.pilotear != null ? String(p.pilotear) : '');
  const [artesMarciales, setArtesMarciales] = useState(p.artesMarciales != null ? String(p.artesMarciales) : '');
  const [medicina, setMedicina] = useState(p.medicina != null ? String(p.medicina) : '');
  const [conObjMagicos, setConObjMagicos] = useState(p.conObjMagicos != null ? String(p.conObjMagicos) : '');
  const [sigilo, setSigilo] = useState(p.sigilo != null ? String(p.sigilo) : '');
  const [conEsferas, setConEsferas] = useState(p.conEsferas != null ? String(p.conEsferas) : '');
  const [conLeyendas, setConLeyendas] = useState(p.conLeyendas != null ? String(p.conLeyendas) : '');
  const [forja, setForja] = useState(p.forja != null ? String(p.forja) : '');
  const [conDemonio, setConDemonio] = useState(p.conDemonio != null ? String(p.conDemonio) : '');
  const [conEspiritual, setConEspiritual] = useState(p.conEspiritual != null ? String(p.conEspiritual) : '');
  const [manejoBlaster, setManejoBlaster] = useState(p.manejoBlaster != null ? String(p.manejoBlaster) : '');
  const [manejoSombras, setManejoSombras] = useState(p.manejoSombras != null ? String(p.manejoSombras) : '');
  const [tratoBakemono, setTratoBakemono] = useState(p.tratoBakemono != null ? String(p.tratoBakemono) : '');
  const [conHechiceria, setConHechiceria] = useState(p.conHechiceria != null ? String(p.conHechiceria) : '');
  const [medVital, setMedVital] = useState(p.medVital != null ? String(p.medVital) : '');
  const [medEspiritual, setMedEspiritual] = useState(p.medEspiritual != null ? String(p.medEspiritual) : '');
  const [rayo, setRayo] = useState(p.rayo != null ? String(p.rayo) : '');
  const [fuego, setFuego] = useState(p.fuego != null ? String(p.fuego) : '');
  const [frio, setFrio] = useState(p.frio != null ? String(p.frio) : '');
  const [veneno, setVeneno] = useState(p.veneno != null ? String(p.veneno) : '');
  const [corte, setCorte] = useState(p.corte != null ? String(p.corte) : '');
  const [energia, setEnergia] = useState(p.energia != null ? String(p.energia) : '');

//****************ESTOS LUEGO LO RESOLVEMOS***************** 
  const [ventajas, setVentajas] = useState(p.ventajas);
  const [inventario, setInventario] = useState(p.inventario);
  const [dominios, setDominios] = useState(p.dominios);
  const [hechizos, setHechizos] = useState(p.hechizos);

//*********************************************************** 
  const [kenActual, setKenActual] = useState(p.kenActual != null ? String(p.kenActual) : '');
  const [kiActual, setKiActual] = useState(p.kiActual != null ? String(p.kiActual) : '');
  const [positiva, setPositiva] = useState(p.positiva != null ? String(p.positiva) : '');
  const [negativa, setNegativa] = useState(p.negativa != null ? String(p.negativa) : '');

  //const [damageActual, setDamageActual] = useState(p.vidaActual);
  const [vidaActual, setVidaActual] = useState(p.vidaActual != null ? String(p.vidaActual) : '');
  const [consumision, setConsumision] = useState(p.consumision != null ? String(p.consumision) : '');

  const [apCombate,setApCombate]=useState(p.apCombate);
  const [valCombate, setValCombate] = useState(p.valCombate != null ? String(p.valCombate) : '');
  const [apCombate2,setApCombate2]=useState(p.apCombate2);
  const [valCombate2, setValCombate2] = useState(p.valCombate2 != null ? String(p.valCombate2) : '');
  const [add1,setAdd1]=useState(p.add1);
  const [valAdd1, setValAdd1] = useState(p.valAdd1 != null ? String(p.valAdd1) : '');
  const [add2,setAdd2]=useState(p.add2);
  const [valAdd2, setValAdd2] = useState(p.valAdd2 != null ? String(p.valAdd2) : '');
  const [add3,setAdd3]=useState(p.add3);
  const [valAdd3, setValAdd3] = useState(p.valAdd3 != null ? String(p.valAdd3) : '');
  const [add4,setAdd4]=useState(p.add4);
  const [valAdd4, setValAdd4] = useState(p.valAdd4 != null ? String(p.valAdd4) : '');


  const [iniciativa, setIniciativa] = useState(p.iniciativa != null ? String(p.iniciativa) : '');
  const [historia,setHistoria]=useState(p.historia);
  const [tecEspecial,setTecEspecial]=useState(p.tecEspecial);
  const [conviccion,setConviccion]=useState(p.conviccion);
  const [cicatriz, setCicatriz] = useState(p.cicatriz != null ? String(p.cicatriz) : '');
  const [resistencia, setResistencia] = useState(p.resistencia != null ? String(p.resistencia) : '');
  const [pjPnj,setPjPnj]=useState(p.pjPnj);





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
      usuarioId: p.usuarioId,
      tecEspecial: tecEspecial,
      conviccion: conviccion || "",

      cicatriz: cicatriz || 0,
      resistencia: resistencia || 0,
      pjPnj:pjPnj,
    };
    
   
    const response = await axios.put(`http://192.168.0.38:3000/update-personaje/${p.idpersonaje}`, personaje, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('Cambios guardados exitosamente:', response.data);
    setTimeout(() => {
      showMessage({
        message: 'Cambios guardados',
        description: 'Tus datos se han actualizado correctamente.',
        type: 'success',
        icon: 'success',
        duration: 3000
      });
    }, 500);

  } catch (error) {
    console.error('Error al guardar cambios:', error);
  }
};



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

const colorPlaceHolder="#888" 
  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
  <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.container, { paddingBottom: 100, flexGrow: 1 }]}
    >
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
      <TextInput
        placeholder="Nombre"
        placeholderTextColor={colorPlaceHolder}
        keyboardType="default"
        style={[styles.inputTextoNombre, { flex: 1, marginRight: 10 }]}
        value={nombre}
        onChangeText={setNombre}
      />

      <TouchableOpacity style={styles.botonGuardar} onPress={guardarCambiosBBDD}>
        <Icon name="save" size={24} color="#00FF00" />
      </TouchableOpacity>
    </View>

          <View style={styles.rowContainer}>
          <View style={styles.imageContainer}>
            <Image source={getImageSource()} style={styles.imagen} resizeMode="cover" />
            <TouchableOpacity onPress={seleccionarImagen} style={{ marginTop: 10 }}>
              <Text style={{ color: 'cyan' }}>Cambiar imagen</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputsContainer}>
          <Text style={styles.label}>Raza</Text>
          <TextInput placeholder="Raza" placeholderTextColor={colorPlaceHolder} keyboardType="default" style={styles.inputTexto} value={raza} onChangeText={setRaza} />
          
          <Text style={styles.label}>Dominio</Text>
          <TextInput placeholder="Dominio" placeholderTextColor={colorPlaceHolder} keyboardType="default" style={styles.inputTexto} value={dominio} onChangeText={setDominio} />
          
          <Text style={styles.label}>Edad</Text>
          <TextInput placeholder="Edad" placeholderTextColor={colorPlaceHolder} keyboardType="default" style={styles.inputTexto} value={edad} onChangeText={setEdad} />
          
          <Text style={styles.label}>Naturaleza</Text>
          <TextInput placeholder="Naturaleza" placeholderTextColor={colorPlaceHolder} keyboardType="default" style={styles.inputTexto} value={naturaleza} onChangeText={setNaturaleza} />
          
        
          
          
        </View>

          </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
          {/* Columna 1 */}
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.label}>Ki</Text>
            <TextInput
              placeholder="Ki"
              placeholderTextColor={colorPlaceHolder}
              keyboardType="numeric"
              value={ki}
              onChangeText={setKi}
            style={styles.inputNumero}
            />

            <Text style={styles.label}>
              Nivel de Destino
            </Text>
            <TextInput
              placeholder="Nivel de Destino"
              placeholderTextColor={colorPlaceHolder}
              keyboardType="numeric"
              value={destino}
              onChangeText={setDestino}
            style={styles.inputNumero}
            />
          </View>

          {/* Columna 2 */}
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.label}>Ken</Text>
            <TextInput
              placeholder="Ken"
              placeholderTextColor={colorPlaceHolder}
              keyboardType="numeric"
              value={ken}
              onChangeText={setKen}
            style={styles.inputNumero}
            />

            <Text style={styles.label}>
              P. de Destino
            </Text>
            <TextInput
              placeholder="P. de destino"
              placeholderTextColor={colorPlaceHolder}
              keyboardType="numeric"
              value={pDestino}
              onChangeText={setPdestino}
              style={styles.inputNumero}
            />
          </View>
      </View>
      <Text style={styles.label}>Convicción</Text>
          <TextInput placeholder="Convicción" placeholderTextColor={colorPlaceHolder} keyboardType="default" multiline={true} style={styles.inputTextoConv} value={conviccion} onChangeText={setConviccion} />


     



    
      <List.Section>

         <List.Accordion
          title="Caracteristicas"
          expanded={expanded === 'caracteristicas'}
          onPress={() => handlePress('caracteristicas')}
           titleStyle={{ fontSize: 18, fontWeight: 'bold', color: '#FFA500' }}
          style={{ backgroundColor: '#1c1c1c', borderBottomWidth: 2, borderBottomColor: '#e0b878', paddingVertical: 4 }}
        >

          <View style={{ marginTop: 12 }}>
            <View style={styles.gridContainer}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Fuerza</Text>
                    <TextInput
                      keyboardType="numeric"
                      style={styles.inputNumero}
                      value={fuerza}
                      onChangeText={setFuerza}
                      placeholder="Fza"
                      placeholderTextColor={colorPlaceHolder}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Fortaleza</Text>
                    <TextInput
                      keyboardType="numeric"
                      style={styles.inputNumero}
                      value={fortaleza}
                      onChangeText={setFortaleza}
                      placeholder="For"
                      placeholderTextColor={colorPlaceHolder}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Destreza</Text>
                    <TextInput
                      keyboardType="numeric"
                      style={styles.inputNumero}
                      value={destreza}
                      onChangeText={setDestreza}
                      placeholder="Des"
                      placeholderTextColor={colorPlaceHolder}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Agilidad</Text>
                    <TextInput
                      keyboardType="numeric"
                      style={styles.inputNumero}
                      value={agilidad}
                      onChangeText={setAgilidad}
                      placeholder="Agi"
                      placeholderTextColor={colorPlaceHolder}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Sabiduria</Text>
                    <TextInput
                      keyboardType="numeric"
                      style={styles.inputNumero}
                      value={sabiduria}
                      onChangeText={setSabiduria}
                      placeholder="Sab"
                      placeholderTextColor={colorPlaceHolder}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Presencia</Text>
                    <TextInput
                      keyboardType="numeric"
                      style={styles.inputNumero}
                      value={presencia}
                      onChangeText={setPresencia}
                      placeholder="Pre"
                      placeholderTextColor={colorPlaceHolder}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Principio</Text>
                    <TextInput
                      keyboardType="numeric"
                      style={styles.inputNumero}
                      value={principio}
                      onChangeText={setPrincipio}
                      placeholder="Pri"
                      placeholderTextColor={colorPlaceHolder}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Sentidos</Text>
                    <TextInput
                      keyboardType="numeric"
                      style={styles.inputNumero}
                      value={sentidos}
                      onChangeText={setSentidos}
                      placeholder="Sen"
                      placeholderTextColor={colorPlaceHolder}
                    />
                  </View>
           </View>
          
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Academisismo</Text><TextInput placeholder="Academisismo" placeholderTextColor={colorPlaceHolder} keyboardType="numeric" style={styles.inputNumero} value={academisismo} onChangeText={setAcademisismo} />
                <Text style={styles.label}>Atletismo</Text><TextInput placeholder="Atletismo" placeholderTextColor={colorPlaceHolder} keyboardType="numeric" style={styles.inputNumero} value={atletismo} onChangeText={setAtletismo} />
                <Text style={styles.label}>Mentir</Text><TextInput placeholder="Mentir" placeholderTextColor={colorPlaceHolder} keyboardType="numeric" style={styles.inputNumero} value={mentir} onChangeText={setMentir} />
                <Text style={styles.label}>Artes Marciales</Text><TextInput placeholder="Artes Marciales" placeholderTextColor={colorPlaceHolder} keyboardType="numeric" style={styles.inputNumero} value={artesMarciales} onChangeText={setArtesMarciales} />
                <Text style={styles.label}>Con Obj. Mágicos</Text><TextInput placeholder="Con Obj. Mágicos" placeholderTextColor={colorPlaceHolder} keyboardType="numeric" style={styles.inputNumero} value={conObjMagicos} onChangeText={setConObjMagicos} />
                <Text style={styles.label}>Con Leyendas</Text><TextInput placeholder="Con Leyendas" placeholderTextColor={colorPlaceHolder} keyboardType="numeric" style={styles.inputNumero} value={conLeyendas} onChangeText={setConLeyendas} />
                <Text style={styles.label}>Con Espiritual</Text><TextInput placeholder="Con Espiritual" placeholderTextColor={colorPlaceHolder} keyboardType="numeric" style={styles.inputNumero} value={conEspiritual} onChangeText={setConEspiritual} />
                <Text style={styles.label}>Manejo Sombras</Text><TextInput placeholder="Manejo Sombras" placeholderTextColor={colorPlaceHolder} keyboardType="numeric" style={styles.inputNumero} value={manejoSombras} onChangeText={setManejoSombras} />
                <Text style={styles.label}>Con Hechicería</Text><TextInput placeholder="Con Hechicería" placeholderTextColor={colorPlaceHolder} keyboardType="numeric" style={styles.inputNumero} value={conHechiceria} onChangeText={setConHechiceria} />
                <Text style={styles.label}>Med Espiritual</Text><TextInput placeholder="Med Espiritual" placeholderTextColor={colorPlaceHolder} keyboardType="numeric" style={styles.inputNumero} value={medEspiritual} onChangeText={setMedEspiritual} />
                <Text style={styles.label}>Fuego</Text><TextInput placeholder="Fuego" placeholderTextColor={colorPlaceHolder} keyboardType="numeric" style={styles.inputNumero} value={fuego} onChangeText={setFuego} />
                <Text style={styles.label}>Veneno</Text><TextInput placeholder="Veneno" placeholderTextColor={colorPlaceHolder} keyboardType="numeric" style={styles.inputNumero} value={veneno} onChangeText={setVeneno} />
                <Text style={styles.label}>Energía</Text><TextInput placeholder="Energía" placeholderTextColor={colorPlaceHolder} keyboardType="numeric" style={styles.inputNumero} value={energia} onChangeText={setEnergia} />
                

                <TextInput
                  placeholder="Ingresa Armamento"
                  placeholderTextColor={colorPlaceHolder}
                  style={[styles.label, {  height: 19 ,marginTop: 0,marginBottom: 0, paddingTop:0, paddingBottom: 2 }]} 
                  value={apCombate}
                  onChangeText={setApCombate}
                />
                <TextInput
                  placeholder="0"
                  placeholderTextColor={colorPlaceHolder}
                  keyboardType="numeric"
                  style={[styles.inputNumero, { marginTop: 0 }]}
                  value={valCombate}
                  onChangeText={setValCombate}
                />

                <TextInput
                  placeholder="Ingresa Armamento"
                  placeholderTextColor={colorPlaceHolder}
                  style={[styles.label, { height: 19, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 2 }]}
                  value={apCombate2}
                  onChangeText={setApCombate2}
                />
                <TextInput
                  placeholder="0"
                  placeholderTextColor={colorPlaceHolder}
                  keyboardType="numeric"
                  style={[styles.inputNumero, { marginTop: 0 }]}
                  value={valCombate2}
                  onChangeText={setValCombate2}
                />  

                <TextInput
                  placeholder="Aptitud nueva"
                  placeholderTextColor={colorPlaceHolder}
                  style={[styles.label, { height: 19, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 2 }]}
                  value={add3}
                  onChangeText={setAdd3}
                />
                <TextInput
                  placeholder="0"
                  placeholderTextColor={colorPlaceHolder}
                  keyboardType="numeric"
                  style={[styles.inputNumero, { marginTop: 0 }]}
                  value={valAdd3}
                  onChangeText={setValAdd3}
                />

                <TextInput
                  placeholder="Aptitud nueva"
                  placeholderTextColor={colorPlaceHolder}
                  style={[styles.label, { height: 19, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 2 }]}
                  value={add4}
                  onChangeText={setAdd4}
                />
                <TextInput
                  placeholder="0"
                  placeholderTextColor={colorPlaceHolder}
                  keyboardType="numeric"
                  style={[styles.inputNumero, { marginTop: 0 }]}
                  value={valAdd4}
                  onChangeText={setValAdd4}
                />

                

              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.label}>Alerta</Text><TextInput placeholder="Alerta" placeholderTextColor={colorPlaceHolder} keyboardType="numeric" style={styles.inputNumero} value={alerta} onChangeText={setAlerta} />
                <Text style={styles.label}>Con Bakemono</Text><TextInput placeholder="Con Bakemono" placeholderTextColor={colorPlaceHolder} keyboardType="numeric" style={styles.inputNumero} value={conBakemono} onChangeText={setConBakemono} />
                <Text style={styles.label}>Pilotear</Text><TextInput placeholder="Pilotear" placeholderTextColor={colorPlaceHolder} keyboardType="numeric" style={styles.inputNumero} value={pilotear} onChangeText={setPilotear} />
                <Text style={styles.label}>Medicina</Text><TextInput placeholder="Medicina" placeholderTextColor={colorPlaceHolder} keyboardType="numeric" style={styles.inputNumero} value={medicina} onChangeText={setMedicina} />
                <Text style={styles.label}>Sigilo</Text><TextInput placeholder="Sigilo" placeholderTextColor={colorPlaceHolder} keyboardType="numeric" style={styles.inputNumero} value={sigilo} onChangeText={setSigilo} />
                <Text style={styles.label}>Con Esferas</Text><TextInput placeholder="Con Esferas" placeholderTextColor={colorPlaceHolder} keyboardType="numeric" style={styles.inputNumero} value={conEsferas} onChangeText={setConEsferas} />
                <Text style={styles.label}>Forja</Text><TextInput placeholder="Forja" placeholderTextColor={colorPlaceHolder} keyboardType="numeric" style={styles.inputNumero} value={forja} onChangeText={setForja} />
                <Text style={styles.label}>Con Demonio</Text><TextInput placeholder="Con Demonio" placeholderTextColor={colorPlaceHolder} keyboardType="numeric" style={styles.inputNumero} value={conDemonio} onChangeText={setConDemonio} />
                <Text style={styles.label}>Manejo Blaster</Text><TextInput placeholder="Manejo Blaster" placeholderTextColor={colorPlaceHolder} keyboardType="numeric" style={styles.inputNumero} value={manejoBlaster} onChangeText={setManejoBlaster} />
                <Text style={styles.label}>Trato Bakemono</Text><TextInput placeholder="Trato Bakemono" placeholderTextColor={colorPlaceHolder} keyboardType="numeric" style={styles.inputNumero} value={tratoBakemono} onChangeText={setTratoBakemono} />
                <Text style={styles.label}>Med Vital</Text><TextInput placeholder="Med Vital" placeholderTextColor={colorPlaceHolder} keyboardType="numeric" style={styles.inputNumero} value={medVital} onChangeText={setMedVital} />
                <Text style={styles.label}>Rayo</Text><TextInput placeholder="Rayo" placeholderTextColor={colorPlaceHolder} keyboardType="numeric" style={styles.inputNumero} value={rayo} onChangeText={setRayo} />
                <Text style={styles.label}>Frío</Text><TextInput placeholder="Frío" placeholderTextColor={colorPlaceHolder} keyboardType="numeric" style={styles.inputNumero} value={frio} onChangeText={setFrio} />
                <Text style={styles.label}>Corte</Text><TextInput placeholder="Corte" placeholderTextColor={colorPlaceHolder} keyboardType="numeric" style={styles.inputNumero} value={corte} onChangeText={setCorte} /> 



                <TextInput
                  placeholder="Aptitud nueva"
                  placeholderTextColor={colorPlaceHolder}
                  style={[styles.label, { height: 19, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 2 }]}
                  value={add1}
                  onChangeText={setAdd1}
                />
                <TextInput
                  placeholder="0"
                  placeholderTextColor={colorPlaceHolder}
                  keyboardType="numeric"
                  style={[styles.inputNumero, { marginTop: 0 }]}
                  value={valAdd1}
                  onChangeText={setValAdd1}
                />

                <TextInput
                  placeholder="Aptitud nueva"
                  placeholderTextColor={colorPlaceHolder}
                  style={[styles.label, { height: 19, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 2 }]}
                  value={add2}
                  onChangeText={setAdd2}
                />
                <TextInput
                  placeholder="0"
                  placeholderTextColor={colorPlaceHolder}
                  keyboardType="numeric"
                  style={[styles.inputNumero, { marginTop: 0 }]}
                  value={valAdd2}
                  onChangeText={setValAdd2}
                />


                
              </View>
            </View>
          </View>
           
         
        </List.Accordion>

        <List.Accordion
          title="Ventajas y Desventajas"
          expanded={expanded === 'ventajas'}
          onPress={() => handlePress('ventajas')}
          titleStyle={{ fontSize: 18, fontWeight: 'bold', color: '#FFA500' }}
          style={{ backgroundColor: '#1c1c1c', borderBottomWidth: 2, borderBottomColor: '#e0b878', paddingVertical: 4 }}
                  >
            <Ventajas ventajas={ventajas} setVentajas={setVentajas} />
        </List.Accordion>

         <List.Accordion
          title="Inventario"
          expanded={expanded === 'inventario'}
          onPress={() => handlePress('inventario')}
          titleStyle={{ fontSize: 18, fontWeight: 'bold', color: '#FFA500' }}
          style={{ backgroundColor: '#1c1c1c', borderBottomWidth: 2, borderBottomColor: '#e0b878', paddingVertical: 4 }}
        >
          <Inventario inventario={inventario} setInventario={setInventario} />
        </List.Accordion>

        <List.Accordion
          title="Dominios y Tecnicas"
          expanded={expanded === 'dominios'}
          onPress={() => handlePress('dominios')}
          titleStyle={{ fontSize: 18, fontWeight: 'bold', color: '#FFA500' }}
          style={{ backgroundColor: '#1c1c1c', borderBottomWidth: 2, borderBottomColor: '#e0b878', paddingVertical: 4 }}
        >
          <Dominios dominios={dominios} setDominios={setDominios} />
        </List.Accordion>

        <List.Accordion
          title="Hechicería"
          expanded={expanded === 'hechiceria'}
          onPress={() => handlePress('hechiceria')}
          titleStyle={{ fontSize: 18, fontWeight: 'bold', color: '#FFA500' }}
          style={{ backgroundColor: '#1c1c1c', borderBottomWidth: 2, borderBottomColor: '#e0b878', paddingVertical: 4 }}
        >
          <Hechizos hechizos={hechizos} setHechizos={setHechizos}></Hechizos>
        </List.Accordion>

        <List.Accordion
          title="Historia"
          expanded={expanded === 'historia'}
          onPress={() => handlePress('historia')}
          titleStyle={{ fontSize: 18, fontWeight: 'bold', color: '#FFA500' }}
          style={{ backgroundColor: '#1c1c1c', borderBottomWidth: 2, borderBottomColor: '#e0b878', paddingVertical: 4 }}
        >
          <Historia historia={historia} setHistoria={setHistoria}></Historia>
        </List.Accordion>

         <List.Accordion
          title="Tecnicas, poderes y objetos unicos"
          expanded={expanded === 'tecEspecial'}
          onPress={() => handlePress('tecEspecial')}
          titleStyle={{ fontSize: 18, fontWeight: 'bold', color: '#FFA500' }}
          style={{ backgroundColor: '#1c1c1c', borderBottomWidth: 2, borderBottomColor: '#e0b878', paddingVertical: 4 }}
        >
          <TecnicaEspecial tecEspecial={tecEspecial} setTecEspecial={setTecEspecial}></TecnicaEspecial>
        </List.Accordion>

       
      </List.Section>


          
        
        </ScrollView>


        
    



   
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12, // antes: 20
    backgroundColor: '#000',
    justifyContent: 'flex-start',
  },
  titulo: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8, // antes: 10
  },
  imagen: {
    width: 200,
    height: 200,
    marginTop: 16,
    borderWidth: 4,
    borderColor: 'white',
    borderRadius: 12, // opcional para bordes redondeados
    // sombra iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    // sombra Android
    elevation: 15,
  },
  info: {
    fontSize: 16,
    color: '#eee',
    marginTop: 4, // antes: 5
  },
  error: {
    color: 'red',
    fontSize: 18,
    marginTop: 12, // antes: 20
  },
  input: {
    height: 36, // antes: 40
    borderColor: '#ccc',
    borderWidth: 1,
    color: '#fff',
    backgroundColor: '#222',
    paddingHorizontal: 8, // antes: 10
    borderRadius: 5,
    width: '80%',
    marginBottom: 6, // antes: 10
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12, // antes: 20
  },
  imageContainer: {
    marginRight: 10, // antes: 15
    alignItems: 'center',
  },
  inputsContainer: {
    flex: 1,
  },
  inputTexto: {
    borderWidth: 1,
    borderColor:'#a16207',
    backgroundColor: '#1a1a1a',
    paddingVertical: 4, // antes: 6
    paddingHorizontal: 6, // antes: 8
    borderRadius: 6,
    marginBottom: 6, // antes: 10
    color: '#e0e0e0',
    fontSize: 14, // antes: 15
  },
  inputTextoConv: {
  borderWidth: 1,
  borderColor: '#a16207',
  backgroundColor: '#1a1a1a',
  paddingVertical: 8,  // aumenta el padding vertical para más espacio interno
  paddingHorizontal: 6,
  borderRadius: 6,
  marginBottom: 6,
  color: '#e0e0e0',
  fontSize: 14,
  minHeight: 60, // altura mínima, ajusta a lo que necesites
  textAlignVertical: 'top', // para que el texto empiece desde arriba
},
  inputNumero: {
    borderWidth: 1,
    borderColor: '#a16207',
    backgroundColor: '#1a1a1a',
    paddingVertical: 4, // antes: 6
    paddingHorizontal: 6, // antes: 8
    borderRadius: 6,
    marginBottom: 6, // antes: 10
    color: '#d1fae5',
    fontSize: 14, // antes: 15
    fontWeight: '500',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  inputGroup: {
    width: '48%',
    marginBottom: 8, // antes: 12
  },
  label: {
    color: '#facc15',
    marginBottom: 1, // antes: 2
    fontSize: 13, // antes: 14
    fontWeight: '600',
  },
  botonGuardar: {
  backgroundColor: '#28a745', // verde success estilo Bootstrap
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 8,
  alignSelf: 'center', // lo centra horizontalmente
  marginTop: 12,
},

textoBoton: {
  color: '#fff', // blanco para contraste
  fontWeight: 'bold',
  fontSize: 16,
},
inputTextoNombre: {
  borderWidth: 1,
  backgroundColor: 'black',
  paddingVertical: 4,
  paddingHorizontal: 6,
  borderRadius: 6,
  marginTop: 5,
  color: '#FFFF00',
  fontSize: 19,
  fontFamily: 'AnimeAce2.0',
  
  // sombra iOS
  shadowColor: '#FFFF00',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.8,
  shadowRadius: 8,

  // sombra Android
  elevation: 10,
}, 
});