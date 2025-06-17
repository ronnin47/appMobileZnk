import { useEffect, useState, useRef } from "react"
import 'animate.css';
import { io } from 'socket.io-client';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Swal from 'sweetalert2';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

import { BarraKen } from './barraKen.jsx';
import { BarraKi } from './barraKi.jsx';
import {BarraVida} from "./barraVida.jsx";

import Modal from 'react-bootstrap/Modal';


const socket = io(process.env.REACT_APP_BACKEND_URL);
//REACT_APP_BACKEND_URL=https://tu-backend-en-render.onrender.com



function generarNumerosAzarSinRangoMin(cantidad, rangoMax) {
  var numeros = [];
  for (var i = 0; i < cantidad; i++) {
      var numero = Math.floor(Math.random() * rangoMax) + 1; 
      numeros.push(numero);
  }
  return numeros;
}
//************************ */
/*
const Pj = ({ idpersonaje, nombre, imagen, pjSeleccionado, setPjSeleccionado }) => {
  
  const seleccionar = (idpersonaje) => {
    //console.log("funciona seleccionar pj", idpersonaje);
    setPjSeleccionado(idpersonaje);  // Establecer el pj seleccionado
  };

  // Renderizando el Tooltip con el nombre
  const renderTooltip = (nombre) => (
    <Tooltip id={`tooltip-${idpersonaje}`} style={{textAlign: 'center' }}>
      {nombre}
    </Tooltip>
  );

  return (
    <OverlayTrigger
      placement="top" // Puedes elegir entre "top", "bottom", "left", "right"
      overlay={renderTooltip(nombre)}  // Aquí se pasa el tooltip con el nombre
    >
      <img 
        onClick={() => seleccionar(idpersonaje)} 
        src={imagen} 
        className='grupo-card-image' 
        style={{ 
          width: "50px", 
          height: "50px", 
          cursor: "pointer",
          border: idpersonaje === pjSeleccionado ? '3px solid white' : 'none', // Borde más grueso
          boxShadow: idpersonaje === pjSeleccionado ? '0 0 10px rgba(255, 255, 255, 0.8)' : 'none' // Efecto de sombra para hacerlo más llamativo
        }} 
      />
    </OverlayTrigger>
  );
};
*/




