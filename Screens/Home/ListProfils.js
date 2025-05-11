import React, { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  Image,
  ImageBackground,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import firebase from "../../Config";
import { View } from "react-native";

const database = firebase.database();
const ref_database = database.ref();
const ref_listaccount = ref_database.child("ListAccounts");

export default function ListProfils(props) {
  const currentUserid = props.route.params.currentUserid;
  const [data, setdata] = useState([]);

  // Récuperation des données
  useEffect(() => {
    ref_listaccount.on("value", (snapshot) => {
      var d = [];
      snapshot.forEach((one_account) => {
        if (one_account.val().id != currentUserid) d.push(one_account.val());
      });
      setdata(d);
    });

    return () => {
      ref_listaccount.off();
    };
  }, []);

  return (
    <ImageBackground
      source={require("../../assets/bg.jpg")}
      style={styles.container}
    >
      <Text
        style={{
          fontSize: 32,
          color: "#11A",
          fontWeight: "bold",
        }}
      >
        List Accounts
      </Text>
      <TextInput
        style={{
          height: 50,
          width: "95%",
          backgroundColor: "#fff4",
          marginBottom: 10,
        }}
        placeholder="Search account ..."
      ></TextInput>
      {/* afficher data */}
      <FlatList
        data={data}
        renderItem={({ item }) => {
          return (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                borderWidth: 2,
                borderColor: "gray",
                margin: 2,
              }}
            >
              <Image
                source={
                  item.urlImage
                    ? { uri: item.urlImage } // Fixed: Changed from urlImage to item.urlImage
                    : require("../../assets/profil.png")
                }
                style={styles.profileImage}
              />
              <Text
                onPress={() => {
                  props.navigation.navigate("Chat", {
                    currentid: currentUserid,
                    secondid: item.id,
                  });
                }}
              >
                {item.pseudo}
              </Text>
              <Text
                onPress={() => {
                  if (Platform.OS == "android") {
                    Linking.openURL("tel:" + item.numero);
                  } else {
                    Linking.openURL("telprompt:" + item.numero);
                  }
                }}
              >
                {item.numero}
              </Text>
            </View>
          );
        }}
        style={{ width: "98%" }}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 45,
    marginBottom: 10,
  },
});
