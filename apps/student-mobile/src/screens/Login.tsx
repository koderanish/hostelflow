import React, { useState } from "react";
import { View, Text, TextInput, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "../components/UI";
import { colors } from "../theme/tokens";
import { authService } from "../services/auth.service";
import { authStore } from "../services/authStore";

export default function Login() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
    setLoading(true);
    const result = await authService.login(email, password);
    setLoading(false);
    if (result.success && result.data) {
      authStore.setToken(result.data.accessToken);
      authStore.setUser(result.data.user);
      navigation.replace("MainTabs");
    } else {
      Alert.alert("Login Failed", result.error || "Something went wrong");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24 }}>
        <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 30, lineHeight: 36, marginBottom: 8 }}>HostelFlow</Text>
        <Text style={{ color: colors.onSurfaceVariant, fontSize: 16, lineHeight: 24, marginBottom: 32 }}>Welcome back — log in to continue</Text>

        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", marginBottom: 8 }}>Email</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="you@university.edu" keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#9ca3af" style={{ backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16, color: colors.onSurface, fontSize: 16 }} />

        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", marginBottom: 8 }}>Password</Text>
        <TextInput value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry placeholderTextColor="#9ca3af" style={{ backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 24, color: colors.onSurface, fontSize: 16 }} />

        <PrimaryButton label={loading ? "Logging in..." : "Log In"} onPress={handleLogin} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
