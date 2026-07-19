import React, { useState, useCallback } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { StubHeader, Card, Badge, PrimaryButton } from "../components/UI";
import { leaveService } from "../services/leave.service";
import { authStore } from "../services/authStore";
import { colors, spacing, radius } from "../theme/tokens";

const STATUS_TONE: Record<string, "warning" | "success" | "error" | "neutral"> = {
  Pending: "warning",
  Approved: "success",
  Rejected: "error",
  Cancelled: "neutral",
};

export default function LeaveStatus() {
  const navigation = useNavigation<any>();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = useCallback(async () => {
    const studentId = authStore.getUser()?.id ?? "temp-student-id";
    setLoading(true);
    const res = await leaveService.getByStudent(studentId);
    if (res.success && res.data) setLeaves(res.data);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLeaves();
    }, [fetchLeaves])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <StubHeader title="Leave Status" />
      <ScrollView style={{ flex: 1, paddingHorizontal: spacing.gutter, paddingTop: spacing.lg }} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        {loading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : leaves.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
            <MaterialIcons name="fact-check" size={48} color={colors.outlineVariant} />
            <Text style={{ color: colors.onSurfaceVariant, textAlign: "center", marginTop: spacing.md, fontSize: 16 }}>No leave records found</Text>
          </View>
        ) : (
          leaves.map((l) => (
            <Card key={l.id} style={{ marginBottom: spacing.md }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm }}>
                <Text style={{ color: colors.onSurface, fontWeight: "600", fontSize: 16 }}>{l.leaveType}</Text>
                <Badge label={l.status} tone={STATUS_TONE[l.status] ?? "neutral"} />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.xs }}>
                <MaterialIcons name="calendar-today" size={14} color={colors.onSurfaceVariant} />
                <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, marginLeft: 6 }}>{l.fromDate} — {l.toDate}</Text>
              </View>
              {l.reason ? (
                <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, marginTop: spacing.xs }} numberOfLines={2}>{l.reason}</Text>
              ) : null}
            </Card>
          ))
        )}

        <View style={{ marginTop: spacing.lg }}>
          <PrimaryButton label="New Request" onPress={() => navigation.navigate("LeaveRequest")} icon="add" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
