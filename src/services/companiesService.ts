import { createClient } from "@/lib/supabase/server";
import type {
  ApplicantSummary,
  ApplicationSummary,
  CompanySummary,
  JobListing,
  JobWithApplicants,
  MatchingRequestSummary,
} from "@/types/domain";

// Same flat-queries-plus-in-memory-joins approach as postsService — our
// hand-authored Database type has no FK relationship metadata for
// PostgREST's embedded-select syntax to use.

export async function getMyCompany(userId: string): Promise<CompanySummary | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .select("id, owner_id, name, description, website, created_at")
    .eq("owner_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    ownerId: data.owner_id,
    name: data.name,
    description: data.description,
    website: data.website,
    createdAt: data.created_at,
  };
}

export async function getOpenJobs(userId: string | null): Promise<JobListing[]> {
  const supabase = await createClient();
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, company_id, title, description, location, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (jobs.length === 0) return [];

  const companyIds = Array.from(new Set(jobs.map((j) => j.company_id)));
  const [{ data: companies }, { data: myApplications }] = await Promise.all([
    supabase.from("companies").select("id, name").in("id", companyIds),
    userId
      ? supabase.from("applications").select("job_id").eq("student_id", userId)
      : Promise.resolve({ data: [] as { job_id: string }[] }),
  ]);

  const companyNameById = new Map((companies ?? []).map((c) => [c.id, c.name]));
  const appliedJobIds = new Set((myApplications ?? []).map((a) => a.job_id));

  return jobs.map((job) => ({
    id: job.id,
    companyId: job.company_id,
    companyName: companyNameById.get(job.company_id) ?? "Unknown company",
    title: job.title,
    description: job.description,
    location: job.location,
    createdAt: job.created_at,
    alreadyApplied: appliedJobIds.has(job.id),
  }));
}

export async function getMyJobsWithApplicants(companyId: string): Promise<JobWithApplicants[]> {
  const supabase = await createClient();
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, title, description, location, created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (jobs.length === 0) return [];

  const jobIds = jobs.map((j) => j.id);
  const { data: applications } = await supabase
    .from("applications")
    .select("id, job_id, student_id, status, created_at")
    .in("job_id", jobIds);

  if (!applications || applications.length === 0) {
    return jobs.map((job) => ({ ...toJobShape(job), applicants: [] }));
  }

  const studentIds = Array.from(new Set(applications.map((a) => a.student_id)));
  const [{ data: profiles }, { data: matchingRequests }] = await Promise.all([
    supabase.from("profiles").select("id, display_name, anonymous_alias").in("id", studentIds),
    supabase.from("matching_requests").select("student_id, status, identity_revealed").eq("company_id", companyId),
  ]);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const matchByStudent = new Map((matchingRequests ?? []).map((m) => [m.student_id, m]));

  const applicantsByJob = new Map<string, ApplicantSummary[]>();
  for (const app of applications) {
    const profile = profileById.get(app.student_id);
    const match = matchByStudent.get(app.student_id);
    const revealed = match?.identity_revealed ?? false;

    const applicant: ApplicantSummary = {
      applicationId: app.id,
      studentId: app.student_id,
      label: revealed ? (profile?.display_name ?? "Unknown") : (profile?.anonymous_alias ?? "Anonymous"),
      identityRevealed: revealed,
      status: app.status,
      appliedAt: app.created_at,
      revealStatus: match?.status ?? null,
    };

    const list = applicantsByJob.get(app.job_id) ?? [];
    list.push(applicant);
    applicantsByJob.set(app.job_id, list);
  }

  return jobs.map((job) => ({ ...toJobShape(job), applicants: applicantsByJob.get(job.id) ?? [] }));
}

function toJobShape(job: { id: string; title: string; description: string | null; location: string | null; created_at: string }) {
  return { id: job.id, title: job.title, description: job.description, location: job.location, createdAt: job.created_at };
}

export async function getMyApplications(userId: string): Promise<ApplicationSummary[]> {
  const supabase = await createClient();
  const { data: applications, error } = await supabase
    .from("applications")
    .select("id, job_id, status, created_at")
    .eq("student_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (applications.length === 0) return [];

  const jobIds = Array.from(new Set(applications.map((a) => a.job_id)));
  const { data: jobs } = await supabase.from("jobs").select("id, title, company_id").in("id", jobIds);

  const companyIds = Array.from(new Set((jobs ?? []).map((j) => j.company_id)));
  const { data: companies } = await supabase.from("companies").select("id, name").in("id", companyIds);

  const jobById = new Map((jobs ?? []).map((j) => [j.id, j]));
  const companyNameById = new Map((companies ?? []).map((c) => [c.id, c.name]));

  return applications.map((app) => {
    const job = jobById.get(app.job_id);
    return {
      id: app.id,
      jobId: app.job_id,
      jobTitle: job?.title ?? "Unknown role",
      companyId: job?.company_id ?? "",
      companyName: job ? (companyNameById.get(job.company_id) ?? "Unknown company") : "Unknown company",
      status: app.status,
      createdAt: app.created_at,
    };
  });
}

export async function getMyMatchingRequests(userId: string): Promise<MatchingRequestSummary[]> {
  const supabase = await createClient();
  const { data: requests, error } = await supabase
    .from("matching_requests")
    .select("company_id, status, created_at")
    .eq("student_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (requests.length === 0) return [];

  const companyIds = Array.from(new Set(requests.map((r) => r.company_id)));
  const { data: companies } = await supabase.from("companies").select("id, name").in("id", companyIds);
  const companyNameById = new Map((companies ?? []).map((c) => [c.id, c.name]));

  return requests.map((r) => ({
    companyId: r.company_id,
    companyName: companyNameById.get(r.company_id) ?? "Unknown company",
    status: r.status,
    createdAt: r.created_at,
  }));
}
