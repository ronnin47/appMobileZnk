import React, { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import socket from './socket';
import * as SplashScreen from 'expo-splash-screen';
import { showMessage } from 'react-native-flash-message';
import { Alert } from 'react-native'; // 👈 AÑADÍ ESTO
import { API_BASE_URL } from './config'; 
import { AppState } from 'react-native';

//SplashScreen.preventAutoHideAsync();

export const AuthProvider = ({ children }) => {

const [userToken, setUserToken] = useState(null);
const [estatus,setEstatus]=useState(null);
const [email,setEmail]=useState(null);
const [contrasenia,setContrasenia]=useState(null);
const [nick,setNick]=useState(null);
const [imagenurl,setImagenurl]=useState(null);
const [imagencloudid, setImagencloudid]=useState(null);
const [isLoading, setIsLoading] = useState(true);
const [personajes, setPersonajes] = useState([]);
const [coleccionPersonajes, setColeccionPersonajes] = useState([]);
const [sagas, setSagas] = useState([]);
const [historialChat, setHistorialChat] = useState([]);
const [notasUsuario, setNotasUsuario] = useState("");
const [pjSeleccionado, setPjSeleccionado] = useState(null);
const [favoritos, setFavoritos] = useState([]);
const [cargandoNotas, setCargandoNotas] = useState(true);
  const appState = useRef(AppState.currentState);


  useEffect(() => {
  const subscription = AppState.addEventListener('change', nextAppState => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active' &&
      userToken
    ) {
      socket.emit('solicitar-historial');
    }
    appState.current = nextAppState;
  });

  return () => {
    subscription.remove();
  };
}, [userToken]);


const loadData = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const estatus = await AsyncStorage.getItem('estatus');
    const email = await AsyncStorage.getItem('email');
    const contrasenia = await AsyncStorage.getItem('contrasenia');
    const nick = await AsyncStorage.getItem('nick');
    const imagenurl = await AsyncStorage.getItem('imagenurl');
    const imagencloudid = await AsyncStorage.getItem('imagencloudid');

    if (token) {
      setUserToken(token);
      setEstatus(estatus);
      setEmail(email);
      setContrasenia(contrasenia);
      setNick(nick);
      setImagenurl(imagenurl);
      setImagencloudid(imagencloudid);

      const usuarioIdStr = await AsyncStorage.getItem('userId');
      const usuarioId = usuarioIdStr ? parseInt(usuarioIdStr, 10) : null;

      if (usuarioId) {
        const response = await axios.get(`${API_BASE_URL}/consumirPersonajesUsuario`, {
          params: { usuarioId },
        });

        const coleccion = Array.isArray(response?.data?.coleccionPersonajes)
          ? response.data.coleccionPersonajes
          : [];

        setPersonajes(coleccion);
      } else {
        setPersonajes([]); // usuario sin ID válido
      }
    } else {
      setUserToken(null);
      setPersonajes([]);
      setEstatus(null);
    }
  } catch (e) {
    console.log('Error loading data:', e);
      console.log('Error loading data:', e.response?.data || e.message || e);
  Alert.alert(
    'Error',
    e.response?.data?.error || 'No se pudo cargar el usuario'
  );
    setUserToken(null);
    setPersonajes([]);
    setEstatus(null);
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  loadData(); // al montar la app
}, []);

