# Email Reminders Documentation

## Parallel Development Evidence

This feature was developed in parallel with the health visualization feature.

### Development Timeline

- Base commit: 2bc3db1 (shared with feat/health-visualization)
- Worktree: Bloom-email-reminders/
- Parallel branch: feat/health-visualization

### API Endpoints

- POST /api/reminders - Schedule reminders
- DELETE /api/reminders - Cancel reminders
- POST /api/reminders/trigger - Trigger due reminders

### Edge Function

- send-email-reminder - Deployed to Supabase
