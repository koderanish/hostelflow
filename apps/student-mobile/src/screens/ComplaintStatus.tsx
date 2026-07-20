import React, { useState, useCallback, useEffect } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { StubHeader, Card, Badge, PrimaryButton } from "../components/UI";
import { complaintService } from "../services/complaint.service";
import { studentService } from "../services/student.service";
import { authStore } from "../services/authStore";
import { useTheme } from "../theme/ThemeContext";

const STATUS_TONE: Record<string, "warning" | "success" | "error" | "neutral"> = {
  Open: "warning",
  Assigned: "neutral",
  "In Progress": "warning",
  Resolved: "success",
  Closed: "neutral",
};

export default function ComplaintStatus() {
  const { colors } = useTheme();
  const PRIORITY_COLORS: Record<string, string> = {
    Low: colors.outline,
    Medium: colors.onSurfaceVariant,
    High: "#ea580c",
    Critical: colors.error,
  };
  const navigation = useNavigation<any>();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<string>("");

  useEffect(() => {
    const user = authStore.getUser();
    if (!user?.id) { setLoading(false); return; }
    studentService.getByUserId(user.id).then(res => {
      const sid = res.success && res.data ? res.data.id : user.id;
      setStudentId(sid);
    });
  }, []);

  const fetchComplaints = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    const res = await complaintService.getByStudent(studentId);
    if (res.success && res.data) setComplaints(res.data);
    setLoading(false);
  }, [studentId]);

  useFocusEffect(
    useCallback(() => {
      if (studentId) fetchComplaints();
    }, [fetchComplaints, studentId])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <StubHeader title="Complaint Status" />
      <ScrollView style={{ flex: 1, paddingHorizontal: spacing.gutter, paddingTop: spacing.lg }} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        {loading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : complaints.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
            <MaterialIcons name="checklist" size={48} color={colors.outlineVariant} />
            <Text style={{ color: colors.onSurfaceVariant, textAlign: "center", marginTop: spacing.md, fontSize: 16 }}>No complaints found</Text>
          </View>
        ) : (
          complaints.map((c) => (
            <Card key={c.id} style={{ marginBottom: spacing.md }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm }}>
                <Text style={{ color: colors.onSurface, fontWeight: "600", fontSize: 16, flex: 1 }} numberOfLines={1}>{c.title}</Text>
                <Badge label={c.status} tone={STATUS_TONE[c.status] ?? "neutral"} />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.xs }}>
                <MaterialIcons name="category" size={14} color={colors.onSurfaceVariant} />
                <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, marginLeft: 6, flex: 1 }}>{c.category}</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MaterialIcons name="flag" size={14} color={PRIORITY_COLORS[c.priority] ?? colors.onSurfaceVariant} />
                  <Text style={{ color: PRIORITY_COLORS[c.priority] ?? colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", marginLeft: 4 }}>{c.priority}</Text>
                </View>
              </View>
              {c.description ? (
                <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, marginTop: spacing.xs }} numberOfLines={2}>{c.description}</Text>
              ) : null}
            </Card>
          ))
        )}

        <View style={{ marginTop: spacing.lg }}>
          <PrimaryButton label="New Complaint" onPress={() => navigation.navigate("Complaint")} icon="add" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
