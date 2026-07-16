"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createCompanyInvitationNotification } from "@/services/notificationsService";

export interface CompanyActionState {
  error?: string;
  success?: boolean;
}

const MAX_NAME_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_TITLE_LENGTH = 120;
const MAX_LOCATION_LENGTH = 120;

async function requireCompany(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." as const };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "company") return { error: "Only company accounts can do this." as const };

  return { userId: user.id };
}

export async function createCompanyAction(
  _prev: CompanyActionState,
  formData: FormData
): Promise<CompanyActionState> {
  const supabase = await createClient();
  const check = await requireCompany(supabase);
  if ("error" in check) return { error: check.error };

  const { data: existing } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", check.userId)
    .maybeSingle();
  if (existing) return { error: "You've already set up a company." };

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();

  if (!name) return { error: "Add your company name." };
  if (name.length > MAX_NAME_LENGTH) return { error: `Name must be under ${MAX_NAME_LENGTH} characters.` };
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return { error: `Description must be under ${MAX_DESCRIPTION_LENGTH} characters.` };
  }

  const { error } = await supabase.from("companies").insert({
    owner_id: check.userId,
    name,
    description: description || null,
    website: website || null,
  });

  if (error) return { error: "Something went wrong setting up your company." };

  revalidatePath("/companies");
  return { success: true };
}

export async function createJobAction(_prev: CompanyActionState, formData: FormData): Promise<CompanyActionState> {
  const supabase = await createClient();
  const check = await requireCompany(supabase);
  if ("error" in check) return { error: check.error };

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", check.userId)
    .maybeSingle();
  if (!company) return { error: "Set up your company profile first." };

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();

  if (!title) return { error: "Give the role a title." };
  if (title.length > MAX_TITLE_LENGTH) return { error: `Title must be under ${MAX_TITLE_LENGTH} characters.` };
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return { error: `Description must be under ${MAX_DESCRIPTION_LENGTH} characters.` };
  }
  if (location.length > MAX_LOCATION_LENGTH) {
    return { error: `Location must be under ${MAX_LOCATION_LENGTH} characters.` };
  }

  const { error } = await supabase.from("jobs").insert({
    company_id: company.id,
    title,
    description: description || null,
    location: location || null,
  });

  if (error) return { error: "Something went wrong posting the role." };

  revalidatePath("/companies");
  return { success: true };
}

export async function applyToJobAction(jobId: string): Promise<CompanyActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("job_id", jobId)
    .eq("student_id", user.id)
    .maybeSingle();
  if (existing) return { error: "You've already applied to this role." };

  const { error } = await supabase.from("applications").insert({ job_id: jobId, student_id: user.id });
  if (error) return { error: "Something went wrong applying. Please try again." };

  revalidatePath("/companies");
  return { success: true };
}

export async function requestRevealAction(studentId: string): Promise<CompanyActionState> {
  const supabase = await createClient();
  const check = await requireCompany(supabase);
  if ("error" in check) return { error: check.error };

  const { data: company } = await supabase
    .from("companies")
    .select("id, name")
    .eq("owner_id", check.userId)
    .maybeSingle();
  if (!company) return { error: "Set up your company profile first." };

  const { data: existing } = await supabase
    .from("matching_requests")
    .select("id")
    .eq("student_id", studentId)
    .eq("company_id", company.id)
    .maybeSingle();
  if (existing) return { error: "You've already sent a reveal request to this student." };

  const { error } = await supabase
    .from("matching_requests")
    .insert({ student_id: studentId, company_id: company.id, status: "pending" });

  if (error) return { error: "Something went wrong sending the reveal request." };

  await createCompanyInvitationNotification({ studentId, companyName: company.name });

  revalidatePath("/companies");
  return { success: true };
}

export async function respondToRevealAction(
  companyId: string,
  accept: boolean
): Promise<CompanyActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { error } = await supabase
    .from("matching_requests")
    .update({ status: accept ? "accepted" : "declined", identity_revealed: accept })
    .eq("student_id", user.id)
    .eq("company_id", companyId);

  if (error) return { error: "Something went wrong responding to that request." };

  revalidatePath("/companies");
  return { success: true };
}
