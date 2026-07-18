import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Users, AlertTriangle, UserPlus, ChevronRight, Phone, MessageSquare, ShieldAlert, CheckCircle, Clock, Bell, CalendarClock, UserCheck } from 'lucide-react-native';
import { Complaint, Visitor } from '../types';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface HomeViewProps {
  onTabChange: (tab: 'home' | 'attendance' | 'complaints' | 'visitors') => void;
  pendingComplaintsCount: number;
  activeVisitorsCount: number;
  criticalComplaints: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
  onOpenNewVisitor: () => void;
}

export default function HomeView({
  onTabChange,
  pendingComplaintsCount,
  activeVisitorsCount,
  criticalComplaints,
  onSelectComplaint,
  onOpenNewVisitor
}: HomeViewProps) {
  const [notifiedParents, setNotifiedParents] = useState(false);
  const [calledStudent, setCalledStudent] = useState(false);

  const wardenAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuCFXyWamq8jjVE5k20JXy4jW4zg4RWsUniwctczB2cXt3k7w9Xj9KOEBHfmzkFTVn1M9xJQyFd0aNLm9p0rnmDIN-7cets_bp4pYD6xI10St5QMBo2qxoPwMHxY7Xxwoh12xByLYeY0gWGs9grTUOMSoRf_oMK1ITDD1JgE5g7I--iwl82l9vm1w1RnkmzVui2BgP9dWfNGahjAtIUY5cu5__Phm3_VDr8YZ9h8HpkG4G5I1UBbJUxa";

  return (
    <View className="flex-1 bg-background">
      {/* Top App Bar */}
      <View className="flex-row items-center justify-between px-4 h-16 bg-white border-b border-outline-variant shadow-sm z-40">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant bg-surface-variant">
            <Image 
              style={{ width: '100%', height: '100%' }}
              source={{ uri: wardenAvatar }}
            />
          </View>
          <Text className="text-xl font-bold font-sans tracking-tight text-primary">HostelFlow</Text>
        </View>
        <TouchableOpacity 
          className="w-10 h-10 items-center justify-center rounded-full bg-surface-container-low"
          onPress={() => Alert.alert("Notifications", "All notification services are fully operational. No new alerts.")}
        >
          <View>
            <Bell size={24} color="#004ac6" />
            <View className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-error border border-white" />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 120, paddingTop: 16 }}>
        
        {/* Daily Title */}
        <Animated.View entering={FadeIn.delay(100)} className="mb-6">
          <Text className="text-2xl font-extrabold text-on-surface font-sans">Daily Overview</Text>
          <Text className="text-sm text-on-surface-variant font-medium mt-1">Wednesday, Oct 25 • Sector 4 Block A</Text>
        </Animated.View>

        {/* Stats Bento Grid */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          {/* Active Students */}
          <TouchableOpacity 
            activeOpacity={0.8}
            className="w-full bg-white border border-outline-variant rounded-2xl p-4 shadow-sm"
          >
            <View className="flex-row justify-between items-start mb-4">
              <View className="bg-primary/10 p-2 rounded-lg">
                <Users size={24} color="#004ac6" />
              </View>
              <View className="bg-primary-fixed px-2.5 py-1 rounded-full">
                <Text className="text-on-primary-fixed text-xs font-semibold">Live</Text>
              </View>
            </View>
            <View>
              <Text className="text-3xl font-extrabold font-sans text-on-surface">1,248</Text>
              <Text className="text-xs font-semibold text-on-surface-variant mt-1">Active Students</Text>
            </View>
          </TouchableOpacity>

          <View className="flex-row w-full gap-3">
            {/* Pending Complaints */}
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => onTabChange('complaints')}
              className="flex-1 bg-error-container border border-outline-variant rounded-2xl p-4 shadow-sm"
            >
              <View className="bg-error/10 p-2 rounded-lg self-start mb-4">
                <AlertTriangle size={20} color="#ba1a1a" />
              </View>
              <View>
                <Text className="text-2xl font-extrabold text-on-surface">{pendingComplaintsCount}</Text>
                <Text className="text-xs font-bold text-on-surface-variant opacity-90 mt-1">Pending Complaints</Text>
              </View>
            </TouchableOpacity>

            {/* Incoming Visitors */}
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => onTabChange('visitors')}
              className="flex-1 bg-secondary-container border border-outline-variant rounded-2xl p-4 shadow-sm"
            >
              <View className="bg-secondary/10 p-2 rounded-lg self-start mb-4">
                <UserPlus size={20} color="#004ac6" />
              </View>
              <View>
                <Text className="text-2xl font-extrabold text-on-surface">{activeVisitorsCount}</Text>
                <Text className="text-xs font-bold text-on-surface-variant opacity-90 mt-1">Incoming Visitors</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Tasks */}
        <View className="mb-6">
          <Text className="text-xs font-bold text-on-surface-variant uppercase tracking-wider font-mono mb-3">Quick Tasks</Text>
          <View className="gap-2">
            
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => onTabChange('attendance')}
              className="flex-row items-center bg-surface-container border border-outline-variant rounded-2xl p-4"
            >
              <View className="w-10 h-10 rounded-xl bg-primary items-center justify-center mr-3">
                <CalendarClock size={20} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-on-surface">Mark Night Attendance</Text>
                <Text className="text-xs text-on-surface-variant font-medium mt-0.5">Scheduled for 10:00 PM</Text>
              </View>
              <ChevronRight size={20} color="#737686" />
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => {
                onTabChange('attendance');
                setTimeout(() => {
                  Alert.alert("Action", "Filtering student list by pending leaves.");
                }, 300);
              }}
              className="flex-row items-center bg-surface-container border border-outline-variant rounded-2xl p-4"
            >
              <View className="w-10 h-10 rounded-xl bg-tertiary-container items-center justify-center mr-3">
                <UserCheck size={20} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-on-surface">Approve Leave</Text>
                <Text className="text-xs text-on-surface-variant font-medium mt-0.5">14 pending requests</Text>
              </View>
              <ChevronRight size={20} color="#737686" />
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={onOpenNewVisitor}
              className="flex-row items-center bg-surface-container border border-outline-variant rounded-2xl p-4"
            >
              <View className="w-10 h-10 rounded-xl bg-secondary items-center justify-center mr-3">
                <UserPlus size={20} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-on-surface">Register Visitor</Text>
                <Text className="text-xs text-on-surface-variant font-medium mt-0.5">New entry registration</Text>
              </View>
              <ChevronRight size={20} color="#737686" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Alerts */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xs font-bold text-on-surface-variant uppercase tracking-wider font-mono">Recent Alerts</Text>
            <TouchableOpacity onPress={() => onTabChange('complaints')}>
              <Text className="text-xs font-bold text-primary">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="gap-3">
            {criticalComplaints.map((item) => (
              <TouchableOpacity 
                activeOpacity={0.8}
                key={item.id}
                onPress={() => onSelectComplaint(item)}
                className="bg-white border-l-4 border-l-error border border-outline-variant p-4 rounded-r-2xl shadow-sm"
              >
                <View className="flex-row justify-between items-start mb-1">
                  <View className="flex-row items-center gap-1">
                    <ShieldAlert size={16} color="#ba1a1a" />
                    <Text className="text-xs text-error font-extrabold ml-1">CRITICAL COMPLAINT</Text>
                  </View>
                  <Text className="text-xs text-on-surface-variant font-semibold">{item.timeAgo}</Text>
                </View>
                <Text className="text-sm font-bold text-on-surface mt-1">{item.title} ({item.room})</Text>
                <Text className="text-xs text-on-surface-variant font-medium mt-1">Immediate attention required. Reported by {item.reportedBy}.</Text>
              </TouchableOpacity>
            ))}

            {/* Overdue Leave Alert (Aditya Verma) */}
            <View className="bg-white border-l-4 border-l-tertiary border border-outline-variant p-4 rounded-r-2xl shadow-sm">
              <View className="flex-row justify-between items-start mb-1">
                <View className="flex-row items-center gap-1">
                  <Clock size={16} color="#943700" />
                  <Text className="text-xs text-tertiary font-extrabold ml-1">OVERDUE LEAVE</Text>
                </View>
                <Text className="text-xs text-on-surface-variant font-semibold">1h ago</Text>
              </View>
              <Text className="text-sm font-bold text-on-surface mt-1">Aditya Verma (Room 105)</Text>
              <Text className="text-xs text-on-surface-variant font-medium mt-1">
                Expected return was 8:00 PM. Student is not reachable via primary mobile connection.
              </Text>
              
              <View className="mt-4 flex-row gap-2">
                <TouchableOpacity 
                  activeOpacity={0.8}
                  onPress={() => {
                    setCalledStudent(true);
                    Alert.alert("Calling", "Initiating secure proxy call to Student Aditya Verma (+91 99887 76655). Connection established.");
                  }}
                  className={`px-4 py-2 rounded-xl flex-row items-center justify-center flex-1 ${
                    calledStudent ? 'bg-secondary' : 'bg-primary'
                  }`}
                >
                  <Phone size={14} color="white" />
                  <Text className="text-white text-xs font-bold ml-1.5">{calledStudent ? 'Calling...' : 'Call Student'}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  activeOpacity={0.8}
                  onPress={() => {
                    setNotifiedParents(true);
                    Alert.alert("Notified", "Sending high-priority SMS and Email alerts to Parents of Aditya Verma. Sent successfully.");
                  }}
                  className={`px-4 py-2 rounded-xl border flex-row items-center justify-center flex-1 ${
                    notifiedParents ? 'bg-green-100 border-green-300' : 'bg-surface-container border-outline-variant'
                  }`}
                >
                  {notifiedParents ? (
                    <CheckCircle size={14} color="#15803d" />
                  ) : (
                    <MessageSquare size={14} color="#191b23" />
                  )}
                  <Text className={`text-xs font-bold ml-1.5 ${notifiedParents ? 'text-green-800' : 'text-on-surface'}`}>
                    {notifiedParents ? 'Parents Notified' : 'Notify Parents'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Atmospheric Graphic Banner */}
        <View className="h-28 w-full rounded-2xl bg-primary-fixed overflow-hidden flex-row items-center px-5 shadow-sm border border-outline-variant mb-4">
          <View className="absolute right-[-20] bottom-[-20] opacity-10">
            <View className="w-40 h-40 rounded-full bg-primary" />
          </View>
          <View>
            <View className="flex-row items-center gap-2 mb-1">
              <View className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <Text className="text-xs font-bold text-primary font-mono uppercase tracking-widest">Warden Center Online</Text>
            </View>
            <Text className="text-sm font-semibold text-on-surface-variant max-w-[260px] leading-relaxed">
              System running smoothly. All services and network logs are operational.
            </Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
