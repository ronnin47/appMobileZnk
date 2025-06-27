//LA PRUEBA FUNCIONA!!
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthContext';
import axios from 'axios';

import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [estatus,setEstatus]=useState(null)

  const [isLoading, setIsLoading] = useState(true);
  const [personajes, setPersonajes] = useState([]);

  const [coleccionPersonajes, setColeccionPersonajes] = useState([]);

   const [sagas, setSagas] = useState([]);

  // NUEVO: Historial de tiradas global
  const [historialChat, setHistorialChat] = useState([]);

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();

    const loadData = async () => {
      console.time('loadData');
      try {
        const token = await AsyncStorage.getItem('userToken');
        const estatus = await AsyncStorage.getItem('estatus');

        if (token) {
          setUserToken(token);
          setEstatus(estatus);

          const usuarioIdStr = await AsyncStorage.getItem('userId');
          const usuarioId = usuarioIdStr ? parseInt(usuarioIdStr, 10) : null;

          if (usuarioId) {
            const response = await axios.get(
              'http://192.168.0.38:3000/consumirPersonajesUsuario',
              { params: { usuarioId } }
            );

            const coleccion = response.data.coleccionPersonajes || [];
            setPersonajes(coleccion);
          } else {
            /*const coleccionPersonajes = await AsyncStorage.getItem('personajesUsuario');
            if (coleccionPersonajes) {
              setPersonajes(JSON.parse(coleccionPersonajes));
            }*/
          }
        } else {
          setUserToken(null);
          setPersonajes([]);
          setEstatus(null)
        }
      } catch (e) {
        console.log('Error loading token or personajes:', e);
        setUserToken(null);
        setPersonajes([]);
        setEstatus(null)
      } finally {
        setIsLoading(false);
        console.timeEnd('loadData');
        await SplashScreen.hideAsync();
      }
    };

    loadData();
  }, [userToken]);
