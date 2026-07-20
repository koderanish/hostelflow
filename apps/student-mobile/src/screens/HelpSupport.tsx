import React from "react";
import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ScreenWrapper, StubHeader, Card } from "../components/UI";
import { useTheme } from "../theme/ThemeContext";

const faqs = [
  { q: "How do I reset my password?", a: "Go to Settings > Security and use the Change Password option." },
  { q: "How do I mark attendance?", a: "Go to Attendance tab and tap the 'Scan QR Attendance' button to scan your class QR code." },
  { q: "How do I raise a complaint?", a: "Go to the Complaint screen from the Quick Actions on the Dashboard." },
  { q: "How do I apply for leave?", a: "Go to Leave Request from Quick Actions and fill out the form." },
];

export default function HelpSupport() {
  const { colors } = useTheme();
  const [expandedFaq, setExpandedFaq] = React.useState<number | null>(null);

  const sections = [
    { icon: "email", label: "Email Support", value: "support@hostelflow.com", action: () => Linking.openURL("mailto:support@hostelflow.com") },
    { icon: "phone", label: "Call Support", value: "+1 (555) 123-4567", action: () => Linking.openURL("tel:+15551234567") },
    { icon: "bug-report", label: "Report a Bug", description: "Report technical issues to our team.", action: () => Linking.openURL("mailto:bugs@hostelflow.com") },
    { icon: "privacy-tip", label: "Privacy Policy", description: "Read our privacy policy.", action: () => {} },
    { icon: "article", label: "Terms & Conditions", description: "View terms of service.", action: () => {} },
  ];

  return (
    <ScreenWrapper>
      <StubHeader title="Help & Support" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 }}>FAQs</Text>
        <Card style={{ padding: 0, overflow: "hidden", marginBottom: 24 }}>
          {faqs.map((faq, i) => (
            <View key={i} style={{ borderBottomWidth: i < faqs.length - 1 ? 1 : 0, borderBottomColor: colors.outlineVariant }}>
              <Pressable
                onPress={() => setExpandedFaq(expandedFaq === i ? null : i)}
                style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, backgroundColor: pressed ? colors.surfaceContainerLow : "transparent" })}
              >
                <Text style={{ color: colors.onSurface, fontSize: 15, flex: 1 }}>{faq.q}</Text>
                <MaterialIcons name={expandedFaq === i ? "expand-less" : "expand-more"} size={20} color={colors.onSurfaceVariant} />
              </Pressable>
              {expandedFaq === i ? <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, paddingHorizontal: 16, paddingBottom: 16 }}>{faq.a}</Text> : null}
            </View>
          ))}
        </Card>

        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 }}>Contact & Support</Text>
        <Card style={{ padding: 0, overflow: "hidden", marginBottom: 24 }}>
          {sections.map((item, i) => (
            <Pressable
              key={i}
              onPress={item.action}
              style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: i < sections.length - 1 ? 1 : 0, borderBottomColor: colors.outlineVariant, backgroundColor: pressed ? colors.surfaceContainerLow : "transparent" })}
            >
              <MaterialIcons name={item.icon as any} size={22} color={colors.primary} />
              <View style={{ marginLeft: 16, flex: 1 }}>
                <Text style={{ color: colors.onSurface, fontSize: 16 }}>{item.label}</Text>
                {item.value ? <Text style={{ color: colors.onSurfaceVariant, fontSize: 13 }}>{item.value}</Text> : null}
                {item.description ? <Text style={{ color: colors.onSurfaceVariant, fontSize: 13 }}>{item.description}</Text> : null}
              </View>
              <MaterialIcons name="chevron-right" size={20} color={colors.outline} />
            </Pressable>
          ))}
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
}
