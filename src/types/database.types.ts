// Hand-written to match database/migrations/0001_init.sql + 0002_rls.sql.
// Once the migrations are applied to a live Supabase project, regenerate
// with `supabase gen types typescript --linked > src/types/database.types.ts`
// and reconcile any drift with this file.
//
// NOTE: Row/Insert/Update must be `type` object literals, not `interface`s —
// postgrest-js's select-string type parser silently resolves to `never` for
// named interfaces (a known quirk), which is why every shape below is a type alias.

export type UserRole = "student" | "mentor" | "company" | "admin";

export type PostCategory =
  | "job_hunting"
  | "interview"
  | "resume"
  | "mental_health"
  | "disability_support"
  | "international_students"
  | "lgbtq"
  | "workplace"
  | "other";

export type NotificationType =
  | "reply"
  | "mentor_comment"
  | "interview_completed"
  | "company_invitation"
  | "system";

export type ApplicationStatus = "submitted" | "reviewing" | "interview" | "offer" | "rejected" | "withdrawn";
export type MatchingStatus = "pending" | "accepted" | "declined" | "revealed";
export type InterviewMode = "text" | "voice";
export type InterviewDifficulty = "easy" | "medium" | "hard";
export type ResumeLanguage = "en" | "ja";
export type AiFunctionType =
  | "resume_feedback"
  | "interview_practice"
  | "career_advice"
  | "job_recommendation"
  | "strength_analysis"
  | "weakness_analysis"
  | "star_answer"
  | "cover_letter";

// Row/Insert/Update triple with sensible shared defaults so tables don't
// each hand-roll boilerplate for auto-generated columns.
type Table<Row, DefaultedOnInsert extends keyof Row> = {
  Row: Row;
  Insert: Omit<Row, DefaultedOnInsert> & Partial<Pick<Row, DefaultedOnInsert>>;
  Update: Partial<Row>;
  Relationships: [];
};

export type ProfileRow = {
  id: string;
  role: UserRole;
  display_name: string;
  anonymous_alias: string;
  university_email: string | null;
  avatar_url: string | null;
  bio: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AccessibilityPreferencesRow = {
  profile_id: string;
  dark_mode: boolean;
  font_scale: number;
  high_contrast: boolean;
  language: string;
  screen_reader_optimized: boolean;
  updated_at: string;
};

export type PostRow = {
  id: string;
  author_id: string;
  is_anonymous: boolean;
  category: PostCategory;
  content: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type CommentRow = {
  id: string;
  post_id: string;
  author_id: string;
  is_anonymous: boolean;
  content: string;
  created_at: string;
};

export type LikeRow = {
  post_id: string;
  user_id: string;
  created_at: string;
};

export type BookmarkRow = {
  post_id: string;
  user_id: string;
  created_at: string;
};

export type MentorProfileRow = {
  profile_id: string;
  headline: string | null;
  badges: string[];
  is_verified: boolean;
  created_at: string;
};

export type MentorSessionRow = {
  id: string;
  mentor_id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  created_at: string;
};

export type MessageRow = {
  id: string;
  sender_id: string;
  receiver_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export type NotificationRow = {
  id: string;
  user_id: string;
  type: NotificationType;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};

export type CompanyRow = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  website: string | null;
  created_at: string;
};

export type JobRow = {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  location: string | null;
  created_at: string;
};

export type ApplicationRow = {
  id: string;
  job_id: string;
  student_id: string;
  status: ApplicationStatus;
  created_at: string;
};

export type MatchingRequestRow = {
  id: string;
  student_id: string;
  company_id: string;
  status: MatchingStatus;
  identity_revealed: boolean;
  created_at: string;
};

export type ResumeVersionRow = {
  id: string;
  student_id: string;
  title: string;
  content: string;
  language: ResumeLanguage;
  created_at: string;
};

export type InterviewSessionRow = {
  id: string;
  student_id: string;
  mode: InterviewMode;
  difficulty: InterviewDifficulty;
  questions: unknown[];
  scores: Record<string, unknown>;
  created_at: string;
};

export type AiChatHistoryRow = {
  id: string;
  user_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  function_type: AiFunctionType | null;
  language: string;
  created_at: string;
};

export type SettingsRow = {
  key: string;
  value: unknown;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow, "created_at" | "updated_at" | "role" | "display_name" | "anonymous_alias">;
      accessibility_preferences: Table<AccessibilityPreferencesRow, "dark_mode" | "font_scale" | "high_contrast" | "language" | "screen_reader_optimized" | "updated_at">;
      posts: Table<PostRow, "id" | "created_at" | "updated_at" | "is_anonymous" | "category">;
      comments: Table<CommentRow, "id" | "created_at" | "is_anonymous">;
      likes: Table<LikeRow, "created_at">;
      bookmarks: Table<BookmarkRow, "created_at">;
      mentor_profiles: Table<MentorProfileRow, "badges" | "is_verified" | "created_at">;
      mentor_sessions: Table<MentorSessionRow, "id" | "created_at">;
      messages: Table<MessageRow, "id" | "read_at" | "created_at">;
      notifications: Table<NotificationRow, "id" | "read_at" | "created_at">;
      companies: Table<CompanyRow, "id" | "created_at">;
      jobs: Table<JobRow, "id" | "created_at">;
      applications: Table<ApplicationRow, "id" | "status" | "created_at">;
      matching_requests: Table<MatchingRequestRow, "id" | "status" | "identity_revealed" | "created_at">;
      resume_versions: Table<ResumeVersionRow, "id" | "created_at">;
      interview_sessions: Table<InterviewSessionRow, "id" | "questions" | "scores" | "created_at">;
      ai_chat_history: Table<AiChatHistoryRow, "id" | "created_at">;
      settings: Table<SettingsRow, "updated_at">;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      post_category: PostCategory;
      notification_type: NotificationType;
      application_status: ApplicationStatus;
      matching_status: MatchingStatus;
      interview_mode: InterviewMode;
      interview_difficulty: InterviewDifficulty;
      resume_language: ResumeLanguage;
      ai_function_type: AiFunctionType;
    };
    CompositeTypes: Record<string, never>;
  };
};
