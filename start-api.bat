@echo off
set DATABASE_URL=postgresql://postgres:sa@localhost:5432/GamInfluencer
set SESSION_SECRET=gambiainfluencers-secret-key-2026
set ADMIN_PASSWORD=Admin@GamInfluencer
set PORT=8080
pnpm --filter @workspace/api-server run dev