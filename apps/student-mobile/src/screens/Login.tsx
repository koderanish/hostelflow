import React, { useState } from "react";
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "../components/UI";
import { colors } from "../theme/tokens";

export default function Login() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24 }}>
        <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 30, lineHeight: 36, marginBottom: 8 }}>HostelFlow</Text>
        <Text style={{ color: colors.onSurfaceVariant, fontSize: 16, lineHeight: 24, marginBottom: 32 }}>Welcome back — log in to continue</Text>

        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", marginBottom: 8 }}>Email</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="you@university.edu" keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#9ca3af" style={{ backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16, color: colors.onSurface, fontSize: 16 }} />

        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", marginBottom: 8 }}>Password</Text>
        <TextInput value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry placeholderTextColor="#9ca3af" style={{ backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 8, color: colors.onSurface, fontSize: 16 }} />

        <Pressable onPress={() => navigation.navigate("ForgotPassword")} style={{ alignSelf: "flex-end", marginBottom: 24 }}>
          <Text style={{ color: colors.primary, fontWeight: "500", fontSize: 14 }}>Forgot password?</Text>
        </Pressable>

        <PrimaryButton label="Log In" onPress={() => navigation.replace("MainTabs")} />

        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 24 }}>
          <Text style={{ color: colors.onSurfaceVariant }}>Don't have an account? </Text>
          <Pressable onPress={() => navigation.navigate("Register")}>
            <Text style={{ color: colors.primary, fontWeight: "600" }}>Register</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