useEffect(() => {
  if (userToken) {
    loadData(); // refresca datos al loguearse de nuevo
  }
}, [userToken]);



 const fetchSagas = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/consumirSagas`);
      setSagas(res.data.coleccionSagas || []);
    } catch (error) {
      console.error('Error al cargar sagas:', error);
    } 
  };

  useEffect(() => {
    fetchSagas();
  }, []);


//CONSUMIR TODOS LOS PERSONAJES
useEffect(() => {
  const loadPersonajes = async () => {

     /*if (!userToken) {
        setColeccionPersonajes([]);
        return;
      }
    */
       if (!userToken) return; 
    try {
           
        const response = await axios.get(`${API_BASE_URL}/consumirPersonajesTodos`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const { coleccionPersonajes } = response.data;

        if (!Array.isArray(coleccionPersonajes)) {
          console.error('El formato de datos no es un array/ aca esta el error.');
          return;
        }

        setColeccionPersonajes(coleccionPersonajes);
      
    } catch (error) {
      console.error("Cliente: Fallo al consumir personajes narrador TODOS", error.message);
    }
       
  };

  loadPersonajes();
  
}, [userToken]);



useEffect(() => {
  const obtenerFavoritos = async () => {
    const data = await AsyncStorage.getItem('favoritos');
    setFavoritos(data ? JSON.parse(data) : []);
  };
  obtenerFavoritos();
}, []);


// Cargar notas guardadas al iniciar
useEffect(() => {
  if (!userToken || !pjSeleccionado) return;

  const cargarNotas = async () => {
    setCargandoNotas(true);

    try {
      const clave = `notasUsuario-${userToken}-${pjSeleccionado}`;
      const guardado = await AsyncStorage.getItem(clave);
      setNotasUsuario(guardado ?? ""); // default en ""
    } catch (error) {
      console.error("Error al cargar notas:", error);
      setNotasUsuario(""); // por seguridad
    } finally {
      setCargandoNotas(false);
    }
  };

  cargarNotas();
}, [userToken, pjSeleccionado]);

// Guardar notas cuando cambien (solo si no estamos cargando)
useEffect(() => {
  if (!userToken || !pjSeleccionado || cargandoNotas) return;

  const guardarNotas = async () => {
    try {
      const clave = `notasUsuario-${userToken}-${pjSeleccionado}`;

      if (typeof notasUsuario === "string") {
        // Elimina si está vacío (opcional)
        if (notasUsuario.trim() === "") {
          await AsyncStorage.removeItem(clave);
        } else {
          await AsyncStorage.setItem(clave, notasUsuario);
        }
      }
    } catch (error) {
      console.error("Error al guardar notas:", error);
    }
  };

  guardarNotas();
}, [notasUsuario, userToken, pjSeleccionado, cargandoNotas]);


useEffect(() => {
  const handleMensaje = (mensaje) => {
    setHistorialChat(prev => [...prev, mensaje]);
  };

 
  socket.off('chat-chat');
  socket.on('chat-chat', handleMensaje);

  return () => {
  //  socket.off('chat-message', handleMensaje);
    socket.off('chat-chat', handleMensaje);
  };
}, []);

/*
useEffect(() => {
  if (!userToken) return;

  socket.emit('solicitar-historial');

  const handleHistorial = (mensajes) => {
    if (Array.isArray(mensajes)) {
      setHistorialChat(mensajes);
    }
  };

  socket.off('historial-chat');
  socket.on('historial-chat', handleHistorial);

  return () => {
    socket.off('historial-chat', handleHistorial);
  };
}, [userToken]);
*/


useEffect(() => {
  if (!userToken) return;

  // Función para pedir historial
  const pedirHistorial = () => {
    socket.emit('solicitar-historial');
  };

  // Pedir historial al montar
  pedirHistorial();

  // Manejar mensaje de historial
  const handleHistorial = (mensajes) => {
    if (Array.isArray(mensajes)) {
      setHistorialChat(mensajes);
    }
  };

  // Escuchar evento historial-chat
  socket.off('historial-chat');
  socket.on('historial-chat', handleHistorial);

  // Escuchar evento connect para reconexiones
  socket.on('connect', () => {
    console.log('Socket conectado/reconectado');
    pedirHistorial();
  });

  return () => {
    socket.off('historial-chat', handleHistorial);
    socket.off('connect');
  };
}, [userToken]);


const savePersonajes = async (lista) => {
  try {
    const clon = lista.map((p) => ({ ...p }));
    setPersonajes(clon);

  } catch (e) {
    console.log('Error saving personajes', e);
  }
};


//ESTE SERA PARA GUARDAR EN TODOS LOS PERSONAJES
 const saveColeccionPersonajes = async (nuevaColeccion) => {
  try {
    setColeccionPersonajes([...nuevaColeccion]);
  } catch (e) {
    console.log('Error guardando colección de personajes', e);
  }
}; 


const savePersonajeUno = async (personajeActualizado) => {
  try {
    setPersonajes((anteriores) =>
      anteriores.map((p) =>
        p.idpersonaje === personajeActualizado.idpersonaje
          ? { ...p, ...personajeActualizado }
          : p
      )
    );
  } catch (e) {
    console.log('Error guardando personaje individual', e);
  }
};

const logout = async () => {
  setUserToken(null);
  await AsyncStorage.removeItem('userToken');
  await AsyncStorage.removeItem('personajesUsuario');
  await AsyncStorage.removeItem('userId');
  await AsyncStorage.removeItem('estatus');


  await AsyncStorage.removeItem('nick');
  await AsyncStorage.removeItem('email');
  await AsyncStorage.removeItem('contrasenia');
  await AsyncStorage.removeItem('imagenurl');
  await AsyncStorage.removeItem('imagencloudid');
  await AsyncStorage.removeItem("favoritos");


  setPersonajes([]);
  
  setEstatus(null);
  setEmail(null);
  setContrasenia(null);
  setNick(null);
  setImagenurl(null);
  setImagencloudid(null);
  setNotasUsuario(null);
  
    // Limpias favoritos
  setFavoritos([]);
   // 🔴 Muy importante
  setPjSeleccionado(null);
};

const consumir = async () => {

       if (!userToken) return; 
    try {
           
        const response = await axios.get(`${API_BASE_URL}/consumirPersonajesTodos`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const { coleccionPersonajes } = response.data;

        if (!Array.isArray(coleccionPersonajes)) {
          console.error('El formato de datos no es un array/ aca esta el error.');
          return;
        }

        setColeccionPersonajes(coleccionPersonajes);
      
    } catch (error) {
      console.error("Cliente: Fallo al consumir personajes narrador TODOS", error.message);
    }
       
};

 const cambiosUsuario = async ({ nuevoNick, nuevoEmail, nuevaContrasenia, usuarioId,nuevaImagenurl }) => {
 if (!usuarioId || usuarioId.toString().trim() === '') {
  Alert.alert('Error', 'El ID de usuario es obligatorio.');
  return;
}

  try {
    // Petición al backend para actualizar usuario
    const response = await axios.put(`${API_BASE_URL}/updateUsuarios/${usuarioId}`, {
      nick: nuevoNick || "",
      email: nuevoEmail,
      contrasenia: nuevaContrasenia,
      imagenurl:nuevaImagenurl,
    });

    if (response.status === 200) {
  const {
    nick,
    email,
    contrasenia,
    imagenurl: serverImagenurl,
    imagencloudid: serverImagencloudid,
  } = response.data;

  const imagenFinal = serverImagenurl || "";
  const cloudIdFinal = serverImagencloudid || "";

  setNick(nick || "");
  setEmail(email);
  setContrasenia(contrasenia);
  setImagenurl(imagenFinal);
  setImagencloudid(cloudIdFinal);

  // Guardamos en AsyncStorage
  await AsyncStorage.setItem('nick', nick || "");
  await AsyncStorage.setItem('email', email);
  await AsyncStorage.setItem('contrasenia', contrasenia);
  await AsyncStorage.setItem('imagenurl', imagenFinal);
  await AsyncStorage.setItem('imagencloudid', cloudIdFinal);
  
  //console.log("guardado en el storage exitoso y servidor actualizado");
  setTimeout(() => {
    showMessage({
      message: 'Cambios guardados',
      description: 'Tus datos se han actualizado correctamente.',
      type: 'success',
      icon: 'success',
      duration: 3000
    });
  }, 500);
}else {
      Alert.alert('Error', 'No se pudo actualizar el perfil en el servidor.');
    }
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
   
  }
};


const toggleFavorito = async (idPersonaje) => {
  let nuevos;
  if (favoritos.includes(idPersonaje)) {
    nuevos = favoritos.filter((id) => id !== idPersonaje);
  } else {
    nuevos = [...favoritos, idPersonaje];
  }
  console.log("FAVORITOS IDS: ", nuevos)
  setFavoritos(nuevos);
  await AsyncStorage.setItem('favoritos', JSON.stringify(nuevos));
};


  
  return (
    <AuthContext.Provider
      value={{
        userToken,
        setUserToken,
        isLoading,
        logout,
        personajes,
        savePersonajes,
        historialChat,
        setHistorialChat,
        coleccionPersonajes,
        saveColeccionPersonajes,
        sagas,
        setSagas,
        setEstatus,
        estatus,
        fetchSagas,
        savePersonajeUno,
        consumir,
        email,
        setEmail,
        contrasenia,
        setContrasenia,
        nick,
        setNick,
        cambiosUsuario,
        imagenurl,
        setImagenurl,
        imagencloudid,
        setImagencloudid,
        favoritos,
        setFavoritos,
        toggleFavorito,
        pjSeleccionado,
        setPjSeleccionado,
        notasUsuario,
        setNotasUsuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};



