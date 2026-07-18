import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { StubHeader } from "../components/UI";
import { colors } from "../theme/tokens";

export default function SettingsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <StubHeader title="Settings" />
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
        <MaterialIcons name="settings" size={48} color="#c3c6d7" />
        <Text style={{ color: colors.onSurfaceVariant, textAlign: "center", marginTop: 16 }}>App settings — security, language, help & support go here.</Text>
      </View>
    </SafeAreaView>
  );
}
