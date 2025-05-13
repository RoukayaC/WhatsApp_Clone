import React, { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  Modal,
  Alert,
  Pressable,
  Platform,
  Linking,
  ActionSheetIOS,
  Clipboard,
} from "react-native";
import firebase from "../Config";
import { ref } from "firebase/database";
import * as DocumentPicker from "expo-document-picker";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";

const database = firebase.database();
const ref_listDiscussions = database.ref().child("List_discussions");
const ref_listaccount = database.ref().child("ListAccounts");

const Chat = (props) => {
  const currentid = props.route.params.currentid;
  const secondid = props.route.params.secondid;
  const discid =
    currentid > secondid ? currentid + secondid : secondid + currentid;
  const ref_lesMessages = ref_listDiscussions.child(discid).child("messages");
  const ref_ladiscussion = ref_listDiscussions.child(discid);
  const ref_istyping = ref_ladiscussion.child("istyping");
  const [Messages, setMessages] = useState([]);
  const [msg, setmsg] = useState("");
  const [istyping, setIstyping] = useState(false);

  // States for user profiles
  const [currentUser, setCurrentUser] = useState({});
  const [secondUser, setSecondUser] = useState({});

  // States for modals
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [reactionModalVisible, setReactionModalVisible] = useState(false);
  const [messageActionVisible, setMessageActionVisible] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);

  // Combined modal state
  const [modalState, setModalState] = useState({
    media: false,
    imagePreview: false,
    previewImage: null,
  });

  // Load user profiles
  useEffect(() => {
    ref_listaccount.child(currentid).on("value", (snapshot) => {
      if (snapshot.exists()) {
        setCurrentUser(snapshot.val());
      }
    });

    ref_listaccount.child(secondid).on("value", (snapshot) => {
      if (snapshot.exists()) {
        setSecondUser(snapshot.val());
      }
    });

    return () => {
      ref_listaccount.child(currentid).off();
      ref_listaccount.child(secondid).off();
    };
  }, []);

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
      const d = [];
      const media = [];

      snapshot.forEach((un_msg) => {
        const message = {
          id: un_msg.key,
          ...un_msg.val(),
        };

        d.push(message);

        // Collect media items
        if (message.mediaUrl) {
          media.push(message);
        }
      });

      setMessages(d);
      setMediaItems(media);
    });

    return () => {
      ref_lesMessages.off();
    };
  }, []);

  // Function to delete message
  const deleteMessage = (messageId, forEveryone) => {
    if (forEveryone) {
      ref_lesMessages.child(messageId).remove();
    } else {
      ref_lesMessages.child(messageId).update({
        deletedFor: [currentid],
      });
    }
    setDeleteModalVisible(false);
  };

  // Function to add reaction
  const addReaction = (messageId, reaction) => {
    const ref_message = ref_lesMessages.child(messageId);
    ref_message.update({
      reaction: {
        by: currentid,
        type: reaction,
      },
    });
    setReactionModalVisible(false);
  };

  // Function to render reaction emoji
  const renderReaction = (reaction) => {
    if (!reaction) return null;

    let emoji = "";
    switch (reaction.type) {
      case "like":
        emoji = "👍";
        break;
      case "love":
        emoji = "❤️";
        break;
      case "laugh":
        emoji = "😂";
        break;
      case "wow":
        emoji = "😮";
        break;
      case "sad":
        emoji = "😢";
        break;
      case "angry":
        emoji = "😡";
        break;
      default:
        return null;
    }

    return (
      <View style={styles.reactionBadge}>
        <Text style={{ fontSize: 16 }}>{emoji}</Text>
      </View>
    );
  };

  // Function to pick image from gallery
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        const fakeMediaUrl = selectedAsset.uri;

        // Send message with media
        const ref_disc = ref_listDiscussions.child(discid);
        const ref_messages = ref_disc.child("messages");
        const key = ref_messages.push().key;
        const ref_unmsg = ref_messages.child(key);
        ref_unmsg.set({
          body: "Sent a photo",
          time: new Date().toLocaleString(),
          sender: currentid,
          receiver: secondid,
          mediaUrl: fakeMediaUrl,
        });

        Alert.alert("Success", "Image sent successfully!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image: " + error.message);
    }
  };

  // Function to share location
  const shareLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Send location as message
      const ref_disc = ref_listDiscussions.child(discid);
      const ref_messages = ref_disc.child("messages");
      const key = ref_messages.push().key;
      const ref_unmsg = ref_messages.child(key);
      ref_unmsg.set({
        body: `📍 Location: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
        time: new Date().toLocaleString(),
        sender: currentid,
        receiver: secondid,
        location: { latitude, longitude },
      });

      Alert.alert("Success", "Location shared successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to get location: " + error.message);
    }
  };

  // Function to copy message to clipboard
  const copyMessage = (message) => {
    Clipboard.setString(message.body);
    Alert.alert("Copied", "Message copied to clipboard");
    setMessageActionVisible(false);
  };

  // Function to show message actions
  const showMessageActions = (message) => {
    setSelectedMessage(message);
    setMessageActionVisible(true);

    // For iOS, use ActionSheet
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Copy", "React with emoji", "Delete message"],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 3,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            copyMessage(message);
          } else if (buttonIndex === 2) {
            setReactionModalVisible(true);
          } else if (buttonIndex === 3) {
            setDeleteModalVisible(true);
          }
        }
      );
    }
  };

  return (
    <ImageBackground
      source={require("../assets/bg.jpg")}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => props.navigation.goBack()}
          style={styles.iconButton}
        >
          <Text style={styles.headerIcon}>←</Text>
        </Pressable>

        <Text style={styles.headerTitle}>{secondUser.pseudo || "Chat"}</Text>

        <Pressable
          onPress={() => setModalState({ ...modalState, media: true })}
          style={styles.iconButton}
        >
          <Text style={styles.headerIcon}>🖼️</Text>
        </Pressable>
      </View>

      <FlatList
        data={Messages}
        renderItem={({ item }) => {
          // Skip deleted messages
          if (item.deletedFor && item.deletedFor.includes(currentid)) {
            return null;
          }

          const color = item.sender === currentid ? "#DCF8C6" : "#FFFFFF";
          const align = item.sender === currentid ? "flex-end" : "flex-start";
          const userInfo = item.sender === currentid ? currentUser : secondUser;

          return (
            <View
              style={{
                flexDirection: align === "flex-start" ? "row" : "row-reverse",
                alignSelf: align,
                margin: 5,
                maxWidth: "85%",
              }}
            >
              {/* User avatar */}
              <Pressable
                onPress={() => {
                  setSelectedUser(userInfo);
                  setUserModalVisible(true);
                }}
                style={{
                  marginHorizontal: 5,
                  alignSelf: "flex-end",
                }}
              >
                <Image
                  source={
                    userInfo.urlImage
                      ? { uri: userInfo.urlImage }
                      : require("../assets/profil.png")
                  }
                  style={styles.avatar}
                />
              </Pressable>

              {/* Message bubble */}
              <Pressable
                onLongPress={() => showMessageActions(item)}
                style={[styles.messageBubble, { backgroundColor: color }]}
              >
                {/* Show media if present */}
                {item.mediaUrl && (
                  <Pressable
                    onPress={() => {
                      setModalState({
                        ...modalState,
                        imagePreview: true,
                        previewImage: item.mediaUrl,
                      });
                    }}
                  >
                    <Image
                      source={{ uri: item.mediaUrl }}
                      style={styles.mediaImage}
                      resizeMode="cover"
                    />
                  </Pressable>
                )}

                {/* Show location if present */}
                {item.location && (
                  <View style={styles.locationBox}>
                    <Text style={styles.locationText}>{item.body}</Text>
                  </View>
                )}

                {!item.location && (
                  <Text style={styles.messageText}>{item.body}</Text>
                )}
                <Text style={styles.timeText}>{item.time}</Text>

                {/* Render reaction if exists */}
                {renderReaction(item.reaction)}
              </Pressable>
            </View>
          );
        }}
        style={styles.messageList}
      />

      {/* Typing indicator */}
      {istyping === secondid && currentid !== secondid && (
        <Text style={styles.typingIndicator}>
          {secondUser.pseudo || "User"} is typing...
        </Text>
      )}

      {/* Input area */}
      <View style={styles.inputContainer}>
        <TextInput
          value={msg}
          onFocus={() => {
            ref_ladiscussion.child("istyping").set(currentid);
          }}
          onBlur={() => {
            ref_ladiscussion.child("istyping").set("");
          }}
          onChangeText={(txt) => {
            setmsg(txt);
          }}
          placeholder=" Type a message..."
          style={styles.input}
        />

        {/* Gallery button */}
        <Pressable onPress={pickImage} style={styles.iconButton}>
          <Text style={styles.iconText}>📷</Text>
        </Pressable>

        {/* Location button */}
        <Pressable onPress={shareLocation} style={styles.iconButton}>
          <Text style={styles.iconText}>📍</Text>
        </Pressable>

        {/* Send button */}
        <Button
          onPress={() => {
            if (!msg || msg.trim() === "") return;

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

            // Clear input after sending
            setmsg("");
          }}
          title="Send"
          color="#128C7E"
        />
      </View>

      {/* User profile modal */}
      <Modal
        visible={userModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setUserModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Image
              source={
                selectedUser?.urlImage
                  ? { uri: selectedUser.urlImage }
                  : require("../assets/profil.png")
              }
              style={styles.modalAvatar}
            />

            <Text style={styles.modalTitle}>
              {selectedUser?.pseudo || "User"}
            </Text>

            {selectedUser?.numero && (
              <Text style={styles.modalSubtitle}>
                Phone: {selectedUser.numero}
              </Text>
            )}

            <View style={styles.buttonRow}>
              {selectedUser?.numero && (
                <Button
                  title="Call"
                  color="#4CAF50"
                  onPress={() => {
                    if (Platform.OS === "android") {
                      Linking.openURL(`tel:${selectedUser.numero}`);
                    } else {
                      Linking.openURL(`telprompt:${selectedUser.numero}`);
                    }
                    setUserModalVisible(false);
                  }}
                />
              )}

              <Button
                title="Close"
                color="#F44336"
                onPress={() => setUserModalVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Message action modal for Android */}
      {Platform.OS === "android" && (
        <Modal
          visible={messageActionVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setMessageActionVisible(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setMessageActionVisible(false)}
          >
            <View style={styles.actionSheet}>
              {/* Copy button */}
              <Pressable
                style={styles.actionOption}
                onPress={() => copyMessage(selectedMessage)}
              >
                <Text style={styles.actionText}>📋 Copy message</Text>
              </Pressable>

              <Pressable
                style={styles.actionOption}
                onPress={() => {
                  setMessageActionVisible(false);
                  setReactionModalVisible(true);
                }}
              >
                <Text style={styles.actionText}>😊 React with emoji</Text>
              </Pressable>

              <Pressable
                style={[styles.actionOption, styles.dangerOption]}
                onPress={() => {
                  setMessageActionVisible(false);
                  setDeleteModalVisible(true);
                }}
              >
                <Text style={styles.dangerText}>🗑️ Delete message</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      )}

      {/* Emoji Reaction modal */}
      <Modal
        visible={reactionModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setReactionModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setReactionModalVisible(false)}
        >
          <View style={styles.emojiContainer}>
            <View style={styles.emojiRow}>
              {["like", "love", "laugh"].map((type) => (
                <Pressable
                  key={type}
                  style={styles.emojiButton}
                  onPress={() => addReaction(selectedMessage?.id, type)}
                >
                  <Text style={styles.emoji}>
                    {type === "like" ? "👍" : type === "love" ? "❤️" : "😂"}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.emojiRow}>
              {["wow", "sad", "angry"].map((type) => (
                <Pressable
                  key={type}
                  style={styles.emojiButton}
                  onPress={() => addReaction(selectedMessage?.id, type)}
                >
                  <Text style={styles.emoji}>
                    {type === "wow" ? "😮" : type === "sad" ? "😢" : "😡"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Delete modal */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Message</Text>

            <Pressable
              onPress={() => deleteMessage(selectedMessage?.id, false)}
              style={styles.deleteOption}
            >
              <Text style={styles.deleteText}>Delete for me</Text>
            </Pressable>

            <Pressable
              onPress={() => deleteMessage(selectedMessage?.id, true)}
              style={styles.deleteOption}
            >
              <Text style={styles.deleteText}>Delete for everyone</Text>
            </Pressable>

            <Pressable
              style={styles.cancelButton}
              onPress={() => setDeleteModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Media gallery modal */}
      <Modal
        visible={modalState.media}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setModalState({ ...modalState, media: false })}
      >
        <View style={styles.fullScreenModal}>
          <View style={styles.header}>
            <Pressable
              onPress={() => setModalState({ ...modalState, media: false })}
              style={styles.iconButton}
            >
              <Text style={styles.headerIcon}>←</Text>
            </Pressable>

            <Text style={styles.headerTitle}>Media Gallery</Text>

            <View style={styles.iconButton} />
          </View>

          {mediaItems.length > 0 ? (
            <FlatList
              data={mediaItems}
              numColumns={2}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setModalState({
                      ...modalState,
                      media: false,
                      imagePreview: true,
                      previewImage: item.mediaUrl,
                    });
                  }}
                  style={styles.mediaGridItem}
                >
                  <Image
                    source={{ uri: item.mediaUrl }}
                    style={styles.mediaGridImage}
                    resizeMode="cover"
                  />
                </Pressable>
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 10 }}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No media shared in this chat</Text>
            </View>
          )}
        </View>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        visible={modalState.imagePreview}
        transparent={true}
        animationType="fade"
        onRequestClose={() =>
          setModalState({ ...modalState, imagePreview: false })
        }
      >
        <View style={styles.fullScreenImage}>
          <Pressable
            style={styles.fullScreenImageClose}
            onPress={() =>
              setModalState({ ...modalState, imagePreview: false })
            }
          >
            <Text style={{ color: "white", fontSize: 24 }}>×</Text>
          </Pressable>

          <Image
            source={{ uri: modalState.previewImage }}
            style={styles.fullScreenImageContent}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </ImageBackground>
  );
};

export default Chat;

// Optimized StyleSheet
const styles = StyleSheet.create({
  // Layout & Container Styles
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  fullScreenModal: {
    flex: 1,
    backgroundColor: "white",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Header Styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    backgroundColor: "#075E54",
    width: "100%",
    paddingHorizontal: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  headerIcon: {
    color: "white",
    fontSize: 22,
  },

  // Message List Styles
  messageList: {
    backgroundColor: "#ECE5DD",
    width: "95%",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  messageBubble: {
    padding: 8,
    borderRadius: 10,
    maxWidth: "88%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
    position: "relative",
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
  typingIndicator: {
    color: "#888",
    fontStyle: "italic",
    margin: 5,
  },

  // Input Area Styles
  inputContainer: {
    flexDirection: "row",
    padding: 5,
    backgroundColor: "#F6F6F6",
    width: "100%",
    alignItems: "center",
  },
  input: {
    height: 50,
    flex: 1,
    backgroundColor: "white",
    borderRadius: 25,
    paddingHorizontal: 15,
    marginRight: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 2,
  },
  iconText: {
    fontSize: 24,
  },

  // Modal Content Styles
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#075E54",
    marginBottom: 15,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#075E54",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },

  // Media Styles
  mediaImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  locationBox: {
    backgroundColor: "#E1F5FE",
    padding: 8,
    borderRadius: 8,
    marginBottom: 5,
  },
  locationText: {
    color: "#0288D1",
    fontSize: 14,
  },
  mediaGridItem: {
    flex: 1,
    margin: 5,
    height: 150,
    borderRadius: 10,
    overflow: "hidden",
  },
  mediaGridImage: {
    width: "100%",
    height: "100%",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },

  // Image Preview Styles
  fullScreenImage: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImageClose: {
    position: "absolute",
    top: 30,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImageContent: {
    width: "100%",
    height: "80%",
  },

  // Reaction Styles
  reactionBadge: {
    position: "absolute",
    bottom: -10,
    right: 10,
    backgroundColor: "white",
    borderRadius: 15,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  emojiContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  emojiRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  emojiButton: {
    padding: 10,
    margin: 5,
  },
  emoji: {
    fontSize: 24,
  },

  // Action Sheet Styles
  actionSheet: {
    width: "70%",
    backgroundColor: "white",
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  actionOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
  },
  actionText: {
    fontSize: 16,
    color: "#333",
  },
  dangerOption: {
    backgroundColor: "#FFEBEE",
  },
  dangerText: {
    fontSize: 16,
    color: "#F44336",
  },

  // Delete Modal Styles
  deleteOption: {
    backgroundColor: "#FFEBEE",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    alignItems: "center",
    width: "100%",
  },
  deleteText: {
    color: "#F44336",
    fontSize: 16,
    fontWeight: "500",
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginTop: 5,
    width: "100%",
  },
  cancelText: {
    color: "#757575",
    fontSize: 16,
    fontWeight: "500",
  },
});
