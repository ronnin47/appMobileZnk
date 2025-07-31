import { useNavigationState } from '@react-navigation/native';
import React, { useContext,useEffect,useState,useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Image, Text, View, StyleSheet, Alert ,ImageBackground, Animated,} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { AuthContext } from './components/AuthContext'; // <-- IMPORTAR EL CONTEXTO
import { ActivityIndicator, Provider as PaperProvider } from 'react-native-paper';
import { LoginScreen } from './components/login'; // Tu pantalla de Login
import RegisterScreen from './components/registro';
import Perfil from './components/perfil';
import Principal from './components/principal';
import { PagerChat } from './components/pagerChat';
import { PantallaDeslizable } from './components/pantallaDeslizable';
import { AuthProvider } from './components/AuthProvider';
import { Ranking } from './components/ranking';
import { Sagas } from './components/sagas';
import { PoderesUnicos } from './components/poderesUnicos';
import { ErrorBoundary } from './ErrorBoundary'; // o la ruta correcta
import FlashMessage from 'react-native-flash-message';
import { Platform } from 'react-native';


import { ObjetosMagicos } from './components/objetosMagicos';
import { Neotecnia } from './components/neotecnia';
import { Herbolaria} from './components/herbolaria';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();




//SplashScreen.preventAutoHideAsync();

export const App = () => {
   const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
  const prepararApp = async () => {
    try {
      await SplashScreen.preventAutoHideAsync(); // 👈 Agregá esto acá
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simula carga
    } catch (e) {
      console.warn(e);
    } finally {
      setAppIsReady(true);
      await SplashScreen.hideAsync(); // Oculta splash al terminar todo
    }
  };

  prepararApp();
}, []);
  
if (!appIsReady) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
      <Text style={{ color: 'white' }}>Cargando aplicación...</Text>
    </View>
  );
}
  return (
       <ErrorBoundary>
          <PaperProvider>
                <AuthProvider>
                  <NavigationContainer>
                    <MainStack />
                  </NavigationContainer>
                </AuthProvider>
            </PaperProvider>   
       </ErrorBoundary>  
  );
};

  // Lógica para mostrar pantallas según login
const MainStack = () => {
  const { userToken, isLoading } = useContext(AuthContext);
   //Alert.alert("DEBUG", `MainStack: isLoading=${isLoading}, token=${userToken}`);

  

const translateY = useRef(new Animated.Value(0)).current;

useEffect(() => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(translateY, {
        toValue: -800, // valor alto para subir todo el texto
        duration: 40000,
        useNativeDriver: true,
      }),
      Animated.delay(1000),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ])
  ).start();
}, []);

const textoCarga = `
Pero las castas seguían enviando hordas, y los mismísimos hijos mayores de los señores oscuros comenzaron a llegar uno tras otro.

Las luchas de Susanowo eran cada vez más riesgosas, dejándolo casi al borde de la aniquilación en una oportunidad.

Amaterasu deseaba que aquellos que llevarían las marcas del destino —las futuras estrellas— nacieran en un lugar apacible.

Eran la única esperanza de poder darle a todos los seres, nuevamente, una vida armoniosa.
`;

if (isLoading) {
  return (
    <ImageBackground
      source={{ uri: 'https://res.cloudinary.com/dzul1hatw/image/upload/v1753555471/puerta_mo6o6p.jpg' }}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
          <View style={{ height:"95%", overflow: 'hidden', width: '100%', marginTop: 60, }}>
             <Animated.View
          style={{
            transform: [{ translateY }],
            width: '90%',
            marginTop: 30,
          }}
        >
          <Text style={styles.loadingText}>
            {textoCarga}
          </Text>
        </Animated.View>

          </View>
        
       
        <ActivityIndicator size="large" color="cyan" />
      </View>
    </ImageBackground>
  );
}

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
      options={{ headerShown: false }}  />
      
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
        }}/>
      
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
        }}/>
      
    
      
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
        }} />



      <Stack.Screen name="Tesoros del universo" component={ObjetosMagicos}
        options={{
            headerTitle: 'Tesoros del universo', // o '' si no querés texto
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
          }} />

        <Stack.Screen name="Neotecnia" component={Neotecnia}
        options={{
            headerTitle: 'Neotecnia', // o '' si no querés texto
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
          }} />
      
        <Stack.Screen name="Herbolaria" component={Herbolaria}
        options={{
            headerTitle: 'Herbolaria', // o '' si no querés texto
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
          }} />
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
      <Tab.Screen name="Chat" component={PagerChat} options={{ title: 'Chat' }} />
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
  },
background: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding:20,
},

overlay: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 40,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  paddingBottom:60,
  borderRadius:15,
  borderWidth:0.4,
  borderColor:"gold"
},

loadingText: {
  color: 'gold',
  fontSize: 16,
  textAlign: 'center',
  lineHeight: 28,
  fontFamily: 'System',
  textShadowColor: 'rgba(0, 0, 0, 0.75)',  // sombra negra semitransparente
  textShadowOffset: { width: 1, height: 1 }, // desplazamiento de la sombra
  textShadowRadius: 2,                      // difuminado de la sombra
  fontWeight: '600',                        // un poco más grueso pero no muy pesado
},
  
});