import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Image, Switch } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { TopAppBar, Card } from "../components/UI";
import { mockStudent } from "../data/mockData";
import { colors } from "../theme/tokens";

export default function Profile() {
  const navigation = useNavigation<any>();
  const s = mockStudent;
  const [darkMode, setDarkMode] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <TopAppBar name={s.name.split(" ")[0]} />
      <ScrollView style={{ paddingHorizontal: 24, paddingTop: 24 }} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <View style={{ position: "relative" }}>
            <Image source={{ uri: s.avatar }} style={{ width: 128, height: 128, borderRadius: 64, borderWidth: 4, borderColor: colors.surfaceContainerHigh }} />
            <Pressable onPress={() => navigation.navigate("EditProfile")} style={({ pressed }) => ({ position: "absolute", bottom: 4, right: 4, backgroundColor: colors.primary, padding: 8, borderRadius: 9999, opacity: pressed ? 0.9 : 1 })}>
              <MaterialIcons name="edit" size={18} color="#fff" />
            </Pressable>
          </View>
          <Text style={{ color: colors.onBackground, fontSize: 24, fontWeight: "700", marginTop: 12 }}>{s.name}</Text>
          <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, marginTop: 4 }}>ID: {s.studentId} • {s.course}</Text>
          <View style={{ backgroundColor: colors.secondaryContainer, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9999, marginTop: 8 }}><Text style={{ color: colors.onSecondaryContainer, fontSize: 12 }}>{s.year}</Text></View>
        </View>

        <Text style={{ color: colors.onBackground, fontSize: 18, fontWeight: "600", marginBottom: 12 }}>Digital Identity</Text>
        <View style={{ backgroundColor: colors.primary, borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View>
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>HostelFlow Student Pass</Text>
              <Text style={{ color: "#fff", fontSize: 20, fontWeight: "600", marginTop: 4 }}>{s.name}</Text>
              <View style={{ flexDirection: "row", gap: 24, marginTop: 16 }}>
                <View><Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, textTransform: "uppercase" }}>Room Number</Text><Text style={{ color: "#fff", fontSize: 14, marginTop: 4 }}>{s.roomNumber}</Text></View>
                <View style={{ marginLeft: 24 }}><Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, textTransform: "uppercase" }}>Valid Until</Text><Text style={{ color: "#fff", fontSize: 14, marginTop: 4 }}>{s.validUntil}</Text></View>
              </View>
            </View>
            <View style={{ backgroundColor: "#fff", padding: 8, borderRadius: 8 }}><MaterialIcons name="qr-code-2" size={48} color="#004ac6" /></View>
          </View>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Text style={{ color: colors.onBackground, fontSize: 18, fontWeight: "600" }}>Personal Info</Text>
          <Pressable onPress={() => navigation.navigate("EditProfile")}><Text style={{ color: colors.primary, fontWeight: "500", fontSize: 14 }}>Edit</Text></Pressable>
        </View>
        <Card style={{ marginBottom: 24, padding: 0, overflow: "hidden" }}>
          <InfoRow icon="call" label="Phone Number" value={s.phone} />
          <InfoRow icon="mail" label="Email Address" value={s.email} />
          <InfoRow icon="family-restroom" label="Guardian Contact" value={s.guardian} last />
        </Card>

        <Text style={{ color: colors.onBackground, fontSize: 18, fontWeight: "600", marginBottom: 12 }}>App Settings</Text>
        <Card style={{ marginBottom: 24, padding: 0, overflow: "hidden" }}>
          <SettingRow icon="notifications-active" label="Notifications" onPress={() => navigation.navigate("Notifications")} />
          <SettingRow icon="lock" label="Security & Password" onPress={() => navigation.navigate("Settings")} />
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}><MaterialIcons name="contrast" size={22} color="#434655" /><Text style={{ color: colors.onSurface, fontWeight: "500", marginLeft: 16 }}>Dark Mode</Text></View>
            <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: "#004ac6" }} />
          </View>
          <SettingRow icon="help" label="Help & Support" onPress={() => navigation.navigate("Settings")} />
          <Pressable onPress={() => navigation.replace("Login")} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 16, padding: 16, backgroundColor: pressed ? "rgba(255,218,214,0.1)" : "transparent" })}>
            <MaterialIcons name="logout" size={22} color="#ba1a1a" />
            <Text style={{ color: colors.error, fontWeight: "500", marginLeft: 16 }}>Log Out</Text>
          </Pressable>
        </Card>
        <View style={{ alignItems: "center", paddingBottom: 24 }}><Text style={{ color: colors.outline, fontSize: 12 }}>HostelFlow v1.0.0</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value, last }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; value: string; last?: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 16, padding: 16, borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.outlineVariant }}>
      <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: colors.surfaceContainerHigh, alignItems: "center", justifyContent: "center" }}><MaterialIcons name={icon} size={20} color="#004ac6" /></View>
      <View style={{ marginLeft: 16, flex: 1 }}><Text style={{ color: colors.onSurfaceVariant, fontSize: 12 }}>{label}</Text><Text style={{ color: colors.onSurface, fontSize: 16, marginTop: 2 }}>{value}</Text></View>
    </View>
  );
}

function SettingRow({ icon, label, onPress }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, backgroundColor: pressed ? colors.surfaceContainerLow : "transparent" })}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}><MaterialIcons name={icon} size={22} color="#434655" /><Text style={{ color: colors.onSurface, fontWeight: "500", marginLeft: 16 }}>{label}</Text></View>
      <MaterialIcons name="chevron-right" size={20} color="#737686" />
    </Pressable>
  );
}
