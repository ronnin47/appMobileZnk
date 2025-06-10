import { ScrollView, Text, View, Image, StyleSheet } from 'react-native';

export const Carrusel = ({ imagenes }) => {

  
  return (
    <ScrollView
      horizontal={true}
      pagingEnabled={true}
      showsHorizontalScrollIndicator={false}
    >
      <View style={styles.row}>
        {imagenes.map((imagen, index) => (
          <View key={index} style={styles.item}>
            <Image
              source={imagen.imagen}
              style={styles.imagen}
            />
            <Text style={styles.text}>
              {imagen.nombre}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1, // Asegura que el contenedor ocupe todo el alto disponible
    padding: 0,
    justifyContent: 'center', // Centra el contenido verticalmente
    alignItems: 'center', // Centra el contenido horizontalmente
    backgroundColor: '#F5F5F5', // Fondo opcional para darle un buen contraste
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    color: '#fff',
    marginBottom: 10,
  },
  imagen: {
    width: 120,  // Ajusta el tamaño para que se vean bien
    height: 160,
    borderRadius: 8,  // Borde redondeado pero no excesivo, típico de las imágenes de Netflix
    marginBottom: 15,  // Añade más espacio hacia abajo

   
    // Sombra para crear profundidad y resplandor
    shadowColor: '#fff', // Sombra blanca para el resplandor luminoso
    shadowOffset: {
      width: 4, // Desplazamiento más pequeño pero aún notorio
      height: 8, // Desplazamiento hacia abajo, más intenso en esta dirección
    },
    shadowOpacity: 0.9, // Opacidad alta para un brillo más fuerte
    shadowRadius: 20, // Radio moderado para difundir bien el resplandor
    elevation: 15, // Para que la sombra sea más visible en Android
    // Efecto de resplandor
    backgroundColor: '#000', // Fondo negro para que el borde blanco brille
    overflow: 'hidden', // Esto asegura que el borde y la sombra no se desborden
  },
  row: {
    flexDirection: 'row', // Acomoda los elementos en una fila
    justifyContent: 'flex-start', // Cambié a flex-start para que se alineen al principio
    alignItems: 'center', // Alinea los elementos al centro verticalmente
    gap: 10, // Espacio entre las imágenes
    width: '100%', // Asegura que la fila ocupe todo el ancho
    paddingHorizontal: 10, // Agrega un pequeño padding horizontal
  },
  item: {
    alignItems: 'center',
    marginBottom: 20,
    marginRight: 20, // Añade un pequeño espacio entre los elementos
  },
});