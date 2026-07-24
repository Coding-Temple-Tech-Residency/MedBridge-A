import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogout } from '@/features/auth/useLogout';

type Appointment = {
  id: number;
  date: string;
  time: string;
  doctor: string;
  visitType: 'virtual' | 'in-person';
  reason: string;
  concerningResults: boolean;
};

const doctorOptions = [
  'Dr. Maya Patel (Primary Care)',
  'Dr. Daniel Kim (Cardiology)',
  'Dr. Sofia Chen (Endocrinology)',
  'Dr. Ethan Brooks (Internal Medicine)',
];

const timeOptions = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '11:00 AM',
  '01:00 PM',
  '02:00 PM',
  '03:30 PM',
  '04:00 PM',
];

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toReadableDate(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const logout = useLogout();
  const today = useMemo(() => new Date(), []);
  const [displayMonth, setDisplayMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const [fullName, setFullName] = useState('Jane Doe');
  const [email, setEmail] = useState('jane.doe@example.com');
  const [phone, setPhone] = useState('(555) 010-2244');
  const [dateOfBirth, setDateOfBirth] = useState('1992-04-12');
  const [preferredClinic, setPreferredClinic] = useState('Downtown Medical Center');
  const [profileSaved, setProfileSaved] = useState(false);

  const [selectedDate, setSelectedDate] = useState(toDateKey(today));
  const [selectedTime, setSelectedTime] = useState(timeOptions[2]);
  const [selectedDoctor, setSelectedDoctor] = useState(doctorOptions[0]);
  const [visitType, setVisitType] = useState<'virtual' | 'in-person'>('virtual');
  const [reason, setReason] = useState('Follow-up for recent lab results');
  const [concerningResults, setConcerningResults] = useState(true);
  const [appointmentNotice, setAppointmentNotice] = useState<string | null>(null);

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 1,
      date: toDateKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2)),
      time: '10:00 AM',
      doctor: doctorOptions[1],
      visitType: 'virtual',
      reason: 'Discuss elevated LDL and next steps',
      concerningResults: true,
    },
  ]);

  const monthLabel = displayMonth.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const firstWeekday = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1).getDay();
  const daysInMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 0).getDate();

  const monthCells = Array.from({ length: firstWeekday + daysInMonth }, (_, index) => {
    if (index < firstWeekday) {
      return null;
    }
    const day = index - firstWeekday + 1;
    const date = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
    return { day, key: toDateKey(date) };
  });

  const upcomingAppointments = [...appointments].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) {
      return dateCompare;
    }
    return a.time.localeCompare(b.time);
  });

  const appointmentDates = new Set(appointments.map((appt) => appt.date));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(true);
    window.setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    setAppointmentNotice(null);

    const newAppointment: Appointment = {
      id: Date.now(),
      date: selectedDate,
      time: selectedTime,
      doctor: selectedDoctor,
      visitType,
      reason: reason.trim() || 'Lab result consultation',
      concerningResults,
    };

    setAppointments((current) => [...current, newAppointment]);
    setAppointmentNotice(
      concerningResults
        ? 'Appointment scheduled. We marked this as concerning so your care team can prioritize review.'
        : 'Appointment scheduled successfully.',
    );
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#8FD4A8]/40 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#2E7D55]">Profile</p>
        <h1 className="mt-1 text-3xl font-bold text-[#1E3A2F]">Your MedBridge Profile</h1>
        <p className="mt-3 max-w-2xl text-sm text-gray-500">
          Update your account details and schedule doctor appointments when your lab results need
          follow-up.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/upload')}
            className="rounded-xl bg-[#1E3A2F] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2E7D55]"
          >
            Upload New Lab
          </button>
          <button
            onClick={() => void logout()}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
          >
            Sign Out
          </button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <form
          onSubmit={handleSaveProfile}
          className="rounded-3xl border border-[#8FD4A8]/40 bg-white p-6 shadow-sm"
        >
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#2E7D55]">Account</p>
            <h2 className="mt-1 text-2xl font-bold text-[#1E3A2F]">Edit Your Information</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-medium text-[#1E3A2F]">
              Full name
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:border-[#2E7D55] focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-[#1E3A2F]">
              Date of birth
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:border-[#2E7D55] focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-[#1E3A2F] sm:col-span-2">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:border-[#2E7D55] focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-[#1E3A2F]">
              Phone
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:border-[#2E7D55] focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-[#1E3A2F]">
              Preferred clinic
              <input
                value={preferredClinic}
                onChange={(e) => setPreferredClinic(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:border-[#2E7D55] focus:outline-none"
              />
            </label>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              type="submit"
              className="rounded-xl bg-[#1E3A2F] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2E7D55]"
            >
              Save Changes
            </button>
            {profileSaved && <span className="text-sm font-medium text-[#2E7D55]">Profile saved.</span>}
          </div>
        </form>

        <form
          onSubmit={handleBookAppointment}
          className="rounded-3xl border border-[#8FD4A8]/40 bg-white p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2E7D55]">Appointments</p>
              <h2 className="mt-1 text-2xl font-bold text-[#1E3A2F]">Book With A Doctor</h2>
            </div>
            <span className="rounded-full border border-[#8FD4A8] bg-[#F2F7F4] px-3 py-1 text-xs font-semibold text-[#2E7D55]">
              {monthLabel}
            </span>
          </div>

          <div className="mb-4 rounded-2xl border border-gray-100 p-3">
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  setDisplayMonth(
                    (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
                  )
                }
                className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Prev
              </button>
              <p className="text-sm font-semibold text-[#1E3A2F]">{monthLabel}</p>
              <button
                type="button"
                onClick={() =>
                  setDisplayMonth(
                    (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
                  )
                }
                className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Next
              </button>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {monthCells.map((cell, index) => {
                if (!cell) {
                  return <span key={`empty-${index}`} className="h-9" />;
                }

                const isSelected = selectedDate === cell.key;
                const hasAppointment = appointmentDates.has(cell.key);

                return (
                  <button
                    key={cell.key}
                    type="button"
                    onClick={() => setSelectedDate(cell.key)}
                    className={`relative h-9 rounded-lg text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-[#1E3A2F] text-white'
                        : 'text-[#1E3A2F] hover:bg-[#F2F7F4]'
                    }`}
                  >
                    {cell.day}
                    {hasAppointment && (
                      <span
                        className={`absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${
                          isSelected ? 'bg-[#D4A843]' : 'bg-[#2E7D55]'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-medium text-[#1E3A2F]">
              Selected date
              <input
                type="text"
                value={toReadableDate(selectedDate)}
                readOnly
                className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-600"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-[#1E3A2F]">
              Time slot
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:border-[#2E7D55] focus:outline-none"
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-[#1E3A2F] sm:col-span-2">
              Doctor
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:border-[#2E7D55] focus:outline-none"
              >
                {doctorOptions.map((doctor) => (
                  <option key={doctor} value={doctor}>
                    {doctor}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-[#1E3A2F] sm:col-span-2">
              Reason for visit
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-20 rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:border-[#2E7D55] focus:outline-none"
              />
            </label>

            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <button
                type="button"
                onClick={() => setVisitType('virtual')}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  visitType === 'virtual'
                    ? 'bg-[#1E3A2F] text-white'
                    : 'bg-[#F2F7F4] text-[#2E7D55] hover:bg-[#E5F2EA]'
                }`}
              >
                Virtual
              </button>
              <button
                type="button"
                onClick={() => setVisitType('in-person')}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  visitType === 'in-person'
                    ? 'bg-[#1E3A2F] text-white'
                    : 'bg-[#F2F7F4] text-[#2E7D55] hover:bg-[#E5F2EA]'
                }`}
              >
                In-person
              </button>
            </div>

            <label className="sm:col-span-2 flex items-center gap-2 rounded-xl border border-[#D4A843]/40 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <input
                type="checkbox"
                checked={concerningResults}
                onChange={(e) => setConcerningResults(e.target.checked)}
                className="h-4 w-4 rounded border-amber-300"
              />
              My latest lab results look concerning and need quicker review.
            </label>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              className="rounded-xl bg-[#1E3A2F] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2E7D55]"
            >
              Schedule Appointment
            </button>
            {appointmentNotice && <span className="text-sm font-medium text-[#2E7D55]">{appointmentNotice}</span>}
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-[#8FD4A8]/40 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-bold text-[#1E3A2F]">Upcoming Appointments</h3>
        <p className="mt-1 text-sm text-gray-500">
          Keep track of consultations booked from your profile.
        </p>

        <div className="mt-4 grid gap-3">
          {upcomingAppointments.length === 0 ? (
            <p className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
              No appointments scheduled yet.
            </p>
          ) : (
            upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="rounded-xl border border-gray-100 bg-[#FDFEFD] px-4 py-3 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="text-sm font-semibold text-[#1E3A2F]">{toReadableDate(appointment.date)}</p>
                  <span className="text-xs text-gray-400">•</span>
                  <p className="text-sm font-semibold text-[#2E7D55]">{appointment.time}</p>
                  <span className="text-xs text-gray-400">•</span>
                  <p className="text-sm text-gray-600">{appointment.doctor}</p>
                </div>
                <p className="mt-1 text-sm text-gray-500">{appointment.reason}</p>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="rounded-full border border-[#8FD4A8] bg-[#F2F7F4] px-2 py-0.5 font-semibold text-[#2E7D55]">
                    {appointment.visitType === 'virtual' ? 'Virtual' : 'In-person'}
                  </span>
                  {appointment.concerningResults && (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 font-semibold text-amber-700">
                      Concerning results follow-up
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;