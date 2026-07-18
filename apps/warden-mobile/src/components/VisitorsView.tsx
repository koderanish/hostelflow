import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, Alert } from 'react-native';
import { UserPlus, UserCheck, Clock, LogOut, Search, School, User, Users } from 'lucide-react-native';
import { Visitor } from '../types';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

interface VisitorsViewProps {
  visitors: Visitor[];
  onAddVisitor: (newVisitor: Visitor) => void;
  onCheckOutVisitor: (id: string) => void;
}

export default function VisitorsView({ visitors, onAddVisitor, onCheckOutVisitor }: VisitorsViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const activeVisitors = visitors.filter(v => v.status === 'in-premise');
  const checkedOutCount = visitors.filter(v => v.status === 'checked-out').length;
  const totalToday = visitors.length;

  const maleWardenAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuBenMkggkZOf0aftqgYx-kZJGKVqC0gnOUig3DX8D4B-_DgiiiQpg10w5Hu4ISpVIU8D8BnHCPHMBZA_OM_d64gQtIX044fwPQ6agR-kSkvd8q_PvhUQERGk1r8Cbd3r9svIfCpn3iU9Xwzm_JgTAlk_8AZp4TzySNlMWQYswpFobMucxfYt0OXHMGQe6-YNK6iOtQ8s0WHJKr8SzKL5gf-kefxvEVMJu7Y2uPZzWkyBjuBZxkUCIsg";

  const handleSubmit = () => {
    if (!visitorName.trim() || !studentName.trim()) {
      Alert.alert("Error", "Please provide both Visitor Name and Host Student Name.");
      return;
    }

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = (hours % 12 || 12).toString();
    const entryTime = `${formattedHours}:${minutes} ${ampm}`;

    const newVisitor: Visitor = {
      id: `V-${Date.now()}`,
      name: visitorName.trim(),
      studentName: studentName.trim(),
      entryTime,
      status: 'in-premise'
    };

    onAddVisitor(newVisitor);
    setVisitorName('');
    setStudentName('');
    setShowForm(false);
  };

  const filteredVisitors = activeVisitors.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.studentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-4 h-16 bg-white border-b border-outline-variant shadow-sm z-40">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant bg-surface-variant">
            <Image style={{ width: '100%', height: '100%' }} source={{ uri: maleWardenAvatar }} />
          </View>
          <Text className="text-xl font-bold font-sans tracking-tight text-primary">Visitors</Text>
        </View>
        <TouchableOpacity 
          className="w-10 h-10 items-center justify-center rounded-full bg-surface-container-low"
          onPress={() => Alert.alert("Total checked in visitors", `${activeVisitors.length}`)}
        >
          <Users size={24} color="#004ac6" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 120, paddingTop: 16 }}>
        
        <View className="mb-6">
          <View className="bg-primary-container rounded-2xl p-6 flex-row items-center justify-between shadow-sm">
            <View className="space-y-1">
              <Text className="text-xs font-bold text-on-primary-container uppercase tracking-widest font-mono opacity-90">Total Today</Text>
              <Text className="text-4xl font-extrabold font-sans text-white my-1">{totalToday}</Text>
              <Text className="text-xs text-on-primary-container font-medium opacity-90">
                {activeVisitors.length} active in-premise • {checkedOutCount} checked out
              </Text>
            </View>
            <View className="bg-white/20 p-4 rounded-full">
              <Users size={32} color="white" />
            </View>
          </View>
        </View>

        <View className="mb-6">
          {!showForm ? (
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => setShowForm(true)}
              className="w-full bg-primary py-4 rounded-2xl flex-row items-center justify-center shadow-sm"
            >
              <UserPlus size={20} color="white" />
              <Text className="text-white font-bold ml-2">Log New Visitor</Text>
            </TouchableOpacity>
          ) : (
            <Animated.View entering={FadeIn} className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm">
              <View className="flex-row justify-between items-center border-b border-outline-variant pb-3 mb-4">
                <View className="flex-row items-center gap-2">
                  <UserPlus size={16} color="#004ac6" />
                  <Text className="font-bold text-on-surface text-sm uppercase tracking-wider font-mono">Register New Entry</Text>
                </View>
                <TouchableOpacity onPress={() => setShowForm(false)}>
                  <Text className="text-xs text-on-surface-variant font-bold">Cancel</Text>
                </TouchableOpacity>
              </View>

              <View className="mb-4">
                <Text className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-mono">Visitor Full Name</Text>
                <TextInput 
                  value={visitorName}
                  onChangeText={setVisitorName}
                  placeholder="e.g. Robert Stevenson"
                  className="w-full h-12 px-4 border border-outline-variant rounded-xl text-sm font-medium text-on-surface"
                />
              </View>

              <View className="mb-6">
                <Text className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-mono">Host Student Name / Room</Text>
                <TextInput 
                  value={studentName}
                  onChangeText={setStudentName}
                  placeholder="e.g. Alex Chen (Room 302)"
                  className="w-full h-12 px-4 border border-outline-variant rounded-xl text-sm font-medium text-on-surface"
                />
              </View>

              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={handleSubmit}
                className="w-full bg-primary py-4 rounded-xl items-center"
              >
                <Text className="text-white font-bold text-xs uppercase tracking-widest">Confirm Visitor Entry</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        <View className="space-y-4">
          <View className="flex-row items-center justify-between px-1 mb-2">
            <Text className="text-lg font-bold text-on-surface">Current Visitors</Text>
            <View className="bg-surface-container px-2.5 py-1 rounded-full">
              <Text className="text-xs font-bold text-on-surface-variant uppercase font-mono">Active ({activeVisitors.length})</Text>
            </View>
          </View>

          <View className="flex-row items-center bg-white border border-outline-variant rounded-xl px-4 h-12 mb-4">
            <Search size={20} color="#737686" />
            <TextInput 
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search current visitors or host students..."
              className="flex-1 ml-2 text-sm font-medium text-on-surface"
            />
          </View>

          <View className="gap-3">
            {filteredVisitors.length > 0 ? (
              filteredVisitors.map((visitor) => (
                <Animated.View 
                  key={visitor.id}
                  layout={Layout.springify()}
                  entering={FadeIn}
                  exiting={FadeOut}
                  className="bg-white border border-outline-variant rounded-2xl p-4 shadow-sm"
                >
                  <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-row items-center gap-3 flex-1">
                      <View className="w-12 h-12 rounded-xl bg-surface-container items-center justify-center border border-outline-variant">
                        <User size={24} color="#585f6c" />
                      </View>
                      <View className="flex-1 mr-2">
                        <Text className="font-bold text-on-surface text-base truncate">{visitor.name}</Text>
                        <View className="flex-row items-center gap-1 mt-1">
                          <School size={14} color="#585f6c" />
                          <Text className="text-xs text-on-surface-variant font-medium">Student: {visitor.studentName}</Text>
                        </View>
                      </View>
                    </View>
                    <View className="items-end">
                      <View className="flex-row items-center gap-1">
                        <Clock size={12} color="#004ac6" />
                        <Text className="text-xs text-primary font-extrabold font-mono">{visitor.entryTime}</Text>
                      </View>
                      <Text className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-1">Entry</Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center justify-between pt-3 border-t border-outline-variant">
                    <View className="bg-secondary-container px-3 py-1.5 rounded-full flex-row items-center gap-1.5">
                      <View className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <Text className="text-on-secondary-container text-xs font-semibold">In Premise</Text>
                    </View>
                    <TouchableOpacity 
                      activeOpacity={0.8}
                      onPress={() => onCheckOutVisitor(visitor.id)}
                      className="border border-error/30 px-4 py-2 rounded-xl flex-row items-center gap-1.5 bg-error/5"
                    >
                      <LogOut size={14} color="#ba1a1a" />
                      <Text className="text-error font-bold text-xs">Check Out</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              ))
            ) : (
              <View className="items-center py-10 bg-white border border-outline-variant rounded-2xl">
                <UserCheck size={40} color="#c3c6d7" />
                <Text className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mt-4">No active visitors</Text>
              </View>
            )}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
