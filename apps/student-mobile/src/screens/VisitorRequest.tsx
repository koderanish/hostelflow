import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { StubHeader } from "../components/UI";
import { colors } from "../theme/tokens";

export default function VisitorRequest() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <StubHeader title="Visitor Request" />
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
        <MaterialIcons name="groups" size={48} color="#c3c6d7" />
        <Text style={{ color: colors.onSurfaceVariant, textAlign: "center", marginTop: 16 }}>Form to request a visitor pass goes here.</Text>
      </View>
    </SafeAreaView>
  );
}
