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
const database = firebase.database();
const ref_database = database.ref();
const ref_listaccount = ref_database.child("ListAccounts");

export default function NewUser(props) {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();

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
          backgroundColor: "rgba(0,0,0,0.65)",
          borderRadius: 10,
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

        <View style={{ flexDirection: "row", gap: 15, marginTop: 10 }}>
          <Button
            onPress={() => {
              if (password == confirmPassword) {
                auth
                  .createUserWithEmailAndPassword(email, password)
                  .then(() => {
                    const currentUserid = auth.currentUser.uid;
                    {
                      /* to show the status of the user connected or not*/
                    }
                    const ref_myaccount = ref_listaccount.child(currentUserid);
                    ref_myaccount.set({
                      id: currentUserid,
                      connected: true,
                    });

                    props.navigation.replace("MyAccount", {
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
            color={"#666"}
            title="Create"
          ></Button>
          <Button
            onPress={() => {
              props.navigation.goBack();
            }}
            color={"#666"}
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
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    width: "95%",
    height: 50,
    backgroundColor: "#fff7",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#075E54",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 16,
  },
});
