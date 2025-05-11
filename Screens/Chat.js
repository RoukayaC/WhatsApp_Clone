import React, { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import firebase from "../Config";
import { ref } from "firebase/database";

const database = firebase.database();
const ref_listDiscussions = database.ref().child("List_discussions");

const Chat = (props) => {
  const currentid = props.route.params.currentid;
  const secondid = props.route.params.secondid;

  const discid =
    currentid > secondid ? currentid + secondid : secondid + currentid;

  const ref_lesMessages = ref_listDiscussions.child(discid).child("messages");

  const [Messages, setMessages] = useState([]);

  const [msg, setmsg] = useState();

  useEffect(() => {
    ref_lesMessages.on("value", (snapshot) => {
      var d = [];
      snapshot.forEach((un_msg) => {
        d.push(un_msg.val());
      });
    });

    return () => {
      ref_lesMessages.off();
    };
  }, [third]);

  return (
    <ImageBackground
      source={require("../assets/profil.png")}
      style={styles.container}
    >
      <Text
        style={{
          fontSize: 32,
          color: "white",
          textAlign: "center",
          height: 50,
          backgroundColor: "gray",
          width: "100%",
        }}
      >
        Chat
      </Text>
      <FlatList
        style={{
          backgroundColor: "#0005",
          width: "95%",
        }}
      ></FlatList>
      <View style={{ flexDirection: "row" }}>
        <TextInput
          onChangeText={(txt) => {
            setmsg(txt);
          }}
          placeholder=" msg..."
          style={{ height: 50, width: "85%" }}
        ></TextInput>
        <Button
          onPress={() => {
            const ref_disc = ref_listDiscussions.child(discid);
            const ref_messages = ref_disc.child("messages");
            const key = ref_messages.push().key;
            const ref_unmsg = ref_messages.child(key);
            ref_unmsg.set({
              body: msg,
              time: new Date().toLocaleString(),
              sender: currentid,
              receiver: secondid,
            });
          }}
          title="Send"
        ></Button>
      </View>
    </ImageBackground>
  );
};

export default Chat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center", // align horiz
    justifyContent: "flex-start", // align verti
  },
});
