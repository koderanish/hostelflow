import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { allocationService } from '../../services/allocation.service';
import { studentService } from '../../services/student.service';
import { hostelService } from '../../services/hostel.service';
import { buildingService } from '../../services/building.service';
import { roomService } from '../../services/room.service';
import { bedService } from '../../services/bed.service';
import { applicationService } from '../../services/application.service';
import type { Student, Hostel, Building, Room, Bed, HostelApplication } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { useNotify } from '../../context/NotificationContext';
import { Loader2, Search } from 'lucide-react';

const allocationSchema = z.object({
  hostelId: z.string().min(1, 'Hostel is required'),
  buildingId: z.string().min(1, 'Building is required'),
  roomId: z.string().min(1, 'Room is required'),
  bedId: z.string().min(1, 'Bed is required'),
  dateAllocated: z.string().min(1, 'Allocation date is required'),
  expectedVacateDate: z.string().optional(),
  applicationId: z.string().optional(),
});

type AllocationFormData = z.infer<typeof allocationSchema>;

export function CreateAllocationPage() {
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [students, setStudents] = useState<Student[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [approvedApps, setApprovedApps] = useState<HostelApplication[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AllocationFormData>({
    resolver: zodResolver(allocationSchema),
    defaultValues: {
      dateAllocated: new Date().toISOString().split('T')[0],
    },
  });

  const selectedHostelId = watch('hostelId');
  const selectedBuildingId = watch('buildingId');
  const selectedRoomId = watch('roomId');

  useEffect(() => {
    studentService.getAll().then(res => {
      if (res.success && res.data) setStudents(res.data.filter(s => !s.isDeleted));
    });
    hostelService.getAll().then(res => {
      if (res.success && res.data) setHostels(res.data.filter(h => !h.isDeleted));
    });
    buildingService.getAll().then(res => {
      if (res.success && res.data) setBuildings(res.data.filter(b => !b.isDeleted));
    });
  }, []);

  useEffect(() => {
    if (selectedHostelId) {
      setValue('buildingId', '');
      setValue('roomId', '');
      setValue('bedId', '');
      buildingService.getByField('hostelId' as keyof Building, selectedHostelId).then(res => {
        if (res.success && res.data) setBuildings(res.data.filter(b => !b.isDeleted));
      });
    }
  }, [selectedHostelId]);

  useEffect(() => {
    if (selectedBuildingId) {
      setValue('roomId', '');
      setValue('bedId', '');
      roomService.getByBuilding(selectedBuildingId).then(res => {
        if (res.success && res.data) setRooms(res.data.filter(r => !r.isDeleted && r.status !== 'Under Maintenance'));
      });
    }
  }, [selectedBuildingId]);

  useEffect(() => {
    if (selectedRoomId) {
      setValue('bedId', '');
      bedService.getAvailableByRoom(selectedRoomId).then(res => {
        if (res.success && res.data) setBeds(res.data);
      });
    }
  }, [selectedRoomId]);

  useEffect(() => {
    if (selectedStudent) {
      applicationService.getActiveByStudent(selectedStudent.id).then(res => {
        if (res.success && res.data) {
          setApprovedApps(res.data.filter(a => a.status === 'Approved'));
        }
      });
    }
  }, [selectedStudent]);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.enrollmentNo.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const selectStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowStudentPicker(false);
    setStudentSearch('');
  };

  const onSubmit = async (data: AllocationFormData) => {
    if (!selectedStudent) {
      addToast('Please select a student', 'error');
      return;
    }
    setSubmitting(true);
    const hostel = hostels.find(h => h.id === data.hostelId);
    const room = rooms.find(r => r.id === data.roomId);
    const building = buildings.find(b => b.id === data.buildingId);
    const bed = beds.find(b => b.id === data.bedId);
    const res = await allocationService.createAllocation({
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      applicationId: data.applicationId || undefined,
      hostelId: data.hostelId,
      hostelName: hostel?.name || data.hostelId,
      buildingId: data.buildingId,
      roomId: data.roomId,
      roomNo: room?.roomNo || '',
      bedId: data.bedId,
      bedNo: bed?.bedNo,
      dateAllocated: data.dateAllocated,
      expectedVacateDate: data.expectedVacateDate || undefined,
    });
    if (res.success) {
      addToast('Allocation created successfully', 'success');
      navigate('/admin/allocations');
    } else {
      addToast((res as any).error || 'Failed to create allocation', 'error');
    }
    setSubmitting(false);
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";
  const errorClass = "text-xs text-rose-500 mt-1";

  const filteredBuildings = buildings.filter(b => !selectedHostelId || b.hostelId === selectedHostelId);
  const filteredRooms = rooms.filter(r => !selectedBuildingId || r.buildingId === selectedBuildingId);
  const filteredBeds = beds.filter(b => b.roomId === selectedRoomId);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Create Allocation" description="Allocate a room to a student" />
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-1.5">
            <label className={labelClass}>Student *</label>
            {selectedStudent ? (
              <div className="flex items-center justify-between p-3 rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-900/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-500/20 to-accent-500/20 flex items-center justify-center text-xs font-bold text-brand-700">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedStudent.name}</p>
                    <p className="text-[10px] text-slate-500">{selectedStudent.enrollmentNo} · {selectedStudent.course}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setSelectedStudent(null)}
                  className="text-xs text-rose-500 hover:text-rose-600 font-medium">Change</button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={studentSearch} onChange={e => { setStudentSearch(e.target.value); setShowStudentPicker(true); }}
                  onFocus={() => setShowStudentPicker(true)}
                  placeholder="Search for a student..."
                  className={inputClass + " pl-10"} />
                {showStudentPicker && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {filteredStudents.length === 0 ? (
                      <p className="p-3 text-xs text-slate-400">No students found</p>
                    ) : filteredStudents.map(s => (
                      <button key={s.id} type="button" onClick={() => selectStudent(s)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500/20 to-accent-500/20 flex items-center justify-center text-xs font-bold text-brand-700">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{s.name}</p>
                          <p className="text-[10px] text-slate-500">{s.enrollmentNo} · {s.course}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedStudent && approvedApps.length > 0 && (
            <div className="space-y-1.5">
              <label className={labelClass}>Application (optional)</label>
              <select {...register('applicationId')} className={inputClass}>
                <option value="">No application reference</option>
                {approvedApps.map(app => (
                  <option key={app.id} value={app.id}>{app.preferredHostel} - {app.preferredRoomType} ({app.appliedDate})</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className={labelClass}>Hostel *</label>
              <select {...register('hostelId')} className={inputClass}>
                <option value="">Select hostel</option>
                {hostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
              {errors.hostelId && <p className={errorClass}>{errors.hostelId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Building *</label>
              <select {...register('buildingId')} className={inputClass}>
                <option value="">Select building</option>
                {filteredBuildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              {errors.buildingId && <p className={errorClass}>{errors.buildingId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Room *</label>
              <select {...register('roomId')} className={inputClass}>
                <option value="">Select room</option>
                {filteredRooms.map(r => <option key={r.id} value={r.id}>{r.roomNo} ({r.roomType})</option>)}
              </select>
              {errors.roomId && <p className={errorClass}>{errors.roomId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Bed *</label>
              <select {...register('bedId')} className={inputClass}>
                <option value="">Select bed</option>
                {filteredBeds.map(b => <option key={b.id} value={b.id}>{b.bedNo}</option>)}
              </select>
              {errors.bedId && <p className={errorClass}>{errors.bedId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Allocation Date *</label>
              <input type="date" {...register('dateAllocated')} className={inputClass} />
              {errors.dateAllocated && <p className={errorClass}>{errors.dateAllocated.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Expected Vacate Date</label>
              <input type="date" {...register('expectedVacateDate')} className={inputClass} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={() => navigate('/admin/allocations')}
              className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Allocation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
