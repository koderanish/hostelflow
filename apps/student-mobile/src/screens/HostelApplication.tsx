import React, { useState, useCallback } from "react";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { StubHeader, Card, Badge, PrimaryButton } from "../components/UI";
import { applicationService } from "../services/application.service";
import { authStore } from "../services/authStore";
import { colors, spacing, radius } from "../theme/tokens";

const ROOM_TYPES = ["Single", "Double", "Triple", "Dormitory"];

const STATUS_TONE: Record<string, "warning" | "success" | "error" | "neutral"> = {
  Pending: "warning",
  Approved: "success",
  Rejected: "error",
  Cancelled: "neutral",
  Waitlisted: "warning",
};

export default function HostelApplication() {
  const navigation = useNavigation<any>();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [preferredRoomType, setPreferredRoomType] = useState("Single");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const fetch = useCallback(async () => {
    const studentId = authStore.getUser()?.id ?? "";
    setLoading(true);
    const res = await applicationService.getByStudent(studentId);
    if (res.success && res.data) setApplications(res.data);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => { fetch(); }, [fetch])
  );

  const activeApp = applications.find(a => a.status !== "Cancelled" && a.status !== "Rejected");

  const handleSubmit = async () => {
    if (!reason.trim()) {
      Alert.alert("Error", "Please provide a reason");
      return;
    }
    const studentId = authStore.getUser()?.id ?? "";
    setSubmitting(true);
    const res = await applicationService.create({
      studentId,
      preferredRoomType,
      reason,
      preferredHostelId: "default",
    });
    setSubmitting(false);
    if (res.success) {
      Alert.alert("Success", "Application submitted successfully");
      fetch();
    } else {
      Alert.alert("Error", res.error || "Failed to submit application");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
        <StubHeader title="Hostel Application" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <StubHeader title="Hostel Application" />
      <ScrollView style={{ flex: 1, paddingHorizontal: spacing.gutter, paddingTop: spacing.lg }} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        {activeApp ? (
          <Card style={{ marginBottom: spacing.lg }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md }}>
              <Text style={{ color: colors.onSurface, fontWeight: "600", fontSize: 18 }}>Current Application</Text>
              <Badge label={activeApp.status} tone={STATUS_TONE[activeApp.status] ?? "neutral"} />
            </View>
            <View style={{ marginBottom: spacing.sm }}>
              <Text style={{ color: colors.onSurfaceVariant, fontSize: 12 }}>Room Type</Text>
              <Text style={{ color: colors.onSurface, fontSize: 16, marginTop: 2 }}>{activeApp.preferredRoomType || "Not specified"}</Text>
            </View>
            {activeApp.reason ? (
              <View style={{ marginBottom: spacing.sm }}>
                <Text style={{ color: colors.onSurfaceVariant, fontSize: 12 }}>Reason</Text>
                <Text style={{ color: colors.onSurface, fontSize: 14, marginTop: 2 }}>{activeApp.reason}</Text>
              </View>
            ) : null}
            {activeApp.appliedDate ? (
              <View>
                <Text style={{ color: colors.onSurfaceVariant, fontSize: 12 }}>Applied On</Text>
                <Text style={{ color: colors.onSurface, fontSize: 14, marginTop: 2 }}>{new Date(activeApp.appliedDate).toLocaleDateString()}</Text>
              </View>
            ) : null}
            {activeApp.reviewRemarks ? (
              <View style={{ marginTop: spacing.sm, padding: spacing.md, backgroundColor: colors.surfaceContainer, borderRadius: radius.md }}>
                <Text style={{ color: colors.onSurfaceVariant, fontSize: 12 }}>Review Remarks</Text>
                <Text style={{ color: colors.onSurface, fontSize: 14, marginTop: 2 }}>{activeApp.reviewRemarks}</Text>
              </View>
            ) : null}
          </Card>
        ) : (
          <>
            <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", marginBottom: spacing.sm }}>Preferred Room Type</Text>
            <Pressable
              onPress={() => setShowPicker(true)}
              style={{ backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 14, marginBottom: spacing.md, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
            >
              <Text style={{ color: colors.onSurface, fontSize: 16 }}>{preferredRoomType}</Text>
              <MaterialIcons name="arrow-drop-down" size={24} color={colors.onSurfaceVariant} />
            </Pressable>

            <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", marginBottom: spacing.sm }}>Reason for Application</Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="Why do you want hostel accommodation?"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              style={{ backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 14, marginBottom: spacing.lg, color: colors.onSurface, fontSize: 16, minHeight: 120, textAlignVertical: "top" }}
            />

            <PrimaryButton label={submitting ? "Submitting..." : "Submit Application"} onPress={handleSubmit} icon="assignment" />
          </>
        )}

        {applications.filter(a => a.status === "Cancelled" || a.status === "Rejected").length > 0 && (
          <View style={{ marginTop: spacing.lg }}>
            <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", marginBottom: spacing.sm }}>Previous Applications</Text>
            {applications.filter(a => a.status === "Cancelled" || a.status === "Rejected").map((a) => (
              <Card key={a.id} style={{ marginBottom: spacing.sm }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ color: colors.onSurface, fontWeight: "500" }}>{a.preferredRoomType || "Application"}</Text>
                  <Badge label={a.status} tone={STATUS_TONE[a.status] ?? "neutral"} />
                </View>
                {a.appliedDate ? <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, marginTop: 4 }}>{new Date(a.appliedDate).toLocaleDateString()}</Text> : null}
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={showPicker} transparent animationType="fade">
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", paddingHorizontal: 32 }} onPress={() => setShowPicker(false)}>
          <Pressable style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg }}>
            <Text style={{ color: colors.onSurface, fontWeight: "600", fontSize: 18, marginBottom: spacing.md }}>Select Room Type</Text>
            {ROOM_TYPES.map((t) => (
              <Pressable
                key={t}
                onPress={() => { setPreferredRoomType(t); setShowPicker(false); }}
                style={{ paddingVertical: 14, paddingHorizontal: spacing.md, borderRadius: radius.md, backgroundColor: preferredRoomType === t ? colors.primaryContainer : "transparent", marginBottom: 4 }}
              >
                <Text style={{ color: preferredRoomType === t ? colors.primary : colors.onSurface, fontWeight: preferredRoomType === t ? "600" : "400", fontSize: 16 }}>{t}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
