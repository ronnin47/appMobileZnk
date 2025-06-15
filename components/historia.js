import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

export const Historia = ({ historia, setHistoria }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textarea}
        value={historia}
        onChangeText={setHistoria}
        multiline
        placeholder="Escribe la historia aquí..."
        placeholderTextColor="#aaa"
        textAlignVertical="top"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop:10,
    padding: 5,
    backgroundColor: 'black',
  },
  titulo: {
    color: 'aliceblue',
    fontSize: 30,
    fontFamily: 'Impact',
    margin: 10,
  },
  textarea: {
    backgroundColor: '#111',
    color: 'white',
    fontSize: 16,
    borderRadius: 6,
    padding: 10,
    minHeight: 150,
  },
});
