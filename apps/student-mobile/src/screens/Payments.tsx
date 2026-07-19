import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { TopAppBar, Card, Badge, SectionLabel } from "../components/UI";
import { colors } from "../theme/tokens";
import { authStore } from "../services/authStore";
import { studentService } from "../services/student.service";
import { paymentService, type Payment, type Invoice, type PaymentHistoryEntry } from "../services/payment.service";

interface PaymentsState {
  studentName: string;
  outstandingBalance: number;
  dueDate: string;
  invoices: { id: string; icon: string; label: string; amount: number; meta: string }[];
  history: { id: string; ref: string; meta: string; amount: number; status: string }[];
  scheduled: { id: string; date: string; label: string; amount: number; status: string }[];
}

export default function Payments() {
  const [data, setData] = useState<PaymentsState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const user = authStore.getUser();
        if (!user) { setError("User not logged in"); setLoading(false); return; }

        const studentRes = await studentService.getByUserId(user.id);
        if (!studentRes.success || !studentRes.data) {
          setError(studentRes.error || "Failed to load student");
          setLoading(false);
          return;
        }

        const studentId = studentRes.data.id;
        const studentName = studentRes.data.fullName || studentRes.data.name || "Student";

        const [paymentsRes, invoicesRes, historyRes] = await Promise.all([
          paymentService.getByStudent(studentId).catch(() => ({ success: false as const, data: [] as Payment[] })),
          paymentService.getInvoices(studentId).catch(() => ({ success: false as const, data: [] as Invoice[] })),
          paymentService.getPaymentHistory(studentId).catch(() => ({ success: false as const, data: [] as PaymentHistoryEntry[] })),
        ]);

        const payments = Array.isArray(paymentsRes.data) ? paymentsRes.data : [];
        const invoices = Array.isArray(invoicesRes.data) ? invoicesRes.data : [];
        const history = Array.isArray(historyRes.data) ? historyRes.data : [];

        let outstandingBalance = 0;
        let dueDate = "";
        for (const p of payments) {
          if (p.status === "Pending" || p.status === "Overdue" || p.status === "Partial") {
            outstandingBalance += p.balance ?? p.amount - (p.paidAmount ?? 0);
            if (!dueDate || p.dueDate < dueDate) dueDate = p.dueDate;
          }
        }

        const invoiceItems = invoices.map((inv) => ({
          id: inv.id,
          icon: "receipt",
          label: inv.invoiceNo || inv.items.map((i) => i.description).join(", "),
          amount: inv.totalAmount,
          meta: `Due: ${inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}`,
        }));

        if (invoiceItems.length === 0) {
          for (const p of payments) {
            invoiceItems.push({
              id: p.id,
              icon: "receipt",
              label: p.feeType || "Fee",
              amount: p.amount - (p.paidAmount ?? 0),
              meta: p.dueDate ? `Due: ${new Date(p.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : "",
            });
          }
        }

        const historyItems = history.map((h) => ({
          id: h.id,
          ref: h.receiptNo || h.transactionId || h.id.slice(0, 8),
          meta: `${h.paymentMethod || ""} • ${h.paidDate ? new Date(h.paidDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}`,
          amount: h.amount,
          status: h.status === "Completed" || h.status === "Paid" ? "Paid" : h.status,
        }));

        if (historyItems.length === 0) {
          const paid = payments.filter((p) => p.status === "Paid" || p.status === "Completed");
          for (const p of paid) {
            historyItems.push({
              id: p.id,
              ref: p.invoiceId || p.id.slice(0, 8),
              meta: `${p.paymentMethod || ""} • ${p.paidDate ? new Date(p.paidDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}`,
              amount: p.paidAmount ?? p.amount,
              status: "Paid",
            });
          }
        }

        const upcoming = payments
          .filter((p) => p.status === "Pending" || p.status === "Partial")
          .map((p) => ({
            id: p.id,
            date: p.dueDate ? new Date(p.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A",
            label: p.feeType || "Payment",
            amount: p.balance ?? p.amount - (p.paidAmount ?? 0),
            status: p.status,
          }));

        setData({
          studentName,
          outstandingBalance,
          dueDate: dueDate ? new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A",
          invoices: invoiceItems,
          history: historyItems,
          scheduled: upcoming,
        });
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }} edges={["top"]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
        <TopAppBar name="Student" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <MaterialIcons name="error-outline" size={48} color={colors.error} />
          <Text style={{ color: colors.onSurface, textAlign: "center", marginTop: 16, fontSize: 16 }}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const p = data!;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <TopAppBar name={p.studentName.split(" ")[0]} />
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
          {p.outstandingBalance > 0 && <Badge label="Overdue" tone="error" />}
        </View>
        {p.invoices.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 24, backgroundColor: colors.surfaceContainerLow, borderRadius: 12, marginBottom: 12 }}>
            <MaterialIcons name="receipt-long" size={32} color={colors.outlineVariant} />
            <Text style={{ color: colors.onSurfaceVariant, marginTop: 8 }}>No invoices available</Text>
          </View>
        ) : (
          p.invoices.map((inv) => (
            <View key={inv.id} style={{ backgroundColor: colors.surfaceContainer, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <View style={{ backgroundColor: colors.primaryFixed, width: 36, height: 36, borderRadius: 8, alignItems: "center", justifyContent: "center" }}><MaterialIcons name={inv.icon as any} size={18} color="#004ac6" /></View>
                <Text style={{ color: colors.onSurfaceVariant, fontSize: 12 }}>{inv.label}</Text>
              </View>
              <Text style={{ color: colors.onSurface, fontSize: 20, fontWeight: "600" }}>${inv.amount.toFixed(2)}</Text>
              <Text style={{ color: colors.onSurfaceVariant, fontSize: 14 }}>{inv.meta}</Text>
            </View>
          ))
        )}

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <Text style={{ color: colors.onSurface, fontSize: 18, fontWeight: "600" }}>Payment History</Text>
          <Text style={{ color: colors.primary, fontWeight: "500", fontSize: 14 }}>View All</Text>
        </View>
        {p.history.length === 0 ? (
          <Card style={{ marginBottom: 24, alignItems: "center", paddingVertical: 24 }}>
            <MaterialIcons name="history" size={32} color={colors.outlineVariant} />
            <Text style={{ color: colors.onSurfaceVariant, marginTop: 8 }}>No payment history</Text>
          </Card>
        ) : (
          <Card style={{ marginBottom: 24, padding: 0, overflow: "hidden" }}>
            {p.history.map((h, i) => (
              <View key={h.id} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: i !== p.history.length - 1 ? 1 : 0, borderBottomColor: colors.outlineVariant }}>
                <View style={{ flex: 1 }}><Text style={{ color: colors.onSurface, fontWeight: "500" }}>{h.ref}</Text><Text style={{ color: colors.onSurfaceVariant, fontSize: 12 }}>{h.meta}</Text></View>
                <Text style={{ color: colors.onSurface, fontWeight: "500", marginRight: 12 }}>${h.amount.toFixed(2)}</Text>
                <Badge label={h.status} tone="success" />
              </View>
            ))}
          </Card>
        )}

        <SectionLabel>Scheduled Payments</SectionLabel>
        {p.scheduled.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 24, backgroundColor: colors.surfaceContainerLow, borderRadius: 12 }}>
            <MaterialIcons name="schedule" size={32} color={colors.outlineVariant} />
            <Text style={{ color: colors.onSurfaceVariant, marginTop: 8 }}>No scheduled payments</Text>
          </View>
        ) : (
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
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
