import React from "react";
import { View, Text, ScrollView, ImageBackground, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { TopAppBar, Card, Badge } from "../components/UI";
import { mockRoom, mockStudent } from "../data/mockData";
import { colors } from "../theme/tokens";

export default function RoomDetails() {
  const r = mockRoom;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <TopAppBar name={mockStudent.name.split(" ")[0]} />
      <ScrollView style={{ paddingHorizontal: 16, paddingTop: 20 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <ImageBackground source={{ uri: r.image }} style={{ height: 224, borderRadius: 12, overflow: "hidden", marginBottom: 16 }} imageStyle={{ borderRadius: 12 }}>
          <View style={{ flex: 1, justifyContent: "flex-end", padding: 16, backgroundColor: "rgba(0,0,0,0.35)", borderRadius: 12 }}>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
              <View style={{ backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9999 }}><Text style={{ color: "#fff", fontSize: 12, textTransform: "uppercase" }}>{r.type}</Text></View>
              <View style={{ backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9999 }}><Text style={{ color: "#fff", fontSize: 12 }}>{r.wing}</Text></View>
            </View>
            <Text style={{ color: "#fff", fontSize: 24, fontWeight: "700" }}>{r.roomNumber}</Text>
            <Text style={{ color: "rgba(255,255,255,0.8)" }}>{r.floor}</Text>
          </View>
        </ImageBackground>

        <Card style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.primary, fontSize: 18, fontWeight: "600", marginBottom: 8 }}>Service Status</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#22c55e", marginRight: 8 }} />
            <Text style={{ color: colors.onSurfaceVariant }}>{r.serviceStatus}</Text>
          </View>
          <Pressable style={({ pressed }) => ({ backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, opacity: pressed ? 0.9 : 1 })}>
            <MaterialIcons name="report" size={20} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "600", marginLeft: 8 }}>Report Issue</Text>
          </Pressable>
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={{ color: colors.onSurface, fontSize: 18, fontWeight: "600" }}>Roommate</Text>
            <Text style={{ color: colors.primary, fontWeight: "500", fontSize: 14 }}>View Profile</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16, backgroundColor: colors.surfaceContainer, borderRadius: 12, padding: 16 }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.surfaceContainerHigh, marginRight: 16 }} />
            <View style={{ flex: 1 }}><Text style={{ color: colors.onSurface, fontWeight: "600", fontSize: 16 }}>{r.roommate.name}</Text><Text style={{ color: colors.onSurfaceVariant, fontSize: 14 }}>{r.roommate.detail}</Text>
              <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}><MaterialIcons name="chat" size={18} color="#585f6c" /><MaterialIcons name="call" size={18} color="#585f6c" style={{ marginLeft: 12 }} /></View>
            </View>
          </View>
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.onSurface, fontSize: 18, fontWeight: "600", marginBottom: 16 }}>Room Facilities</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {r.facilities.map((f) => (
              <View key={f.label} style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.surfaceContainerLow, borderRadius: 8, padding: 12, width: "47%" }}>
                <MaterialIcons name={f.icon as any} size={20} color="#004ac6" />
                <Text style={{ color: colors.onSurface, fontSize: 14, marginLeft: 8, flex: 1 }}>{f.label}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={{ color: colors.onSurface, fontSize: 18, fontWeight: "600" }}>Maintenance History</Text>
            <MaterialIcons name="history" size={20} color="#585f6c" />
          </View>
          {r.maintenanceHistory.map((m) => (
            <View key={m.id} style={{ borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, paddingVertical: 12 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <Text style={{ color: colors.onSurface, fontWeight: "500", flex: 1 }}>{m.issue}</Text>
                <Badge label={m.status} tone={m.status === "Completed" ? "success" : "neutral"} />
              </View>
              <Text style={{ color: colors.onSurfaceVariant, fontSize: 12 }}>{m.date}</Text>
              <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, marginTop: 4 }}>{m.resolution}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
