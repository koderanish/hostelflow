import React, { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton, StubHeader } from "../components/UI";
import { colors } from "../theme/tokens";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StubHeader title="Reset Password" />
      <View style={{ paddingHorizontal: 24, paddingTop: 32 }}>
        {sent ? (
          <Text style={{ color: colors.onSurface, fontSize: 16, lineHeight: 24 }}>If an account exists for {email}, a reset link has been sent.</Text>
        ) : (
          <>
            <Text style={{ color: colors.onSurfaceVariant, fontSize: 16, lineHeight: 24, marginBottom: 24 }}>Enter your registered email and we'll send you a reset link.</Text>
            <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", marginBottom: 8 }}>Email</Text>
            <TextInput value={email} onChangeText={setEmail} placeholder="you@university.edu" keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#9ca3af" style={{ backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 24, color: colors.onSurface, fontSize: 16 }} />
            <PrimaryButton label="Send Reset Link" onPress={() => setSent(true)} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
