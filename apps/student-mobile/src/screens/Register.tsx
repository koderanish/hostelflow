import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton, StubHeader } from "../components/UI";
import { colors } from "../theme/tokens";
import { authService } from "../services/auth.service";

export default function Register() {
  const navigation = useNavigation<any>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    setLoading(true);
    const result = await authService.register({
      fullName: name,
      email,
      phone: "",
      password,
      role: "student",
    });
    setLoading(false);
    if (result.success) {
      Alert.alert("Success", "Account created successfully. Please log in.", [
        { text: "OK", onPress: () => navigation.replace("Login") },
      ]);
    } else {
      Alert.alert("Registration Failed", result.error || "Something went wrong");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StubHeader title="Create Account" />
      <ScrollView style={{ paddingHorizontal: 24, paddingTop: 24 }} contentContainerStyle={{ paddingBottom: 32 }}>
        <Field label="Full Name" value={name} onChangeText={setName} placeholder="Alex Henderson" />
        <Field label="Student ID" value={studentId} onChangeText={setStudentId} placeholder="HF-2024-8892" />
        <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@university.edu" keyboardType="email-address" />
        <Field label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
        <View style={{ marginTop: 16 }}><PrimaryButton label={loading ? "Creating account..." : "Create Account"} onPress={handleRegister} /></View>
        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 24 }}>
          <Text style={{ color: colors.onSurfaceVariant }}>Already have an account? </Text>
          <Pressable onPress={() => navigation.navigate("Login")}><Text style={{ color: colors.primary, fontWeight: "600" }}>Log In</Text></Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field(props: { label: string; value: string; onChangeText: (t: string) => void; placeholder?: string; secureTextEntry?: boolean; keyboardType?: "default" | "email-address" }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", marginBottom: 8 }}>{props.label}</Text>
      <TextInput value={props.value} onChangeText={props.onChangeText} placeholder={props.placeholder} secureTextEntry={props.secureTextEntry} keyboardType={props.keyboardType ?? "default"} autoCapitalize="none" placeholderTextColor="#9ca3af" style={{ backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: colors.onSurface, fontSize: 16 }} />
    </View>
  );
}
