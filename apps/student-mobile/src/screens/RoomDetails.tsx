import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ImageBackground, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { TopAppBar, Card, Badge } from "../components/UI";
import { colors } from "../theme/tokens";
import { authStore } from "../services/authStore";
import { studentService } from "../services/student.service";
import { roomService } from "../services/room.service";

interface RoomDetailsState {
  studentName: string;
  roomNumber: string;
  type: string;
  wing: string;
  floor: string;
  image: string;
  serviceStatus: string;
  roommate: { name: string; detail: string } | null;
  facilities: { icon: string; label: string }[];
  maintenanceHistory: { id: string; issue: string; date: string; status: string; resolution: string }[];
}

export default function RoomDetails() {
  const [data, setData] = useState<RoomDetailsState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const user = authStore.getUser();
        if (!user) { setError("User not logged in"); setLoading(false); return; }

        const studentRes = await studentService.getByUserId(user.id);
        if (!studentRes.success || !studentRes.data) {
          setError(studentRes.error || "Failed to load student");
          setLoading(false);
          return;
        }

        const student = studentRes.data;
        const studentId = student.id;
        const studentName = student.fullName || student.name || "Student";

        const roomRes = await roomService.getByStudentId(studentId);

        const alloc = (student as any).allocations?.[0];
        const roomData = alloc?.room || roomRes.data;

        let roomNumber = student.roomNo || "";
        if (!roomNumber && roomData) roomNumber = roomData.roomNo || roomData.roomNumber || "";
        if (!roomNumber && alloc?.room?.roomNumber) roomNumber = alloc.room.roomNumber;

        const maintenanceRes = roomData?.id
          ? await roomService.getMaintenanceHistory(roomData.id).catch(() => ({ success: false as const, data: [] as any[] }))
          : { success: false as const, data: [] as any[] };

        const maintenance = Array.isArray(maintenanceRes.data) ? maintenanceRes.data : [];

        let roommateData: RoomDetailsState["roommate"] = null;
        if (alloc?.roommates?.[0]) {
          const rm = alloc.roommates[0];
          roommateData = { name: rm.name || rm.fullName || "Roommate", detail: rm.detail || rm.course || "" };
        } else if (roomData?.roommate) {
          roommateData = { name: roomData.roommate.name, detail: roomData.roommate.detail || "" };
        }

        const amenities = roomData?.amenities || [];
        const facilities: { icon: string; label: string }[] = amenities.length > 0
          ? amenities.map((a: string) => ({ icon: iconForAmenity(a), label: a }))
          : (roomData?.facilities || []);

        setData({
          studentName,
          roomNumber: roomNumber || "Not assigned",
          type: roomData?.roomType || roomData?.type || "Standard",
          wing: alloc?.wing || roomData?.wing || roomData?.hostelName || "Main Wing",
          floor: roomData?.floor ? `${roomData.floor}${ordinal(roomData.floor)} Floor` : "Ground Floor",
          image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
          serviceStatus: roomData?.status === "Active" || roomData?.status === "available" ? "All systems operational" : roomData?.status || "Operational",
          roommate: roommateData,
          facilities,
          maintenanceHistory: maintenance.map((m: any) => ({
            id: m.id,
            issue: m.title || m.issue || "Maintenance",
            date: m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : m.date || "",
            status: m.status === "Resolved" || m.status === "Completed" ? "Completed" : m.status === "Archived" ? "Archived" : m.status || "Pending",
            resolution: m.resolutionNotes || m.resolution || "",
          })),
        });
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }} edges={["top"]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
        <TopAppBar name="Student" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <MaterialIcons name="error-outline" size={48} color={colors.error} />
          <Text style={{ color: colors.onSurface, textAlign: "center", marginTop: 16, fontSize: 16 }}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const r = data!;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <TopAppBar name={r.studentName.split(" ")[0]} />
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
          {!r.roommate ? (
            <View style={{ alignItems: "center", paddingVertical: 16, backgroundColor: colors.surfaceContainer, borderRadius: 12 }}>
              <MaterialIcons name="person-outline" size={32} color={colors.outlineVariant} />
              <Text style={{ color: colors.onSurfaceVariant, marginTop: 8 }}>No roommate assigned</Text>
            </View>
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16, backgroundColor: colors.surfaceContainer, borderRadius: 12, padding: 16 }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.surfaceContainerHigh, marginRight: 16 }} />
              <View style={{ flex: 1 }}><Text style={{ color: colors.onSurface, fontWeight: "600", fontSize: 16 }}>{r.roommate.name}</Text><Text style={{ color: colors.onSurfaceVariant, fontSize: 14 }}>{r.roommate.detail}</Text>
                <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}><MaterialIcons name="chat" size={18} color="#585f6c" /><MaterialIcons name="call" size={18} color="#585f6c" style={{ marginLeft: 12 }} /></View>
              </View>
            </View>
          )}
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.onSurface, fontSize: 18, fontWeight: "600", marginBottom: 16 }}>Room Facilities</Text>
          {r.facilities.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 16 }}>
              <MaterialIcons name="cleaning-services" size={32} color={colors.outlineVariant} />
              <Text style={{ color: colors.onSurfaceVariant, marginTop: 8 }}>No facilities listed</Text>
            </View>
          ) : (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {r.facilities.map((f) => (
                <View key={f.label} style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.surfaceContainerLow, borderRadius: 8, padding: 12, width: "47%" }}>
                  <MaterialIcons name={f.icon as any} size={20} color="#004ac6" />
                  <Text style={{ color: colors.onSurface, fontSize: 14, marginLeft: 8, flex: 1 }}>{f.label}</Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={{ color: colors.onSurface, fontSize: 18, fontWeight: "600" }}>Maintenance History</Text>
            <MaterialIcons name="history" size={20} color="#585f6c" />
          </View>
          {r.maintenanceHistory.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 16 }}>
              <MaterialIcons name="check-circle-outline" size={32} color={colors.outlineVariant} />
              <Text style={{ color: colors.onSurfaceVariant, marginTop: 8 }}>No maintenance requests</Text>
            </View>
          ) : (
            r.maintenanceHistory.map((m) => (
              <View key={m.id} style={{ borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, paddingVertical: 12 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <Text style={{ color: colors.onSurface, fontWeight: "500", flex: 1 }}>{m.issue}</Text>
                  <Badge label={m.status} tone={m.status === "Completed" ? "success" : "neutral"} />
                </View>
                <Text style={{ color: colors.onSurfaceVariant, fontSize: 12 }}>{m.date}</Text>
                <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, marginTop: 4 }}>{m.resolution}</Text>
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function iconForAmenity(amenity: string): string {
  const lower = amenity.toLowerCase();
  if (lower.includes("wifi")) return "wifi";
  if (lower.includes("ac") || lower.includes("air")) return "ac-unit";
  if (lower.includes("bath") || lower.includes("shower")) return "shower";
  if (lower.includes("desk") || lower.includes("study")) return "desk";
  if (lower.includes("fridge") || lower.includes("kitchen")) return "kitchen";
  if (lower.includes("clean") || lower.includes("service")) return "cleaning-services";
  if (lower.includes("bed") || lower.includes("cot")) return "bed";
  if (lower.includes("table") || lower.includes("chair")) return "table-restaurant";
  if (lower.includes("fan")) return "air";
  return "check-circle";
}
