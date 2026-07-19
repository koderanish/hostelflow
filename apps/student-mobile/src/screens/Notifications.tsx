import React, { useState, useCallback } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { StubHeader } from "../components/UI";
import { notificationService } from "../services/notification.service";
import { authStore } from "../services/authStore";
import { colors, spacing, radius } from "../theme/tokens";

export default function Notifications() {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const studentId = authStore.getUser()?.id ?? "";
    setLoading(true);
    const res = await notificationService.getByStudent(studentId);
    if (res.success && res.data) setNotifications(res.data);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => { fetch(); }, [fetch])
  );

  const handleMarkRead = async (id: string) => {
    await notificationService.markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <StubHeader title="Notifications" />
      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <MaterialIcons name="notifications-none" size={48} color={colors.outlineVariant} />
          <Text style={{ color: colors.onSurfaceVariant, textAlign: "center", marginTop: spacing.md, fontSize: 16 }}>No notifications yet</Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1, paddingHorizontal: spacing.gutter, paddingTop: spacing.md }} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md }}>
            <Text style={{ color: colors.onSurfaceVariant, fontSize: 14 }}>{unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}</Text>
          </View>
          {notifications.map((n) => (
            <Pressable
              key={n.id}
              onPress={() => !n.read && handleMarkRead(n.id)}
              style={({ pressed }) => ({
                backgroundColor: n.read ? colors.surfaceContainerLowest : colors.primaryContainer,
                borderWidth: 1,
                borderColor: n.read ? colors.outlineVariant : colors.primary,
                borderRadius: radius.lg,
                padding: spacing.md,
                marginBottom: spacing.sm,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: n.read ? colors.surfaceContainerHigh : colors.primary, alignItems: "center", justifyContent: "center" }}>
                  <MaterialIcons name={n.read ? "notifications" : "notifications-active"} size={20} color={n.read ? colors.onSurfaceVariant : colors.onPrimary} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Text style={{ color: colors.onSurface, fontWeight: n.read ? "500" : "700", fontSize: 15, flex: 1 }}>{n.title}</Text>
                    {!n.read && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginLeft: 8, marginTop: 4 }} />}
                  </View>
                  <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, marginTop: 4 }}>{n.message}</Text>
                  <Text style={{ color: colors.outline, fontSize: 11, marginTop: 6 }}>{n.date ? new Date(n.date).toLocaleString() : ""}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