/*
  // Importante: este useEffect escucha cambios en userToken para recargar personajes
  useEffect(() => {
    const fetchPersonajes = async () => {
      if (!userToken) {
        setPersonajes([]);
        return;
      }
      try {
        const usuarioIdStr = await AsyncStorage.getItem('userId');
        const usuarioId = usuarioIdStr ? parseInt(usuarioIdStr, 10) : null;
        if (usuarioId) {
          const response = await axios.get(
            'http://192.168.0.38:3000/consumirPersonajesUsuario',
            { params: { usuarioId } }
          );
          const coleccion = response.data.coleccionPersonajes || [];
          setPersonajes(coleccion);
        }
      } catch (e) {
        console.log('Error recargando personajes tras cambio de token:', e);
      }
    };

    fetchPersonajes();
  }, [userToken]);


*/


 const fetchSagas = async () => {
    try {
      const res = await axios.get('http://192.168.0.38:3000/consumirSagas');
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
           
        const response = await axios.get(`http://192.168.0.38:3000/consumirPersonajesTodos`, {
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


  const savePersonajes = async (lista) => {
    try {
      const clon = lista.map((p) => ({ ...p }));
      setPersonajes(clon);

      // Si querés guardar localmente también:
      // await AsyncStorage.setItem('personajesUsuario', JSON.stringify(clon));
    } catch (e) {
      console.log('Error saving personajes', e);
    }
  };

  const logout = async () => {
    setUserToken(null);
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('personajesUsuario');
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('estatus');
    setPersonajes([]);
    setEstatus(null)
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
        sagas,
        setSagas,
        setEstatus,
        estatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};





/*

//codigo incial donde hace logout 

import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthContext';
import axios from 'axios';

import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [personajes, setPersonajes] = useState([]);
  
  // NUEVO: Historial de tiradas global
  const [historialChat, setHistorialChat] = useState([]);

 useEffect(() => {
  SplashScreen.preventAutoHideAsync(); // 👈 evitar cierre automático

  const loadData = async () => {
    console.time("loadData");
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        setUserToken(token);

        const usuarioIdStr = await AsyncStorage.getItem('userId');
        const usuarioId = usuarioIdStr ? parseInt(usuarioIdStr, 10) : null;

        if (usuarioId) {
          const response = await axios.get('http://192.168.0.38:3000/consumirPersonajesUsuario', {
            params: { usuarioId },
          });

          const coleccion = response.data.coleccionPersonajes || [];
          setPersonajes(coleccion);
        } else {
          const coleccionPersonajes = await AsyncStorage.getItem('personajesUsuario');
          if (coleccionPersonajes) {
            setPersonajes(JSON.parse(coleccionPersonajes));
          }
        }
      }
    } catch (e) {
      console.log('Error loading token or personajes:', e);
    } finally {
      setIsLoading(false);
      console.timeEnd("loadData");
      await SplashScreen.hideAsync(); // 👈 cerrar splash una vez termina
    }
  };

  console.log("Iniciando loadData");
  loadData();
}, []);
  // ... resto de tu código, savePersonajes, logout, etc.

  const savePersonajes = async (lista) => {
  try {
    // Clon profundo para asegurar nueva referencia
    const clon = lista.map(p => ({ ...p }));
    setPersonajes(clon);

    // await AsyncStorage.setItem('personajesUsuario', JSON.stringify(clon));
  } catch (e) {
    console.log('Error saving personajes', e);
  }
};


  const logout = async () => {
    setUserToken(null);
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('personajesUsuario');
    await AsyncStorage.removeItem('userId');
    setPersonajes([]);
  };

  return (
    <AuthContext.Provider value={{ userToken, setUserToken, isLoading, logout, personajes, savePersonajes, historialChat, setHistorialChat }}>
      {children}
    </AuthContext.Provider>
  );
};

*/


//ultimo codigo DONDE SI ELIMINA Y NO HACE LOGOUT 
/*
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthContext';
import axios from 'axios';

import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [personajes, setPersonajes] = useState([]);
  
  // NUEVO: Historial de tiradas global
  const [historialChat, setHistorialChat] = useState([]);

 useEffect(() => {
  SplashScreen.preventAutoHideAsync(); // 👈 evitar cierre automático

  const loadData = async () => {
    console.time("loadData");
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        setUserToken(token);

        const usuarioIdStr = await AsyncStorage.getItem('userId');
        const usuarioId = usuarioIdStr ? parseInt(usuarioIdStr, 10) : null;

        if (usuarioId) {
          const response = await axios.get('http://192.168.0.38:3000/consumirPersonajesUsuario', {
            params: { usuarioId },
          });

          const coleccion = response.data.coleccionPersonajes || [];
          setPersonajes(coleccion);
        } else {
          const coleccionPersonajes = await AsyncStorage.getItem('personajesUsuario');
          if (coleccionPersonajes) {
            setPersonajes(JSON.parse(coleccionPersonajes));
          }
        }
      }
    } catch (e) {
      console.log('Error loading token or personajes:', e);
    } finally {
      setIsLoading(false);
      console.timeEnd("loadData");
      await SplashScreen.hideAsync(); // 👈 cerrar splash una vez termina
    }
  };

  console.log("Iniciando loadData");
  loadData();
}, []);
  // ... resto de tu código, savePersonajes, logout, etc.

  const savePersonajes = async (lista) => {
  try {
    // Clon profundo para asegurar nueva referencia
    const clon = lista.map(p => ({ ...p }));
    setPersonajes(clon);

    // await AsyncStorage.setItem('personajesUsuario', JSON.stringify(clon));
  } catch (e) {
    console.log('Error saving personajes', e);
  }
};


  const logout = async () => {
    setUserToken(null);
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('personajesUsuario');
    await AsyncStorage.removeItem('userId');
    setPersonajes([]);
  };

  return (
    <AuthContext.Provider value={{ userToken, setUserToken, isLoading, logout, personajes, savePersonajes, historialChat, setHistorialChat }}>
      {children}
    </AuthContext.Provider>
  );
};
*/


