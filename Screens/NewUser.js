import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Button,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import firebase from "../Config";
const auth = firebase.auth();

export default function NewUser(props) {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();

  return (
    <ImageBackground
      source={require("../assets/profil.png")}
      style={styles.container}
    >
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: "98%",
          height: 300,
          backgroundColor: "#0003",
          borderRadius: 5,
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 34,
            fontStyle: "italic",
            fontWeight: "bold",
          }}
        >
          Create account
        </Text>

        <TextInput
          onChangeText={(ch) => setEmail(ch)}
          keyboardType="email-address"
          style={styles.input}
          placeholder="name@site.com"
        ></TextInput>
        <TextInput
          onChangeText={(ch) => setPassword(ch)}
          style={styles.input}
          placeholder="***password***"
        ></TextInput>
        <TextInput
          onChangeText={(ch) => setConfirmPassword(ch)}
          style={styles.input}
          placeholder="***confirm password***"
        ></TextInput>
        <View style={{ flexDirection: "row", gap: 15 }}>
          <Button
            onPress={() => {
              if (password == confirmPassword) {
                auth
                  .createUserWithEmailAndPassword(email, password)
                  .then(() => {
                    const currentUserid = auth.currentUser.uid;
                    props.navigation.replace("Home", {
                      currentUserid: currentUserid,
                    });
                  })
                  .catch((error) => {
                    alert(error);
                  });
              } else {
                alert("vérifier password");
              }
            }}
            color={"gray"}
            title="Create"
          ></Button>
          <Button
            onPress={() => {
              props.navigation.goBack();
            }}
            color={"gray"}
            title="Back"
          ></Button>
        </View>
      </View>
      <StatusBar style="dark" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "yellow",
    alignItems: "center", // alignement horizontal
    justifyContent: "center", // aligement vertical
  },
  input: {
    width: "95%",
    height: 50,
    backgroundColor: "#fff5",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 4,
    textAlign: "center",
  },
});
