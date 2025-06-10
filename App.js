import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Image, Text, View } from 'react-native';
import React, { useContext } from 'react';
import { AuthContext } from './components/AuthContext'; // <-- IMPORTAR EL CONTEXTO

// importaciones de COMPONENTS
import { LoginScreen } from './components/login'; // Tu pantalla de Login
import RegisterScreen from './components/registro';
import Configuracion from './components/configuracion';
import Perfil from './components/perfil';
import Principal from './components/principal';
import Chat from './components/chat';

import { AuthProvider } from './components/AuthProvider';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();





// el Stack navigator es una PILA de pantallas
export const App = () => {

  // Lógica para mostrar pantallas según login
const MainStack = () => {
  const { userToken, isLoading } = useContext(AuthContext);

  if (isLoading) return null; // o un loader

  return (
    <Stack.Navigator initialRouteName={userToken ? 'Home' : 'Login'}>
      {!userToken ? (
        <>
          {/* Primera pantalla---------Pantalla de Login */}
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          {/* Segunda pantalla---------Pantalla de Registro */}
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <>
          {/* Pantalla principal de la aplicacion (con las pestañas) */}
          <Stack.Screen
            name="Home"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

  return (
    <AuthProvider>
      <NavigationContainer>
        <MainStack />
      </NavigationContainer>
    </AuthProvider>
  );
};



// esto es para cuando ya ingresamos a la pantalla de navegacion principal
const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Principal"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Principal') {
            iconName = 'home-outline';
          } else if (route.name === 'Chat') {
            iconName = 'chatbox-outline';
          } else if (route.name === 'Perfil') {
            iconName = 'person-outline';
          } else if (route.name === 'Configuracion') {
            iconName = 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: 'white',
        },
        headerTintColor: 'black',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerTitle: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={require('./assets/mitamaDorada.png')}
              style={{ width: 40, height: 40, marginRight: 10 }}
              resizeMode="contain"
            />
            <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'black' }}>
              {route.name}
            </Text>
          </View>
        ),
      })}
    >
      <Tab.Screen name="Principal" component={Principal} options={{ title: 'Inicio' }} />
      <Tab.Screen name="Chat" component={Chat} options={{ title: 'Chat' }} />
      <Tab.Screen name="Perfil" component={Perfil} options={{ title: 'Perfil' }} />
      <Tab.Screen name="Configuracion" component={Configuracion} options={{ title: 'Configuración' }} />
    </Tab.Navigator>
  );
};
