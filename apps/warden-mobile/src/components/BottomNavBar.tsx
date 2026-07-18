import { View, TouchableOpacity, Text } from 'react-native';
import { Home, ClipboardCheck, AlertTriangle, Users } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomNavBarProps {
  activeTab: 'home' | 'attendance' | 'complaints' | 'visitors';
  onTabChange: (tab: 'home' | 'attendance' | 'complaints' | 'visitors') => void;
}

export default function BottomNavBar({ activeTab, onTabChange }: BottomNavBarProps) {
  const insets = useSafeAreaInsets();
  
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
    { id: 'complaints', label: 'Complaints', icon: AlertTriangle },
    { id: 'visitors', label: 'Visitors', icon: Users },
  ] as const;

  return (
    <View 
      className="absolute bottom-0 left-0 w-full flex-row justify-around items-center px-4 bg-white border-t border-outline-variant z-50 shadow-sm"
      style={{ paddingBottom: Math.max(insets.bottom, 16), paddingTop: 16 }}
    >
      <View className="flex-row w-full max-w-lg justify-around items-center mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center rounded-full ${
                isActive ? 'bg-secondary-container px-5 py-2' : 'px-4 py-2'
              }`}
            >
              <Icon 
                color={isActive ? '#151c27' : '#5e6572'} 
                strokeWidth={isActive ? 2.5 : 2} 
                size={20} 
              />
              <Text 
                className={`text-xs mt-1 font-sans ${
                  isActive ? 'text-on-secondary-container font-semibold' : 'text-on-surface-variant'
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
