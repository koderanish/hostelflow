import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { complaintService } from '../../services/complaint.service';
import { studentService } from '../../services/student.service';
import { roomService } from '../../services/room.service';
import type { Student, Room } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { useNotify } from '../../context/NotificationContext';
import { Loader2, Search } from 'lucide-react';

const complaintSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  roomId: z.string().min(1, 'Room is required'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  priority: z.string().min(1, 'Priority is required'),
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

export function CreateComplaintPage() {
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
  });

  const studentId = watch('studentId');

  useEffect(() => {
    studentService.getAll().then(res => {
      if (res.success && res.data) setStudents(res.data.filter((s: Student) => !s.isDeleted));
    });
    roomService.getAll().then(res => {
      if (res.success && res.data) setRooms(res.data.filter((r: Room) => !r.isDeleted));
    });
  }, []);

  // Auto-set room if student has one
  useEffect(() => {
    if (selectedStudent && selectedStudent.roomId) {
      setValue('roomId', selectedStudent.roomId);
    }
  }, [selectedStudent, setValue]);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.enrollmentNo.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const selectStudent = (student: Student) => {
    setSelectedStudent(student);
    setValue('studentId', student.id);
    setShowStudentPicker(false);
    setStudentSearch('');
  };

  const onSubmit = async (data: ComplaintFormData) => {
    if (!selectedStudent) {
      addToast('Please select a student', 'error');
      return;
    }
    const room = rooms.find(r => r.id === data.roomId);
    if (!room) {
      addToast('Room not found', 'error');
      return;
    }
    setSubmitting(true);
    const res = await complaintService.createComplaint({
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      roomId: data.roomId,
      roomNo: room.roomNo,
      title: data.title,
      description: data.description,
      category: data.category as any,
      priority: data.priority as any,
    });
    if (res.success) {
      addToast('Complaint created successfully', 'success');
      navigate('/admin/complaints');
    } else {
      addToast((res as any).error || 'Failed to create complaint', 'error');
    }
    setSubmitting(false);
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";
  const errorClass = "text-xs text-rose-500 mt-1";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Create Complaint" description="Submit a new complaint" />
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
                    <p className="text-[10px] text-slate-500">{selectedStudent.enrollmentNo}</p>
                  </div>
                </div>
                <button type="button" onClick={() => { setSelectedStudent(null); setValue('studentId', ''); setValue('roomId', ''); }}
                  className="text-xs text-rose-500 hover:text-rose-600 font-medium">Change</button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={studentSearch} onChange={e => { setStudentSearch(e.target.value); setShowStudentPicker(true); }}
                  onFocus={() => setShowStudentPicker(true)} placeholder="Search for a student..." className={inputClass + " pl-10"} />
                {showStudentPicker && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {filteredStudents.length === 0 ? (
                      <p className="p-3 text-xs text-slate-400">No students found</p>
                    ) : filteredStudents.map(s => (
                      <button key={s.id} type="button" onClick={() => selectStudent(s)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500/20 to-accent-500/20 flex items-center justify-center text-xs font-bold text-brand-700">{s.name.charAt(0)}</div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{s.name}</p>
                          <p className="text-[10px] text-slate-500">{s.enrollmentNo}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {errors.studentId && <p className={errorClass}>{errors.studentId.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className={labelClass}>Room *</label>
              <select {...register('roomId')} className={inputClass}>
                <option value="">Select room</option>
                {rooms.filter(r => !r.isDeleted).map(r => (
                  <option key={r.id} value={r.id}>{r.roomNo} ({r.roomType})</option>
                ))}
              </select>
              {errors.roomId && <p className={errorClass}>{errors.roomId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Category *</label>
              <select {...register('category')} className={inputClass}>
                <option value="">Select category</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Internet">Internet</option>
                <option value="Furniture">Furniture</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && <p className={errorClass}>{errors.category.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Priority *</label>
              <select {...register('priority')} className={inputClass}>
                <option value="">Select priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
              {errors.priority && <p className={errorClass}>{errors.priority.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Title *</label>
            <input type="text" {...register('title')} placeholder="e.g. Fan not working" className={inputClass} />
            {errors.title && <p className={errorClass}>{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Description *</label>
            <textarea {...register('description')} rows={4} placeholder="Describe the issue in detail..." className={inputClass} />
            {errors.description && <p className={errorClass}>{errors.description.message}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={() => navigate('/admin/complaints')}
              className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Complaint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
