import { useState, useEffect } from "react";

import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
} from "react-native";
import styles from "../../components/styles/adminStyles/EventsStyle";

export const EventsManager = () => {
  const [eventModal, setEventModal] = useState<boolean>(false);
  const [events, setEvents] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);

  type EventInput = {
    title: string;
    date: string;
    category: string;
  };

  const [inputData, setInputData] = useState<EventInput>({
    title: "",
    date: "",
    category: "",
  });

  useEffect(() => {
    const fetchEvents = async () => {
      const db = getFirestore();
      const snapshot = await getDocs(collection(db, "events"));
      const eventList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventList);
    };
    fetchEvents();
  }, []);

  const handleCreateEvent = async () => {
    const db = getFirestore();
    try {
      if (!inputData.title || !inputData.date || !inputData.category) {
        alert("Please fill all fields.");
        return;
      }
      setCreating(true);
      await addDoc(collection(db, "events"), {
        title: inputData.title,
        date: inputData.date,
        category: inputData.category,
        createdAt: new Date().toISOString(),
      });
      // Fetch updated events list
      const snapshot = await getDocs(collection(db, "events"));
      const eventList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventList);
      setInputData({ title: "", date: "", category: "" });
      setEventModal(false);
    } catch (error) {
      alert("Error creating event.");
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      {events.length === 0 ? (
        <View style={styles.contentContainer}>
          <Image
            style={{
              width: 300,
              height: 250,
              alignSelf: "center",
            }}
            resizeMode="contain"
            source={require("../../assets/images/Logo.png")}
          />
          <Text style={styles.text}>Events Empty.</Text>
          <TouchableOpacity
            style={styles.addEventButton}
            onPress={() => setEventModal(true)}
          >
            <Text style={styles.textButton}>Create Event</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.eventContainer}>
          <Text>Events List</Text>
          <FlatList
            data={events}
            keyExtractor={(item, idx) => idx.toString()}
            renderItem={({ item }) => (
              <View style={styles.eventCard}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                {/* Add more event details here */}
              </View>
            )}
            ListHeaderComponent={
              <TouchableOpacity
                style={styles.addEventButton}
                onPress={() => setEventModal(true)}
              >
                <Text style={styles.textButton}>Create Event</Text>
              </TouchableOpacity>
            }
          />
        </View>
      )}

      {/* MODALS*/}
      <Modal transparent visible={eventModal}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#00000055",
          }}
        >
          <View style={styles.modal}>
            <View style={styles.headerModal}>
              <Text style={styles.headerTextModal}>Create New Event</Text>
            </View>

            <View style={{ marginBottom: 10, display: "flex", gap: 10 }}>
              <View>
                <Text style={styles.label}>Event Name</Text>
                <TextInput
                  style={styles.textModalInput}
                  placeholder="ex. PRO"
                  placeholderTextColor="#999"
                  value={inputData.title || ""}
                  onChangeText={(text) =>
                    setInputData((data) => ({ ...data, title: text }))
                  }
                />
              </View>

              <View>
                <Text style={styles.label}>Date</Text>
                <TextInput
                  style={styles.textModalInput}
                  placeholder="ex. 09/20/25"
                  placeholderTextColor="#999"
                  value={inputData.date || ""}
                  onChangeText={(text) =>
                    setInputData((data) => ({ ...data, date: text }))
                  }
                />
              </View>

              <View>
                <Text style={styles.label}>Category</Text>
                <TextInput
                  style={styles.textModalInput}
                  placeholder="ex. Robomission-Elementary"
                  placeholderTextColor="#999"
                  value={inputData.category || ""}
                  onChangeText={(text) =>
                    setInputData((data) => ({ ...data, category: text }))
                  }
                />
              </View>
            </View>

            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 10,
              }}
            >
              <TouchableOpacity
                style={styles.button}
                onPress={() => setEventModal(false)}
              >
                <Text style={{ color: "red" }}>Cancel</Text>
              </TouchableOpacity>

              {creating ? (
                <ActivityIndicator
                  size="small"
                  color="#432344"
                  style={{ marginLeft: 10 }}
                />
              ) : (
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleCreateEvent}
                >
                  <Text style={{ color: "blue" }}>Create Event</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
