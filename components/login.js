

import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ImageBackground, StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { API_BASE_URL } from './config';



//este componente inicial que renderiza la aplciaicon al ingresar
export const LoginScreen = ({ navigation}) => {

 const { setUserToken, savePersonajes,setEstatus } = useContext(AuthContext);
 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');


 const handleLogin = async () => {
  if (!email || !password) {
    setError('Por favor ingrese ambos campos.');
    return;
  }
  console.log("Intentando login con:", email, password);
  try {
  const response = await axios.post(`${API_BASE_URL}/loginUsuario`, {
    email,
    contrasenia: password,
  });

  // Asegurate de que el status sea 200
  if (response.status === 200 && response.data?.idusuario) {
    const { idusuario, estatus, user } = response.data;
    //console.log("dta usuario: " ,user)

    console.log("Respuesta del login:", response.data);
    
    await AsyncStorage.setItem('estatus', estatus);

    if (user.nick !== null && user.nick !== undefined) {
      await AsyncStorage.setItem('nick', String(user.nick));
    }

    await AsyncStorage.setItem(
      'imagenurl',
      user.imagenurl != null ? String(user.imagenurl) : ''
    );

    await AsyncStorage.setItem(
      'imagencloudid',
      user.imagencloudid != null ? String(user.imagencloudid) : ''
    );

    await AsyncStorage.setItem('email', user.email);
    await AsyncStorage.setItem('contrasenia', user.contrasenia);

    const token = `usuario-${idusuario}`;
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('userId', idusuario.toString());

    setUserToken(token);
    setEstatus(estatus);

    
    console.log("id usuario",typeof idusuario)
    const personajesRes = await axios.get(`${API_BASE_URL}/consumirPersonajesUsuario`, {
      params: { usuarioId: idusuario },
    });
    console.log("llego aca------------------",personajesRes)
/*
    const coleccion = personajesRes.data.coleccionPersonajes;
    savePersonajes(coleccion);
*/
/*
console.log("personajes res ",personajesRes)
const coleccion = Array.isArray(personajesRes.data.coleccionPersonajes)
  ? personajesRes.data.coleccionPersonajes
  : [];

savePersonajes(coleccion);
console.log("LOGIN EXITOSO")
  */  
  } else {
    setError('Login inválido: no se pudo autenticar');
  }

} catch (error) {
  console.error('Error en login FALLO EN LOGIN :', error);

  if (error.response?.status === 401) {
    setError('Correo o contraseña incorrectos');
  } else {
    setError('Error al conectar con el servidor');
  }
}
};





const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <ImageBackground 
      source={require('../assets/imagenFondo.jpeg')}  // Usando require para importar la imagen
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Bienvenido al Universo Celeste</Text>

        {/* Campo de correo electrónico */}
        <TextInput
          style={styles.input}
          placeholder="Correo Electrónico"
          placeholderTextColor="#666666" 
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        {/* Campo de contraseña */}
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#666666" 
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
        />

        {/* Mostrar mensaje de error si es necesario */}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Botón de inicio de sesión */}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        {/* Enlace a la pantalla de registro */}
        <TouchableOpacity onPress={handleRegister}>
          <Text style={styles.registerText}>¿No tienes cuenta? Regístrate aquí</Text>
        </TouchableOpacity>

        {/* Opción para recuperar contraseña */}
        <TouchableOpacity>
          <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};





const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    color: 'white',
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    color: '#000', 
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerText: {
    textAlign: 'center',
    color: '#0066cc',
    marginTop: 15,
  },
  forgotPassword: {
    textAlign: 'center',
    color: '#0066cc',
    marginTop: 10,
  },
});

