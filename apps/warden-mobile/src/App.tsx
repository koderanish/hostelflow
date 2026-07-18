import { useState, useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Student, Complaint, Visitor, AttendanceStatus, ComplaintStatus } from './types';
import { INITIAL_STUDENTS, INITIAL_COMPLAINTS, INITIAL_VISITORS } from './data';
import BottomNavBar from './components/BottomNavBar';
import HomeView from './components/HomeView';
import AttendanceView from './components/AttendanceView';
import ComplaintsView from './components/ComplaintsView';
import VisitorsView from './components/VisitorsView';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'attendance' | 'complaints' | 'visitors'>('home');
  
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [visitors, setVisitors] = useState<Visitor[]>(INITIAL_VISITORS);
  
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadState = async () => {
      try {
        const savedStudents = await AsyncStorage.getItem('hf_students');
        if (savedStudents) setStudents(JSON.parse(savedStudents));
        
        const savedComplaints = await AsyncStorage.getItem('hf_complaints');
        if (savedComplaints) setComplaints(JSON.parse(savedComplaints));
        
        const savedVisitors = await AsyncStorage.getItem('hf_visitors');
        if (savedVisitors) setVisitors(JSON.parse(savedVisitors));
      } catch (e) {
        console.error("Failed to load state", e);
      } finally {
        setIsReady(true);
      }
    };
    loadState();
  }, []);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem('hf_students', JSON.stringify(students)).catch(console.error);
  }, [students, isReady]);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem('hf_complaints', JSON.stringify(complaints)).catch(console.error);
  }, [complaints, isReady]);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem('hf_visitors', JSON.stringify(visitors)).catch(console.error);
  }, [visitors, isReady]);

  const handleUpdateAttendance = (studentId: string, status: AttendanceStatus) => {
    setStudents(prev => prev.map(student => 
      student.id === studentId ? { ...student, attendanceStatus: status } : student
    ));
  };

  const handleSubmitAllAttendance = (stats: { present: number; absent: number; leave: number }) => {
    console.log("Attendance submitted successfully!", stats);
  };

  const handleAddComplaint = (newComplaint: Complaint) => {
    setComplaints(prev => [newComplaint, ...prev]);
  };

  const handleUpdateComplaintStatus = (id: string, status: ComplaintStatus) => {
    setComplaints(prev => prev.map(complaint => 
      complaint.id === id ? { ...complaint, status } : complaint
    ));
    setSelectedComplaint(prev => prev && prev.id === id ? { ...prev, status } : prev);
  };

  const handleAddVisitor = (newVisitor: Visitor) => {
    setVisitors(prev => [newVisitor, ...prev]);
  };

  const handleCheckOutVisitor = (id: string) => {
    setVisitors(prev => prev.map(visitor => 
      visitor.id === id 
        ? { ...visitor, status: 'checked-out', checkOutTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } 
        : visitor
    ));
  };

  const handleSelectComplaintFromHome = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setActiveTab('complaints');
  };

  const handleOpenVisitorRegistration = () => {
    setActiveTab('visitors');
  };

  const criticalComplaintsList = complaints.filter(c => c.priority === 'critical' && c.status !== 'resolved');
  const pendingComplaintsCount = complaints.filter(c => c.status !== 'resolved').length;
  const activeVisitorsCount = visitors.filter(v => v.status === 'in-premise').length;

  if (!isReady) return null;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1 pb-20">
        {activeTab === 'home' && (
          <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1">
            <HomeView 
              onTabChange={setActiveTab}
              pendingComplaintsCount={pendingComplaintsCount}
              activeVisitorsCount={activeVisitorsCount}
              criticalComplaints={criticalComplaintsList}
              onSelectComplaint={handleSelectComplaintFromHome}
              onOpenNewVisitor={handleOpenVisitorRegistration}
            />
          </Animated.View>
        )}

        {activeTab === 'attendance' && (
          <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1">
            <AttendanceView 
              students={students}
              onUpdateAttendance={handleUpdateAttendance}
              onSubmitAllAttendance={handleSubmitAllAttendance}
            />
          </Animated.View>
        )}

        {activeTab === 'complaints' && (
          <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1">
            <ComplaintsView 
              complaints={complaints}
              selectedComplaint={selectedComplaint}
              onSelectComplaint={setSelectedComplaint}
              onAddComplaint={handleAddComplaint}
              onUpdateComplaintStatus={handleUpdateComplaintStatus}
            />
          </Animated.View>
        )}

        {activeTab === 'visitors' && (
          <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1">
            <VisitorsView 
              visitors={visitors}
              onAddVisitor={handleAddVisitor}
              onCheckOutVisitor={handleCheckOutVisitor}
            />
          </Animated.View>
        )}
      </View>
      <BottomNavBar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </SafeAreaView>
  );
}
