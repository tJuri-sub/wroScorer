import { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  getDoc,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const categories = [
  { label: "Robomission-Elementary", value: "robo-elem" },
  { label: "Robomission-Junior", value: "robo-junior" },
  { label: "Robomission-Senior", value: "robo-senior" },
  { label: "Robosports", value: "robosports" },
  { label: "Future Innovators-Elementary", value: "fi-elem" },
  { label: "Future Innovators-Junior", value: "fi-junior" },
  { label: "Future Innovators-Senior", value: "fi-senior" },
  { label: "Future Engineers", value: "future-eng" },
];

const EventCategories = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = useState(false);
  
  // Add null checks and default values
  const params = route.params as { eventId?: string } || {};
  const { eventId } = params;
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    const fetchEvent = async () => {
        if (!eventId) {
        setLoading(false);
        return;
        }
        setLoading(true);
        try {
        const db = getFirestore();
        const eventRef = doc(db, "events", eventId);
        const eventDoc = await getDoc(eventRef);
        
        if (!eventDoc.exists()) {
          console.error('Event not found');
          setEvent(null);
          setLoading(false);
          return;
        }
        
        const eventData = eventDoc.data();
        setEvent(eventData);
        } catch (error) {
        console.error('Error fetching event:', error);
        setEvent(null);
        }
        setLoading(false);
    };
    fetchEvent();
    }, [eventId]);

  // Show error state if eventId is missing
  if (!eventId) {
    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", padding: 20 }}>
        <Text style={{ fontSize: 18, color: 'red' }}>
          Error: Event ID is missing. Please navigate back and try again.
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", padding: 20 }}>
      {loading ? (
        <ActivityIndicator size="large" color="#432344" />
      ) : (
        <>
          <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
            {event?.title}
          </Text>
          <Text style={{ fontSize: 16, marginBottom: 5 }}>
            Date: {event?.date}
          </Text>
          <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
            Event Categories
          </Text>
          <View>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                onPress={() => (navigation as any).navigate("Event", { 
                  eventId: eventId,  // Pass the eventId here!
                  category: cat.value 
                })}
                style={{ marginBottom: 8 }}
              >
                <Text style={{ color: "#0081CC", fontSize: 16, textDecorationLine: "underline" }}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default EventCategories;