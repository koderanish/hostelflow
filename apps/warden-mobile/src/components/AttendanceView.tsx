import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { CheckCircle, XCircle, Calendar, Search, Check, HelpCircle, CalendarRange, ListTodo, Sparkles, Server } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Student, AttendanceRecord, AttendanceStatus } from '../types';
import { INITIAL_ATTENDANCE_HISTORY } from '../data';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

interface AttendanceViewProps {
  students: Student[];
  onUpdateAttendance: (id: string, status: AttendanceStatus) => void;
  onSubmitAllAttendance: (stats: { present: number; absent: number; leave: number }) => void;
}

export default function AttendanceView({
  students,
  onUpdateAttendance,
  onSubmitAllAttendance
}: AttendanceViewProps) {
  const [activeTab, setActiveTab] = useState<'mark' | 'history'>('mark');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const [history, setHistory] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_HISTORY);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const saved = await AsyncStorage.getItem('hf_attendance_history');
        if (saved) setHistory(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    };
    loadHistory();
  }, []);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.room.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    onUpdateAttendance(studentId, status);
  };

  const handleAttendanceSubmit = () => {
    const unassignedCount = students.filter(s => s.attendanceStatus === undefined).length;
    if (unassignedCount > 0) {
      Alert.alert(
        "Unmarked Students",
        `There are ${unassignedCount} students without any attendance marked. Submit anyway?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Submit", onPress: executeSubmit }
        ]
      );
    } else {
      executeSubmit();
    }
  };

  const executeSubmit = () => {
    setIsSubmitting(true);

    let present = 0;
    let absent = 0;
    let leave = 0;

    students.forEach(s => {
      if (s.attendanceStatus === 'present') present++;
      else if (s.attendanceStatus === 'absent') absent++;
      else if (s.attendanceStatus === 'leave') leave++;
      else present++; 
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);

      const today = new Date();
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
      const formattedDate = today.toLocaleDateString('en-GB', options);

      const newRecord: AttendanceRecord = {
        date: formattedDate,
        present: 1248 - absent - leave,
        absent,
        leave
      };

      const updatedHistory = [newRecord, ...history];
      setHistory(updatedHistory);
      AsyncStorage.setItem('hf_attendance_history', JSON.stringify(updatedHistory)).catch(console.error);

      onSubmitAllAttendance({ present, absent, leave });

      setTimeout(() => {
        setSubmitSuccess(false);
      }, 2000);

    }, 1500);
  };

  const femaleWardenSeniorPortrait = "https://lh3.googleusercontent.com/aida-public/AB6AXuBDEdu7lEzmYHPpgTbjCtiHm-2o-_6nQScBNjiCU7UgNjePWPBd1dUAOFCZtq8mkqBwIHvpBhanpTfidPwhfw3OIE4ER0hNrT6JUnmP3X3qY0g8Iczg-gh6_nLvM0kpTQF5CFmdpRyAE4Wc1yMG6i1lNFKWKVwO-AnE1rGjUXwEMkt1QFckRjeEBSjScPyVKJPB1Wln7F3bZP8Ae8i8nY-fO3b4lV_opft-OewcP_GomKamepnzLHAO";

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-4 h-16 bg-white border-b border-outline-variant shadow-sm z-40">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant bg-surface-variant">
            <Image 
              style={{ width: '100%', height: '100%' }}
              source={{ uri: femaleWardenSeniorPortrait }}
            />
          </View>
          <Text className="text-xl font-bold font-sans tracking-tight text-primary">Attendance</Text>
        </View>
        <TouchableOpacity 
          className="w-10 h-10 items-center justify-center rounded-full bg-surface-container-low"
          onPress={() => Alert.alert("Status", "Daily Attendance Service Status: ONLINE. Ready to submit.")}
        >
          <Server size={24} color="#004ac6" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 120, paddingTop: 16 }}>
          
          <View className="mb-4">
            <View className="flex-row p-1 bg-surface-container rounded-xl self-start">
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => setActiveTab('mark')}
                className={`px-5 py-2.5 rounded-lg flex-row items-center justify-center ${
                  activeTab === 'mark' ? 'bg-white shadow-sm' : ''
                }`}
              >
                <Text className={`text-xs font-bold ${activeTab === 'mark' ? 'text-primary' : 'text-on-surface-variant'}`}>Mark Attendance</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => setActiveTab('history')}
                className={`px-5 py-2.5 rounded-lg flex-row items-center justify-center ${
                  activeTab === 'history' ? 'bg-white shadow-sm' : ''
                }`}
              >
                <Text className={`text-xs font-bold ${activeTab === 'history' ? 'text-primary' : 'text-on-surface-variant'}`}>History</Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'mark' && (
              <View className="mt-4 flex-row items-center bg-white border border-outline-variant rounded-xl px-4 h-12">
                <Search size={20} color="#737686" />
                <TextInput 
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search by student name or room number..."
                  className="flex-1 ml-2 text-sm font-medium text-on-surface"
                />
              </View>
            )}
          </View>

          {activeTab === 'mark' ? (
            <View className="space-y-3">
              <View className="flex-row items-center justify-between px-1 mb-2">
                <Text className="text-xs text-outline font-bold uppercase tracking-wider font-mono">Student Identity & Room</Text>
                <Text className="text-xs text-outline font-bold uppercase tracking-wider font-mono">Roster Mark</Text>
              </View>

              <View className="gap-3">
                {filteredStudents.map((student) => {
                  const isPresent = student.attendanceStatus === 'present';
                  const isAbsent = student.attendanceStatus === 'absent';
                  const isLeave = student.attendanceStatus === 'leave';

                  return (
                    <Animated.View 
                      key={student.id}
                      layout={Layout.springify()}
                      entering={FadeIn}
                      exiting={FadeOut}
                      className="bg-white border border-outline-variant rounded-2xl p-4 shadow-sm"
                    >
                      <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center gap-3">
                          <View className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant bg-surface-variant">
                            <Image 
                              style={{ width: '100%', height: '100%' }}
                              source={{ uri: student.avatar }}
                            />
                          </View>
                          <View>
                            <Text className="font-bold text-on-surface text-base tracking-tight">{student.name}</Text>
                            <Text className="text-xs text-outline font-mono mt-0.5">{student.id}</Text>
                          </View>
                        </View>
                        <View className="px-3 py-1.5 bg-surface-container rounded-lg">
                          <Text className="font-bold text-xs text-primary">{student.room}</Text>
                        </View>
                      </View>

                      <View className="flex-row items-center gap-2 pt-3 border-t border-outline-variant">
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => handleStatusChange(student.id, 'present')}
                          className={`flex-1 flex-row justify-center items-center gap-1.5 py-2.5 rounded-full border ${
                            isPresent ? 'bg-green-100 border-green-600' : 'bg-white border-outline-variant'
                          }`}
                        >
                          <CheckCircle size={16} color={isPresent ? '#15803d' : '#737686'} />
                          <Text className={`text-xs font-bold ${isPresent ? 'text-green-800' : 'text-on-surface-variant'}`}>Present</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => handleStatusChange(student.id, 'absent')}
                          className={`flex-1 flex-row justify-center items-center gap-1.5 py-2.5 rounded-full border ${
                            isAbsent ? 'bg-red-100 border-red-600' : 'bg-white border-outline-variant'
                          }`}
                        >
                          <XCircle size={16} color={isAbsent ? '#b91c1c' : '#737686'} />
                          <Text className={`text-xs font-bold ${isAbsent ? 'text-red-800' : 'text-on-surface-variant'}`}>Absent</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => handleStatusChange(student.id, 'leave')}
                          className={`flex-1 flex-row justify-center items-center gap-1.5 py-2.5 rounded-full border ${
                            isLeave ? 'bg-yellow-100 border-yellow-600' : 'bg-white border-outline-variant'
                          }`}
                        >
                          <Calendar size={16} color={isLeave ? '#a16207' : '#737686'} />
                          <Text className={`text-xs font-bold ${isLeave ? 'text-yellow-800' : 'text-on-surface-variant'}`}>Leave</Text>
                        </TouchableOpacity>
                      </View>
                    </Animated.View>
                  );
                })}
              </View>
            </View>
          ) : (
            <Animated.View entering={FadeIn} className="space-y-4">
              <View className="flex-row items-center justify-between px-1 mb-4">
                <View className="flex-row items-center gap-2">
                  <CalendarRange size={20} color="#004ac6" />
                  <Text className="text-lg font-bold text-on-surface">Previous Records</Text>
                </View>
                <View className="bg-surface-container px-2 py-1 rounded-md">
                  <Text className="text-xs font-bold text-outline font-mono uppercase">Logs ({history.length})</Text>
                </View>
              </View>

              <View className="gap-3">
                {history.map((record, index) => (
                  <View key={index} className="bg-white border border-outline-variant rounded-2xl p-4 shadow-sm">
                    <View className="flex-row items-center justify-between border-b border-outline-variant pb-2 mb-3">
                      <View className="flex-row items-center gap-1">
                        <ListTodo size={14} color="#004ac6" />
                        <Text className="text-xs font-bold text-on-surface-variant font-mono">{record.date}</Text>
                      </View>
                      <View className="bg-primary/10 px-2.5 py-0.5 rounded-full">
                        <Text className="text-[10px] text-primary font-extrabold uppercase tracking-wider">Verified</Text>
                      </View>
                    </View>

                    <View className="flex-row gap-2">
                      <View className="flex-1 p-2 bg-green-50 rounded-xl border border-green-100 items-center">
                        <Text className="text-[10px] text-green-700 font-extrabold uppercase tracking-wide">Present</Text>
                        <Text className="text-lg font-extrabold text-green-800">{record.present}</Text>
                      </View>
                      <View className="flex-1 p-2 bg-red-50 rounded-xl border border-red-100 items-center">
                        <Text className="text-[10px] text-red-700 font-extrabold uppercase tracking-wide">Absent</Text>
                        <Text className="text-lg font-extrabold text-red-800">{record.absent}</Text>
                      </View>
                      <View className="flex-1 p-2 bg-yellow-50 rounded-xl border border-yellow-100 items-center">
                        <Text className="text-[10px] text-yellow-700 font-extrabold uppercase tracking-wide">On Leave</Text>
                        <Text className="text-lg font-extrabold text-yellow-800">{record.leave}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Giant Submit Float Panel */}
      {activeTab === 'mark' && (
        <View className="absolute bottom-6 right-4 z-40">
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={handleAttendanceSubmit}
            disabled={isSubmitting || submitSuccess}
            className={`px-6 py-4 rounded-full shadow-lg flex-row items-center justify-center gap-2 ${
              submitSuccess ? 'bg-green-600' : isSubmitting ? 'bg-primary/80' : 'bg-primary'
            }`}
          >
            {isSubmitting ? (
              <Text className="text-white font-bold text-xs uppercase tracking-widest">Processing...</Text>
            ) : submitSuccess ? (
              <>
                <Check size={20} color="white" />
                <Text className="text-white font-bold text-xs uppercase tracking-widest">Success</Text>
              </>
            ) : (
              <>
                <CheckCircle size={20} color="white" />
                <Text className="text-white font-bold text-xs uppercase tracking-widest">Submit Attendance</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
