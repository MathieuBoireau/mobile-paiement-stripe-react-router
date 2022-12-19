import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, TextInput, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as SecureStore from 'expo-secure-store';
import * as ipaddress from '../ipaddress.json'
import { ItemType } from './ItemType';

export default function ScanScreen({ navigation }: any) {
  const [hasPermission, setHasPermission] = useState<boolean|null>(null);
  const [scanned, setScanned] = useState(false);
  const keyTabStore = "keyTabStore";

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: any) => {
    setScanned(true);
    data = JSON.parse(data);
    if(data.id != null)
      await handleItem(data.id)
    else{
      Alert.alert('Erreur', "QR code invalide.")
    }
  };

  const handleItem = async function (idItem: string) {
    const item = await checkItemInDB(idItem);
    if(!item || item.id === undefined){
      Alert.alert("Erreur", "Cet item n'existe pas.");
      return false;
    }
    Alert.alert(
      "Confirmation",
      `Voulez-vous vraiment ajouter l'item "${item.name}" au panier ?`,
      [
          {
              text: "Non",
          },
          {
              text: "Oui",
              onPress: async () => {
                let itemAsync = await SecureStore.getItemAsync(keyTabStore);
                let tab;
                if(itemAsync == null){
                  tab = [];
                }else{
                  tab = JSON.parse(itemAsync);
                }
                let itemInTab = tab.find((itemTab:ItemType) => itemTab.id == item.id)
                if(itemInTab != null){
                  itemInTab.count++;
                }else{
                  tab.push({ id:item.id, name:item.name, price:item.price, count:1});
                }
                await SecureStore.setItemAsync(keyTabStore, JSON.stringify(tab));
                return true;
              },
          },
      ]
    );
  }

  const checkItemInDB = async function(item_id: string) {
    const response = await fetch(`http://${ipaddress.ip}:8000/items/${item_id}`, {
      method: 'GET'
    })
    const json = await response.json()
    if(json == null){
      return null
    }else{
      const { id, name, price } = json;
      return { id, name, price }
    }
  }

  const [id, setId] = useState('');

  const scanView = (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={[StyleSheet.absoluteFillObject, styles.camera]}
      />
      {scanned && <View style={styles.btn}><Button title={'Rescanner'} onPress={() => setScanned(false)} /></View>}
      
      <Button title="Accéder au panier" onPress={() => navigation.navigate('Panier')} />
    </View>
  )

  const inputView = (
    <View>
      <TextInput onChangeText={newText => setId(newText)} />
      <View style={styles.btn}><Button title='Valider' onPress={ async () => {
        if(await handleItem(id))
          Alert.alert("Succès", "Item ajouté au panier");
      }} /></View>
      <Button title="Accéder au panier" onPress={() => navigation.navigate('Panier')} />
    </View>
  )

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }

  if (hasPermission === false) {
    return inputView;
  }else{
    return scanView;
  }
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    marginHorizontal: 8
  },

  btn: {
    paddingBottom: 10
  },

  camera: {
    marginTop: 90
  }
});
