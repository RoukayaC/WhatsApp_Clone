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
import { useState } from "react";
const database = firebase.database();
const ref_database = database.ref();
const ref_listaccount = ref_database.child("ListAccounts");
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
          height: 350,
          backgroundColor: "rgba(0,0,0,0.6)",
          borderRadius: 12,
          padding: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 34,
            fontStyle: "italic",
            fontWeight: "bold",
            marginBottom: 20,
          }}
        >
          WELOCOME
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

        <View style={{ flexDirection: "row", gap: 15, marginTop: 10 }}>
          <Button
            onPress={() => {
              auth
                .signInWithEmailAndPassword(email, password)
                .then(() => {
                  const currentUserid = auth.currentUser.uid;
                  {
                    /* to show the status of the user connected or not*/
                  }
                  const ref_myaccount = ref_listaccount.child(currentUserid);
                  ref_myaccount.update({
                    id: currentUserid,
                    connected: true,
                  });
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
            textDecorationLine: "underline",
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
    justifyContent: "center",
  },
  input: {
    width: "95%",
    height: 50,
    backgroundColor: "#fff8",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#075E54",
    borderRadius: 8,
    textAlign: "center",
    paddingHorizontal: 15,
    fontSize: 16,
  },
});
