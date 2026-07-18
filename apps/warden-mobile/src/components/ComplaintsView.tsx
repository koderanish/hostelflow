import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, Alert, Modal } from 'react-native';
import { 
  AlertTriangle, Wrench, Zap, Archive as Cabinet, Wifi, Clipboard, 
  Plus, Search, Phone, ShieldAlert, Check, X, MapPin, 
  Hammer, ChevronRight 
} from 'lucide-react-native';
import { Complaint, ComplaintPriority, ComplaintStatus } from '../types';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

interface ComplaintsViewProps {
  complaints: Complaint[];
  selectedComplaint: Complaint | null;
  onSelectComplaint: (complaint: Complaint | null) => void;
  onAddComplaint: (newComplaint: Complaint) => void;
  onUpdateComplaintStatus: (id: string, status: ComplaintStatus) => void;
}

export default function ComplaintsView({
  complaints,
  selectedComplaint,
  onSelectComplaint,
  onAddComplaint,
  onUpdateComplaintStatus
}: ComplaintsViewProps) {
  const [filter, setFilter] = useState<'all' | 'open' | 'in-progress' | 'resolved'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [title, setTitle] = useState('');
  const [room, setRoom] = useState('');
  const [category, setCategory] = useState('Plumbing');
  const [priority, setPriority] = useState<ComplaintPriority>('medium');
  const [description, setDescription] = useState('');
  const [reportedBy, setReportedBy] = useState('');

  const filteredComplaints = complaints.filter(c => {
    const matchesFilter = filter === 'all' || c.status === filter;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const activeCount = complaints.filter(c => c.status !== 'resolved').length;
  const criticalCount = complaints.filter(c => c.priority === 'critical' && c.status !== 'resolved').length;
  const todayCount = complaints.length; 

  const femaleWardenAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuCc0MR6mlKnjF6FRTkqFskiY7zCiwN1bgMl3U2eYj5Y_SUnKH3_U92mNQQGL5Q5tKDz1OICs8vrsyiwaRHj6MwomBoWzW8FCsz0CkUsl15h58M8YwyGxAmx5wIgytOH0P2wGbbF3yMhet3AQExHzvkx-eB6UIChBFj_FkrW9Ojyvz81I_fT4uIiwFdrnd6-ZzbRenZtHiat04LPLxNmmP9WY9rzNIxhLotMokq6AWro6k6LttcMCcXq";

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'plumbing': return <Wrench size={16} color="#737686" />;
      case 'electrical': return <Zap size={16} color="#737686" />;
      case 'furniture': return <Cabinet size={16} color="#737686" />;
      case 'network': return <Wifi size={16} color="#737686" />;
      default: return <Clipboard size={16} color="#737686" />;
    }
  };

  const handleCreateComplaint = () => {
    if (!title.trim() || !room.trim() || !description.trim() || !reportedBy.trim()) {
      Alert.alert("Error", "Please complete all the input fields.");
      return;
    }

    const newComplaint: Complaint = {
      id: `C-${Math.floor(1000 + Math.random() * 9000)}`,
      title: title.trim(),
      priority,
      status: 'open',
      room: room.trim().startsWith('Room') ? room.trim() : `Room ${room.trim()}`,
      category,
      timeAgo: 'Just now',
      reportedBy: reportedBy.trim(),
      studentId: `HF-2024-0${Math.floor(10 + Math.random() * 90)}`,
      studentPhone: '+91 99001 12233',
      description: description.trim(),
      imageUrl: category.toLowerCase() === 'plumbing' 
        ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFlv3sLw-MWOdGz43Z-kZFJDGtCSqDbK9lR3rAzlOKTg9UZbFlwd-fU32IHl-IiWj_jniPH8KXvfxDBGMStcc45t2igIKV5gAM2d-mN7ENHjL_AdzNGz2wr0Pe4GbZvbmsYVaLx9kbIgU_tadEHPyYMihk98IvfrqEnEvo9WByBSU6beqRTuZVGBVNcm1DIRFShHrMlhtwi5ahhDPZfvYkwNEV2KaaXtzi78EpnNccKQFY5TvUt9ry'
        : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600'
    };

    onAddComplaint(newComplaint);
    setTitle('');
    setRoom('');
    setCategory('Plumbing');
    setPriority('medium');
    setDescription('');
    setReportedBy('');
    setShowAddForm(false);
  };

  const categories = ['Plumbing', 'Electrical', 'Furniture', 'Network', 'Other'];
  const priorities: ComplaintPriority[] = ['low', 'medium', 'critical'];

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-4 h-16 bg-white border-b border-outline-variant shadow-sm z-40">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant bg-surface-variant">
            <Image style={{ width: '100%', height: '100%' }} source={{ uri: femaleWardenAvatar }} />
          </View>
          <Text className="text-xl font-bold font-sans tracking-tight text-primary">Complaints</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity 
            onPress={() => setShowSearch(!showSearch)}
            className="w-10 h-10 items-center justify-center rounded-full bg-surface-container-low"
          >
            <Search size={20} color="#004ac6" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 120, paddingTop: 16 }}>
        
        {showSearch && (
          <Animated.View entering={FadeIn} exiting={FadeOut} className="mb-4">
            <View className="flex-row items-center bg-white border border-outline-variant rounded-xl px-4 h-12">
              <Search size={20} color="#737686" />
              <TextInput 
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search by title, room, or category..."
                className="flex-1 ml-2 text-sm font-medium text-on-surface"
                autoFocus
              />
            </View>
          </Animated.View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 flex-row">
          {(['all', 'open', 'in-progress', 'resolved'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setFilter(tab)}
              className={`mr-2 px-5 py-2 rounded-full items-center justify-center border ${
                filter === tab ? 'bg-primary-container border-primary-container' : 'bg-white border-outline-variant'
              }`}
            >
              <Text className={`text-xs font-bold ${filter === tab ? 'text-white' : 'text-on-surface-variant'}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View className="flex-row flex-wrap gap-3 mb-6">
          <View className="w-[48%] p-4 bg-white border border-outline-variant rounded-2xl shadow-sm">
            <Text className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">Active</Text>
            <Text className="text-2xl font-extrabold text-primary font-sans mt-1">{activeCount}</Text>
          </View>
          <View className="w-[48%] p-4 bg-white border border-outline-variant rounded-2xl shadow-sm">
            <Text className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">Critical</Text>
            <Text className="text-2xl font-extrabold text-error font-sans mt-1">{criticalCount}</Text>
          </View>
          <View className="w-[48%] p-4 bg-white border border-outline-variant rounded-2xl shadow-sm">
            <Text className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">Logged Today</Text>
            <Text className="text-2xl font-extrabold text-tertiary font-sans mt-1">{todayCount}</Text>
          </View>
          <View className="w-[48%] p-4 bg-white border border-outline-variant rounded-2xl shadow-sm">
            <Text className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">Avg Resolve</Text>
            <Text className="text-2xl font-extrabold text-on-surface font-sans mt-1">4.2h</Text>
          </View>
        </View>

        <View className="gap-3">
          {filteredComplaints.length > 0 ? (
            filteredComplaints.map((complaint) => {
              const isCritical = complaint.priority === 'critical';
              const isMedium = complaint.priority === 'medium';

              return (
                <TouchableOpacity 
                  activeOpacity={0.8}
                  key={complaint.id}
                  onPress={() => onSelectComplaint(complaint)}
                  className="bg-white border border-outline-variant rounded-2xl p-4 shadow-sm"
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1 mr-2">
                      <View className="flex-row items-center gap-1.5 mb-1">
                        <Text className={`text-[10px] font-extrabold uppercase tracking-widest ${
                          isCritical ? 'text-error' : isMedium ? 'text-tertiary' : 'text-secondary'
                        }`}>
                          {complaint.priority} priority
                        </Text>
                      </View>
                      <Text className="font-bold text-on-surface text-base tracking-tight" numberOfLines={1}>{complaint.title}</Text>
                    </View>
                    <View className={`px-2.5 py-1 rounded-full ${
                      complaint.status === 'open' ? 'bg-error-container' : 
                      complaint.status === 'in-progress' ? 'bg-secondary-container' : 'bg-green-100'
                    }`}>
                      <Text className={`text-[10px] font-bold uppercase tracking-wider ${
                        complaint.status === 'open' ? 'text-on-error-container' : 
                        complaint.status === 'in-progress' ? 'text-on-secondary-container' : 'text-green-800'
                      }`}>
                        {complaint.status}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center text-xs font-semibold pt-3 border-t border-outline-variant">
                    <View className="flex-row items-center mr-4">
                      <MapPin size={12} color="#737686" />
                      <Text className="text-xs text-on-surface-variant ml-1">{complaint.room}</Text>
                    </View>
                    <View className="flex-row items-center">
                      {getCategoryIcon(complaint.category)}
                      <Text className="text-xs text-on-surface-variant ml-1">{complaint.category}</Text>
                    </View>
                    <View className="flex-1 items-end">
                      <Text className="text-[10px] text-outline font-mono">{complaint.timeAgo}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View className="items-center py-12 bg-white border border-outline-variant rounded-2xl">
              <View className="bg-green-50 p-3 rounded-full mb-3">
                <Check size={32} color="#22c55e" />
              </View>
              <Text className="text-sm font-bold text-on-surface-variant">All clear! No active complaints found</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => setShowAddForm(true)}
        className="absolute right-6 bottom-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg z-40"
      >
        <Plus size={28} color="white" />
      </TouchableOpacity>

      <Modal visible={showAddForm} animationType="slide" transparent>
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white w-full rounded-t-3xl pt-6 px-6 pb-12 shadow-xl h-[85%]">
            <View className="flex-row justify-between items-center border-b border-outline-variant pb-4 mb-4">
              <View className="flex-row items-center gap-2">
                <Hammer size={20} color="#004ac6" />
                <Text className="text-lg font-bold text-on-surface">Log New Complaint</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddForm(false)}>
                <X size={24} color="#737686" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 mb-4">
              <View className="mb-4">
                <Text className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-mono">Title</Text>
                <TextInput 
                  value={title} 
                  onChangeText={setTitle}
                  placeholder="e.g. Wash basin tap leak"
                  className="w-full h-12 px-4 border border-outline-variant rounded-xl text-sm font-medium text-on-surface"
                />
              </View>

              <View className="flex-row gap-4 mb-4">
                <View className="flex-1">
                  <Text className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-mono">Room</Text>
                  <TextInput 
                    value={room} 
                    onChangeText={setRoom}
                    placeholder="e.g. 402B"
                    className="w-full h-12 px-4 border border-outline-variant rounded-xl text-sm font-medium text-on-surface"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-mono">Reported By</Text>
                  <TextInput 
                    value={reportedBy} 
                    onChangeText={setReportedBy}
                    placeholder="e.g. Rohan Verma"
                    className="w-full h-12 px-4 border border-outline-variant rounded-xl text-sm font-medium text-on-surface"
                  />
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-mono">Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                  {categories.map(c => (
                    <TouchableOpacity 
                      key={c}
                      onPress={() => setCategory(c)}
                      className={`mr-2 px-4 py-2 rounded-xl border ${
                        category === c ? 'bg-primary border-primary' : 'bg-surface-container border-outline-variant'
                      }`}
                    >
                      <Text className={`text-xs font-bold ${category === c ? 'text-white' : 'text-on-surface'}`}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View className="mb-4">
                <Text className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-mono">Priority</Text>
                <View className="flex-row gap-2">
                  {priorities.map(p => (
                    <TouchableOpacity 
                      key={p}
                      onPress={() => setPriority(p)}
                      className={`flex-1 items-center justify-center py-2.5 rounded-xl border ${
                        priority === p ? 'bg-primary border-primary' : 'bg-surface-container border-outline-variant'
                      }`}
                    >
                      <Text className={`text-[10px] uppercase font-bold ${priority === p ? 'text-white' : 'text-on-surface'}`}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-mono">Description</Text>
                <TextInput 
                  value={description} 
                  onChangeText={setDescription}
                  placeholder="Describe the complaint in detail..."
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="w-full h-24 px-4 py-3 border border-outline-variant rounded-xl text-sm font-medium text-on-surface"
                />
              </View>
            </ScrollView>

            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={handleCreateComplaint}
              className="w-full bg-primary py-4 rounded-xl items-center"
            >
              <Text className="text-white font-bold text-xs uppercase tracking-widest">Submit Complaint</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={!!selectedComplaint} animationType="fade" transparent>
        {selectedComplaint && (
          <View className="flex-1 bg-black/40 justify-center px-4">
            <View className="bg-white w-full rounded-2xl shadow-xl overflow-hidden max-h-[80%]">
              <View className="p-6">
                <View className="flex-row justify-between items-start mb-4">
                  <View>
                    <Text className="text-[10px] font-bold text-outline uppercase tracking-widest font-mono">Complaint #{selectedComplaint.id}</Text>
                    <Text className="text-xl font-extrabold text-on-surface mt-1">{selectedComplaint.title}</Text>
                  </View>
                  <TouchableOpacity onPress={() => onSelectComplaint(null)}>
                    <X size={24} color="#737686" />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View className="flex-row items-center justify-between p-4 bg-surface-container-low border border-outline-variant rounded-2xl mb-4">
                    <View>
                      <Text className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">Reported By</Text>
                      <Text className="font-bold text-sm text-on-surface mt-1">{selectedComplaint.reportedBy} ({selectedComplaint.room})</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => Alert.alert("Call", `Dialing ${selectedComplaint.studentPhone}`)}
                      className="w-10 h-10 rounded-full bg-primary items-center justify-center"
                    >
                      <Phone size={18} color="white" />
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row gap-3 mb-4">
                    <View className="flex-1 p-3 border border-outline-variant rounded-2xl">
                      <Text className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2 font-mono">Status</Text>
                      <View className="flex-row items-center gap-2">
                        <View className={`w-2.5 h-2.5 rounded-full ${
                          selectedComplaint.status === 'open' ? 'bg-error' : 
                          selectedComplaint.status === 'in-progress' ? 'bg-tertiary' : 'bg-green-500'
                        }`} />
                        <Text className="font-bold text-xs text-on-surface uppercase tracking-wide">{selectedComplaint.status}</Text>
                      </View>
                    </View>
                    <View className="flex-1 p-3 border border-outline-variant rounded-2xl">
                      <Text className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2 font-mono">Category</Text>
                      <View className="flex-row items-center gap-1">
                        {getCategoryIcon(selectedComplaint.category)}
                        <Text className="font-bold text-xs text-on-surface ml-1">{selectedComplaint.category}</Text>
                      </View>
                    </View>
                  </View>

                  <View className="mb-4">
                    <Text className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2 font-mono">Description</Text>
                    <Text className="text-xs text-on-surface font-medium bg-surface-container-low p-4 border border-outline-variant rounded-xl leading-5">
                      {selectedComplaint.description}
                    </Text>
                  </View>

                  {selectedComplaint.imageUrl && (
                    <View className="mb-4">
                      <Text className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block font-mono mb-2">Photo Evidence</Text>
                      <View className="w-full h-44 rounded-2xl overflow-hidden border border-outline-variant">
                        <Image source={{ uri: selectedComplaint.imageUrl }} style={{ width: '100%', height: '100%' }} />
                      </View>
                    </View>
                  )}
                </ScrollView>

                <View className="flex-row gap-3 pt-4 border-t border-outline-variant">
                  {selectedComplaint.status !== 'in-progress' && selectedComplaint.status !== 'resolved' && (
                    <TouchableOpacity 
                      onPress={() => onUpdateComplaintStatus(selectedComplaint.id, 'in-progress')}
                      className="flex-1 py-3 bg-primary rounded-xl items-center"
                    >
                      <Text className="text-white font-bold text-xs uppercase tracking-widest">Assign Staff</Text>
                    </TouchableOpacity>
                  )}
                  {selectedComplaint.status !== 'resolved' && (
                    <TouchableOpacity 
                      onPress={() => onUpdateComplaintStatus(selectedComplaint.id, 'resolved')}
                      className="flex-1 py-3 border border-primary rounded-xl items-center"
                    >
                      <Text className="text-primary font-bold text-xs uppercase tracking-widest">Mark Resolved</Text>
                    </TouchableOpacity>
                  )}
                  {selectedComplaint.status === 'resolved' && (
                    <TouchableOpacity 
                      onPress={() => onUpdateComplaintStatus(selectedComplaint.id, 'open')}
                      className="flex-1 py-3 bg-error rounded-xl items-center"
                    >
                      <Text className="text-white font-bold text-xs uppercase tracking-widest">Reopen</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}
