import { Stack, useRouter } from "expo-router";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text style={styles.title}>404</Text>
        <Text style={styles.message}>Page not found</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/" as any)}
        >
          + <Ionicons name="home" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Go Home</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 24,
  },
  title: {
    fontSize: 72,
    fontWeight: "800" as const,
    color: "#111827",
    marginBottom: 16,
  },
  message: {
    fontSize: 18,
    color: "#6B7280",
    marginBottom: 32,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
});
