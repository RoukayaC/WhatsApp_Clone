import React, { use, useEffect, useState } from "react";
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
  const ref_ladiscussion = ref_listDiscussions.child(discid);
  const ref_istyping = ref_ladiscussion.child("istyping");
  const [Messages, setMessages] = useState([]);
  const [msg, setmsg] = useState();
  const [istyping, setIstyping] = useState(false);

  useEffect(() => {
    ref_istyping.on("value", (snapshot) => {
      setIstyping(snapshot.val());
    });
    return () => {
      ref_istyping.off();
    };
  }, []);

  useEffect(() => {
    ref_lesMessages.on("value", (snapshot) => {
      var d = [];
      snapshot.forEach((un_msg) => {
        d.push(un_msg.val());
      });
      setMessages(d);
    });

    return () => {
      ref_lesMessages.off();
    };
  }, []);

  return (
    <ImageBackground
      source={require("../assets/bg.jpg")}
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
        data={Messages}
        renderItem={({ item }) => {
          const color = item.sender === currentid ? "green" : "blue";
          const align = item.sender === currentid ? "flex-end" : "flex-start";
          return (
            <View
              style={{
                backgroundColor: color,
                margin: 5,
                alignItems: align,
              }}
            >
              <Text>{item.body}</Text>
              <Text>{item.time}</Text>
            </View>
          );
        }}
        style={{
          backgroundColor: "#0005",
          width: "95%",
        }}
      ></FlatList>

      {/* afficher si l'autre est en train de taper */}
      {istyping === secondid && currentid !== secondid && (
        <Text> is typing...</Text>
      )}

      <View style={{ flexDirection: "row" }}>
        <TextInput
          //add when the user is typing a mssg..
          onFocus={() => {
            ref_ladiscussion.child("istyping").set(currentid);
          }}
          onBlur={() => {
            ref_ladiscussion.child("istyping").set("");
          }}
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
