import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Alert, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { StubHeader, PrimaryButton } from "../components/UI";
import { leaveService } from "../services/leave.service";
import { authStore } from "../services/authStore";
import { colors, spacing, radius } from "../theme/tokens";

const LEAVE_TYPES = ["Medical", "Personal", "Family", "Emergency", "Other"];

export default function LeaveRequest() {
  const navigation = useNavigation<any>();
  const [leaveType, setLeaveType] = useState("Personal");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  const handleSubmit = async () => {
    if (!fromDate || !toDate || !reason) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    const studentId = authStore.getUser()?.id ?? "temp-student-id";
    setLoading(true);
    const res = await leaveService.applyLeave({
      studentId,
      leaveType,
      fromDate,
      toDate,
      reason,
    });
    setLoading(false);
    if (res.success) {
      Alert.alert("Success", "Leave applied successfully");
      navigation.goBack();
    } else {
      Alert.alert("Error", res.error || "Failed to apply leave");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <StubHeader title="Leave Request" />
      <ScrollView style={{ flex: 1, paddingHorizontal: spacing.gutter, paddingTop: spacing.lg }} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", marginBottom: spacing.sm }}>Leave Type</Text>
        <Pressable
          onPress={() => setShowTypePicker(true)}
          style={{ backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 14, marginBottom: spacing.md, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
        >
          <Text style={{ color: colors.onSurface, fontSize: 16 }}>{leaveType}</Text>
          <MaterialIcons name="arrow-drop-down" size={24} color={colors.onSurfaceVariant} />
        </Pressable>

        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", marginBottom: spacing.sm }}>From Date</Text>
        <TextInput
          value={fromDate}
          onChangeText={setFromDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#9ca3af"
          style={{ backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 14, marginBottom: spacing.md, color: colors.onSurface, fontSize: 16 }}
        />

        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", marginBottom: spacing.sm }}>To Date</Text>
        <TextInput
          value={toDate}
          onChangeText={setToDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#9ca3af"
          style={{ backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 14, marginBottom: spacing.md, color: colors.onSurface, fontSize: 16 }}
        />

        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", marginBottom: spacing.sm }}>Reason</Text>
        <TextInput
          value={reason}
          onChangeText={setReason}
          placeholder="Describe your reason"
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={4}
          style={{ backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 14, marginBottom: spacing.lg, color: colors.onSurface, fontSize: 16, minHeight: 100, textAlignVertical: "top" }}
        />

        <PrimaryButton label={loading ? "Submitting..." : "Submit Leave Request"} onPress={handleSubmit} icon="exit-to-app" />
      </ScrollView>

      <Modal visible={showTypePicker} transparent animationType="fade">
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", paddingHorizontal: 32 }} onPress={() => setShowTypePicker(false)}>
          <Pressable style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg }}>
            <Text style={{ color: colors.onSurface, fontWeight: "600", fontSize: 18, marginBottom: spacing.md }}>Select Leave Type</Text>
            {LEAVE_TYPES.map((t) => (
              <Pressable
                key={t}
                onPress={() => { setLeaveType(t); setShowTypePicker(false); }}
                style={{ paddingVertical: 14, paddingHorizontal: spacing.md, borderRadius: radius.md, backgroundColor: leaveType === t ? colors.primaryContainer : "transparent", marginBottom: 4 }}
              >
                <Text style={{ color: leaveType === t ? colors.primary : colors.onSurface, fontWeight: leaveType === t ? "600" : "400", fontSize: 16 }}>{t}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
