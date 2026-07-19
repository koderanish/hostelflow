import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { StubHeader } from "../components/UI";
import { colors, spacing } from "../theme/tokens";

export default function Documents() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <StubHeader title="Documents" />
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.gutter }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.secondaryContainer, alignItems: "center", justifyContent: "center", marginBottom: spacing.lg }}>
          <MaterialIcons name="description" size={40} color={colors.primary} />
        </View>
        <Text style={{ color: colors.onBackground, fontSize: 20, fontWeight: "600", textAlign: "center" }}>Documents Module</Text>
        <Text style={{ color: colors.onSurfaceVariant, fontSize: 15, textAlign: "center", marginTop: spacing.sm, lineHeight: 22 }}>
          Document upload and management will be available soon. You'll be able to upload, view, and manage your hostel-related documents here.
        </Text>
      </View>
    </SafeAreaView>
  );
}
