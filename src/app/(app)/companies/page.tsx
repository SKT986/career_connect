import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CompanySetupForm } from "@/components/companies/company-setup-form";
import { JobComposer } from "@/components/companies/job-composer";
import { MyJobsList } from "@/components/companies/my-jobs-list";
import { JobCard } from "@/components/companies/job-card";
import { MyApplicationsList } from "@/components/companies/my-applications-list";
import {
  getMyApplications,
  getMyCompany,
  getMyJobsWithApplicants,
  getMyMatchingRequests,
  getOpenJobs,
} from "@/services/companiesService";

export default async function CompaniesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();

  if (profile?.role === "company") {
    const company = await getMyCompany(user.id);

    if (!company) {
      return (
        <div className="mx-auto max-w-3xl">
          <CompanySetupForm />
        </div>
      );
    }

    const jobs = await getMyJobsWithApplicants(company.id);

    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{company.name}</h1>
            <p className="text-sm text-muted-foreground">Manage your job postings and applicants.</p>
          </div>
          <JobComposer />
        </div>
        <MyJobsList jobs={jobs} />
      </div>
    );
  }

  const [jobs, applications, matchingRequests] = await Promise.all([
    getOpenJobs(user.id),
    getMyApplications(user.id),
    getMyMatchingRequests(user.id),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Companies</h1>
        <p className="text-sm text-muted-foreground">
          Apply anonymously. Companies only see your identity if you choose to reveal it.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground">Open roles</h2>
        {jobs.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            No roles posted yet — check back soon.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground">My applications</h2>
        <MyApplicationsList applications={applications} matchingRequests={matchingRequests} />
      </section>
    </div>
  );
}
