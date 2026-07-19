import React from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { StubHeader, Card } from "../components/UI";
import { colors, spacing } from "../theme/tokens";

export default function SettingsScreen() {
  const handleClearData = () => {
    Alert.alert(
      "Clear Local Data",
      "This will clear all cached data. You will need to log in again.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", style: "destructive", onPress: () => {} },
      ]
    );
  };

  const handleComingSoon = (feature: string) => {
    Alert.alert("Coming Soon", `${feature} will be available in a future update.`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <StubHeader title="Settings" />
      <ScrollView style={{ flex: 1, paddingHorizontal: spacing.gutter, paddingTop: spacing.lg }} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: spacing.sm }}>Account</Text>
        <Card style={{ marginBottom: spacing.lg, padding: 0, overflow: "hidden" }}>
          <SettingRow icon="lock" label="Change Password" onPress={() => handleComingSoon("Change Password")} />
          <SettingRow icon="help" label="Help & Support" onPress={() => handleComingSoon("Help & Support")} last />
        </Card>

        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: spacing.sm }}>Preferences</Text>
        <Card style={{ marginBottom: spacing.lg, padding: 0, overflow: "hidden" }}>
          <SettingRow icon="notifications" label="Notification Preferences" onPress={() => handleComingSoon("Notification Preferences")} />
          <SettingRow icon="language" label="Language" onPress={() => handleComingSoon("Language Settings")} last />
        </Card>

        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: spacing.sm }}>Data</Text>
        <Card style={{ marginBottom: spacing.lg, padding: 0, overflow: "hidden" }}>
          <SettingRow icon="delete-sweep" label="Clear Local Data" onPress={handleClearData} last />
        </Card>

        <View style={{ alignItems: "center", paddingTop: spacing.lg }}>
          <Text style={{ color: colors.outline, fontSize: 12 }}>HostelFlow v1.0.0</Text>
          <Text style={{ color: colors.outline, fontSize: 11, marginTop: 4 }}>Student Mobile App</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({ icon, label, onPress, last }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; onPress?: () => void; last?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        padding: spacing.md,
        borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.outlineVariant,
        backgroundColor: pressed ? colors.surfaceContainerLow : "transparent",
      })}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <MaterialIcons name={icon} size={22} color={colors.onSurfaceVariant} />
        <Text style={{ color: colors.onSurface, fontWeight: "500", fontSize: 16, marginLeft: 16 }}>{label}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={20} color={colors.outline} />
    </Pressable>
  );
}
