import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Alert, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { StubHeader, PrimaryButton } from "../components/UI";
import { complaintService } from "../services/complaint.service";
import { authStore } from "../services/authStore";
import { colors, spacing, radius } from "../theme/tokens";

const CATEGORIES = ["Maintenance", "Cleaning", "Noise", "Electricity", "Plumbing", "Security", "Other"];
const PRIORITIES = ["Low", "Medium", "High", "Critical"];

export default function Complaint() {
  const navigation = useNavigation<any>();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [loading, setLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);

  const handleSubmit = async () => {
    if (!title || !description) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    const user = authStore.getUser();
    const studentId = user?.id ?? "temp-student-id";
    setLoading(true);
    const res = await complaintService.create({
      studentId,
      title,
      description,
      category,
      priority,
      roomId: "temp-room-id",
      studentName: user?.name,
    });
    setLoading(false);
    if (res.success) {
      Alert.alert("Success", "Complaint submitted successfully");
      navigation.navigate("ComplaintStatus");
    } else {
      Alert.alert("Error", res.error || "Failed to submit complaint");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <StubHeader title="Raise Complaint" />
      <ScrollView style={{ flex: 1, paddingHorizontal: spacing.gutter, paddingTop: spacing.lg }} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", marginBottom: spacing.sm }}>Category</Text>
        <Pressable
          onPress={() => setShowCategoryPicker(true)}
          style={{ backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 14, marginBottom: spacing.md, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
        >
          <Text style={{ color: colors.onSurface, fontSize: 16 }}>{category}</Text>
          <MaterialIcons name="arrow-drop-down" size={24} color={colors.onSurfaceVariant} />
        </Pressable>

        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", marginBottom: spacing.sm }}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Brief title for your complaint"
          placeholderTextColor="#9ca3af"
          style={{ backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 14, marginBottom: spacing.md, color: colors.onSurface, fontSize: 16 }}
        />

        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", marginBottom: spacing.sm }}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your issue in detail"
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={4}
          style={{ backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 14, marginBottom: spacing.md, color: colors.onSurface, fontSize: 16, minHeight: 120, textAlignVertical: "top" }}
        />

        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", marginBottom: spacing.sm }}>Priority</Text>
        <Pressable
          onPress={() => setShowPriorityPicker(true)}
          style={{ backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 14, marginBottom: spacing.lg, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
        >
          <Text style={{ color: colors.onSurface, fontSize: 16 }}>{priority}</Text>
          <MaterialIcons name="arrow-drop-down" size={24} color={colors.onSurfaceVariant} />
        </Pressable>

        <PrimaryButton label={loading ? "Submitting..." : "Submit Complaint"} onPress={handleSubmit} icon="report-problem" />
      </ScrollView>

      <Modal visible={showCategoryPicker} transparent animationType="fade">
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", paddingHorizontal: 32 }} onPress={() => setShowCategoryPicker(false)}>
          <Pressable style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg }}>
            <Text style={{ color: colors.onSurface, fontWeight: "600", fontSize: 18, marginBottom: spacing.md }}>Select Category</Text>
            {CATEGORIES.map((c) => (
              <Pressable
                key={c}
                onPress={() => { setCategory(c); setShowCategoryPicker(false); }}
                style={{ paddingVertical: 14, paddingHorizontal: spacing.md, borderRadius: radius.md, backgroundColor: category === c ? colors.primaryContainer : "transparent", marginBottom: 4 }}
              >
                <Text style={{ color: category === c ? colors.primary : colors.onSurface, fontWeight: category === c ? "600" : "400", fontSize: 16 }}>{c}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={showPriorityPicker} transparent animationType="fade">
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", paddingHorizontal: 32 }} onPress={() => setShowPriorityPicker(false)}>
          <Pressable style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg }}>
            <Text style={{ color: colors.onSurface, fontWeight: "600", fontSize: 18, marginBottom: spacing.md }}>Select Priority</Text>
            {PRIORITIES.map((p) => (
              <Pressable
                key={p}
                onPress={() => { setPriority(p); setShowPriorityPicker(false); }}
                style={{ paddingVertical: 14, paddingHorizontal: spacing.md, borderRadius: radius.md, backgroundColor: priority === p ? colors.primaryContainer : "transparent", marginBottom: 4 }}
              >
                <Text style={{ color: priority === p ? colors.primary : colors.onSurface, fontWeight: priority === p ? "600" : "400", fontSize: 16 }}>{p}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
