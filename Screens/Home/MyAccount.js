import React, { useState } from "react";
import {
  Button,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import firebase from "../../Config";

const auth = firebase.auth();
const database = firebase.database();
const ref_database = database.ref();
const ref_listaccount = ref_database.child("ListAccounts");

export default function MyAccount(props) {
  const currentUserid = props.route.params.currentUserid;

  const [pseudo, setPseudo] = useState("");
  const [numero, setNumero] = useState();

  const [isDefaultImage, setIsDefaultImage] = useState(true);
  const [localUriImage, setLocalUriImage] = useState();
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setIsDefaultImage(false);
      setLocalUriImage(result.assets[0].uri);
    }
  };
  return (
    <ImageBackground
      source={require("../../assets/profil.png")}
      style={styles.container}
    >
      <Text
        style={{
          fontSize: 32,
          color: "#11A",
          fontWeight: "bold",
        }}
      >
        MyAccount
      </Text>
      <TouchableOpacity
        onPress={() => {
          pickImage();
        }}
      >
        <Image
          // source={
          //   isDefaultImage
          //     ? require("../../assets/profil.png")
          //     : { uri: localUriImage }
          // }
          style={{
            width: 250,
            height: 250,
            backgroundColor: "#0052",
            borderRadius: 40,
            marginBottom: 50,
          }}
        ></Image>
      </TouchableOpacity>
      <TextInput
        onChangeText={(ch) => {
          setPseudo(ch);
        }}
        style={styles.input}
        placeholderTextColor={"white"}
        placeholder="le pseudo"
      ></TextInput>
      <TextInput
        onChangeText={(ch) => {
          setNumero(ch);
        }}
        style={styles.input}
        placeholderTextColor={"white"}
        placeholder="le numero"
      ></TextInput>
      <Button
        onPress={() => {
          const key = ref_listaccount.push().key; // Unused variable
          const ref_account = ref_listaccount.child(currentUserid);
          ref_account.set({
            id: currentUserid,
            pseudo,
            numero,
          });
        }}
        title="Save"
      />
      <Button
        onPress={() => {
          auth.signOut().then(() => {
            props.navigation.replace("Auth");
          });
        }}
        title="Deconnect"
      ></Button>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  input: {
    color: "white",
    borderWidth: 2,
    borderColor: "white",
    height: 50,
    width: "90%",
    backgroundColor: "#0007",
    marginBottom: 15,
    borderRadius: 4,
    textAlign: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center", // align horiz
    justifyContent: "center", // align verti
  },
});
