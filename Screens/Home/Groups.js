import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Image,
} from "react-native";
import firebase from "../../Config";
import { useNavigation, useRoute } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

// Firebase database references
const database = firebase.database();
const ref_groups = database.ref().child("Groups");
const ref_listaccount = database.ref().child("ListAccounts");

export default function Groups() {
  const navigation = useNavigation();
  const route = useRoute();
  const currentUserid = route.params?.currentUserid;

  // Debug logs
  console.log("Groups component loaded");
  console.log("route.params:", route.params);
  console.log("currentUserid:", currentUserid);
  console.log("typeof currentUserid:", typeof currentUserid);

  // State variables
  const [userGroups, setUserGroups] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [createGroupModal, setCreateGroupModal] = useState(false);
  const [currentUser, setCurrentUser] = useState({});

  // Load current user data
  useEffect(() => {
    if (currentUserid) {
      const ref_currentUser = ref_listaccount.child(currentUserid);
      ref_currentUser.on("value", (snapshot) => {
        if (snapshot.exists()) {
          setCurrentUser(snapshot.val());
        }
      });

      return () => {
        ref_currentUser.off();
      };
    }
  }, [currentUserid]);

  // Load all users
  useEffect(() => {
    ref_listaccount.on("value", (snapshot) => {
      const users = [];
      snapshot.forEach((userSnapshot) => {
        const user = userSnapshot.val();
        if (user.id !== currentUserid) {
          users.push(user);
        }
      });
      setAllUsers(users);
    });

    return () => {
      ref_listaccount.off();
    };
  }, [currentUserid]);

  // Load groups where the current user is a member
  useEffect(() => {
    if (!currentUserid) return;

    ref_groups.on("value", (snapshot) => {
      const userJoinedGroups = [];

      snapshot.forEach((groupSnapshot) => {
        const group = {
          id: groupSnapshot.key,
          ...groupSnapshot.val(),
        };

        // Check if user is a member or admin of this group
        const members = group.members || {};
        if (members[currentUserid] || group.adminId === currentUserid) {
          userJoinedGroups.push(group);
        }
      });

      setUserGroups(userJoinedGroups);
    });

    return () => {
      ref_groups.off();
    };
  }, [currentUserid]);

  // Handle creating a new group
  const handleCreateGroup = () => {
    if (!currentUserid) {
      console.log("Error: currentUserid is undefined", route.params);
      Alert.alert("Error", "You need to be logged in to create a group");
      return;
    }

    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }

    if (selectedUsers.length === 0) {
      Alert.alert("Error", "Please select at least one member");
      return;
    }

    // Create a new group entry in Firebase
    try {
      const newGroupRef = ref_groups.push();
      const groupId = newGroupRef.key;

      // Create members object with current user as admin
      const members = {};
      members[String(currentUserid)] = true; // Ensure it's a string

      // Add selected users to members
      selectedUsers.forEach((userId) => {
        members[String(userId)] = true; // Ensure it's a string
      });

      // Log the data being saved (for debugging)
      const groupData = {
        name: groupName,
        adminId: String(currentUserid), // Ensure it's a string
        createdAt: new Date().toISOString(),
        members: members,
      };

      console.log("Creating group with data:", JSON.stringify(groupData));

      // Set group data
      newGroupRef
        .set(groupData)
        .then(() => {
          Alert.alert("Success", "Group created successfully!");
          setCreateGroupModal(false);
          setGroupName("");
          setSelectedUsers([]);
        })
        .catch((error) => {
          console.error("Firebase error:", error);
          Alert.alert("Error", "Failed to create group: " + error.message);
        });
    } catch (error) {
      console.error("Unexpected error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

  // Navigate to group chat
  const navigateToGroupChat = (group) => {
    navigation.navigate("GroupChat", {
      groupId: group.id,
      groupName: group.name,
      currentUserid: currentUserid,
    });
  };

  // Render group item for the list
  const renderGroupItem = ({ item }) => {
    const memberCount = item.members ? Object.keys(item.members).length : 0;

    return (
      <TouchableOpacity
        style={styles.groupItem}
        onPress={() => navigateToGroupChat(item)}
      >
        <View style={styles.groupImageContainer}>
          <View style={styles.groupImagePlaceholder}>
            <Text style={styles.groupInitial}>
              {item.name ? item.name.charAt(0).toUpperCase() : "G"}
            </Text>
          </View>
        </View>

        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.groupMeta}>
            {memberCount} member{memberCount !== 1 ? "s" : ""}
            {item.adminId === currentUserid ? " • Admin" : ""}
          </Text>
        </View>

        <MaterialCommunityIcons name="chevron-right" size={24} color="#888" />
      </TouchableOpacity>
    );
  };

  // Render user item in selection list
  const renderUserItem = ({ item }) => {
    const isSelected = selectedUsers.includes(item.id);

    return (
      <TouchableOpacity
        style={[styles.userItem, isSelected && styles.userItemSelected]}
        onPress={() => {
          if (isSelected) {
            setSelectedUsers(selectedUsers.filter((id) => id !== item.id));
          } else {
            setSelectedUsers([...selectedUsers, item.id]);
          }
        }}
      >
        <Image
          source={
            item.urlImage
              ? { uri: item.urlImage }
              : require("../../assets/profil.png")
          }
          style={styles.userAvatar}
        />

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.pseudo || "Unknown User"}</Text>
          <Text style={styles.userNumber}>{item.numero || "No number"}</Text>
        </View>

        {isSelected && (
          <MaterialCommunityIcons
            name="check-circle"
            size={24}
            color="#128C7E"
            style={styles.selectedIcon}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground
      source={require("../../assets/bg.jpg")}
      style={styles.container}
    >
      {/* Groups List */}
      <View style={styles.groupsContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>My Groups</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setCreateGroupModal(true)}
          >
            <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
            <Text style={styles.createButtonText}>Create Group</Text>
          </TouchableOpacity>
        </View>

        {userGroups.length > 0 ? (
          <FlatList
            data={userGroups}
            renderItem={renderGroupItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.groupsList}
          />
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="account-group-outline"
              size={70}
              color="#CCCCCC"
            />
            <Text style={styles.emptyText}>You don't have any groups yet</Text>
            <Text style={styles.emptySubtext}>
              Create a group to start chatting with multiple people at once
            </Text>
          </View>
        )}
      </View>

      {/* Create Group Modal */}
      <Modal
        visible={createGroupModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCreateGroupModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Group</Text>
              <TouchableOpacity onPress={() => setCreateGroupModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#555" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.groupNameInput}
              placeholder="Group Name"
              value={groupName}
              onChangeText={setGroupName}
              maxLength={25}
            />

            <Text style={styles.memberSelectionTitle}>Select Members</Text>

            <FlatList
              data={allUsers}
              renderItem={renderUserItem}
              keyExtractor={(item) => item.id}
              style={styles.usersList}
            />

            <View style={styles.selectedCount}>
              <Text>
                {selectedUsers.length} member
                {selectedUsers.length !== 1 ? "s" : ""} selected
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.createGroupButton,
                (!groupName.trim() || selectedUsers.length === 0) &&
                  styles.createGroupButtonDisabled,
              ]}
              onPress={handleCreateGroup}
              disabled={!groupName.trim() || selectedUsers.length === 0}
            >
              <Text style={styles.createGroupButtonText}>Create Group</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },

  // Groups Section
  groupsContainer: {
    flex: 1,
    padding: 15,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#075E54",
    marginBottom: 10,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#128C7E",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  createButtonText: {
    color: "#FFF",
    fontWeight: "500",
    marginLeft: 5,
  },
  groupsList: {
    paddingBottom: 20,
  },
  groupItem: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  groupImageContainer: {
    marginRight: 15,
  },
  groupImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#128C7E",
    justifyContent: "center",
    alignItems: "center",
  },
  groupInitial: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "bold",
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
  },
  groupMeta: {
    fontSize: 14,
    color: "#666",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 5,
    paddingHorizontal: 30,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 15,
    paddingBottom: 30,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#075E54",
  },
  groupNameInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  memberSelectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
    color: "#333",
  },
  usersList: {
    maxHeight: 300,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  userItemSelected: {
    backgroundColor: "#E7F3F1",
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 3,
  },
  userNumber: {
    fontSize: 14,
    color: "#888",
  },
  selectedIcon: {
    marginLeft: 10,
  },
  selectedCount: {
    marginVertical: 10,
    alignItems: "center",
  },
  createGroupButton: {
    backgroundColor: "#128C7E",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  createGroupButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  createGroupButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },
});
