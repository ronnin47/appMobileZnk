import { useNavigationState } from '@react-navigation/native';
import React, { useContext,useEffect,useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Image, Text, View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { AuthContext } from './components/AuthContext'; // <-- IMPORTAR EL CONTEXTO
import { Provider as PaperProvider } from 'react-native-paper';
// importaciones de COMPONENTS
import { LoginScreen } from './components/login'; // Tu pantalla de Login
import RegisterScreen from './components/registro';
//import Configuracion from './components/configuracion';
import Perfil from './components/perfil';
import Principal from './components/principal';
import Chat from './components/chat';
import { FichaPersonaje } from './components/fichaPersonaje';
import { PantallaDeslizable } from './components/pantallaDeslizable';

import { AuthProvider } from './components/AuthProvider';
import { Ranking } from './components/ranking';
import { Sagas } from './components/sagas';
import { PoderesUnicos } from './components/poderesUnicos';



import FlashMessage from 'react-native-flash-message';
import { Platform } from 'react-native';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();



import { io } from 'socket.io-client';
import { Nuevo } from './components/nuevo';

const socket = io('http://192.168.0.38:3000'); // IP y puerto de tu servidor

SplashScreen.preventAutoHideAsync();
// el Stack navigator es una PILA de pantallas
export const App = () => {



  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    const prepararApp = async () => {
      try {
        // Podés cargar fuentes, datos del usuario, etc aquí si querés
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simula 2 segundos de carga
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync(); // ✅ Oculta el splash cuando está todo listo
      }
    };

    prepararApp();
  }, []);

  if (!appIsReady) return null; // No renderiza nada mientras carga

  return (
     <PaperProvider>
        <AuthProvider>
          <NavigationContainer>
            <MainStack />
          </NavigationContainer>
        </AuthProvider>
     </PaperProvider>   
  );
};

  // Lógica para mostrar pantallas según login
const MainStack = () => {
  const { userToken, isLoading } = useContext(AuthContext);

  if (isLoading) return null; // o un loader

  return (
    <>
  <Stack.Navigator initialRouteName={userToken ? 'Home' : 'Login'}>
  {!userToken ? (
    <>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
    </>
  ) : (
    <>
      <Stack.Screen name="Home" component={TabNavigator} options={{ headerShown: false }} />
      
      {/* Protegidas por userToken */}
      <Stack.Screen name="PantallaDeslizable" component={PantallaDeslizable}  
       options={{
    headerTitle: '', // Oculta el texto del título
    headerBackTitleVisible: false,
    headerStyle: {
      backgroundColor: '#121212', // Color de fondo del header
      height: 80, 
                    
    },
    headerTintColor: 'white',
  }}  />
      <Stack.Screen name="Ranking" component={Ranking}   
      options={{
          headerTitle: 'Ranking', // o '' si no querés texto
          headerBackTitleVisible: false,
          headerStyle: {
            backgroundColor: '#121212', // Fondo oscuro
            height: 80,
          },
          headerTintColor: 'white', // Color de la flechita y backTitle
          headerTitleStyle: {
            color: 'white', // ✅ Color del texto del título
            fontWeight: 'bold',
            fontSize: 20,
          },
        }}   />
      <Stack.Screen name="Sagas" component={Sagas} 
       options={{
          headerTitle: 'Sagas', // o '' si no querés texto
          headerBackTitleVisible: false,
          headerStyle: {
            backgroundColor: '#121212', // Fondo oscuro
            height: 80,
          },
          headerTintColor: 'white', // Color de la flechita y backTitle
          headerTitleStyle: {
            color: 'white', // ✅ Color del texto del título
            fontWeight: 'bold',
            fontSize: 20,
          },
        }}  />
      <Stack.Screen name="Nuevo" component={Nuevo} />
      <Stack.Screen name="Poderes Unicos" component={PoderesUnicos}
       options={{
          headerTitle: 'Poderes Unicos', // o '' si no querés texto
          headerBackTitleVisible: false,
          headerStyle: {
            backgroundColor: '#121212', // Fondo oscuro
            height: 80,
          },
          headerTintColor: 'white', // Color de la flechita y backTitle
          headerTitleStyle: {
            color: 'white', // ✅ Color del texto del título
            fontWeight: 'bold',
            fontSize: 20,
          },
        }}   />
    </>
  )}
</Stack.Navigator>
    <FlashMessage position="top" />
    </>
    
  );
};



// esto es para cuando ya ingresamos a la pantalla de navegacion principal
const TabNavigator = () => {

   const state = useNavigationState(state => state);

 useEffect(() => {
  if (Platform.OS === 'web') {
    document.activeElement?.blur?.();
  }
}, [state.index]);

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
          } /*else if (route.name === 'Configuracion') {
            iconName = 'settings-outline';
          }*/

          return <Ionicons name={iconName} size={size} color={color} />;
        },
         tabBarActiveTintColor: 'white',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: 'black',
           borderTopColor: 'white',
           borderTopWidth: 0.5,
          },
        headerShown: true,
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#121212',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerTitle: () => (
          <View style={styles.nav}>
            <Image
              source={require('./assets/mitamaDorada.png')}
              style={{ width: 40, height: 40, marginRight: 10 }}
              resizeMode="contain"
            />
            <Text style={styles.tituloNav}>
              {route.name}
            </Text>
          </View>
        ),
      })}
    >
      <Tab.Screen name="Principal" component={Principal} options={{ title: 'Inicio' }} />
      <Tab.Screen name="Chat" component={Chat} options={{ title: 'Chat' }} />
      <Tab.Screen name="Perfil" component={Perfil} options={{ title: 'Perfil' }} />
    
      
    </Tab.Navigator>
  );
};
const styles = StyleSheet.create({
  tituloNav: {
    color:"white",
      fontWeight: 'bold',
      fontSize:18,
      backgroundColor: '#000',

  },
  nav:{
    flexDirection:"row",
    alignItems:"center",
  }
  
});