@echo off
set DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/YOUR_DB_NAME
set SESSION_SECRET=any-long-random-string-you-make-up
set ADMIN_PASSWORD=your-chosen-admin-password
set PORT=8080
pnpm --filter @workspace/api-server run dev