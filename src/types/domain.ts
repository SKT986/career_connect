import type {
  AiFunctionType,
  ApplicationStatus,
  InterviewDifficulty,
  InterviewMode,
  MatchingStatus,
  NotificationType,
  PostCategory,
  ResumeLanguage,
  UserRole,
} from "@/types/database.types";

export interface FeedPost {
  id: string;
  category: PostCategory;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  isAnonymous: boolean;
  authorId: string;
  authorLabel: string;
  authorAvatarUrl: string | null;
  likeCount: number;
  commentCount: number;
  likedByViewer: boolean;
  bookmarkedByViewer: boolean;
}

export interface FeedComment {
  id: string;
  postId: string;
  content: string;
  createdAt: string;
  authorId: string;
  authorLabel: string;
  isMentor: boolean;
}

export interface MentorProfileSummary {
  profileId: string;
  displayName: string;
  headline: string | null;
  badges: string[];
  isVerified: boolean;
}

export interface AmaSession {
  id: string;
  mentorId: string;
  mentorName: string;
  title: string;
  description: string | null;
  scheduledAt: string;
}

export interface InterviewAnswerScore {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface InterviewSessionSummary {
  id: string;
  mode: InterviewMode;
  difficulty: InterviewDifficulty;
  questions: string[];
  createdAt: string;
  averageScore: number | null;
}

export interface AdminOverviewStats {
  totalUsers: number;
  newUsersLast7Days: number;
  totalPosts: number;
  totalComments: number;
  verifiedMentors: number;
  pendingMentorVerifications: number;
}

export interface DailyActivityPoint {
  date: string;
  activeUsers: number;
  posts: number;
  comments: number;
}

export interface CategoryBreakdownPoint {
  category: PostCategory;
  count: number;
}

export interface PendingMentorProfile {
  profileId: string;
  displayName: string;
  universityEmail: string | null;
  headline: string | null;
  createdAt: string;
}

export interface PromotableStudent {
  profileId: string;
  displayName: string;
  universityEmail: string | null;
}

export interface ResumeVersionSummary {
  id: string;
  title: string;
  language: ResumeLanguage;
  createdAt: string;
}

export interface AiUsageStats {
  totalMessages: number;
  byFunctionType: { functionType: AiFunctionType; count: number }[];
  lastUsedAt: string | null;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  payload: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

export interface CompanySummary {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  website: string | null;
  createdAt: string;
}

export interface JobListing {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  description: string | null;
  location: string | null;
  createdAt: string;
  alreadyApplied: boolean;
}

export interface ApplicantSummary {
  applicationId: string;
  studentId: string;
  label: string;
  identityRevealed: boolean;
  status: ApplicationStatus;
  appliedAt: string;
  revealStatus: MatchingStatus | null;
}

export interface JobWithApplicants {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  createdAt: string;
  applicants: ApplicantSummary[];
}

export interface ApplicationSummary {
  id: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  status: ApplicationStatus;
  createdAt: string;
}

export interface MatchingRequestSummary {
  companyId: string;
  companyName: string;
  status: MatchingStatus;
  createdAt: string;
}

export interface ProfileSummary {
  id: string;
  role: UserRole;
  displayName: string;
  universityEmail: string | null;
  avatarUrl: string | null;
  bio: string | null;
  defaultAnonymous: boolean;
  notificationsEnabled: boolean;
  createdAt: string;
}
