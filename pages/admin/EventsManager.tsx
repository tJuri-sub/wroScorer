import { use, useState } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
} from "react-native";
import styles from "../../components/styles/adminStyles/EventsStyle";

export const EventsManager = () => {
  const [eventModal, setEventModal] = useState<boolean>(false);
  const [events, setEvents] = useState<any[]>([]); // Replace 'any' with your event type

  // Example handler for creating an event
  const handleCreateEvent = (newEvent: any) => {
    setEvents((prev) => [...prev, newEvent]);
    setEventModal(false);
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
          <View
            style={{ backgroundColor: "#fff", padding: 24, borderRadius: 12 }}
          >
            {/* Replace this with your event creation form */}
            <Text>Create Event Form Here</Text>
            <TouchableOpacity
              onPress={() => {
                // Example: create a dummy event
                handleCreateEvent({ title: "New Event" });
              }}
            >
              <Text style={{ color: "blue", marginTop: 16 }}>Save Event</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEventModal(false)}>
              <Text style={{ color: "red", marginTop: 8 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
