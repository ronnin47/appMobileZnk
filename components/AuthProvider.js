import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthContext';
import axios from 'axios';

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [personajes, setPersonajes] = useState([]);
  
  // NUEVO: Historial de tiradas global
  const [historialChat, setHistorialChat] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          setUserToken(token);

          const usuarioIdStr = await AsyncStorage.getItem('userId');
          const usuarioId = usuarioIdStr ? parseInt(usuarioIdStr, 10) : null;

          if (usuarioId) {
            // Traer personajes actualizados del backend
            const response = await axios.get('http://192.168.0.38:3000/consumirPersonajesUsuario', {
              params: { usuarioId },
            });

            const coleccion = response.data.coleccionPersonajes || [];

            //setPersonajes(coleccion);


              //const nombres = coleccion.map(p => p.nombre); // Suponiendo que tienen campo `nombre`
              //console.log('ARCHIVO LOGIN-Nombres de personajes:', nombres);

              setPersonajes(coleccion)




              

            //await AsyncStorage.setItem('personajesUsuario', JSON.stringify(coleccion));
          
          } else {
            // Si no hay usuarioId, intentar cargar personajes guardados localmente
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
      }
    };

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
