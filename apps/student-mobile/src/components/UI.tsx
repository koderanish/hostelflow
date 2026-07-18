import React from "react";
import { View, Text, Pressable, Image, ViewStyle, PressableStateCallbackType } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../theme/tokens";

export function TopAppBar({ name = "Student" }: { name?: string }) {
  const navigation = useNavigation<any>();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 64, paddingHorizontal: 24, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Image
          source={{ uri: "https://i.pravatar.cc/150?img=12" }}
          style={{ width: 40, height: 40, borderRadius: 9999, borderWidth: 1, borderColor: colors.primaryContainer }}
        />
        <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 20, lineHeight: 28, marginLeft: 12 }}>Hi, {name}</Text>
      </View>
      <Pressable
        onPress={() => navigation.navigate("Notifications")}
        style={({ pressed }: PressableStateCallbackType) => ({
          width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 9999,
          backgroundColor: pressed ? colors.surfaceContainerLow : "transparent",
        })}
      >
        <MaterialIcons name="notifications" size={24} color="#004ac6" />
      </Pressable>
    </View>
  );
}

export function Card({ style, ...props }: { style?: ViewStyle; children?: React.ReactNode }) {
  return (
    <View
      style={[{ backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 12, padding: 16 }, style]}
      {...props}
    />
  );
}

const badgeToneStyles: Record<string, { bg: string; text: string }> = {
  neutral: { bg: colors.secondaryContainer, text: colors.onSecondaryContainer },
  success: { bg: "#dcfce7", text: "#15803d" },
  warning: { bg: colors.secondaryContainer, text: colors.onSecondaryContainer },
  error: { bg: colors.errorContainer, text: colors.onErrorContainer },
};

export function Badge({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "success" | "warning" | "error" }) {
  const t = badgeToneStyles[tone] || badgeToneStyles.neutral;
  return (
    <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999, alignSelf: "flex-start", backgroundColor: t.bg }}>
      <Text style={{ fontSize: 12, fontWeight: "700", textTransform: "uppercase", color: t.text }}>{label}</Text>
    </View>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ color: colors.onSurfaceVariant, fontWeight: "500", fontSize: 12, lineHeight: 16, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
      {children}
    </Text>
  );
}

export function PrimaryButton({ label, onPress, icon }: { label: string; onPress?: () => void; icon?: keyof typeof MaterialIcons.glyphMap }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }: PressableStateCallbackType) => ({
        width: "100%", backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12,
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      {icon ? <MaterialIcons name={icon} size={22} color="#fff" /> : null}
      <Text style={{ color: "#fff", fontWeight: "600", fontSize: 18, lineHeight: 28 }}>{label}</Text>
    </Pressable>
  );
}

export function StubHeader({ title }: { title: string }) {
  const navigation = useNavigation();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", height: 64, paddingHorizontal: 24, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant }}>
      <Pressable onPress={() => navigation.goBack()} style={({ pressed }: PressableStateCallbackType) => ({ marginRight: 12, opacity: pressed ? 0.6 : 1 })}>
        <MaterialIcons name="arrow-back" size={24} color="#004ac6" />
      </Pressable>
      <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 20, lineHeight: 28 }}>{title}</Text>
    </View>
  );
}
