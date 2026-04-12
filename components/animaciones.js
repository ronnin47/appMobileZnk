import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Vibration } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import { Audio } from 'expo-av';
const COLUMNS = 6;
const ROWS = 2;
const FRAMES = 12;

const FRAME_WIDTH = 110;
const FRAME_HEIGHT = 190;
const CROP_BOTTOM = 25;

export const Animaciones = ({ scaleSize = 0.5 }) => {
  const frame = useSharedValue(0);

  const [duration, setDuration] = useState(800);
  const [flip, setFlip] = useState(false); // 🔥 dirección


  const [sound, setSound] = useState(null);

  useEffect(() => {
    let sonido;
  
    const cargarSonido = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/nakaSound.mp3'),
          { volume: 0.1 }
        );
  
        sonido = sound;
        setSound(sound);
      } catch (error) {
        console.log("Error cargando sonido:", error);
      }
    };
  
    cargarSonido();
  
    return () => {
      if (sonido) {
        sonido.unloadAsync();
      }
    };
  }, []);
  
  
  const reproducirSonidoSeleccion = async () => {
    if (sound) {
      try {
        await sound.replayAsync();
      } catch (error) {
        console.log("Error reproduciendo sonido:", error);
      }
    }
  };
  



  const startAnimation = () => {
    cancelAnimation(frame);

    const current = frame.value % FRAMES;

    frame.value = current;

    frame.value = withRepeat(
      withTiming(FRAMES + current, {
        duration: duration,
        easing: Easing.steps(FRAMES),
      }),
      -1,
      false
    );
  };

  useEffect(() => {
    startAnimation();
  }, [duration]);

  const handlePress = () => {
    // 📳 vibración
    Vibration.vibrate(120);


    //snido
    reproducirSonidoSeleccion();

    // 🔁 cambia dirección
    setFlip((prev) => !prev);

    // 🚀 boost velocidad
    setDuration(250);

    setTimeout(() => {
      setDuration(800);
    }, 1500);
  };

  const animatedStyle = useAnimatedStyle(() => {
    const f = Math.floor(frame.value % FRAMES);

    const col = f % COLUMNS;
    const row = Math.floor(f / COLUMNS);

    return {
      transform: [
        { translateX: -col * FRAME_WIDTH },
        { translateY: -row * FRAME_HEIGHT },
      ],
    };
  });

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <View
        style={{
          width: FRAME_WIDTH,
          height: FRAME_HEIGHT - CROP_BOTTOM,
          overflow: "hidden",
          transform: [
            { scale: scaleSize },
            { scaleX: flip ? -1 : 1 }, // 🔥 inversión real
          ],
        }}
      >
        <Animated.Image
          source={require("../assets/naka.png")}
          style={[
            {
              width: FRAME_WIDTH * COLUMNS,
              height: FRAME_HEIGHT * ROWS,
            },
            animatedStyle,
          ]}
          resizeMode="cover"
        />
      </View>
    </TouchableOpacity>
  );
};