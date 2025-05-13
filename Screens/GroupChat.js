import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import firebase from "../Config";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

// Firebase database references
const database = firebase.database();
const ref_groups = database.ref().child("Groups");
const ref_listaccount = database.ref().child("ListAccounts");

const GroupChat = ({ route, navigation }) => {
  // Get parameters from navigation
  const { groupId, groupName, currentUserid } = route.params;

  // Reference to the specific group and its messages
  const ref_group = ref_groups.child(groupId);
  const ref_messages = ref_group.child("messages");

  // State variables
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [members, setMembers] = useState({});
  const [usersInfo, setUsersInfo] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  // Reference for auto-scrolling to bottom
  const flatListRef = useRef(null);

  // Load group info and members
  useEffect(() => {
    ref_group.on("value", (snapshot) => {
      if (snapshot.exists()) {
        // Get members list
        if (snapshot.val().members) {
          setMembers(snapshot.val().members);

          // Load each member's info
          Object.keys(snapshot.val().members).forEach((memberId) => {
            ref_listaccount.child(memberId).once("value", (memberSnapshot) => {
              if (memberSnapshot.exists()) {
                setUsersInfo((prev) => ({
                  ...prev,
                  [memberId]: memberSnapshot.val(),
                }));
              }
            });
          });
        }
      }
    });

    // Clean up when component unmounts
    return () => {
      ref_group.off();
    };
  }, [groupId]);

  // Load current user info
  useEffect(() => {
    ref_listaccount.child(currentUserid).once("value", (snapshot) => {
      if (snapshot.exists()) {
        setCurrentUser(snapshot.val());
      }
    });
  }, [currentUserid]);

  // Load messages
  useEffect(() => {
    ref_messages.on("value", (snapshot) => {
      const loadedMessages = [];

      snapshot.forEach((childSnapshot) => {
        loadedMessages.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });

      setMessages(loadedMessages);

      // Scroll to bottom when new messages arrive
      if (flatListRef.current && loadedMessages.length > 0) {
        setTimeout(() => {
          flatListRef.current.scrollToEnd({ animated: true });
        }, 200);
      }
    });

    // Clean up when component unmounts
    return () => {
      ref_messages.off();
    };
  }, [groupId]);

  // Send a message
  const sendMessage = () => {
    if (!msg.trim()) return;

    const newMessage = {
      text: msg,
      senderId: currentUserid,
      senderName: currentUser?.pseudo || "Unknown",
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleString(),
    };

    ref_messages
      .push(newMessage)
      .then(() => {
        setMsg("");
        // Update group's lastMessage
        ref_group.update({
          lastMessage: {
            text: msg,
            senderId: currentUserid,
            timestamp: new Date().toISOString(),
          },
        });
      })
      .catch((error) => {
        Alert.alert("Error", "Failed to send message: " + error.message);
      });
  };

  // Format timestamp for display
  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "";
    }
  };

  // Render a message item
  const renderMessageItem = ({ item }) => {
    const isMine = item.senderId === currentUserid;
    const sender = usersInfo[item.senderId] || {
      pseudo: item.senderName || "Unknown",
    };

    return (
      <View
        style={[
          styles.messageContainer,
          isMine ? styles.myMessageContainer : styles.theirMessageContainer,
        ]}
      >
        {!isMine && (
          <View style={styles.avatarContainer}>
            <Image
              source={
                sender.urlImage
                  ? { uri: sender.urlImage }
                  : require("../assets/profil.png")
              }
              style={styles.avatar}
            />
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            isMine ? styles.myMessageBubble : styles.theirMessageBubble,
          ]}
        >
          {!isMine && <Text style={styles.senderName}>{sender.pseudo}</Text>}

          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require("../assets/bg.jpg")}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.groupInfo}>
          <View style={styles.groupImagePlaceholder}>
            <Text style={styles.groupInitial}>
              {groupName ? groupName.charAt(0).toUpperCase() : "G"}
            </Text>
          </View>

          <View>
            <Text style={styles.headerTitle}>{groupName}</Text>
            <Text style={styles.memberCount}>
              {Object.keys(members).length} members
            </Text>
          </View>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => {
          if (flatListRef.current && messages.length > 0) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }}
        ListHeaderComponent={
          <Text style={styles.chatStartedMessage}>Group chat started</Text>
        }
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={msg}
          onChangeText={setMsg}
          multiline
        />

        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={!msg.trim()}
        >
          <MaterialCommunityIcons
            name="send"
            size={24}
            color={msg.trim() ? "#128C7E" : "#AAAAAA"}
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#075E54",
    paddingTop: Platform.OS === "ios" ? 50 : 15,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  groupInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  groupImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  groupInitial: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  memberCount: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },

  // Messages styles
  messagesContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  chatStartedMessage: {
    alignSelf: "center",
    backgroundColor: "rgba(225, 245, 254, 0.7)",
    color: "#075E54",
    fontSize: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginVertical: 15,
  },
  messageContainer: {
    marginVertical: 5,
    maxWidth: "80%",
    flexDirection: "row",
    alignItems: "flex-end",
  },
  myMessageContainer: {
    alignSelf: "flex-end",
  },
  theirMessageContainer: {
    alignSelf: "flex-start",
  },
  avatarContainer: {
    marginRight: 5,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  messageBubble: {
    padding: 10,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  myMessageBubble: {
    backgroundColor: "#DCF8C6",
    borderTopRightRadius: 0,
  },
  theirMessageBubble: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 0,
  },
  senderName: {
    color: "#128C7E",
    fontWeight: "500",
    fontSize: 14,
    marginBottom: 3,
  },
  messageText: {
    fontSize: 16,
    color: "#000",
  },
  timeText: {
    fontSize: 12,
    color: "#666",
    alignSelf: "flex-end",
    marginTop: 2,
  },

  // Input area styles
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#ECECEC",
    backgroundColor: "#F8F8F8",
  },
  input: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  sendButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    height: 44,
    width: 44,
  },
});

export default GroupChat;