export const Tiradas = ({
  dataIncrementos,setDataIncrementos,
  mostrarIncremetos,setMostrarIncrementos,

  idpersonaje,
  cicatriz,
  fortaleza, 
  ki, 
  ken,
  positiva,
  negativa,                 
  damageActual, 
  consumision,
  kiActual,
  kenActual,
  personajes,
  setPersonajes,
  imagen,
  conviccion,
  isChecked,
  setIsChecked,
  textareaRef, 
  messagesEndRef,
  nombre,
  setMessage,
  sock,
  setSock,
  fuerza,
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
  add1,
  valAdd1,
  add2,
  valAdd2,
  add3,
  valAdd3,
  add4,
  valAdd4,         
  vidaActual,
  iniciativa,
  pjsCombinados,
  setPjsCombinados,
  pjSeleccionado,
  setPjSeleccionado,
  resistencia,

}) => {

const [valTirada,setValTirada]=useState("");
const [sumaTirada,setSumaTirada]=useState("");
const [valTiradaD6,setValTiradaD6]=useState("");
const [valTiradaD4,setValTiradaD4]=useState("");
const [valTiradaD12,setValTiradaD12]=useState("");
const [valTiradaD10,setValTiradaD10]=useState("");
const [valTiradaD20,setValTiradaD20]=useState("");
const [valTiradaD10Bono,setValTiradaD10Bono]=useState("");
const [principal,setPrincipal]=useState("");
const [secundaria,setSecundaria]=useState("");




 const tirarDados=()=>{
  const principalValue = principal === "" ? 0 : parseInt(principal);
  const secundariaValue = secundaria === "" ? 0 : parseInt(secundaria);
    let base=1
    if(principal==0){
      base=0
    }
  let cantD10= Math.floor(principal / 10)+base;
  let tirada=generarNumerosAzarSinRangoMin(cantD10,10);
  let d12=generarNumerosAzarSinRangoMin(dadosD12Bono,12);
  let d6=generarNumerosAzarSinRangoMin(dadosD6Bono,6);
  let d4=generarNumerosAzarSinRangoMin(dadosD4Bono,4);
  let d10=generarNumerosAzarSinRangoMin(dadosD10,10);
  let d20=generarNumerosAzarSinRangoMin(dadosD20,20);
  let d10Bono=generarNumerosAzarSinRangoMin(dadosD10Bono,10);

  let sumaTirada = tirada.reduce((acumulador, valorActual) => acumulador + valorActual, 0);
  

  let sumaD12= d12.reduce((acumulador, valorActual)=> acumulador +valorActual,0);
  let sumaD6= d6.reduce((acumulador, valorActual)=> acumulador +valorActual,0);
  let sumaD4= d4.reduce((acumulador, valorActual)=> acumulador +valorActual,0);

  let sumaD10= d10.reduce((acumulador, valorActual) => acumulador + valorActual, 0);
  let sumaD20= d20.reduce((acumulador, valorActual) => acumulador + valorActual, 0)
  let sumaD10Bono= d10Bono.reduce((acumulador, valorActual) => acumulador + valorActual, 0);

  let total=sumaTirada+parseInt(principalValue)+parseInt(secundariaValue)+sumaD10+sumaD20+sumaD10Bono+sumaD6+sumaD4+sumaD12
  
  setValTirada(tirada.join(", "))

  setValTiradaD12(d12.join(", "))
  setValTiradaD6(d6.join(", "))
  setValTiradaD4(d4.join(", "))

  setValTiradaD10(d10.join(", "))
  setValTiradaD10(d10.join(", "))
  setValTiradaD20(d20.join(", "))
  setValTiradaD10Bono(d10Bono.join(", "))
  
  setSumaTirada(total)
  let imprimirTirada
  let imprimirBase
  
  let imprimirBonoD12;
  let imprimirBonoD6;
  let imprimirBonoD4;

  let imprimirBonoD10;
  let imprimirBonoD20;
  let imprimirBonoKen;

const baset=principalValue+secundariaValue

  if(baset>0){
    imprimirBase=`Base:    ${baset}`
  }else{
    imprimirBase="";
  }

  if(tirada.length>0){
    imprimirTirada=`D10 esfuerzo:    ${tirada.join(", ")}`
  }else{
    imprimirTirada="";
  }

  if(d12.length>0){
    imprimirBonoD12=`Bono D12:    ${d12.join(", ")}`
  }else{
    imprimirBonoD12="";
  }

  if(d6.length>0){
    imprimirBonoD6=`Bono D6:    ${d6.join(", ")}`
  }else{
    imprimirBonoD6="";
  }

  if(d4.length>0){
    imprimirBonoD4=`Bono D4:    ${d4.join(", ")}`
  }else{
    imprimirBonoD4="";
  }

  if(d10.length>0){
    imprimirBonoD10=`Bono D10:    ${d10.join(", ")}`
  }else{
    imprimirBonoD10="";
  }

  if(d20.length>0){
    imprimirBonoD20=`Bono D20:    ${d20.join(", ")}`
  }else{
    imprimirBonoD20="";
  }

  if(d10Bono.length>0){
    imprimirBonoKen=`Bono D10 KEN:    ${d10Bono.join(", ")}`
  }else{
    imprimirBonoKen="";
  }
  
  const message = `     Tirada  ${nombreTirada}      ${imprimirBase}     ${imprimirTirada}       ${imprimirBonoD10}        ${imprimirBonoD20}        ${imprimirBonoKen}         ${imprimirBonoD6}        ${imprimirBonoD4}       ${imprimirBonoD12}       TOTAL: ${total}`;
  
  const msgEnviar={
    nombre:nombre,
    mensaje:message
  }
 
  setAnimacionActiva(true);
  setTimeout(() => {
  setAnimacionActiva(false); 
}, 1000); 
  
  socket.emit('message', msgEnviar);
  setMessage('');
  setNombreTirada("");


  if(isChecked){
    setDadosD12Bono(0);
    setDadosD6Bono(0);
    setDadosD4Bono(0);
    setDadosD10(0);
    setDadosD20(0);
    setDadosD10Bono(0);
    setPrincipal("");
    setSecundaria("");
  }


}

/********************************* */

const [dadosD12Bono,setDadosD12Bono]=useState(0);
const [dadosD6Bono,setDadosD6Bono]=useState(0);
const [dadosD4Bono,setDadosD4Bono]=useState(0);
const [dadosD10,setDadosD10]=useState(0);
const [dadosD20,setDadosD20]=useState(0);
const [dadosD10Bono,setDadosD10Bono]=useState(0);
const [nombreTirada,setNombreTirada]=useState("");
const [selectedButton, setSelectedButton] = useState(1);


const addD10=()=>{
  setDadosD10(dadosD10+1)
}
const restD10=()=>{
  setDadosD10(dadosD10-1)
}
const addD20=()=>{
  setDadosD20(dadosD20+1)
}
const restD20=()=>{
  setDadosD20(dadosD20-1)
}
const addD10Bono=()=>{
  setDadosD10Bono(dadosD10Bono+1)
}
const restD10Bono=()=>{
  setDadosD10Bono(dadosD10Bono-1)
}
const addD12Bono=()=>{
  setDadosD12Bono(dadosD12Bono+1)
}
const restD12Bono=()=>{
  setDadosD12Bono(dadosD12Bono-1)
}
const addD6Bono=()=>{
  setDadosD6Bono(dadosD6Bono+1)
}
const restD6Bono=()=>{
  setDadosD6Bono(dadosD6Bono-1)
}
const addD4Bono=()=>{
  setDadosD4Bono(dadosD4Bono+1)
}
const restD4Bono=()=>{
  setDadosD4Bono(dadosD4Bono-1)
}
const handlePrincipal=(event)=>{
 setPrincipal(event.target.value)
}
const handleSecundaria=(event)=>{
  setSecundaria(event.target.value)
}
/*
const [boton1, setBoton1] = useState(() => {
  const storedValue = localStorage.getItem(`boton1_${nombre}`);
  return storedValue ? JSON.parse(storedValue) : "Boton 1";
});
const [boton2, setBoton2] = useState(() => {
  const storedValue = localStorage.getItem(`boton2_${nombre}`);
  return storedValue ? JSON.parse(storedValue) : "Boton 2";
});
const [boton3, setBoton3] = useState(() => {
  const storedValue = localStorage.getItem(`boton3_${nombre}`);
  return storedValue ? JSON.parse(storedValue) : "Boton 3";
});
const [boton4, setBoton4] = useState(() => {
  const storedValue = localStorage.getItem(`boton4_${nombre}`);
  return storedValue ? JSON.parse(storedValue) : "Boton 4";
});
const [boton5, setBoton5] = useState(() => {
  const storedValue = localStorage.getItem(`boton5_${nombre}`);
  return storedValue ? JSON.parse(storedValue) : "Boton 5";
});
const [boton6, setBoton6] = useState(() => {
  const storedValue = localStorage.getItem(`boton6_${nombre}`);
  return storedValue ? JSON.parse(storedValue) : "Boton 6";
});
const [boton7, setBoton7] = useState(() => {
  const storedValue = localStorage.getItem(`boton7_${nombre}`);
  return storedValue ? JSON.parse(storedValue) : "Boton 7";
});
const [boton8, setBoton8] = useState(() => {
  const storedValue = localStorage.getItem(`boton8_${nombre}`);
  return storedValue ? JSON.parse(storedValue) : "Boton 8";
});
const [boton9, setBoton9] = useState(() => {
  const storedValue = localStorage.getItem(`boton9_${nombre}`);
  return storedValue ? JSON.parse(storedValue) : "Boton 9";
});
const [boton10, setBoton10] = useState(() => {
  const storedValue = localStorage.getItem(`boton10_${nombre}`);
  return storedValue ? JSON.parse(storedValue) : "Boton 10";
});

*/
/*
const guardarTiradaMacro=()=>{
 Swal.fire({
  title: `Deseas guardar la accion ${nombreTirada} en el boton ${selectedButton}?`,
  showDenyButton: true,
  showCancelButton: true,
  confirmButtonText: "Guardar",
  denyButtonText: `No guardar`
}).then((result) => {
  
  if (result.isConfirmed) {
    const tirada = {
      principal: principal || 0,
      secundaria: secundaria || 0,
      dadosD10: dadosD10 || 0,
      dadosD20: dadosD20 || 0,
      dadosD10Bono: dadosD10Bono || 0,
      dadosD6Bono: dadosD6Bono || 0,
      dadosD4Bono: dadosD4Bono || 0,
      dadosD12Bono: dadosD12Bono || 0,
      nombreTirada: nombreTirada,
      nombre:nombre,
    };
    
    localStorage.setItem(`boton${selectedButton}_${nombre}`, JSON.stringify(tirada));
    
    switch(selectedButton){
      case 1:
        setBoton1(tirada);
      break
      case 2:
        setBoton2(tirada);
      break
      case 3:
        setBoton3(tirada);
      break
      case 4:
        setBoton4(tirada);
      break
      case 5:
        setBoton5(tirada);
      break
      case 6:
        setBoton6(tirada);
      break
      case 7:
        setBoton7(tirada);
      break
      case 8:
        setBoton8(tirada);
      break
      case 9:
        setBoton9(tirada);
      break
      case 10:
        setBoton10(tirada);
      break
    }
    
    setNombreTirada("");

    Swal.fire("Accion guardada!", "", "tirada guardada");
  } else if (result.isDenied) {
    Swal.fire("La accion no se guardo", "", "info");
    setNombreTirada("");
  }
});

}*/

const handleInputChange = (event) => {
  setSelectedButton(parseInt(event.target.value, 10));
};

/*
const cargarTirada1=()=>{
  //presenta el nombre de la tirada que queria coco
  // acaaaaaaaaaaaa
  setSelectedButton(1);
   setNombreTirada(boton1.nombreTirada || "Accion-1")
   const principal1=parseInt(boton1.principal) || 0;
   setPrincipal(principal1);
   const secundaria1=parseInt(boton1.secundaria) || 0;
   setSecundaria(secundaria1);
   const dadosD101=parseInt(boton1.dadosD10) || 0;
   setDadosD10(dadosD101);
   const dadosD10Bono1=parseInt(boton1.dadosD10Bono) || 0;
   setDadosD10Bono(dadosD10Bono1)
   const dadosD201=parseInt(boton1.dadosD20) || 0;
   setDadosD20(dadosD201); 
   const dadosD061=parseInt(boton1.dadosD6Bono) || 0;
   setDadosD6Bono(dadosD061); 
   const dadosD041=parseInt(boton1.dadosD4Bono) || 0;
   setDadosD4Bono(dadosD041);
   const dadosD121=parseInt(boton1.dadosD12Bono) || 0;
   setDadosD12Bono(dadosD121); 
}

const cargarTirada2=()=>{
  setSelectedButton(2);
  setNombreTirada(boton2.nombreTirada || "Accion-2")
  const principal2=boton2.principal || 0;
  setPrincipal(principal2);
  const secundaria2=boton2.secundaria  || 0;
  setSecundaria(secundaria2);
  const dadosD102=boton2.dadosD10  || 0;
  setDadosD10(dadosD102);
  const dadosD10Bono2=boton2.dadosD10Bono  || 0;
  setDadosD10Bono(dadosD10Bono2)
  const dadosD202=boton2.dadosD20  || 0;
  setDadosD20(dadosD202); 
  const dadosD062=boton2.dadosD6Bono  || 0;
  setDadosD6Bono(dadosD062); 
  const dadosD042=boton2.dadosD4Bono  || 0;
  setDadosD4Bono(dadosD042); 
  const dadosD122=parseInt(boton2.dadosD12Bono) || 0;
  setDadosD12Bono(dadosD122); 
}
const cargarTirada3=()=>{
  setSelectedButton(3);
  setNombreTirada(boton3.nombreTirada || "Accion-3")
  const principal3=boton3.principal  || 0;
  setPrincipal(principal3);
  const secundaria3=boton3.secundaria  || 0;
  setSecundaria(secundaria3);
  const dadosD103=boton3.dadosD10  || 0;
  setDadosD10(dadosD103);
  const dadosD10Bono3=boton3.dadosD10Bono  || 0;
  setDadosD10Bono(dadosD10Bono3)
  const dadosD203=boton3.dadosD20  || 0;
  setDadosD20(dadosD203); 
  const dadosD063=boton3.dadosD6Bono  || 0;
  setDadosD6Bono(dadosD063); 
  const dadosD043=boton3.dadosD4Bono  || 0;
  setDadosD4Bono(dadosD043);
  const dadosD123=parseInt(boton3.dadosD12Bono) || 0;
  setDadosD12Bono(dadosD123);  
}
const cargarTirada4=()=>{
  setSelectedButton(4);
  setNombreTirada(boton4.nombreTirada || "Accion-4")
  const principal4=boton4.principal  || 0;
  setPrincipal(principal4);
  const secundaria4=boton4.secundaria  || 0;
  setSecundaria(secundaria4);
  const dadosD104=boton4.dadosD10  || 0;
  setDadosD10(dadosD104);
  const dadosD10Bono4=boton4.dadosD10Bono  || 0;
  setDadosD10Bono(dadosD10Bono4)
  const dadosD204=boton4.dadosD20  || 0;
  setDadosD20(dadosD204); 
  const dadosD064=boton4.dadosD6Bono  || 0;
  setDadosD6Bono(dadosD064); 
  const dadosD044=boton4.dadosD4Bono  || 0;
  setDadosD4Bono(dadosD044);
  const dadosD124=parseInt(boton4.dadosD12Bono) || 0;
  setDadosD12Bono(dadosD124);  
}
const cargarTirada5=()=>{
  setSelectedButton(5);
  setNombreTirada(boton5.nombreTirada || "Accion-5")
  const principal5=boton5.principal  || 0;
  setPrincipal(principal5);
  const secundaria5=boton5.secundaria  || 0;
  setSecundaria(secundaria5);
  const dadosD105=boton5.dadosD10  || 0;
  setDadosD10(dadosD105);
  const dadosD10Bono5=boton5.dadosD10Bono  || 0;
  setDadosD10Bono(dadosD10Bono5)
  const dadosD205=boton5.dadosD20  || 0;
  setDadosD20(dadosD205); 
  const dadosD065=boton5.dadosD6Bono  || 0;
  setDadosD6Bono(dadosD065); 
  const dadosD045=boton5.dadosD4Bono  || 0;
  setDadosD4Bono(dadosD045);
  const dadosD125=parseInt(boton5.dadosD12Bono) || 0;
  setDadosD12Bono(dadosD125);  
}
const cargarTirada6=()=>{
  setSelectedButton(6);
  setNombreTirada(boton6.nombreTirada || "Accion-6")
  const principal6=boton6.principal  || 0;
  setPrincipal(principal6);
  const secundaria6=boton6.secundaria  || 0;
  setSecundaria(secundaria6);
  const dadosD106=boton6.dadosD10  || 0;
  setDadosD10(dadosD106);
  const dadosD10Bono6=boton6.dadosD10Bono  || 0;
  setDadosD10Bono(dadosD10Bono6)
  const dadosD206=boton6.dadosD20  || 0;
  setDadosD20(dadosD206); 
  const dadosD066=boton6.dadosD6Bono  || 0;
  setDadosD6Bono(dadosD066); 
  const dadosD046=boton6.dadosD4Bono  || 0;
  setDadosD4Bono(dadosD046); 
  const dadosD126=parseInt(boton6.dadosD12Bono) || 0;
  setDadosD12Bono(dadosD126); 
}
const cargarTirada7=()=>{
  setSelectedButton(7);
  setNombreTirada(boton7.nombreTirada || "Accion-7")
  const principal7=boton7.principal  || 0;
  setPrincipal(principal7);
  const secundaria7=boton7.secundaria  || 0;
  setSecundaria(secundaria7);
  const dadosD107=boton7.dadosD10  || 0;
  setDadosD10(dadosD107);
  const dadosD10Bono7=boton7.dadosD10Bono  || 0;
  setDadosD10Bono(dadosD10Bono7)
  const dadosD207=boton7.dadosD20  || 0;
  setDadosD20(dadosD207); 
  const dadosD067=boton7.dadosD6Bono  || 0;
  setDadosD6Bono(dadosD067); 
  const dadosD047=boton7.dadosD4Bono  || 0;
  setDadosD4Bono(dadosD047); 
  const dadosD127=parseInt(boton7.dadosD12Bono) || 0;
  setDadosD12Bono(dadosD127); 
}
const cargarTirada8=()=>{
  setSelectedButton(8);
  setNombreTirada(boton8.nombreTirada|| "Accion-8")
  const principal8=boton8.principal  || 0;
  setPrincipal(principal8);
  const secundaria8=boton8.secundaria  || 0;
  setSecundaria(secundaria8);
  const dadosD108=boton8.dadosD10  || 0;
  setDadosD10(dadosD108);
  const dadosD10Bono8=boton8.dadosD10Bono  || 0;
  setDadosD10Bono(dadosD10Bono8)
  const dadosD208=boton8.dadosD20  || 0;
  setDadosD20(dadosD208); 
  const dadosD068=boton8.dadosD6Bono  || 0;
  setDadosD6Bono(dadosD068); 
  const dadosD048=boton8.dadosD4Bono  || 0;
  setDadosD4Bono(dadosD048);
  const dadosD128=parseInt(boton8.dadosD12Bono) || 0;
  setDadosD12Bono(dadosD128);  
}
const cargarTirada9=()=>{
  setSelectedButton(9);
  setNombreTirada(boton9.nombreTirada || "Accion-9")
  const principal9=boton9.principal  || 0;
  setPrincipal(principal9);
  const secundaria9=boton9.secundaria  || 0;
  setSecundaria(secundaria9);
  const dadosD109=boton9.dadosD10  || 0;
  setDadosD10(dadosD109);
  const dadosD10Bono9=boton9.dadosD10Bono  || 0;
  setDadosD10Bono(dadosD10Bono9)
  const dadosD209=boton9.dadosD20  || 0;
  setDadosD20(dadosD209); 
  const dadosD069=boton9.dadosD6Bono  || 0;
  setDadosD6Bono(dadosD069); 
  const dadosD049=boton9.dadosD4Bono  || 0;
  setDadosD4Bono(dadosD049); 
  const dadosD129=parseInt(boton9.dadosD12Bono) || 0;
  setDadosD12Bono(dadosD129); 
}
const cargarTirada10=()=>{
  setSelectedButton(10);
  setNombreTirada(boton10.nombreTirada || "Accion-10")
  const principal10=boton10.principal  || 0;
  setPrincipal(principal10);
  const secundaria10=boton10.secundaria  || 0;
  setSecundaria(secundaria10);
  const dadosD1010=boton10.dadosD10  || 0;
  setDadosD10(dadosD1010);
  const dadosD10Bono10=boton10.dadosD10Bono  || 0;
  setDadosD10Bono(dadosD10Bono10)
  const dadosD2010=boton10.dadosD20  || 0;
  setDadosD20(dadosD2010); 
  const dadosD0610=boton10.dadosD6Bono  || 0;
  setDadosD6Bono(dadosD0610); 
  const dadosD0410=boton10.dadosD4Bono  || 0;
  setDadosD4Bono(dadosD0410); 
  const dadosD1210=parseInt(boton10.dadosD12Bono) || 0;
  setDadosD12Bono(dadosD1210); 
}

const handleNombreTirada=(event)=>{
  setNombreTirada(event.target.value)
}
*/

const [mensajeChat,setMensajeChat]=useState("")

const handleChangeM=(event)=>{
  setMensajeChat(event.target.value)
}
const enviar=()=>{
const msgEnviar={
  nombre:nombre,
  mensaje:mensajeChat
}

  if(msgEnviar.mensaje.includes("+")){
  
 
    setDataIncrementos([...dataIncrementos,msgEnviar])
 
  }  

  socket.emit('message', msgEnviar);
  setMessage('')
  setMensajeChat("")
}


/*

useEffect(()=>{
  dataIncrementos.map((pj)=>{
  console.log(`
    nombre: ${pj.nombre}
    incremento: ${pj.mensaje}`)
  })
//console.log("",dataIncrementos)
},[dataIncrementos])
*/

useEffect(() => {
  if (textareaRef.current) {
    textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
  }
}, [sock]);


const handleKeyPress = (event) => {
  if (event.key === 'Enter') {
    event.preventDefault(); 
    enviar();
  }
};




  // Maneja el cambio del checkbox
  const handleToggleChange = (event) => {
    setIsChecked(event.target.checked); // Actualiza el estado a true o false
  };

const renderTooltip = (props) => (
  <Tooltip id="button-tooltip" {...props}>
    Limpiar dados
  </Tooltip>
);



//aca lo vamos resolviendo
const [cicatrizN,setCicatrizN]=useState(cicatriz);

const [damageActualN,setDamageActualN]=useState(damageActual);
const [fortalezaN,setFortalezaN]=useState(fortaleza)
const [positivaN,setPositivaN]=useState(positiva);
const [negativaN,setNegativaN]=useState(negativa);
const [kenN,setKenN]=useState(ken)
const [kiN,setKiN]=useState(ki)
const [consumisionN,setConsumisionN]=useState(consumision)

const [kenActualN,setKenActualN]=useState(kenActual);
const [kiActualN,setKiActualN]=useState(kiActual);






const btnGuardarCambios = () => {
   
  const index = personajes.findIndex(pj => pj.idpersonaje == idpersonaje);

  const nuevosPersonajes = [...personajes];


  nuevosPersonajes[index] = {
    ...nuevosPersonajes[index],

    
   // ken:kenN,
  // ki:kiN,
   
    //fortaleza: fortalezaN,
   
    kenActual:kenActualN,
    kiActual:kiActualN,
    positiva:positivaN,
    negativa:negativaN,
    vidaActual:damageActualN,
  
    consumision: consumisionN,
  
    cicatriz: cicatrizN,  
  };


  setPersonajes(nuevosPersonajes);

}
useEffect(() => {
  btnGuardarCambios();
 }, [ 
  
  // kenN,
  //  kiN,
 
   //fortalezaN,
  
   kenActualN,
   kiActualN,
   positivaN,
   negativaN,
   damageActualN,
  
   consumisionN,
  
   cicatrizN,
   
 ]);



 const [showModal, setShowModal] = useState(false);

  const handleClose = () => setShowModal(false);
  
  const handleShow = () => setShowModal(true);


  //************es para el modal de ficha************

  const [showModalFicha, setShowModalFicha] = useState(false);

  const handleCloseFicha = () => setShowModalFicha(false);
  
  const handleShowFicha = () => setShowModalFicha(true);






  //incrementos
const incrementos=()=>{
  setMostrarIncrementos(!mostrarIncremetos)
}


  return (
    <>
      {mostrarIncremetos?(
       <FlotanteIncrementos dataIncrementos={dataIncrementos}></FlotanteIncrementos>):(<></>)}

      <div className="container" style={{display:"flex", flexDirection:"row", justifyContent:"center",alignItems:"center",marginTop:"1em",marginBottom:"2em"}}>
      <input type="text" className="chatcito" value={mensajeChat} onChange={handleChangeM} onKeyPress={handleKeyPress}/>
      <button className="btn btn-primary" onClick={enviar} style={{marginLeft:"10px"}}>enviar</button>
      <button className="btn btn-warning" onClick={()=>incrementos()} style={{marginLeft:"10px"}}>incrementos</button>
      </div>

      <div className="container" style={{display:"flex",   flexWrap: "wrap", gap:"0.5em", color:"yellow", justifyContent:"center", marginBottom:"1em"}}>

      {pjsCombinados.map((pj)=>(  
        <Pj key={pj.idpersonaje} idpersonaje={pj.idpersonaje} nombre={pj.nombre} imagen={pj.imagen} pjSeleccionado={pjSeleccionado} setPjSeleccionado={setPjSeleccionado}></Pj>
      ))}
      </div>

      <div className="container" style={{ display: "flex", alignItems: "center" }}>
      <img 
        src={imagen} 
        onClick={handleShow} 
        className='grupo-card-image' 
        style={{ width: "60px", height: "60px", marginRight: "1em", cursor: "pointer" }} 
      />
    
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flexGrow: 1 }}>
    
        <div style={{ textAlign: "center", marginTop: "0.5em" }}>
        <p style={{ color: "orange", fontSize: "1.5em", margin: "0" }}>{nombre}</p>
            <p style={{ fontFamily: "cursive", color: "yellow", margin: "0" }}>"{conviccion}"</p>
        </div>
    </div>

    <img 
        src={imagen} 
        onClick={handleShowFicha} 
        className='grupo-card-image' 
        style={{ width: "60px", height: "60px", marginRight: "1em", cursor: "pointer" }} 
      />

      </div>

    

      <div className="tiradas">
      
        <div className="container barrasTiradasBotones">
          
            <div>
            <OverlayTrigger
                placement="right"
              overlay={renderTooltip}
            >
              <input
                type="checkbox"
                id="custom-checkbox"
                checked={isChecked} // Usa el estado booleano
                onChange={handleToggleChange} // Actualiza el estado cuando cambia
                style={{ marginRight: '1em', transform: 'scale(1.5)' }} // Ajustar el tamaño y el margen si es necesario
              />
            </OverlayTrigger>
            <button className="btn btn-primary" onClick={tirarDados} style={{marginTop:"1em",marginBottom:"1em", width:"8em", placeItems:"center"}}>tirar</button>
           
            </div>
            
            
            <div style={{display:"grid", gridTemplateColumns:"1fr", marginBottom:"1em"}}>
            <input type="number" placeholder="caracteristica principal" value={principal} onChange={handlePrincipal} className="cajaTirada" style={{width:"50%"}}/>
            <input type="number" placeholder="caracteristica secundaria" value={secundaria} onChange={handleSecundaria} className="cajaTirada" style={{width:"50%"}}/>
            </div>

           <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"5px"}} className="botoncinios">
            <div className="fila">
            <Button variant="outline-danger" onClick={restD10}>-d10</Button>
            <label htmlFor="" value={dadosD10} className="dados10">{dadosD10}</label>
            <Button variant="outline-success" onClick={addD10}>+d10</Button> 
            </div>

            <div className="fila">
            <Button variant="outline-danger" onClick={restD20}>-d20</Button>
            <label htmlFor="" value={dadosD20} className="dados10">{dadosD20}</label>
            <Button variant="outline-success"  onClick={addD20}>+d20</Button>            
            </div>

            <div className="fila">
            <Button variant="outline-danger" onClick={restD10Bono}>-d10</Button>
            <label htmlFor="" value={dadosD10Bono} className="dados10">{dadosD10Bono}</label>
            <Button variant="outline-success"  onClick={addD10Bono}>+d10</Button>         
            </div>    

            <div className="fila">
            <Button variant="outline-danger" onClick={restD6Bono}> -d06</Button>
            <label htmlFor="" value={dadosD6Bono} className="dados10">{dadosD6Bono}</label>
            <Button variant="outline-success"  onClick={addD6Bono}> +d06</Button>          
            </div>    

            <div className="fila">
            <Button variant="outline-danger" onClick={restD12Bono}> -d12</Button>
            <label htmlFor="" value={dadosD12Bono} className="dados10">{dadosD12Bono}</label>
            <Button variant="outline-success" onClick={addD12Bono}> +d12</Button>         
            </div>     

            <div className="fila">
            <Button variant="outline-danger" onClick={restD4Bono}> -d04</Button>
            <label htmlFor="" value={dadosD4Bono} className="dados10">{dadosD4Bono}</label>
            <Button variant="outline-success"  onClick={addD4Bono}> +d04</Button>   
            </div>       

           </div>
           
        </div>


        
       <div className="container barrasTiradas">  
          <BarraVida idpersonaje={idpersonaje} cicatrizN={cicatrizN} setCicatrizN={setCicatrizN} nombreN={nombre} fortalezaN={fortaleza} kiN={ki} positivaN={positivaN} setPositivaN={setPositivaN} negativaN={negativaN} setNegativaN={setNegativaN} damageActualN={damageActualN} setDamageActualN={setDamageActualN}></BarraVida>
          <BarraKi idpersonaje={idpersonaje} nombreN={nombre} consumisionN={consumisionN} setConsumisionN={setConsumisionN} kiN={ki} kiActualN={kiActualN} setKiActualN={setKiActualN}></BarraKi>
          <BarraKen idpersonaje={idpersonaje} nombreN={nombre} kenN={ken} kenActualN={kenActualN} setKenActualN={setKenActualN}></BarraKen>
        </div>
      
      

       
 
    </div>

    <div className="macros">

        <div className="guardados">

        <input type="text" placeholder="nombra tu tirada y guardala en un boton" value={nombreTirada} onChange={handleNombreTirada} style={{backgroundColor:"black", color:"greenyellow", textAlign:"center"
        }}/>
          
        <Form.Select value={selectedButton} onChange={handleInputChange} style={{marginLeft:"2em", width:"8em", backgroundColor:"black", color:"greenyellow"}}>
        <option value={1}>Boton 1</option>
        <option value={2}>Boton 2</option>
        <option value={3}>Boton 3</option>
        <option value={4}>Boton 4</option>
        <option value={5}>Boton 5</option>
        <option value={6}>Boton 6</option>
        <option value={7}>Boton 7</option>
        <option value={8}>Boton 8</option>
        <option value={9}>Boton 9</option>
        <option value={10}>Boton 10</option>
        </Form.Select>
       
       <Button variant="outline-info"  onClick={guardarTiradaMacro} style={{marginLeft:"2em"}}>guardar</Button>

        </div>
        
        
        <div className="cajaMacros">
          
            <Button variant="outline-warning" onClick={cargarTirada1}>{boton1.nombreTirada || "Accion-1"}</Button>
            <Button variant="outline-warning" onClick={cargarTirada2}>{boton2.nombreTirada || "Accion-2"}</Button>
            <Button variant="outline-warning" onClick={cargarTirada3}>{boton3.nombreTirada || "Accion-3"}</Button>
            <Button variant="outline-warning" onClick={cargarTirada4}>{boton4.nombreTirada || "Accion-4"}</Button>
            <Button variant="outline-warning" onClick={cargarTirada5}>{boton5.nombreTirada || "Accion-5"}</Button>
            <Button variant="outline-warning" onClick={cargarTirada6}>{boton6.nombreTirada || "Accion-6"}</Button>
            <Button variant="outline-warning" onClick={cargarTirada7}>{boton7.nombreTirada || "Accion-7"}</Button>
            <Button variant="outline-warning" onClick={cargarTirada8}>{boton8.nombreTirada || "Accion-8"}</Button>
            <Button variant="outline-warning" onClick={cargarTirada9}>{boton9.nombreTirada || "Accion-9"}</Button>
            <Button variant="outline-warning" onClick={cargarTirada10}>{boton10.nombreTirada || "Accion-10"}</Button>
          </div>
    </div>

   
    {/*Modal de resultados de tiradas*/}
    <div>
       

      <Modal show={showModal} onHide={handleClose} centered>
      <Modal.Header closeButton className="modal-header-custom">
        <Modal.Title>Resultados de la Tirada</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body-custom">
        <div className="cajasTirdas">
          <div>
            <input
              type="text"
              className="cajaTotal"
              value={sumaTirada}
              placeholder="Total de tirada"
              readOnly
            />
          </div>
          <div>
            <input
              type="text"
              className="cajaTirada"
              value={valTirada}
              placeholder="Dados de esfuerzo base"
              readOnly
            />
          </div>
          <div>
            <input
              type="text"
              className="cajaTirada"
              value={valTiradaD10}
              placeholder="Dados D10 de Bono"
              readOnly
            />
          </div>
          <div>
            <input
              type="text"
              className="cajaTirada"
              value={valTiradaD20}
              placeholder="Dados D20 de Bono"
              readOnly
            />
          </div>
          <div>
            <input
              type="text"
              className="cajaTirada"
              value={valTiradaD12}
              placeholder="Dados D12 de Bono"
              readOnly
            />
          </div>
          <div>
            <input
              type="text"
              className="cajaTirada"
              value={valTiradaD10Bono}
              placeholder="Dados D10 de KEN"
              readOnly
            />
          </div>
          <div>
            <input
              type="text"
              className="cajaTirada"
              value={valTiradaD6}
              placeholder="Dados D6 de Bono"
              readOnly
            />
          </div>
          <div>
            <input
              type="text"
              className="cajaTirada"
              value={valTiradaD4}
              placeholder="Dados D4 de Bono"
              readOnly
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="modal-footer-custom">
        <Button variant="secondary" onClick={handleClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
    </div>




   {/*Nuestro amigo el nuevo modal*/}
   <div>
       

       <Modal show={showModalFicha} onHide={handleCloseFicha} centered size="lg">
       <Modal.Header closeButton className="modal-header-custom">
         <Modal.Title>Ficha {nombre}</Modal.Title>
       </Modal.Header>
       <Modal.Body className="bg-dark text-light">

<div className='bordeRev' style={{ display: "flex", flexDirection: "row", gap: "2em", alignItems: "center", textAlign: "left" }}>

  <p style={{ fontSize: "1em", margin: "0" }}>Vida: {vidaActual} /{(ki + fortaleza) * (positiva + negativa)}</p>
  <p style={{ fontSize: "1em", margin: "0" }}>Ki: {kiActual}/{ki}</p>
  <p style={{ fontSize: "1em", margin: "0" }}>Ken: {kenActual} /{ken}</p>
</div>

<div style={{ display: 'flex', flexDirection: 'column' }}>

  <div className='bordeRev' style={{ display: "flex", flexDirection: "row", gap: "1em" }}>
    <p>Fza: {fuerza}</p>
    <p>Fort: {fortaleza}</p>
    <p>Des: {destreza}</p>
    <p>Agi: {agilidad}</p>
    <p>Sen: {sentidos}</p>
    <p>Sab: {sabiduria}</p>
    <p>Pre: {presencia}</p>
    <p>Pri: {principio}</p>
  </div>

  <div className='bordeRev' style={{ display: "flex", flexDirection: "row", gap: "1em" }}>
    <p>Consumo ki: {consumision}</p>
    <p>Iniciativa: {iniciativa}</p>
    <p>Resistencia: {resistencia}</p>
    <p>Fases +: {positiva}</p>
    <p>Fases -: {negativa}</p>
    <p>Cicatrices: {cicatriz}</p>

  </div>

  <div className='bordeRev' style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: "0.5em", fontSize:"1em",  alignItems: "center", justifyItems: "center" }}>
    <p>Academisismo: {academisismo}</p>
    <p>Alerta: {alerta}</p>
    <p>Atletismo: {atletismo}</p>
    <p>Con. Bakemono: {conBakemono}</p>
    <p>Mentir: {mentir}</p>
    <p>Pilotear: {pilotear}</p>
    <p>Artes Marciales: {artesMarciales}</p>
    <p>Medicina: {medicina}</p>
    <p>Con. Obj. Mágicos: {conObjMagicos}</p>
    <p>Sigilo: {sigilo}</p>
    <p>Con. Esferas: {conEsferas}</p>
    <p>Con. Leyendas: {conLeyendas}</p>
    <p>Forja: {forja}</p>
    <p>Con Demonio: {conDemonio}</p>
    <p>Con Espiritual: {conEspiritual}</p>
    <p>Manejo Blaster: {manejoBlaster}</p>
    <p>Manejo Sombras: {manejoSombras}</p>
    <p>Trato Bakemono: {tratoBakemono}</p>
    <p>Con Hechicería: {conHechiceria}</p>
    <p>Med. Vital: {medVital}</p>
    <p>Med. Espiritual: {medEspiritual}</p>
    <p>Rayo: {rayo}</p>
    <p>Fuego: {fuego}</p>
    <p>Frío: {frio}</p>
    <p>Veneno: {veneno}</p>
    <p>Corte: {corte}</p>
    <p>Energía: {energia}</p>
    <p>{apCombate || "Aptitud combate"}: {valCombate}</p>
    <p>{apCombate2 || "Aptitud combate"}: {valCombate2}</p>
    <p>{add1 || "Aptitud nueva"}: {valAdd1}</p>
    <p>{add2 || "Aptitud nueva"}: {valAdd2}</p>
    <p>{add3 || "Aptitud nueva"}: {valAdd3}</p>
    <p>{add4 || "Aptitud nueva"}: {valAdd4}</p>
  </div>
