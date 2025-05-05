import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
  ImageBackground,
} from "react-native";

export default function NewUser(props) {
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
          Create Account
        </Text>

        <TextInput
          keyboardType="email-address"
          style={styles.input}
          placeholder="name@gmail.com"
        ></TextInput>

        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry={true}
        ></TextInput>

        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          secureTextEntry={true}
        ></TextInput>

        <View style={{ flexDirection: "row", gap: 15 }}>
          <Button
            onPress={() => {
              props.navigation.replace("Home");
            }}
            color={"gray"}
            title="Create"
          />
          <Button
            onPress={() => {
              props.navigation.goBack();
            }}
            color={"gray"}
            title="Back"
          />
        </View>
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
