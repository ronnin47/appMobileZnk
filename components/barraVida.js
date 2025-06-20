import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Animated } from 'react-native';
import { AuthContext } from './AuthContext';
import socket from './socket';
import { LinearGradient } from 'expo-linear-gradient';

export const BarraVida = ({pj, ki, setKi, fortaleza, setFortaleza}) => {
const { personajes, savePersonajes } = useContext(AuthContext);
 //aca extrae el personaje
  const p = personajes.find(p => p.idpersonaje === pj.idpersonaje);

  //console.log("El persoanje que extraemos es: ",p.nombre)
  
 
  //este se anulo de aca porque los state estan en el componenete PantallaDeslizable
  //const [ki, setKi] = useState(ki);
  //const [fortaleza, setFortaleza] = useState(fortaleza);
//ACA LOS STATES
  const [nombre,setNombre]=useState(p.nombre);
  const [positiva, setPositiva] = useState(p.positiva != null ? String(p.positiva) : '');
  const [negativa, setNegativa] = useState(p.negativa != null ? String(p.negativa) : '');
  const [vidaActual, setVidaActual] = useState(p.vidaActual != null ? String(p.vidaActual) : '');
  const [cicatriz, setCicatriz] = useState(p.cicatriz != null ? String(p.cicatriz) : '');
  const [resistencia, setResistencia] = useState(p.resistencia != null ? String(p.resistencia) : '');
  


  //se refiere a la cantidad de vida por fase 
  const faseSalud = parseInt(ki) + parseInt(fortaleza);
    console.log(typeof faseSalud)


//aca la vida total en barra positiva y en barra negativa y el total de la suma de ambas
  const vidaTotalPositiva = faseSalud * parseInt(positiva);
  const vidaTotalNegativa = faseSalud * parseInt(negativa);
  const vidaTotal = vidaTotalPositiva + vidaTotalNegativa;
   

  //const damageActual= parseInt(vidaActual)

  const [damageActual, setDamageActual] = useState(parseInt(vidaActual));

  let porcentajeVidaPositivaInicial = (damageActual * 100) / vidaTotalPositiva;
  let porcentajeVidaNegativaInicial = 0;

  if (porcentajeVidaPositivaInicial > 100) {
    porcentajeVidaNegativaInicial = ((damageActual - vidaTotalPositiva) * 100) / vidaTotalNegativa;
    porcentajeVidaPositivaInicial = 100;
    porcentajeVidaNegativaInicial = porcentajeVidaNegativaInicial > 100 ? 100 : porcentajeVidaNegativaInicial;
  }
  
  
  const [estadoDeFase, setEstadoDeFase] = useState("SIN HERIDAS");
  const [porcentajeVidaPositiva, setPorcentajeVidaPositiva] = useState(porcentajeVidaPositivaInicial);
  const [porcentajeVidaNegativa, setPorcentajeVidaNegativa] = useState(porcentajeVidaNegativaInicial);
  const [consumirVida, setConsumirVida] = useState(0);
  
   useEffect(() => {
      const cicatrizValue = parseInt(cicatriz, 10);
      if (cicatrizValue > 0 && damageActual < cicatrizValue) {
        setDamageActual(cicatrizValue);
      }
    }, [cicatriz, damageActual]);
  
    useEffect(() => {
      if (parseInt(cicatriz) > 0) {
        if (damageActual < parseInt(cicatriz)) {
          setDamageActual(parseInt(cicatriz));
        }
      }
    }, [cicatriz, damageActual]);

  useEffect(() => {
    calcularEstadoInicial();
  }, []);

  const calcularEstadoInicial = () => {
    let newDamage = damageActual;

    if (newDamage <= vidaTotalPositiva && newDamage >= vidaTotalPositiva - faseSalud) {
      if (newDamage !== 0) {
        setEstadoDeFase("MALHERIDO");
      }
    }

    if (newDamage <= vidaTotalPositiva - faseSalud && newDamage >= vidaTotalPositiva - faseSalud * 2) {
      if (newDamage !== 0) {
        setEstadoDeFase("MALTRECHO");
      }
    }

    if (newDamage <= vidaTotalPositiva - faseSalud * 2 && newDamage >= vidaTotalPositiva - faseSalud * 3) {
      if (newDamage !== 0) {
        setEstadoDeFase("RAZGADO");
      }
    }

    if (newDamage <= vidaTotalPositiva - faseSalud * 3) {
      if (positiva >= 3 && newDamage !== 0) {
        setEstadoDeFase("RAZGADO");
      }
    }

    if (newDamage > vidaTotalPositiva && newDamage <= vidaTotalPositiva + faseSalud) {
      if (negativa === 1) {
        setEstadoDeFase("MORIBUNDO");
      } else if (negativa === 2) {
        setEstadoDeFase("INCAPACITADO");
      } else if (negativa >= 3) {
        setEstadoDeFase("INCONCIENTE");
      }
    }

    if (newDamage > vidaTotalPositiva + faseSalud && newDamage <= vidaTotalPositiva + faseSalud * 2) {
      if (negativa === 1 || negativa === 2) {
        setEstadoDeFase("MORIBUNDO");
      } else if (negativa >= 3) {
        setEstadoDeFase("INCAPACITADO");
      }
    }

    if (newDamage > vidaTotalPositiva + faseSalud * 2 && newDamage <= vidaTotalPositiva + faseSalud * 3) {
      if (negativa >= 3) {
        setEstadoDeFase("MORIBUNDO");
      }
    }

    if (newDamage > vidaTotal) {
      setEstadoDeFase("MUERTO");
    }

    if (newDamage === 0) {
      setEstadoDeFase("SIN HERIDAS");
    }
  };





  //const [animacionActiva, setAnimacionActiva] = useState(true);

  const handleChangeCicatriz=(event)=>{
    setCicatriz(event.target.value);
   }
   
/*************************hasta aca llegue******************************* */


const agregarDamage = async () => {
    console.log("FUE DAÑADO POR: ",consumirVida)
    let newValue = parseInt(consumirVida)|| 0;
    let newDamage = damageActual + newValue;
  
    console.log("FUNCIONA BOTON: ",consumirVida)
    
    

    if (newDamage < 0) {
      newDamage = 0; 
    }


     const cicatrizValue = parseInt(cicatriz, 10);
     if (cicatrizValue > 0 && newDamage < cicatrizValue) {
       newDamage = cicatrizValue;
     }
  
    setDamageActual(newDamage);
   
    if (newDamage <= vidaTotalPositiva) {
      setPorcentajeVidaPositiva((newDamage * 100) / vidaTotalPositiva);
      setPorcentajeVidaNegativa(0); 
    } else {
    
      const nuevoPorcentajeNegativa = ((newDamage - vidaTotalPositiva) * 100) / vidaTotalNegativa;
      const porcentajeNegativaAjustado = nuevoPorcentajeNegativa > 100 ? 100 : nuevoPorcentajeNegativa;
      setPorcentajeVidaPositiva(100);
      setPorcentajeVidaNegativa(porcentajeNegativaAjustado); 
    }
    
    let estadoDeFaseActual=""

    if(newDamage<=vidaTotalPositiva && newDamage>=(vidaTotalPositiva-faseSalud)){
      if(newDamage!==0){
      estadoDeFaseActual="MALHERIDO"
      setEstadoDeFase("MALHERIDO")
      }
   }
   
   if(newDamage<=(vidaTotalPositiva-faseSalud) && newDamage>=(vidaTotalPositiva-faseSalud*2)){
    if(newDamage!==0){
      estadoDeFaseActual="MALTRECHO"
      setEstadoDeFase("MALTRECHO")
    }
  }
  if(newDamage<=(vidaTotalPositiva-faseSalud*2) && newDamage>=(vidaTotalPositiva-faseSalud*3)){
    if(newDamage!==0){
     estadoDeFaseActual="RAZGADO"
     setEstadoDeFase("RAZGADO")
    }
  }

  if(newDamage<=(vidaTotalPositiva-faseSalud*3)){
    if(positiva>=3){
      if(newDamage!==0){
        estadoDeFaseActual="RAZGADO"
        setEstadoDeFase("RAZGADO")
       }
    } 
}

   if(newDamage>vidaTotalPositiva && newDamage<=(vidaTotalPositiva+faseSalud)){    
   
    if(negativa==1){
       setEstadoDeFase("MORIBUNDO")
    }else if(negativa==2){
      estadoDeFaseActual="INCAPACITADO"
      setEstadoDeFase("INCAPACITADO")
    }else if(negativa>=3){
      estadoDeFaseActual="INCONCIENTE"
      setEstadoDeFase("INCONCIENTE")
    }
   }

   if(newDamage>(vidaTotalPositiva+faseSalud) && newDamage<=(vidaTotalPositiva+faseSalud*2)){

    if(negativa==1){
      estadoDeFaseActual="MORIBUNDO"
      setEstadoDeFase("MORIBUNDO")
   }else if(negativa==2){
    estadoDeFaseActual="MORIBUNDO" 
    setEstadoDeFase("MORIBUNDO")
   }else if(negativa>=3){
     estadoDeFaseActual="INCAPACITADO"
     setEstadoDeFase("INCAPACITADO")
   }
    //estadoDeFase="fase iNCAPACITADO"
   }
   if(newDamage>(vidaTotalPositiva+faseSalud*2) && newDamage<=(vidaTotalPositiva+faseSalud*3)){
    
    if(negativa==1){
       estadoDeFaseActual=""
      setEstadoDeFase("")
   }else if(negativa==2){
     estadoDeFaseActual=""
     setEstadoDeFase("")
   }else if(negativa>=3){
     estadoDeFaseActual="MORIBUNDO"
     setEstadoDeFase("MORIBUNDO")
   }
    //estadoDeFase="fase MORIBUNDO"
   }
  
   if(newDamage > vidaTotal){
     estadoDeFaseActual="MUERTO"
    setEstadoDeFase("MUERTO")
  }

  if(newDamage == 0){
     estadoDeFaseActual="SIN HERIDAS"
    setEstadoDeFase("SIN HERIDAS")
  }



    let aturdimiento="";
    //catidad de fase positivas, cantidad de fases negativas
    if(newValue>=faseSalud){
      aturdimiento="****ATURDIDO*****"
    }

    let estadoSalud
    if(newDamage>vidaTotalPositiva){
      if(newDamage<=vidaTotal){
          estadoSalud=`barra negativa ${aturdimiento}`
      }else if(newDamage>vidaTotal){
        estadoSalud=`********************* ${nombre} MUERTO ********************* ${aturdimiento}`
      }
      
    }else if(newDamage<=vidaTotalPositiva){
      estadoSalud=`barra positiva ${aturdimiento}`
    }


    let message

    if(newValue>0){
        message = `  Recibio ${newValue} p de DAÑO    VITALIDAD: ${newDamage} / ${vidaTotal}    ${estadoDeFaseActual}   ${estadoSalud}`;
    }else if(newValue<0){
        let recuperado=-(newValue)
        message = `   Restauro ${recuperado} p de VIDA     VITALIDAD: ${newDamage} / ${vidaTotal}                             ${estadoDeFaseActual}   ${estadoSalud}`;
    }else {
        message = `    VITALIDAD: ${newDamage} / ${vidaTotal}     ${estadoDeFaseActual}  ${estadoSalud}`;
    }
  
  
   
     // Emitiendo el objeto con idpersonaje, kenActual y ken
      const msgEnviar = {
        idpersonaje: p.idpersonaje,    
        nombre:nombre,
        vidaActual: newDamage,         
        vidaTotal: vidaTotal,                   
        mensaje: message            
    };
    
    socket.emit('chat-message', msgEnviar);
   
  };



  const estaMuerto = damageActual > vidaTotal;

  const handlePos=(event)=>{
    const newPos=parseInt(event.target.value)
    setPositiva(newPos)
  }
  const handleNeg=(event)=>{
    const newNeg=parseInt(event.target.value)
    setNegativa(newNeg)
  }
  const curarFase=async()=>{
    setConsumirVida("")
    setConsumirVida(-(faseSalud))
    if(consumirVida==-(faseSalud)){
      agregarDamage();
      setConsumirVida("")
    }
   
  }

//ESTO ES PARA LA LOGICA INTERNA DE GUARDAR LOS CAMBIOS EN CON STATES Y UN ARRAY CON USE CONTEXT
 const guardarCambios = () => {
   
  const index = personajes.findIndex(per => per.idpersonaje === p.idpersonaje);
  if (index === -1) return; // por seguridad, si no se encuentra el personaje
 
  const nuevosPersonajes = [...personajes];


  nuevosPersonajes[index] = {
    ...nuevosPersonajes[index],

   
    positiva:positiva,
    negativa:negativa,
    vidaActual:damageActual,
    cicatriz: cicatriz,  
    resistencia:resistencia,
  
 
  };

  savePersonajes(nuevosPersonajes); 
}

useEffect(() => {
 guardarCambios();
}, [ 
  
  positiva,
  negativa,
  damageActual,
  cicatriz,
  resistencia,
]);
//<Text style={styles.estadoText}>{estadoDeFase}</Text>
return (
  <View style={styles.container}>
    

    {/* Barra positiva */}
    <View style={styles.barraContenedor}>
      <View style={[styles.barraAmarilla, { width: '100%' }]} />

      <LinearGradient
        colors={['#8B0000', '#B22222', '#FF4500']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.barraRoja,
          { width: `${Math.min((damageActual / vidaTotalPositiva) * 100, 100)}%` },
        ]}
      />

      {/* Mostrar texto solo si NO hay daño negativo */}
      {damageActual <= vidaTotalPositiva && (
          <Text style={styles.textoVidaEnBarra}>
        Vida: {damageActual}/{vidaTotal}{" "}
        <Text style={styles.estadoText}>{estadoDeFase}</Text>
      </Text>
      )}
    </View>

    {/* Barra negativa, solo si hay daño más allá de la positiva */}
    {damageActual > vidaTotalPositiva && (
      <View style={styles.barraContenedor}>
        <View style={[styles.barraAmarilla, { width: '100%' }]} />

        <LinearGradient
          colors={['#4B0082', '#8A2BE2', '#DDA0DD']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.barraVioleta,
            {
              width: `${Math.min(
                ((damageActual - vidaTotalPositiva) / vidaTotalNegativa) * 100,
                100
              )}%`,
            },
          ]}
        />

        {/* Mostrar texto dentro de la barra negativa si hay daño negativo */}
         <Text style={styles.textoVidaEnBarra}>
        Vida: {damageActual}/{vidaTotal}{" "}
        <Text style={styles.estadoText}>{estadoDeFase}</Text>
      </Text>
      </View>
    )}

   <View style={styles.fila}>
  <TextInput
    style={styles.input}
    placeholder="ingresa daño"
    placeholderTextColor="#aaa"
    value={String(consumirVida)}
    onChangeText={setConsumirVida}
    keyboardType="numbers-and-punctuation"
  />

 <LinearGradient
    colors={['#4B0000', '#8B0000', '#FF2D2D']} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.boton}
    >
      <TouchableOpacity style={styles.botonInterno} onPress={agregarDamage}>
        <Text style={styles.botonTexto}>Aplicar Daño</Text>
      </TouchableOpacity>
  </LinearGradient>
    </View>
  </View>
);
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    padding: 16,
    alignItems: 'center',
  },
  estadoText: {
    color: 'black',
    marginBottom: 6,
    fontSize: 14,
    fontFamily: 'sans-serif-condensed',
  },
  vidaText: {
    color: '#fff',
    marginBottom: 6,
    fontSize: 16,
  },
  barraContenedor: {
    width: '100%',
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 4,
    position: 'relative',
    backgroundColor: '#333',
  },
  barraAmarilla: {
    position: 'absolute',
    height: '100%',
    backgroundColor: 'yellow',
    left: 0,
    width: '100%',
  },
  barraRoja: {
    position: 'absolute',
    height: '100%',
    borderRadius: 8,
    left: 0,
    borderColor: 'white',  // <-- así va el color en string
  borderWidth: 1,        // No olvides poner el ancho del borde
  },
  barraVioleta: {
    position: 'absolute',
    height: '100%',
    borderRadius: 8,
    left: 0,
    borderColor: 'white',  // <-- así va el color en string
  borderWidth: 1,        // No olvides poner el ancho del borde
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 8,
    color: 'white',
    backgroundColor: '#1a1a1a',
    borderRadius: 6,
    marginTop: 10,
    width: '60%',
    textAlign: 'center',
      flex: 1,
  },
 
textoVidaEnBarra: {
  position: 'absolute',
  width: '100%',
  height: '100%',
  textAlign: 'center',
  color: 'black',
  fontWeight: 'bold',
  fontSize: 18,
  textAlignVertical: 'center', // Android
  includeFontPadding: false,   // iOS
  lineHeight: 16,              // Coincidir con la altura de la barra
  zIndex: 10,
  
},
fila: {
  flexDirection: "row",
  alignItems: "center",
  gap:5,
},



boton: {
  marginTop: 10,
  borderRadius: 6,
  padding: 1, // espacio alrededor del botón interno para mostrar el gradiente
},

botonInterno: {
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 6,
  alignItems: 'center',
  justifyContent: 'center', // ✅ centra verticalmente el texto
},

botonTexto: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 16,
  fontFamily: 'sans-serif-condensed',
}
});