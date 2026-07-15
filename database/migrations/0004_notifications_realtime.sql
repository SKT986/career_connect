-- Career Connect — notifications realtime
-- Adds the notifications table to the supabase_realtime publication so the
-- browser client can subscribe to postgres_changes (new notifications and
-- read-state updates) for the notification bell and /notifications page.

alter publication supabase_realtime add table notifications;
