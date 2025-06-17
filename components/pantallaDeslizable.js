import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import PagerView from 'react-native-pager-view';
import {FichaPersonaje} from './fichaPersonaje';
import {Tiradas} from './tiradas';



import { useRoute } from '@react-navigation/native';

export const PantallaDeslizable = () => {

     const route = useRoute();
  const { pj} = route.params;


  return (
    <PagerView style={styles.pagerView} initialPage={0}>
      <View key="1" style={styles.page}>
        <FichaPersonaje pj={pj} />
      </View>
      <View key="2" style={styles.page}>
        <Tiradas pj={pj} />
      </View>
    </PagerView>
  );
};

const styles = StyleSheet.create({
  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
});
