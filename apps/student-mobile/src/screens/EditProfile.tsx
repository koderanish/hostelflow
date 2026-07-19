import React, { useEffect, useState } from "react";
import { View, Text, TextInput, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { StubHeader, PrimaryButton } from "../components/UI";
import { studentService } from "../services/student.service";
import { authStore } from "../services/authStore";
import { colors, spacing, radius } from "../theme/tokens";

export default function EditProfile() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [studentId, setStudentId] = useState("");

  useEffect(() => {
    (async () => {
      const user = authStore.getUser();
      if (!user?.id) { setLoading(false); return; }
      const res = await studentService.getByUserId(user.id);
      if (res.success && res.data) {
        setName(res.data.fullName || "");
        setEmail(res.data.email || "");
        setPhone(res.data.phone || "");
        setStudentId(res.data.id);
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Error", "Name and email are required");
      return;
    }
    setSaving(true);
    const res = await studentService.update(studentId, { fullName: name.trim(), email: email.trim(), phone: phone.trim() });
    setSaving(false);
    if (res.success) {
      Alert.alert("Success", "Profile updated successfully");
      navigation.goBack();
    } else {
      Alert.alert("Error", res.error || "Failed to update profile");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
        <StubHeader title="Edit Profile" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <StubHeader title="Edit Profile" />
      <ScrollView style={{ flex: 1, paddingHorizontal: spacing.gutter, paddingTop: spacing.lg }} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <View style={{ alignItems: "center", marginBottom: spacing.xl }}>
          <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: colors.surfaceContainerHigh, alignItems: "center", justifyContent: "center" }}>
            <MaterialIcons name="person" size={48} color={colors.outline} />
          </View>
        </View>

        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", marginBottom: spacing.sm }}>Full Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your full name"
          placeholderTextColor="#9ca3af"
          style={{ backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 14, marginBottom: spacing.md, color: colors.onSurface, fontSize: 16 }}
        />

        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", marginBottom: spacing.sm }}>Email Address</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email address"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          autoCapitalize="none"
          style={{ backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 14, marginBottom: spacing.md, color: colors.onSurface, fontSize: 16 }}
        />

        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", marginBottom: spacing.sm }}>Phone Number</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone number"
          placeholderTextColor="#9ca3af"
          keyboardType="phone-pad"
          style={{ backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 14, marginBottom: spacing.xl, color: colors.onSurface, fontSize: 16 }}
        />

        <PrimaryButton label={saving ? "Saving..." : "Save Changes"} onPress={handleSave} icon="save" />
      </ScrollView>
    </SafeAreaView>
  );
}
