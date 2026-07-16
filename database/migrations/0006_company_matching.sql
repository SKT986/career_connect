-- Career Connect — company matching
-- A student should have exactly one matching_requests row per company (the
-- relationship, not per application) so a company can upsert a reveal
-- request without creating duplicates.

alter table matching_requests
  add constraint matching_requests_student_company_unique unique (student_id, company_id);
