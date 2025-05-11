import { StatusBar } from "expo-status-bar";
import {
  BackHandler,
  Button,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import firebase from "../Config";
//import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";

const auth = firebase.auth();

export default function Auth(props) {
  const [email, setemail] = useState("roukaya@gmail.com");
  const [password, setPassword] = useState("111111");
  return (
    <ImageBackground
      source={require("../assets/bg.jpg")}
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
          BienVenue
        </Text>

        <TextInput
          value={email}
          onChangeText={(ch) => {
            setemail(ch);
          }}
          keyboardType="email-address"
          style={styles.input}
          placeholder="name@site.com"
        />

        <TextInput
          value={password}
          onChangeText={(ch) => setPassword(ch)}
          secureTextEntry={true}
          style={styles.input}
          placeholder="***password***"
        />

        <View style={{ flexDirection: "row", gap: 15 }}>
          <Button
            onPress={() => {
              auth
                .signInWithEmailAndPassword(email, password)
                .then(() => {
                  const currentUserid = auth.currentUser.uid;
                  props.navigation.replace("Home", {
                    currentUserid: currentUserid,
                  });
                })
                .catch((error) => {
                  alert(error.message);
                });
            }}
            color={"gray"}
            title="Submit"
          ></Button>
          <Button
            onPress={() => {
              BackHandler.exitApp();
            }}
            color={"gray"}
            title="Exit"
          ></Button>
        </View>
        <Text
          onPress={() => {
            props.navigation.navigate("NewUser");
          }}
          style={{
            marginTop: 15,
            width: "100%",
            textAlign: "right",
            marginRight: 15,
            fontSize: 14,
            fontWeight: "bold",
            color: "white",
          }}
        >
          Create new account
        </Text>
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
