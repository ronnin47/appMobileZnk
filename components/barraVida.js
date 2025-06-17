import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Animated } from 'react-native';

import { AuthContext } from './AuthContext';


//import { io } from 'socket.io-client';
//const socket = io(process.env.REACT_APP_BACKEND_URL);

export const BarraVida = ({pj}) => {
const { personajes, savePersonajes } = useContext(AuthContext);
 //aca extrae el personaje
  const p = personajes.find(p => p.idpersonaje === pj.idpersonaje);

  console.log("El persoanje que extraemos es: ",p.nombre)
  
  // LOS STATES QUE USAMOS
//ACA LOS STATES
  const [nombre,setNombre]=useState(p.nombre);

 
  const [ki, setKi] = useState(p.ki != null ? String(p.ki) : '');
  const [fortaleza, setFortaleza] = useState(p.fortaleza != null ? String(p.fortaleza) : '');
  const [positiva, setPositiva] = useState(p.positiva != null ? String(p.positiva) : '');
  const [negativa, setNegativa] = useState(p.negativa != null ? String(p.negativa) : '');
  const [vidaActual, setVidaActual] = useState(p.vidaActual != null ? String(p.vidaActual) : '');
  const [cicatriz, setCicatriz] = useState(p.cicatriz != null ? String(p.cicatriz) : '');
  const [resistencia, setResistencia] = useState(p.resistencia != null ? String(p.resistencia) : '');
  


  //se refiere a la cantidad de vida por fase 
  const faseSalud = parseInt(ki) + parseInt(fortaleza);
    console.log(typeof faseSalud)


//*********************HASTA ACA LLEGAMOS**********************

    const vidaTotalPositiva = faseSalud * parseInt(p.positiva);
  const vidaTotalNegativa = faseSalud * parseInt(p.negativa);
  const vidaTotal = vidaTotalPositiva + vidaTotalNegativa;

   //const [vidaActual, setVidaActual] = useState(p.vidaActual);
  const [estadoDeFase, setEstadoDeFase] = useState("SIN HERIDAS");
  const [porcentajeVidaPositiva, setPorcentajeVidaPositiva] = useState(0);
  const [porcentajeVidaNegativa, setPorcentajeVidaNegativa] = useState(0);
  const [consumirVida, setConsumirVida] = useState("");

  useEffect(() => {
    calcularEstadoInicial();
  }, []);

  const calcularEstadoInicial = () => {
    const newDamage = p.vidaActual;

    if (newDamage > vidaTotal) return setEstadoDeFase("MUERTO");
    if (newDamage === 0) return setEstadoDeFase("SIN HERIDAS");

    const delta = vidaTotalPositiva - newDamage;

    if (delta < faseSalud) return setEstadoDeFase("MALHERIDO");
    if (delta < faseSalud * 2) return setEstadoDeFase("MALTRECHO");
    if (delta < faseSalud * 3) return setEstadoDeFase("RAZGADO");

    if (newDamage > vidaTotalPositiva) {
      const exceso = newDamage - vidaTotalPositiva;
      if (negativa === 1) return setEstadoDeFase("MORIBUNDO");
      if (negativa === 2) return setEstadoDeFase("INCAPACITADO");
      if (negativa >= 3) return setEstadoDeFase("INCONCIENTE");
    }
  };

  const agregarDamage = () => {
    let newValue = parseInt(consumirVida) || 0;
    let newDamage = p.vidaActual + newValue;

    if (newDamage < 0) newDamage = 0;
    if (parseInt(p.cicatriz) > 0 && newDamage < parseInt(p.cicatriz)) {
      newDamage = parseInt(p.cicatriz);
    }

    setVidaActual(newDamage);
    calcularEstadoInicial();

    // Calcular porcentaje
    if (newDamage <= vidaTotalPositiva) {
      setPorcentajeVidaPositiva((newDamage * 100) / vidaTotalPositiva);
      setPorcentajeVidaNegativa(0);
    } else {
      setPorcentajeVidaPositiva(100);
      const dañoNegativo = newDamage - vidaTotalPositiva;
      setPorcentajeVidaNegativa(Math.min(100, (dañoNegativo * 100) / vidaTotalNegativa));
    }
/*
    // Emitir mensaje
    const msgEnviar = {
      idpersonaje:p.idpersonaje,
      nombre: p.nombre,
      vidaActual: newDamage,
      vidaTotal: vidaTotal,
      mensaje: `${nombre} tiene ${newDamage}/${vidaTotal} (${estadoDeFase})`
    };
    socket.emit('message', msgEnviar);
  */
    };

  return (
    <View style={styles.container}>
      <Text style={styles.estadoText}>Estado: {estadoDeFase}</Text>
      <Text style={styles.vidaText}>Vida: {vidaActual}/{vidaTotal}</Text>

      <View style={styles.barraContenedor}>
        <View style={[styles.barraPositiva, { width: `${porcentajeVidaPositiva}%` }]} />
        <View style={[styles.barraNegativa, { width: `${porcentajeVidaNegativa}%` }]} />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Cambiar daño"
        value={consumirVida}
        onChangeText={setConsumirVida}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.boton} onPress={agregarDamage}>
        <Text style={styles.botonTexto}>Aplicar Daño</Text>
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 10,
    margin: 10,
  },
  estadoText: {
    color: '#f8e71c',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 5,
  },
  vidaText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'center',
  },
  barraContenedor: {
    flexDirection: 'row',
    height: 20,
    backgroundColor: '#555',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  barraPositiva: {
    backgroundColor: '#2ecc71',
    height: '100%',
  },
  barraNegativa: {
    backgroundColor: '#e74c3c',
    height: '100%',
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  boton: {
    backgroundColor: '#c0392b',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
});