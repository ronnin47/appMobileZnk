// ...existing code...
import React, { useContext,useState, useEffect } from 'react'; //HOOKS
import { AuthContext } from './AuthContext';// HOOK

import axios from 'axios';//FECHT 

import { showMessage } from 'react-native-flash-message';// MENSAJE EN PANTALLA

import { API_BASE_URL } from './config'; // ES LA DIRECCION DE LA API -ALIAS EL DOMINIO

import { View, Text, StyleSheet, Image, ScrollView ,TextInput,TouchableOpacity,ActivityIndicator  } from 'react-native';// COMPONENTES DE RACT
// ...existing code...




export const Logros=()=>{

    const [logros,setLogros]=useState([]);// useState hook
    const { userToken } = useContext(AuthContext);

    // nuevos estados para el insert
    const [nombreNuevo, setNombreNuevo] = useState('');
    const [descripcionNueva, setDescripcionNueva] = useState('');
    const [loadingInsert, setLoadingInsert] = useState(false);

   const consumirLogros = async () => {
    if (!userToken) return;
    try {
        const response = await axios.get(`${API_BASE_URL}/consumirLogros`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const { logrosConsumidos } = response.data;

        if (!Array.isArray(logrosConsumidos)) {
          console.error('El formato de datos no es un array/ aca esta el error.');
          return;
        }

        setLogros(logrosConsumidos);
      
    } catch (error) {
      console.error("Cliente: Fallo al consumir logros", error.message);
    }
   };

    useEffect(()=>{
        consumirLogros();
    },[]);

    // FUNCION PARA INSERTAR
    const insertarLogro = async () => {
      if (!nombreNuevo.trim()) {
        showMessage({ message: 'El nombre es requerido', type: 'danger' });
        return;
      }

      setLoadingInsert(true);


      try {
        const payload = {
          nombre: nombreNuevo.trim(),
          descripcion: descripcionNueva.trim(),
        };

        const headers = {
          'Content-Type': 'application/json',
        };
        
        if (userToken) headers.Authorization = `Bearer ${userToken}`;

        const res = await axios.post(`${API_BASE_URL}/insertarLogro`, payload, { headers });

        // suponer que el endpoint devuelve el logro insertado en res.data.logro
        const nuevo = res.data?.logro ?? null;

        if (nuevo) {
          setLogros(prev => [nuevo, ...prev]); // agregar arriba
          setNombreNuevo('');
          setDescripcionNueva('');
          showMessage({ message: 'Logro creado', type: 'success' });
        } else {
          // si no devuelve el objeto, refrescar la lista
          await consumirLogros();
          showMessage({ message: 'Logro guardado', type: 'success' });
        }
      } catch (error) {
        console.error('Error al insertar logro', error);
        showMessage({ message: 'Error al guardar logro', type: 'danger' });
      } finally {
        setLoadingInsert(false);
      }
    };

    // ESTO ES LO QUE DEVUELVE EN LA PANTALLA
    return(
      <View style={styles.container}>
        <View style={styles.form}>
          <TextInput
            placeholder="Nombre del logro"
            placeholderTextColor="#888"
            value={nombreNuevo}
            onChangeText={setNombreNuevo}
            style={styles.input}
          />
          <TextInput
            placeholder="Descripción (opcional)"
            placeholderTextColor="#888"
            value={descripcionNueva}
            onChangeText={setDescripcionNueva}
            style={[styles.input, {height: 80}]}
            multiline
          />
          <TouchableOpacity onPress={insertarLogro} style={styles.button} disabled={loadingInsert}>
            {loadingInsert ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Agregar logro</Text>}
          </TouchableOpacity>
        </View>

        <ScrollView style={{width:'100%'}} contentContainerStyle={{padding:16}}>
          {logros.length >0 ? (
              logros.map((logro,index)=>(
                  <View key={logro.id || index} style={styles.logroItem}>
                    <Text style={styles.logroTitulo}>{logro.nombre}</Text>
                    {logro.descripcion ? <Text style={styles.logroDesc}>{logro.descripcion}</Text> : null}
                  </View>
              ))
          ) : (
              <View>
                  <Text>Este sera el nuevo compoenente de logros</Text>
               </View>
          )}
        </ScrollView>
      </View>
    )
}

















const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    //justifyContent: 'center',
  },
  form: {
    width: '100%',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#1e90ff',
    padding: 12,
    borderRadius: 8,
    alignItems:'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
  },
  logroItem: {
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8
  },
  logroTitulo: {
    color: '#fff',
    fontWeight: '700'
  },
  logroDesc: {
    color: '#ccc',
    marginTop: 6
  }
});