</div>

</Modal.Body>
      
       </Modal>
     </div>
    
    </>
    
  )
}











export const FlotanteIncrementos = ({ dataIncrementos}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [relPosition, setRelPosition] = useState({ x: 0, y: 0 });
  const [contentIndex, setContentIndex] = useState(0);

  const handleMouseDown = (e) => {
    setDragging(true);
    setRelPosition({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      e.preventDefault();
      setPosition({
        x: e.clientX - relPosition.x,
        y: e.clientY - relPosition.y,
      });
    }
  };

  useEffect(() => {
    const initialX = window.innerWidth - 160;
    const initialY = 20;
    setPosition({ x: initialX, y: initialY });
  }, []);



  return (
    <div
      className="floating-component1"
      style={{
        position: 'absolute',
        top: `${position.y}px`,
        left: 'auto',
        right: `${window.innerWidth - position.x}px`, // Asegurar alineado a la derecha
        cursor: dragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
     
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        
            <p
            className='tituloFlotante'   
            style={{
                  position: 'absolute',
                  top: '-15px', // Ajusta la posición vertical del título
                  left: '20px', // Ajusta la posición horizontal del título
                  backgroundColor: 'rgb(10, 7, 45)', // Color de fondo adaptado
                  color: '#FFEA00', // Color amarillo chillón
                  padding: '0 10px', // Espaciado interno
                  fontWeight: 'bold',
                  fontSize: '1.2em',
                  textAlign: 'center',
                }}>
                  Incrementos
                </p>

                {dataIncrementos.length > 0 ? (
                  // Agrupamos mensajes por nombre
                  Object.entries(
                    dataIncrementos.reduce((acc, pj) => {
                      if (!acc[pj.nombre]) {
                        acc[pj.nombre] = []; // Inicializa un array para cada nombre
                      }
                      acc[pj.nombre].push(pj.mensaje); // Agrega el mensaje al array del nombre correspondiente
                      return acc;
                    }, {})
                  ).map(([nombre, mensajes]) => (
                    <div style={{ display: "flex", 
                      flexWrap: "wrap", // Habilita el ajuste de los elementos a varias filas
                      gap: "5px", // Espacio entre los elementos
                      marginTop: "1em", 
                      padding: "1em", 
                      maxWidth: '100%', 
                      wordWrap: 'break-word',
                      }}>
                      <div key={nombre} style={{ color: "aliceblue", marginBottom: "1em" }}>
                      <p style={{color:"yellow"}}>{nombre}</p>
                      {mensajes.map((mensaje, index) => (
                        <p 
                        style={{
                          color: "greenYellow",  
                          maxWidth: '100%', // Asegura que el contenedor no se salga del ancho disponible
                          wordWrap: 'break-word', // Se asegura de que las palabras largas se quiebren
                          wordBreak: 'break-word', // Se asegura de que el texto largo se quiebre cuando sea necesario
                        }} 
                          
                          key={index} >{mensaje}</p>
                      ))}
                    </div>
                    </div>

                    
                  ))
                ) : (
                  <p style={{ color: "aliceblue" }}>No hay incrementos</p>
                )}

            
      </div>
    </div>
  );
};