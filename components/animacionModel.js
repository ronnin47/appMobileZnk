import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Vibration, Image, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

export const AnimacionModel = ({
  source,
  scaleSize = 0.5,
  filas = 3,
  columnas = 4,
  fps = 6,
}) => {
  const uri = source?.uri ?? source;

  const frame = useSharedValue(0);

  const [flip, setFlip] = useState(false);
  const [sound, setSound] = useState(null);
const [boost, setBoost] = useState(1);
  const [frameSize, setFrameSize] = useState({
    width: 0,
    height: 0,
  });

  const [debug, setDebug] = useState(null);

  const rows = Number(filas) || 3;
  const cols = Number(columnas) || 4;
  const frames = rows * cols;

  //const duration = fps ? (1000 / fps) * frames : 8000;
const duration = fps ? ((1000 / fps) * frames) / boost : 8000;
  // -------------------------
  // SIZE DEL SPRITE
  // -------------------------
  useEffect(() => {
    if (!uri) return;

    Image.getSize(
      uri,
      (width, height) => {
        setFrameSize({
          width: width / cols,
          height: height / rows,
        });
      },
      (error) => {
        console.log("Error leyendo sprite:", error);
      }
    );
  }, [uri, cols, rows]);

  // -------------------------
  // DEBUG
  // -------------------------
  useEffect(() => {
    const run = async () => {
      if (!uri) return;

      const info = await FileSystem.getInfoAsync(uri);

      setDebug({
        uri,
        exists: info.exists,
        size: info.size,
      });
    };

    run();
  }, [uri]);

  // -------------------------
  // AUDIO
  // -------------------------
  useEffect(() => {
    let soundObj;

    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("../assets/accion.mp3"),
          { volume: 0.1 }
        );

        soundObj = sound;
        setSound(sound);
      } catch (e) {
        console.log("Sound error:", e);
      }
    };

    loadSound();

    return () => {
      if (soundObj) soundObj.unloadAsync();
    };
  }, []);

  const playSound = async () => {
    if (sound) {
      try {
        await sound.replayAsync();
      } catch (e) {}
    }
  };

  // -------------------------
  // ANIMACIÓN
  // -------------------------
  const startAnimation = () => {
    cancelAnimation(frame);

    const current = frame.value % frames;
    frame.value = current;

    frame.value = withRepeat(
      withTiming(frames + current, {
        duration,
        easing: Easing.steps(frames),
      }),
      -1,
      false
    );
  };

  useEffect(() => {
    if (frameSize.width > 0) {
      startAnimation();
    }
  }, [frameSize, duration]);

  // -------------------------
  // INTERACCIÓN
  // -------------------------
 /* const handlePress = () => {
    Vibration.vibrate(120);
    playSound();
    setFlip((p) => !p);
  };
*/
  const handlePress = () => {
  Vibration.vibrate(120);
  playSound();
  setFlip((p) => !p);

  // boost temporal
  setBoost(2);

  setTimeout(() => {
    setBoost(1);
  }, 2000);
};
  // -------------------------
  // FRAME OFFSET
  // -------------------------
  const animatedStyle = useAnimatedStyle(() => {
    if (!frameSize.width) return {};

    const f = Math.floor(frame.value % frames);

    const col = f % cols;
    const row = Math.floor(f / cols);

    return {
      transform: [
        { translateX: -col * frameSize.width },
        { translateY: -row * frameSize.height },
      ],
    };
  });

  if (!frameSize.width || !uri) return null;

  return (
    <View>
      {debug && (
        <Text style={{ color: "white", fontSize: 10 }}>
          size: {debug.size} bytes
        </Text>
      )}

      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <View
          style={{
            width: frameSize.width,
            height: frameSize.height,
            overflow: "hidden",
            backgroundColor: "transparent",
            transform: [
              { scale: scaleSize },
              { scaleX: flip ? -1 : 1 },
            ],
          }}
        >
          <Animated.Image
            source={{ uri }}
            style={[
              {
                width: frameSize.width * cols,
                height: frameSize.height * rows,
              },
              animatedStyle,
            ]}
            resizeMode="cover"
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};