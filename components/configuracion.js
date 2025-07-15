/*import React, { useContext } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { AuthContext } from './AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function Configuracion() {
  const { logout } = useContext(AuthContext);
  const navigation = useNavigation();

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }], // cambia 'Login' por el nombre correcto de tu pantalla de inicio
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pantalla de Configuración</Text>
      <Button title="Cerrar sesión" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 20,
  },
});
*/
import React, { useContext } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { AuthContext } from './AuthContext';

export default function Configuracion() {
  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout(); // 👈 Esto borra datos y setea el userToken en null
    // No hace falta navigation.reset si tu App.js hace el cambio automático
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pantalla de Configuración</Text>
      <Button title="Cerrar sesión" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 20,
  },
});