import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { TopAppBar, Card, Badge, SectionLabel } from "../components/UI";
import { mockPayments, mockStudent } from "../data/mockData";
import { colors } from "../theme/tokens";

export default function Payments() {
  const p = mockPayments;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <TopAppBar name={mockStudent.name.split(" ")[0]} />
      <ScrollView style={{ paddingHorizontal: 16, paddingTop: 20 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ backgroundColor: colors.primaryContainer, borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 12, marginBottom: 4 }}>Total Outstanding Balance</Text>
          <Text style={{ color: "#fff", fontSize: 36, fontWeight: "700" }}>${p.outstandingBalance.toFixed(2)}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 }}>
            <MaterialIcons name="info" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, marginLeft: 4 }}>Due by {p.dueDate}</Text>
          </View>
          <Pressable style={({ pressed }) => ({ backgroundColor: "#fff", alignSelf: "flex-start", marginTop: 16, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 9999, flexDirection: "row", alignItems: "center", gap: 8, opacity: pressed ? 0.9 : 1 })}>
            <Text style={{ color: colors.primary, fontWeight: "600" }}>Pay Now</Text>
            <MaterialIcons name="arrow-forward" size={18} color="#004ac6" />
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <Text style={{ color: colors.onSurface, fontSize: 18, fontWeight: "600" }}>Invoice Details</Text>
          <Badge label="Overdue" tone="error" />
        </View>
        {p.invoices.map((inv) => (
          <View key={inv.id} style={{ backgroundColor: colors.surfaceContainer, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <View style={{ backgroundColor: colors.primaryFixed, width: 36, height: 36, borderRadius: 8, alignItems: "center", justifyContent: "center" }}><MaterialIcons name={inv.icon as any} size={18} color="#004ac6" /></View>
              <Text style={{ color: colors.onSurfaceVariant, fontSize: 12 }}>{inv.label}</Text>
            </View>
            <Text style={{ color: colors.onSurface, fontSize: 20, fontWeight: "600" }}>${inv.amount.toFixed(2)}</Text>
            <Text style={{ color: colors.onSurfaceVariant, fontSize: 14 }}>{inv.meta}</Text>
          </View>
        ))}

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <Text style={{ color: colors.onSurface, fontSize: 18, fontWeight: "600" }}>Payment History</Text>
          <Text style={{ color: colors.primary, fontWeight: "500", fontSize: 14 }}>View All</Text>
        </View>
        <Card style={{ marginBottom: 24, padding: 0, overflow: "hidden" }}>
          {p.history.map((h, i) => (
            <View key={h.id} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: i !== p.history.length - 1 ? 1 : 0, borderBottomColor: colors.outlineVariant }}>
              <View style={{ flex: 1 }}><Text style={{ color: colors.onSurface, fontWeight: "500" }}>{h.ref}</Text><Text style={{ color: colors.onSurfaceVariant, fontSize: 12 }}>{h.meta}</Text></View>
              <Text style={{ color: colors.onSurface, fontWeight: "500", marginRight: 12 }}>${h.amount.toFixed(2)}</Text>
              <Badge label={h.status} tone="success" />
            </View>
          ))}
        </Card>

        <SectionLabel>Scheduled Payments</SectionLabel>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {p.scheduled.map((s) => (
            <View key={s.id} style={{ width: 256, backgroundColor: colors.surfaceContainer, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 12, padding: 16, marginRight: 12 }}>
              <Text style={{ color: colors.secondary, fontSize: 12 }}>{s.date}</Text>
              <Text style={{ color: colors.onSurface, fontWeight: "500", marginTop: 8 }}>{s.label}</Text>
              <Text style={{ color: colors.primary, fontSize: 18, fontWeight: "600", marginTop: 4 }}>${s.amount.toFixed(2)}</Text>
              <Badge label={s.status} />
            </View>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}
