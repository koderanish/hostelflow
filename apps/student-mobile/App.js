import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "./src/theme/tokens";

import Login from "./src/screens/Login";
import Register from "./src/screens/Register";
import ForgotPassword from "./src/screens/ForgotPassword";
import Dashboard from "./src/screens/Dashboard";
import RoomDetails from "./src/screens/RoomDetails";
import Payments from "./src/screens/Payments";
import Profile from "./src/screens/Profile";
import Attendance from "./src/screens/Attendance";
import Complaint from "./src/screens/Complaint";
import ComplaintStatus from "./src/screens/ComplaintStatus";
import Documents from "./src/screens/Documents";
import EditProfile from "./src/screens/EditProfile";
import HostelApplication from "./src/screens/HostelApplication";
import LeaveRequest from "./src/screens/LeaveRequest";
import LeaveStatus from "./src/screens/LeaveStatus";
import MessMenu from "./src/screens/MessMenu";
import Notifications from "./src/screens/Notifications";
import Settings from "./src/screens/Settings";
import VisitorRequest from "./src/screens/VisitorRequest";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarStyle: { height: 80, paddingBottom: 16, paddingTop: 8, backgroundColor: colors.surfaceContainerLowest, borderTopColor: colors.outlineVariant },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "500" },
      }}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} options={{ title: "Home", tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} /> }} />
      <Tab.Screen name="RoomDetails" component={RoomDetails} options={{ title: "Room", tabBarIcon: ({ color, size }) => <MaterialIcons name="bed" size={size} color={color} /> }} />
      <Tab.Screen name="Payments" component={Payments} options={{ title: "Fees", tabBarIcon: ({ color, size }) => <MaterialIcons name="payments" size={size} color={color} /> }} />
      <Tab.Screen name="Profile" component={Profile} options={{ title: "Profile", tabBarIcon: ({ color, size }) => <MaterialIcons name="person" size={size} color={color} /> }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Attendance" component={Attendance} />
          <Stack.Screen name="Complaint" component={Complaint} />
          <Stack.Screen name="ComplaintStatus" component={ComplaintStatus} />
          <Stack.Screen name="Documents" component={Documents} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="HostelApplication" component={HostelApplication} />
          <Stack.Screen name="LeaveRequest" component={LeaveRequest} />
          <Stack.Screen name="LeaveStatus" component={LeaveStatus} />
          <Stack.Screen name="MessMenu" component={MessMenu} />
          <Stack.Screen name="Notifications" component={Notifications} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="VisitorRequest" component={VisitorRequest} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
