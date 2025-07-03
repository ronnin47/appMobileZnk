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

    } catch (e) {
      console.log('Error saving personajes', e);
    }
  };


//ESTE SERA PARA GUARDAR EN TODOS LOS PERSONAJES
 const saveColeccionPersonajes = async (nuevaColeccion) => {
  try {

    nuevaColeccion.forEach((pj) => {
      console.log(`Extos en el contexto id: ${pj.idpersonaje} - ${pj.nombre}- ${pj.imagenurl}`);
    });

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
    setPersonajes([]);
    setEstatus(null)
  };

const consumir = async () => {

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};



