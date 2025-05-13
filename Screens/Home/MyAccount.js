import React, { useState, useEffect } from "react";
import {
  Button,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import firebase, { SUPABASE_URL, SUPABASE_ANON_KEY } from "../../Config";
import * as ImagePicker from "expo-image-picker";

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

  const ref_myaccount = ref_listaccount.child(currentUserid);

  useEffect(() => {
    ref_myaccount.on("value", (snapshot) => {
      const data = snapshot.val();
      console.log(data);
      setNumero(data.numero);
      setPseudo(data.pseudo);
    });
    return () => {
      ref_myaccount.off();
    };
  }, []);

  const uploadImageToStorage = async (urilocal) => {
    try {
      // Fetch the image as a blob
      const response = await fetch(urilocal);
      const blob = await response.blob();

      // Create a unique filename
      const filename = `${currentUserid}_${Date.now()}.jpg`;

      // Upload using Supabase Storage REST API
      const uploadResponse = await fetch(
        `${SUPABASE_URL}/storage/v1/object/lesimages/${filename}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            apikey: SUPABASE_ANON_KEY,
            "Content-Type": "image/jpeg",
          },
          body: blob,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      // Get the public URL
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/lesimages/${filename}`;

      return publicUrl;
    } catch (err) {
      console.error("Error uploading image:", err);
      Alert.alert("Error", "Failed to upload image");
      return null;
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
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
        MyAccount
      </Text>
      <TouchableOpacity
        onPress={() => {
          pickImage();
        }}
      >
        <Image
          source={
            isDefaultImage
              ? require("../../assets/profil.png")
              : { uri: localUriImage }
          }
          style={{
            width: 250,
            height: 250,
            backgroundColor: "#0052",
            borderRadius: 40,
            marginBottom: 50,
          }}
        />
      </TouchableOpacity>
      <TextInput
        onChangeText={(ch) => {
          setPseudo(ch);
        }}
        style={styles.input}
        placeholderTextColor={"white"}
        placeholder="le pseudo"
        value={pseudo}
      />
      <TextInput
        onChangeText={(ch) => {
          setNumero(ch);
        }}
        style={styles.input}
        placeholderTextColor={"white"}
        placeholder="le numero"
        value={numero}
      />
      <Button
        onPress={async () => {
          const urlImage = await uploadImageToStorage(localUriImage);
          console.log("urlImage", urlImage);

          const ref_account = ref_listaccount.child(currentUserid);
          await ref_account.update({
            id: currentUserid,
            pseudo,
            numero,
            urlImage: urlImage,
          });
          Alert.alert("Success", "Profile saved successfully!");
        }}
        title="Save"
      />
      <Button
        onPress={() => {
          auth.signOut().then(() => {
            props.navigation.replace("Auth");
            const ref_account = ref_listaccount.child(currentUserid);
            ref_account.update({
              id: currentUserid,
              connected: false,
            });
          });
        }}
        title="Deconnect"
      />
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
    alignItems: "center",
    justifyContent: "center",
  },
});
