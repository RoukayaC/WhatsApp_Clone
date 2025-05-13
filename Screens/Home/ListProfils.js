import React, { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  Image,
  ImageBackground,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  Alert,
  View,
} from "react-native";
import firebase from "../../Config";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const database = firebase.database();
const ref_database = database.ref();
const ref_listaccount = ref_database.child("ListAccounts");
// Reference for deleted users
const ref_deletedUsers = ref_database.child("DeletedUsers");
// Reference for chat messages
const ref_listDiscussions = database.ref().child("List_discussions");

export default function ListProfils(props) {
  const currentUserid = props.route.params.currentUserid;
  const [data, setdata] = useState([]);
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastMessages, setLastMessages] = useState({});

  // Récuperation des données
  useEffect(() => {
    ref_listaccount.on("value", (snapshot) => {
      var d = [];
      snapshot.forEach((one_account) => {
        if (one_account.val().id != currentUserid) d.push(one_account.val());
      });
      setdata(d);

      // Get last message for each user
      d.forEach((user) => {
        if (user && user.id) {
          const discid =
            currentUserid > user.id
              ? currentUserid + user.id
              : user.id + currentUserid;

          ref_listDiscussions
            .child(discid)
            .child("messages")
            .limitToLast(1)
            .on("value", (snapshot) => {
              if (snapshot.exists()) {
                snapshot.forEach((messageSnap) => {
                  setLastMessages((prev) => ({
                    ...prev,
                    [user.id]: messageSnap.val(),
                  }));
                });
              }
            });
        }
      });
    });

    // Get deleted users
    ref_deletedUsers.child(currentUserid).on("value", (snapshot) => {
      const deleted = [];
      if (snapshot.exists()) {
        snapshot.forEach((item) => {
          deleted.push(item.key);
        });
      }
      setDeletedUsers(deleted);
    });

    return () => {
      ref_listaccount.off();
      ref_deletedUsers.child(currentUserid).off();

      // Cleanup message listeners
      Object.keys(lastMessages).forEach((userId) => {
        const discid =
          currentUserid > userId
            ? currentUserid + userId
            : userId + currentUserid;
        ref_listDiscussions.child(discid).child("messages").off();
      });
    };
  }, []);

  //delete a user
  const deleteUser = (accountId) => {
    Alert.alert(
      "Delete User",
      "Are you sure you want to remove this user from your chats?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            ref_deletedUsers
              .child(currentUserid)
              .child(accountId)
              .set(true)
              .then(() => {
                Alert.alert("Success", "User removed from your chat list");
              })
              .catch((error) => {
                Alert.alert("Error", "Failed to delete: " + error.message);
              });
          },
        },
      ]
    );
  };

  // handle undefined values
  const filteredData = data.filter((user) => {
    //if user is not deleted
    const notDeleted = !deletedUsers.includes(user.id);

    //  no search query
    if (!searchQuery) return notDeleted;

    // search for pseudo
    const matchesPseudo =
      user.pseudo &&
      user.pseudo.toLowerCase().includes(searchQuery.toLowerCase());

    //  search for numero
    const matchesNumero =
      user.numero && user.numero.toString().includes(searchQuery);

    // Return true if not deleted AND matches search
    return notDeleted && (matchesPseudo || matchesNumero);
  });

  return (
    <ImageBackground
      source={require("../../assets/bg.jpg")}
      style={styles.container}
    >
      <Text
        style={{
          fontSize: 26,
          color: "#075E54",
          fontWeight: "bold",
          marginVertical: 15,
        }}
      >
        List of Accounts
      </Text>

      {/* Search bar */}
      <TextInput
        style={{
          height: 50,
          width: "95%",
          backgroundColor: "#f5f5f5",
          marginBottom: 10,
          borderRadius: 25,
          paddingHorizontal: 15,
          fontSize: 16,
          borderWidth: 1,
          borderColor: "#ddd",
        }}
        placeholder="Search for a contact..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* User list */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id || Math.random().toString()}
        renderItem={({ item }) => {
          const color = item.connected ? "#25D366" : "#FF5252";
          const lastMsg = lastMessages[item.id] || {};

          return (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottomWidth: 1,
                borderBottomColor: "#eee",
                padding: 10,
                margin: 5,
                backgroundColor: "white",
              }}
            >
              {/* User info section */}
              <View
                style={{ flexDirection: "row", flex: 1, alignItems: "center" }}
              >
                {/* status indicator */}
                <View style={{ position: "relative" }}>
                  <Image
                    source={
                      item.urlImage
                        ? { uri: item.urlImage }
                        : require("../../assets/profil.png")
                    }
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      borderWidth: 1,
                      borderColor: "#ddd",
                    }}
                  />

                  {/* Status indicator under image */}
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: color,
                      borderWidth: 1,
                      borderColor: "white",
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                    }}
                  />
                </View>

                {/* User name, last message and number */}
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text
                    onPress={() => {
                      props.navigation.navigate("Chat", {
                        currentid: currentUserid,
                        secondid: item.id,
                      });
                    }}
                    style={{
                      fontSize: 16,
                      fontWeight: "500",
                    }}
                  >
                    {item.pseudo || "Unknown User"}
                  </Text>

                  {/* Last message */}
                  <Text
                    numberOfLines={1}
                    style={{
                      color: "#666",
                      fontSize: 14,
                    }}
                  >
                    {lastMsg.body
                      ? (lastMsg.sender === currentUserid ? "You: " : "") +
                        lastMsg.body
                      : "No messages yet"}
                  </Text>

                  <Text
                    style={{
                      color: "#999",
                      fontSize: 12,
                    }}
                  >
                    {item.numero || "No number"}
                  </Text>
                </View>
              </View>

              {/* Action buttons */}
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {/* only show if there's a number */}
                {item.numero && (
                  <MaterialCommunityIcons
                    name="phone"
                    size={24}
                    color="#0C86E6"
                    style={{ padding: 8 }}
                    onPress={() => {
                      if (Platform.OS === "android") {
                        Linking.openURL(`tel:${item.numero}`);
                      } else {
                        Linking.openURL(`telprompt:${item.numero}`);
                      }
                    }}
                  />
                )}

                {/* Delete button */}
                <MaterialCommunityIcons
                  name="delete"
                  size={24}
                  color="#FF5252"
                  style={{ padding: 8 }}
                  onPress={() => deleteUser(item.id)}
                />
              </View>
            </View>
          );
        }}
        style={{ width: "98%" }}
        ListEmptyComponent={() => (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              marginTop: 50,
            }}
          >
            <MaterialCommunityIcons
              name="chat-remove"
              size={70}
              color="#CCCCCC"
            />
            <Text style={{ fontSize: 16, color: "#888888", marginTop: 15 }}>
              {searchQuery ? "No matches found" : "No chats available"}
            </Text>
          </View>
        )}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 45,
    marginBottom: 10,
  },
});
