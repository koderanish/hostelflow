import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenWrapper, StubHeader, Card } from "../components/UI";
import { useTheme } from "../theme/ThemeContext";

const languages = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
];

export default function LanguageSettings() {
  const { colors } = useTheme();
  const [selected, setSelected] = useState("en");

  const handleSelect = async (code: string) => {
    setSelected(code);
    await AsyncStorage.setItem("@language", code);
  };

  return (
    <ScreenWrapper>
      <StubHeader title="App Language" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {languages.map((lang, i) => (
            <Pressable
              key={lang.code}
              onPress={() => handleSelect(lang.code)}
              style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: i < languages.length - 1 ? 1 : 0, borderBottomColor: colors.outlineVariant, backgroundColor: pressed ? colors.surfaceContainerLow : "transparent" })}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MaterialIcons name="language" size={22} color={colors.onSurfaceVariant} />
                <View style={{ marginLeft: 16 }}>
                  <Text style={{ color: colors.onSurface, fontSize: 16 }}>{lang.label}</Text>
                  <Text style={{ color: colors.onSurfaceVariant, fontSize: 12 }}>{lang.native}</Text>
                </View>
              </View>
              <MaterialIcons name={selected === lang.code ? "radio-button-checked" : "radio-button-unchecked"} size={22} color={selected === lang.code ? colors.primary : colors.outline} />
            </Pressable>
          ))}
        </Card>
        <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, marginTop: 24, textAlign: "center" }}>Localization support for more languages coming soon.</Text>
      </ScrollView>
    </ScreenWrapper>
  );
}
