import { useStripe } from "@stripe/stripe-react-native";
import React, { useEffect, useState } from "react";
import { Alert, Text, Button, SafeAreaView, View, FlatList, StyleSheet } from "react-native";
import * as SecureStore from 'expo-secure-store';
import * as ipaddress from '../ipaddress.json'

export default function CheckoutScreen({ navigation }: any) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string>("");
  const [tabStore, setTabStore] = useState<ItemType[]>([]);
  const keyTabStore = "keyTabStore";

  const userId = 1;
  let amount = 0;

  const fetchPaymentSheetParams = async () => {
    amount = 0;
    for (let item of tabStore) {
      amount += item.price * item.count;
    }
    if (amount < 1) {
      return null;
    }
    const response = await fetch(`http://${ipaddress.ip}:8000/payments/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "amount": amount,
        "customer_id": userId
      })
    });

    const { paymentIntent, ephemeralKey, customer } = await response.json();

    return {
      paymentIntent,
      ephemeralKey,
      customer,
    };
  };

  const initializePaymentSheet = async () => {
    const sheetParams = await fetchPaymentSheetParams();
    if (sheetParams) {
      const {
        paymentIntent,
        ephemeralKey,
        customer,
      } = sheetParams;

      const { error } = await initPaymentSheet({
        merchantDisplayName: "Example, Inc.",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: false,
      });

      if (!error) {
        setPaymentIntentId(paymentIntent);
        setLoading(true);
      }
    }else{
      setLoading(false);
    }
  };

  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      const paymentIntent = `pi_${paymentIntentId.split("_")[1]}`;
      const itemsId = [];
      for (let item of tabStore) {
        for (let i = 0; i < item.count; i++) {
          itemsId.push(item.id);
        }
      }
      const response = await fetch(`http://${ipaddress.ip}:8000/payments/check/${paymentIntent}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "items_id": itemsId,
          "customer_id": userId
        })
      });

      if (response.status == 200) {
        Alert.alert('Succès', 'Votre paiement est accepté !');
        SecureStore.setItemAsync(keyTabStore, JSON.stringify([]));
        setTabStore([]);
        navigation.navigate('Accueil');
      }else{
        Alert.alert("Erreur", "Une erreur est survenue.");
        console.log(response.text);
      }
    }
  };

  useEffect(() => {
    SecureStore.getItemAsync(keyTabStore).then((itemAsync) => {
      if (itemAsync == null) {
        setTabStore([]);
      } else {
        setTabStore(JSON.parse(itemAsync));
      }
    });
  }, []);

  useEffect(() => {
    initializePaymentSheet();
  }, [tabStore]);

  let totalAmount = tabStore.reduce((acc, item) => {return acc+item.price*item.count}, 0)/100;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        style={styles.itemList}
        data={tabStore}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text>Prix individuel : {(item.price/100).toFixed(2)} €</Text>
            </View>
            <View style={styles.itemQte}>
              <Text style={styles.itemQteElt} onPress={async () => {
                if (item.count > 1) {
                  item.count--;
                } else {
                  tabStore.splice(tabStore.indexOf(item), 1)
                }
                await SecureStore.setItemAsync(keyTabStore, JSON.stringify(tabStore));
                let tab = JSON.parse(await SecureStore.getItemAsync(keyTabStore))
                setTabStore(tab)
              }}>-</Text>
              <Text style={styles.itemQteElt}>{item.count}</Text>
              <Text style={styles.itemQteElt} onPress={async () => {
                item.count += 1;
                await SecureStore.setItemAsync(keyTabStore, JSON.stringify(tabStore));
                let tab = JSON.parse(await SecureStore.getItemAsync(keyTabStore))
                setTabStore(tab)
              }}>+</Text>
            </View>
          </View>
        )}
      />
      <View style={styles.btn}>
        <Button title='Vider le panier' color={'#FF0000'} onPress={() => {
            Alert.alert(
              "Confirmation", `Voulez-vous vraiment vider le panier ?`,
              [
                  { text: "Non", },
                  { text: "Oui",
                      onPress: async () => {
                        SecureStore.setItemAsync(keyTabStore, JSON.stringify([]));
                        setTabStore([]);
                      },
                  },
              ]
            );
        }} />
      </View>
      <Button
        disabled={!loading}
        title={
          'Procéder au paiement'+(totalAmount==0?'':` (${totalAmount.toFixed(2)} €)`)
        }
        onPress={ openPaymentSheet }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 8
  },

  itemList: {
    paddingHorizontal: 20
  },

  item: {
    borderColor: '#6E5BAA',
    borderWidth: 1,
    borderRadius: 2,
    padding: 10,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  itemName: {
    fontWeight: "bold",
    fontSize: 20
  },

  itemQte: {
    flexDirection: 'row',
    textAlign: "right"
  },

  itemQteElt: {
    fontSize: 30,
    paddingHorizontal: 10
  },

  btn: {
    paddingBottom: 10
  },
})