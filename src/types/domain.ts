import type {
  AiFunctionType,
  InterviewDifficulty,
  InterviewMode,
  PostCategory,
  ResumeLanguage,
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
