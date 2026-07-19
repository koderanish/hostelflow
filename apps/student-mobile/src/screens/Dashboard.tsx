import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { TopAppBar, Card, SectionLabel } from "../components/UI";
import { colors } from "../theme/tokens";
import { authStore } from "../services/authStore";
import { studentService } from "../services/student.service";
import { roomService } from "../services/room.service";
import { paymentService } from "../services/payment.service";

interface DashboardState {
  studentName: string;
  roomNumber: string;
  nextPayment: { amount: number; dueInDays: number } | null;
  announcements: { id: string; title: string; body: string; time: string }[];
  schedule: { id: string; day: string; month: string; title: string; meta: string }[];
}

export default function Dashboard() {
  const navigation = useNavigation<any>();
  const [data, setData] = useState<DashboardState | null>(null);
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

        const [roomRes, paymentRes] = await Promise.all([
          roomService.getByStudentId(studentId),
          paymentService.getByStudent(studentId).catch(() => ({ success: false as const, data: [] as any[] })),
        ]);

        let roomNumber = student.roomNo || "";
        if (!roomNumber) {
          const alloc = (student as any).allocations?.[0];
          if (alloc?.room?.roomNumber) roomNumber = alloc.room.roomNumber;
          else if (alloc?.room?.roomNo) roomNumber = alloc.room.roomNo;
        }
        if (!roomNumber && roomRes.success && roomRes.data) {
          roomNumber = roomRes.data.roomNo;
        }

        let nextPayment: DashboardState["nextPayment"] = null;
        const payments = Array.isArray(paymentRes.data) ? paymentRes.data : [];
        const pending = payments.find((p: any) => p.status === "Pending" || p.status === "Overdue" || p.status === "Partial");
        if (pending) {
          const dueDate = new Date(pending.dueDate);
          const now = new Date();
          const dueInDays = Math.max(0, Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
          nextPayment = { amount: pending.balance ?? pending.amount - (pending.paidAmount ?? 0), dueInDays };
        }

        setData({
          studentName: student.fullName || student.name || "Student",
          roomNumber: roomNumber || "Not assigned",
          nextPayment,
          announcements: [],
          schedule: [],
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

  const d = data!;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <TopAppBar name={d.studentName.split(" ")[0]} />
      <ScrollView style={{ paddingHorizontal: 16, paddingTop: 20 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
          <Card style={{ flex: 1, justifyContent: "space-between", height: 128 }}>
            <MaterialIcons name="bed" size={22} color="#004ac6" />
            <View><Text style={{ color: colors.onSurfaceVariant, fontSize: 12 }}>Room Number</Text><Text style={{ color: colors.primary, fontSize: 20, fontWeight: "600" }}>{d.roomNumber}</Text></View>
          </Card>
        </View>

        {d.nextPayment && (
          <Pressable onPress={() => navigation.navigate("Payments")} style={({ pressed }) => ({ backgroundColor: colors.primary, borderRadius: 12, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24, opacity: pressed ? 0.9 : 1 })}>
            <View><Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 12 }}>Next Payment</Text><Text style={{ color: "#fff", fontSize: 20, fontWeight: "600" }}>${d.nextPayment.amount.toFixed(2)}</Text></View>
            <View style={{ backgroundColor: colors.primaryContainer, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9999 }}><Text style={{ color: colors.onPrimaryContainer, fontSize: 12 }}>Due in {d.nextPayment.dueInDays} days</Text></View>
          </Pressable>
        )}

        <SectionLabel>Quick Actions</SectionLabel>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
          <QuickAction icon="how-to-reg" label="Mark Attendance" onPress={() => navigation.navigate("Attendance")} />
          <QuickAction icon="report-problem" label="Raise Complaint" onPress={() => navigation.navigate("Complaint")} />
          <QuickAction icon="exit-to-app" label="Leave Request" onPress={() => navigation.navigate("LeaveRequest")} />
        </ScrollView>

        <View style={{ backgroundColor: colors.secondaryContainer, borderRadius: 16, padding: 20, marginBottom: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <MaterialIcons name="campaign" size={20} color="#5e6572" />
              <Text style={{ color: colors.onSecondaryContainer, fontSize: 18, fontWeight: "600", marginLeft: 8 }}>Announcements</Text>
            </View>
            <Text style={{ color: colors.primary, fontWeight: "500", fontSize: 14 }}>View all</Text>
          </View>
          {d.announcements.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 16 }}>
              <MaterialIcons name="campaign" size={32} color={colors.outlineVariant} />
              <Text style={{ color: colors.onSurfaceVariant, marginTop: 8 }}>No announcements yet</Text>
            </View>
          ) : (
            d.announcements.map((a) => (
              <Card key={a.id} style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ backgroundColor: colors.errorContainer, width: 40, height: 40, borderRadius: 8, alignItems: "center", justifyContent: "center", marginRight: 12 }}><MaterialIcons name="build" size={20} color="#93000a" /></View>
                <View style={{ flex: 1 }}><Text style={{ color: colors.onSurface, fontWeight: "500" }}>{a.title}</Text><Text style={{ color: colors.onSurfaceVariant, fontSize: 14, marginTop: 4 }}>{a.body}</Text><Text style={{ color: colors.outline, fontSize: 10, marginTop: 8, textTransform: "uppercase" }}>{a.time}</Text></View>
              </Card>
            ))
          )}
        </View>

        <SectionLabel>Upcoming Schedule</SectionLabel>
        {d.schedule.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 16, backgroundColor: colors.surfaceContainerLow, borderRadius: 12, marginBottom: 12 }}>
            <MaterialIcons name="event" size={32} color={colors.outlineVariant} />
            <Text style={{ color: colors.onSurfaceVariant, marginTop: 8 }}>No upcoming events</Text>
          </View>
        ) : (
          d.schedule.map((s) => (
            <View key={s.id} style={{ flexDirection: "row", alignItems: "center", gap: 16, padding: 16, backgroundColor: colors.surfaceContainerLow, borderRadius: 12, borderWidth: 1, borderColor: colors.outlineVariant, marginBottom: 12 }}>
              <View style={{ width: 48, height: 48, backgroundColor: colors.surfaceContainerHighest, borderRadius: 8, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Text style={{ color: colors.primary, fontSize: 10, textTransform: "uppercase" }}>{s.month}</Text>
                <Text style={{ color: colors.onSurface, fontSize: 18, fontWeight: "600" }}>{s.day}</Text>
              </View>
              <View style={{ flex: 1 }}><Text style={{ color: colors.onSurface, fontWeight: "500" }}>{s.title}</Text><Text style={{ color: colors.onSurfaceVariant, fontSize: 14 }}>{s.meta}</Text></View>
              <MaterialIcons name="chevron-right" size={22} color="#737686" />
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickAction({ icon, label, onPress }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.surfaceContainer, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, marginRight: 12, opacity: pressed ? 0.8 : 1 })}>
      <MaterialIcons name={icon} size={20} color="#004ac6" />
      <Text style={{ color: colors.onSurface, fontWeight: "500", marginLeft: 8 }}>{label}</Text>
    </Pressable>
  );
}
