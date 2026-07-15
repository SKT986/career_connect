import Link from "next/link";
import { GraduationCap, ArrowRight } from "lucide-react";
import { getVerifiedMentors, getUpcomingAmaSessions, getMyMentorProfile, getCurrentUserRole } from "@/services/mentorService";
import { getMentorPosts } from "@/services/postsService";
import { MentorCard } from "@/components/mentors/mentor-card";
import { AmaSessionCard } from "@/components/mentors/ama-session-card";
import { MentorProfileSetup } from "@/components/mentors/mentor-profile-setup";
import { HostAmaDialog } from "@/components/mentors/host-ama-dialog";
import { PostCard } from "@/components/feed/post-card";
import { Button } from "@/components/ui/button";

export default async function MentorsPage() {
  const [mentors, sessions, myMentorProfile, role, mentorPosts] = await Promise.all([
    getVerifiedMentors(),
    getUpcomingAmaSessions(),
    getMyMentorProfile(),
    getCurrentUserRole(),
    getMentorPosts(),
  ]);

  const isMentor = role === "mentor";

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mentor Community</h1>
          <p className="text-sm text-muted-foreground">
            Verified mentors sharing guidance, hosting AMAs, and replying to the community.
          </p>
        </div>
        {isMentor && <HostAmaDialog />}
      </div>

      {isMentor && <MentorProfileSetup mentorProfile={myMentorProfile} />}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground">Upcoming AMA sessions</h2>
        {sessions.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            No AMAs scheduled yet. Check back soon.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {sessions.map((session) => (
              <AmaSessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground">Verified mentors</h2>
        {mentors.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            Mentors will appear here once they&apos;re verified.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {mentors.map((mentor) => (
              <MentorCard key={mentor.profileId} mentor={mentor} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-muted-foreground">Success stories &amp; guidance</h2>
          <Button asChild variant="ghost" size="sm" className="gap-1 rounded-full text-muted-foreground">
            <Link href="/feed">
              View in community <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        {mentorPosts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border py-12 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <GraduationCap className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-sm text-muted-foreground">
              Mentor posts show up here — post to the community feed with &quot;Post anonymously&quot; turned off.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {mentorPosts.map((post) => (
              <li key={post.id}>
                <PostCard post={post} href={`/feed/${post.id}`} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
