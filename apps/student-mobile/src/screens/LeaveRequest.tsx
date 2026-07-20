import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Alert, Modal, Platform, ActivityIndicator } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import { MaterialIcons } from "@expo/vector-icons";
import { ScreenWrapper, StubHeader, PrimaryButton } from "../components/UI";
import { leaveService } from "../services/leave.service";
import { studentService } from "../services/student.service";
import { authStore } from "../services/authStore";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../theme/ThemeContext";

const LEAVE_TYPES = ["Medical", "Personal", "Family", "Emergency", "Other"];

function fmt(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function diffDays(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)) + 1);
}

// TODO: Replace with real document upload API
// async function uploadDocument(uri: string, name: string): Promise<string>
async function simulateUpload(uri: string, _name: string): Promise<string> {
  return uri;
}

export default function LeaveRequest() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [leaveType, setLeaveType] = useState("Personal");
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [reason, setReason] = useState("");
  const [document, setDocument] = useState<{ uri: string; name: string; size?: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [studentProfile, setStudentProfile] = useState<any>(null);

  const days = diffDays(fromDate, toDate);

  useEffect(() => {
    const user = authStore.getUser();
    if (!user?.id) { setProfileLoading(false); return; }
    studentService.getByUserId(user.id).then(res => {
      if (res.success && res.data) setStudentProfile(res.data);
    }).finally(() => setProfileLoading(false));
  }, []);

  const onFromChange = (_: DateTimePickerEvent, d?: Date) => {
    if (Platform.OS === "android") setShowFromPicker(false);
    if (d) { setFromDate(d); if (d > toDate) setToDate(d); }
  };

  const onToChange = (_: DateTimePickerEvent, d?: Date) => {
    if (Platform.OS === "android") setShowToPicker(false);
    if (d) setToDate(d);
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "*/*", copyToCacheDirectory: true });
    if (!result.canceled && result.assets?.length) {
      setDocument({ uri: result.assets[0].uri, name: result.assets[0].name, size: result.assets[0].size });
    }
  };

  const handleSubmit = async () => {
    if (!reason.trim()) { Alert.alert("Required", "Please describe the reason for your leave."); return; }
    if (toDate < fromDate) { Alert.alert("Validation", "End date cannot be before start date."); return; }
    const sid = studentProfile?.id || authStore.getUser()?.id || "";
    setLoading(true);
    let documentUri = "";
    if (document) {
      // TODO: Replace with real upload
      // documentUri = await uploadDocument(document.uri, document.name);
      documentUri = await simulateUpload(document.uri, document.name);
    }
    const res = await leaveService.applyLeave({
      studentId: sid,
      leaveType,
      fromDate: fmt(fromDate),
      toDate: fmt(toDate),
      reason: reason.trim(),
      studentName: studentProfile?.name || authStore.getUser()?.name,
      documentUri,
    });
    setLoading(false);
    if (res.success) {
      setSubmitted(true);
    } else {
      Alert.alert("Error", res.error || "Failed to apply leave");
    }
  };

  if (profileLoading) {
    return (
      <ScreenWrapper>
        <StubHeader title="Leave Request" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  if (submitted) {
    return (
      <ScreenWrapper>
        <StubHeader title="Leave Request" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.successContainer, alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <MaterialIcons name="check-circle" size={40} color={colors.success} />
          </View>
          <Text style={{ color: colors.onSurface, fontSize: 22, fontWeight: "700", textAlign: "center" }}>Leave Request Submitted!</Text>
          <Text style={{ color: colors.onSurfaceVariant, fontSize: 15, textAlign: "center", marginTop: 8, lineHeight: 22 }}>
            Your {leaveType.toLowerCase()} leave request has been submitted for {days} day{days > 1 ? "s" : ""} ({fmt(fromDate)} to {fmt(toDate)}).
          </Text>
          <View style={{ marginTop: 32, width: "100%" }}>
            <PrimaryButton label="View Leave Status" onPress={() => navigation.navigate("LeaveStatus")} />
          </View>
          <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 12, padding: 8 }}>
            <Text style={{ color: colors.primary, fontWeight: "500", fontSize: 15 }}>Back</Text>
          </Pressable>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <StubHeader title="Leave Request" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Leave Type */}
        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 }}>Leave Type</Text>
        <Pressable
          onPress={() => setShowTypePicker(true)}
          style={{ backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
        >
          <Text style={{ color: colors.onSurface, fontSize: 16 }}>{leaveType}</Text>
          <MaterialIcons name="arrow-drop-down" size={24} color={colors.onSurfaceVariant} />
        </Pressable>

        {/* From Date */}
        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 }}>From Date</Text>
        <Pressable
          onPress={() => setShowFromPicker(true)}
          style={{ backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
        >
          <Text style={{ color: colors.onSurface, fontSize: 16 }}>{fmt(fromDate)}</Text>
          <MaterialIcons name="calendar-month" size={22} color={colors.primary} />
        </Pressable>
        {showFromPicker && Platform.OS === "ios" ? (
          <View style={{ backgroundColor: colors.surfaceContainerLow, borderRadius: 12, marginBottom: 20, overflow: "hidden" }}>
            <DateTimePicker value={fromDate} mode="date" display="spinner" onChange={onFromChange} minimumDate={new Date()} />
            <Pressable onPress={() => setShowFromPicker(false)} style={{ paddingVertical: 10, alignItems: "center", borderTopWidth: 1, borderTopColor: colors.outlineVariant }}>
              <Text style={{ color: colors.primary, fontWeight: "600", fontSize: 16 }}>Done</Text>
            </Pressable>
          </View>
        ) : showFromPicker ? (
          <DateTimePicker value={fromDate} mode="date" display="default" onChange={onFromChange} minimumDate={new Date()} />
        ) : null}

        {/* To Date */}
        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 }}>To Date</Text>
        <Pressable
          onPress={() => setShowToPicker(true)}
          style={{ backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
        >
          <Text style={{ color: colors.onSurface, fontSize: 16 }}>{fmt(toDate)}</Text>
          <MaterialIcons name="calendar-month" size={22} color={colors.primary} />
        </Pressable>
        {showToPicker && Platform.OS === "ios" ? (
          <View style={{ backgroundColor: colors.surfaceContainerLow, borderRadius: 12, marginBottom: 20, overflow: "hidden" }}>
            <DateTimePicker value={toDate} mode="date" display="spinner" onChange={onToChange} minimumDate={fromDate} />
            <Pressable onPress={() => setShowToPicker(false)} style={{ paddingVertical: 10, alignItems: "center", borderTopWidth: 1, borderTopColor: colors.outlineVariant }}>
              <Text style={{ color: colors.primary, fontWeight: "600", fontSize: 16 }}>Done</Text>
            </Pressable>
          </View>
        ) : showToPicker ? (
          <DateTimePicker value={toDate} mode="date" display="default" onChange={onToChange} minimumDate={fromDate} />
        ) : null}

        {/* Number of Days (auto-calculated) */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.primaryContainer, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 20 }}>
          <Text style={{ color: colors.primary, fontWeight: "600", fontSize: 15 }}>Number of Days</Text>
          <Text style={{ color: colors.primary, fontSize: 18, fontWeight: "700" }}>{days}</Text>
        </View>

        {/* Reason */}
        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 }}>Reason</Text>
        <TextInput
          value={reason}
          onChangeText={setReason}
          placeholder="Describe the reason for your leave"
          placeholderTextColor={colors.outline}
          multiline
          numberOfLines={4}
          style={{ backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 20, color: colors.onSurface, fontSize: 16, minHeight: 120, textAlignVertical: "top" }}
        />

        {/* Upload Supporting Document */}
        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 }}>Supporting Document</Text>
        {document ? (
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surfaceContainerLow, borderRadius: 12, padding: 14, marginBottom: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
              <MaterialIcons name="description" size={24} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.onSurface, fontSize: 14, fontWeight: "500" }} numberOfLines={1}>{document.name}</Text>
                {document.size ? <Text style={{ color: colors.onSurfaceVariant, fontSize: 12 }}>{(document.size / 1024).toFixed(1)} KB</Text> : null}
              </View>
            </View>
            <Pressable onPress={() => setDocument(null)} style={{ padding: 6 }}>
              <MaterialIcons name="close" size={20} color={colors.error} />
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={pickDocument}
            style={{ borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 12, borderStyle: "dashed", paddingVertical: 28, alignItems: "center", justifyContent: "center", marginBottom: 20, backgroundColor: colors.surfaceContainerLow }}
          >
            <MaterialIcons name="upload-file" size={32} color={colors.outline} />
            <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, marginTop: 8 }}>Tap to upload document</Text>
            <Text style={{ color: colors.outline, fontSize: 12, marginTop: 2 }}>PDF, image, or document</Text>
          </Pressable>
        )}

        <PrimaryButton label={loading ? "Submitting..." : "Submit Leave Request"} onPress={handleSubmit} icon="exit-to-app" disabled={loading} />
      </ScrollView>

      {/* Leave Type Picker Modal */}
      <Modal visible={showTypePicker} transparent animationType="fade" onRequestClose={() => setShowTypePicker(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", paddingHorizontal: 32 }} onPress={() => setShowTypePicker(false)}>
          <Pressable style={{ backgroundColor: colors.surfaceContainerLowest, borderRadius: 16, padding: 20 }} onPress={() => {}}>
            <Text style={{ color: colors.onSurface, fontWeight: "600", fontSize: 18, marginBottom: 16 }}>Select Leave Type</Text>
            {LEAVE_TYPES.map((t) => (
              <Pressable
                key={t}
                onPress={() => { setLeaveType(t); setShowTypePicker(false); }}
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, paddingHorizontal: 16, borderRadius: 10, backgroundColor: leaveType === t ? colors.primaryContainer + "60" : "transparent", marginBottom: 4 }}
              >
                <Text style={{ color: leaveType === t ? colors.primary : colors.onSurface, fontWeight: leaveType === t ? "600" : "400", fontSize: 16 }}>{t}</Text>
                {leaveType === t ? <MaterialIcons name="check" size={20} color={colors.primary} /> : null}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenWrapper>
  );
}
