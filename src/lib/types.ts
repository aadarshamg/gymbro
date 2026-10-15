export interface Gym {
  id: string;
  name: string;
  address: string | null;
  timings: string | null;
  checkinToken: string;
  subscriptionTier: "BASIC" | "PRO";
  subscriptionStatus: "TRIAL" | "ACTIVE" | "PAUSED";
  trialEndsAt: string | null;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  features: Record<string, unknown>;
}

export interface MemberUser {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
}

export interface Trainer {
  id: string;
  name: string;
  phone: string | null;
  specialty: string | null;
  _count?: { members: number };
}

export interface Member {
  id: string;
  gymId: string;
  userId: string;
  planId: string | null;
  trainerId: string | null;
  joiningDate: string;
  status: "ACTIVE" | "EXPIRED";
  user: MemberUser;
  plan: Plan | null;
  trainer: Trainer | null;
}

export interface Exercise {
  name: string;
  sets?: string;
  reps?: string;
  notes?: string;
}

export interface WorkoutDay {
  day: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  id: string;
  memberId: string;
  title: string;
  days: WorkoutDay[];
}

export interface ClassSession {
  id: string;
  title: string;
  description: string | null;
  trainerId: string | null;
  trainer: Trainer | null;
  startsAt: string;
  durationMins: number;
  capacity: number;
  _count?: { bookings: number };
}

export interface ClassBooking {
  id: string;
  createdAt: string;
  member: Member;
}

export interface SupportMessage {
  id: string;
  fromRole: "OWNER" | "MEMBER";
  body: string;
  createdAt: string;
}

export interface SupportThread {
  id: string;
  subject: string;
  status: "OPEN" | "RESOLVED";
  createdAt: string;
  updatedAt: string;
  member?: Member;
  messages: SupportMessage[];
}

export interface Payment {
  id: string;
  memberId: string;
  planId: string | null;
  amount: number;
  status: "PAID" | "PENDING";
  paidOn: string;
  member?: Member;
  plan?: Plan | null;
}

export interface Attendance {
  id: string;
  memberId: string;
  checkedInAt: string;
  method: "QR" | "MANUAL";
  member?: Member;
}

export interface Overview {
  activeMembers: number;
  todaysCheckins: number;
  monthlyRevenue: number;
  expiringSoon: { memberId: string; name: string | null }[];
}

export interface RevenueReport {
  range: "monthly" | "yearly";
  points: { period: string; total: number }[];
}

export interface MemberGrowthReport {
  points: { period: string; count: number }[];
}

export interface RetentionReport {
  withAnyPayment: number;
  renewed: number;
  rate: number;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}
