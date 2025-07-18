import React, { useState } from 'react';
import { ImageBackground, StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { showMessage } from 'react-native-flash-message';


import { API_BASE_URL } from './config';



const RegisterScreen = ({ navigation }) => {
 
 
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
  if (!email || !username || !password || !confirmPassword) {
    setError('Por favor complete todos los campos.');
    return;
  }
  if (password !== confirmPassword) {
    setError('Las contraseñas no coinciden.');
    return;
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/insert-usuario`, {
      email,
      contrasenia: password,
     // username, 
    });

    // Si llegas aquí, el registro fue exitoso
    //console.log('Usuario registrado:', response.data);
    setError('');
     // Navegar a la pantalla de login
      navigation.navigate('Login');

     // Espera un poco y luego muestra el mensaje (esto evita que se pierda el contexto del componente)
    setTimeout(() => {
      showMessage({
        message: '¡Registro exitoso!',
        description: 'Ya puedes iniciar sesión',
        type: 'success',
        icon: 'success',
        duration: 3000
      });
    }, 500);

  } catch (error) {
    if (error.response) {
      // Errores del servidor
      setError(error.response.data.message || 'Error en el registro');
    } else {
      // Errores de red u otros
      setError('Error de conexión al servidor.');
    }
  }
};



  return (
    <ImageBackground 
      source={require('../assets/imagenFondo.jpeg')} 
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Crear una Cuenta</Text>

        <TextInput
          style={styles.input}
          placeholder="Correo Electrónico"
          placeholderTextColor="#666666" 
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Nombre de Usuario"
          placeholderTextColor="#666666" 
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#666666" 
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Confirmar Contraseña"
          placeholderTextColor="#666666" 
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Registrarse</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

//estilos
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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
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
    backgroundColor: '#27ae60',
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;