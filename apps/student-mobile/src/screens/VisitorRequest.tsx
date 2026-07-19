import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { StubHeader, PrimaryButton } from "../components/UI";
import { colors, spacing, radius } from "../theme/tokens";

export default function VisitorRequest() {
  const [visitorName, setVisitorName] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = () => {
    if (!visitorName.trim() || !phone.trim() || !purpose.trim() || !date.trim()) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    Alert.alert("Coming Soon", "Visitor management will be available in the next update.");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <StubHeader title="Visitor Request" />
      <ScrollView style={{ flex: 1, paddingHorizontal: spacing.gutter, paddingTop: spacing.lg }} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", marginBottom: spacing.sm }}>Visitor Name</Text>
        <TextInput
          value={visitorName}
          onChangeText={setVisitorName}
          placeholder="Full name of visitor"
          placeholderTextColor="#9ca3af"
          style={{ backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 14, marginBottom: spacing.md, color: colors.onSurface, fontSize: 16 }}
        />

        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", marginBottom: spacing.sm }}>Phone Number</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Visitor's phone number"
          placeholderTextColor="#9ca3af"
          keyboardType="phone-pad"
          style={{ backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 14, marginBottom: spacing.md, color: colors.onSurface, fontSize: 16 }}
        />

        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", marginBottom: spacing.sm }}>Purpose of Visit</Text>
        <TextInput
          value={purpose}
          onChangeText={setPurpose}
          placeholder="Why are they visiting?"
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={3}
          style={{ backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 14, marginBottom: spacing.md, color: colors.onSurface, fontSize: 16, minHeight: 90, textAlignVertical: "top" }}
        />

        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", marginBottom: spacing.sm }}>Visit Date</Text>
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#9ca3af"
          style={{ backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 14, marginBottom: spacing.lg, color: colors.onSurface, fontSize: 16 }}
        />

        <PrimaryButton label="Submit Request" onPress={handleSubmit} icon="groups" />
      </ScrollView>
    </SafeAreaView>
  );
}
