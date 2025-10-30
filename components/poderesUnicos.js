import React, { useContext, useState, useMemo } from 'react';
import { View, Text, TextInput, FlatList, Image, ImageBackground } from 'react-native';
import { AuthContext } from './AuthContext';
import { Estrellitas } from './estrellitas';
import tw from './tailwind';

export const PoderesUnicos = () => {
  const { coleccionPersonajes } = useContext(AuthContext);
  const [tecBuscar, setTecBuscar] = useState('');

  const poderesFiltrados = useMemo(() => {
    const filtro = tecBuscar.toLowerCase();
    return coleccionPersonajes.reduce((acc, personaje) => {
      const tecnicasActivas = (personaje.tecEspecial || []).filter(t => t.check === true);
      if (tecnicasActivas.length === 0) return acc;

      const coincideNombrePersonaje = personaje.nombre?.toLowerCase().includes(filtro);
      const tecnicasFiltradas = tecnicasActivas.filter(t =>
        t.nombre?.toLowerCase().includes(filtro)
      );

      if (coincideNombrePersonaje || tecnicasFiltradas.length > 0) {
        acc.push({
          ...personaje,
          tecEspecial: tecnicasFiltradas.length > 0 ? tecnicasFiltradas : tecnicasActivas,
        });
      }

      return acc;
    }, []);
  }, [tecBuscar, coleccionPersonajes]);

  const renderPersonaje = ({ item }) => (
    <View style={tw`mb-6 rounded-3xl overflow-hidden shadow-lg shadow-black/60`}>
      {/* Banner principal con imagen */}
      <View style={tw`relative w-full h-44`}>
        {item.imagenurl && (
          <Image
            source={{ uri: item.imagenurl }}
            style={tw`w-full h-full`}
          />
        )}
        {/* Overlay degradado y estrellas */}
       <View style={tw`absolute bottom-0 left-0 w-full px-4 py-2 bg-black/50 rounded-t-lg flex-row justify-between items-end`}>
  <Text style={tw`text-white text-xl font-bold`}>
    {item.nombre || 'Desconocido'}
  </Text>
  <View style={tw` p-1 rounded-lg`}>
    <Estrellitas ken={item.ken} />
  </View>
</View>
      </View>

      {/* Técnicas debajo del banner */}
      <View style={tw`bg-[#111]/90 p-4 rounded-b-3xl`}>
        {item.tecEspecial.map((tecnica, idx) => (
          <View key={idx} style={tw`bg-[#222]/70 p-3 rounded-2xl mb-2 shadow-md shadow-cyan-500/20`}>
            <Text style={tw`text-yellow-300 text-lg font-bold mb-1 text-center`}>
              {tecnica.nombre || 'Sin nombre'}
            </Text>
            <Text style={tw`text-[aliceblue] text-center`}>
              <Text style={tw`text-orange-400 font-semibold`}>Descripción: </Text>
              {tecnica.presentacion || 'No disponible'}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const fondoUrl = "https://res.cloudinary.com/dzul1hatw/image/upload/v1761596480/3c5776803bd188a000c4a709bfa5cc73_f93fra.jpg";

  return (
    <ImageBackground
      source={{ uri: fondoUrl }}
      style={tw`flex-1`}
      resizeMode="cover"
    >
      {/* Overlay semitransparente para todo el fondo */}
      <View style={tw`flex-1 bg-black/40`}>
        <TextInput
          style={tw`bg-[#222]/80 text-white p-4 rounded-3xl m-4 shadow-md shadow-cyan-500/30`}
          value={tecBuscar}
          onChangeText={setTecBuscar}
          placeholder="Busca un personaje o poder único"
          placeholderTextColor="#ccc"
        />

        {poderesFiltrados.length > 0 ? (
          <FlatList
            data={poderesFiltrados}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderPersonaje}
            contentContainerStyle={tw`px-4 pb-10`}
            keyboardShouldPersistTaps="handled"
          />
        ) : (
          <Text style={tw`text-yellow-400 text-lg text-center mt-8`}>
            No se encontró la técnica especial buscada.
          </Text>
        )}
      </View>
    </ImageBackground>
  );
};
