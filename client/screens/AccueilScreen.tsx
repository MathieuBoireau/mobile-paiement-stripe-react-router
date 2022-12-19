import React from "react";
import { Button, SafeAreaView, View, StyleSheet } from "react-native"


export function AccueilScreen({ navigation }: any) {

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.btn}><Button title="Scanner un QR Code" onPress={() => navigation.navigate('Scan')} /></View>
      <View style={styles.btn}><Button title="Accéder au panier" onPress={() => navigation.navigate('Panier')} /></View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 8
  },

  btn: {
    paddingBottom: 10
  }
})