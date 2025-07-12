import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthContext';

export default function Perfil() {
  const {
    userToken,
    actualizarNombreUsuario,
    estatus,
    email,
    contrasenia,
    nick,
    setUserToken,
    setEstatus,
    cambiosUsuario,
  } = useContext(AuthContext);

  const [nombreUsuario, setNombreUsuario] = useState(nick || '');
  const [emailEditable, setEmailEditable] = useState(email || '');

  const [contraseniaEditable, setContraseniaEditable] = useState(contrasenia || '');
  const [mostrarContrasenia, setMostrarContrasenia] = useState(false); // 👁 estado nuevo
  const usuarioId = userToken ? userToken.split("-")[1] : null;
 

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>🧾 Estatus</Text>
        <Text style={styles.valor}>{estatus || 'Desconocido'}</Text>

        <Text style={styles.label}>📧 Email</Text>
        <TextInput
          style={styles.input}
          value={emailEditable}
          onChangeText={setEmailEditable}
          placeholder="Ingresa tu email"
          placeholderTextColor="#777"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>🔒 Contraseña</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { flex: 1, marginTop: 1, borderWidth:0, }]}
            value={contraseniaEditable}
            onChangeText={setContraseniaEditable}
            placeholder="Ingresa tu contraseña"
            placeholderTextColor="#777"
            secureTextEntry={!mostrarContrasenia}
          />
          <TouchableOpacity
            onPress={() => setMostrarContrasenia(!mostrarContrasenia)}
            style={styles.ojo}
          >
            <Text style={{ fontSize: 18 }}>
              {mostrarContrasenia ? '🙈' : '👁'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>👤 Nombre de Usuario</Text>
        <TextInput
          style={styles.input}
          value={nombreUsuario}
          onChangeText={setNombreUsuario}
          placeholder="Ingresa tu nick"
          placeholderTextColor="#777"
        />

        <TouchableOpacity
          style={styles.botonGuardar}
          onPress={() =>
            cambiosUsuario({
              nuevoNick: nombreUsuario,
              nuevoEmail: emailEditable,
              nuevaContrasenia: contraseniaEditable,
              usuarioId,
            })
          }
        >
          <Text style={styles.textoBoton}>💾 Guardar Cambios</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0d0d0d',
    flexGrow: 1,
    padding: 24,
    paddingTop: 40,
    justifyContent: 'flex-start',
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#00FFC6',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 8,
  },
  label: {
    color: '#999',
    fontSize: 14,
    marginTop: 16,
    marginBottom: 4,
  },
  valor: {
    color: '#f2f2f2',
    fontSize: 16,
  },
  input: {
    backgroundColor: '#2c2c2c',
    color: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00FFC6',
    fontSize: 16,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: '#2c2c2c',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00FFC6',
    paddingHorizontal: 10,
  },
  ojo: {
    paddingHorizontal: 10,
  },
  botonGuardar: {
    marginTop: 28,
    backgroundColor: '#00FFC6',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#00ffc6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  textoBoton: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
