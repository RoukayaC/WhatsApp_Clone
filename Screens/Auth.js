import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
  ImageBackground,
  BackHandler,
} from "react-native";

export default function Auth(props) {
  console.log(props);
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
          Welcome
        </Text>

        <TextInput
          keyboardType="email-address"
          style={styles.input}
          placeholder="name@gmail.com"
        ></TextInput>

        <TextInput style={styles.input} placeholder="password"></TextInput>
        <View style={{ flexDirection: "row", gap: 15 }}>
          <Button
            onPress={() => {
              props.navigation.navigate("Home");
            }}
            color={"gray"}
            title="Submit"
          />
          <Button
            onPress={() => {
              BackHandler.exitApp();
            }}
            color={"gray"}
            title="Exit"
          />
        </View>
        <Text
          onPress={() => props.navigation.navigate("NewUser")}
          style={{
            marginTop: 25,
            width: "100%",
            textAlign: "right",
            marginRight: 25,
            fontFamily: "bold",
            fontSize: 16,
            color: "white",
          }}
        >
          Create New Account
        </Text>
      </View>
      <StatusBar style="dark" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "pink",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    height: 50,
    width: "95%",
    backgroundColor: "#fff5",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 5,
    textAlign: "center",
  },
});
