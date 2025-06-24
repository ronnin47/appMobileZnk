//LA PRUEBA FUNCIONA!!
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
    SplashScreen.preventAutoHideAsync();

    const loadData = async () => {
      console.time('loadData');
      try {
        const token = await AsyncStorage.getItem('userToken');

        if (token) {
          setUserToken(token);

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
        }
      } catch (e) {
        console.log('Error loading token or personajes:', e);
        setUserToken(null);
        setPersonajes([]);
      } finally {
        setIsLoading(false);
        console.timeEnd('loadData');
        await SplashScreen.hideAsync();
      }
    };

    loadData();
  }, []);

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
    setPersonajes([]);
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


