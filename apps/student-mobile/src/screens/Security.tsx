import React, { useState } from "react";
import { View, Text, ScrollView, Switch } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ScreenWrapper, StubHeader, Card, StyledInput, PrimaryButton } from "../components/UI";
import { useTheme } from "../theme/ThemeContext";

export default function Security() {
  const { colors } = useTheme();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fingerprint, setFingerprint] = useState(false);
  const [faceUnlock, setFaceUnlock] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSave = () => {
    setError("");
    setSuccess("");
    if (!oldPassword || !newPassword || !confirmPassword) { setError("All password fields are required."); return; }
    if (newPassword.length < 6) { setError("New password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setSuccess("Password changed successfully.");
    setOldPassword(""); setNewPassword(""); setConfirmPassword("");
  };

  return (
    <ScreenWrapper>
      <StubHeader title="Security" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Card style={{ marginBottom: 24 }}>
          <Text style={{ color: colors.onSurface, fontSize: 18, fontWeight: "600", marginBottom: 16 }}>Change Password</Text>
          <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", marginBottom: 8 }}>Old Password</Text>
          <StyledInput value={oldPassword} onChangeText={setOldPassword} placeholder="Enter old password" secureTextEntry />
          <View style={{ height: 16 }} />
          <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", marginBottom: 8 }}>New Password</Text>
          <StyledInput value={newPassword} onChangeText={setNewPassword} placeholder="Enter new password" secureTextEntry />
          <View style={{ height: 16 }} />
          <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", marginBottom: 8 }}>Confirm Password</Text>
          <StyledInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm new password" secureTextEntry />
          {error ? <Text style={{ color: colors.error, marginTop: 12 }}>{error}</Text> : null}
          {success ? <Text style={{ color: colors.success, marginTop: 12 }}>{success}</Text> : null}
          <View style={{ marginTop: 20 }}><PrimaryButton label="Save Changes" onPress={handleSave} /></View>
        </Card>
        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 }}>Optional Security</Text>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <SettingRow icon="fingerprint" label="Enable Fingerprint" value={fingerprint} onValueChange={setFingerprint} colors={colors} />
          <SettingRow icon="face" label="Enable Face Unlock" value={faceUnlock} onValueChange={setFaceUnlock} colors={colors} last />
        </Card>
        <View style={{ height: 16 }} />
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <SettingRow icon="verified-user" label="Two-Factor Authentication" value={twoFA} onValueChange={setTwoFA} colors={colors} last />
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
}

function SettingRow({ icon, label, value, onValueChange, colors, last }: any) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.outlineVariant }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <MaterialIcons name={icon} size={22} color={colors.onSurfaceVariant} />
        <Text style={{ color: colors.onSurface, fontSize: 16, marginLeft: 16 }}>{label}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: colors.primary, false: colors.outlineVariant }} />
    </View>
  );
}
