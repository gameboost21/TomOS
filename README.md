Welcome to TomOS, a all-in-one (or rather 3-1) Tool for Finance, Task and Knowledge management.

The application was designed to be deployed in docker / kuberenetes.

Currently, only the Task-Section of the Tool was developed, but Knowledge and Finance will follow as soon as I finished building th Tasks-Section.

Following is a short overview of the IS-State:
Current State: ✅ Core Task CRUD (except delete)
-----------------------------------------------
[ FRONTEND ]
TaskPage.jsx
 ├─ Active tasks (done = false)
 ├─ Completed tasks (done = true)
 └─ Create Task Form (POST)

[ BACKEND ]
Task API
 ├─ GET /tasks
 ├─ POST /tasks (create)
 ├─ PUT /tasks/{id} (update done, urgent, etc.)
 └─ No DELETE yet

 Now following what will be implemented soon...
 1. Soft Delete 🟢
   ├─ Backend: Add `is_deleted` / `deleted_at` flag
   ├─ DELETE endpoint → flip flag
   └─ Frontend: hide soft-deleted tasks

2. Delete Button in TaskCard 🟢
   ├─ Calls DELETE endpoint
   └─ Optional confirmation modal

3. Idempotent Task Creation 🟢
   ├─ Backend: optional `idempotency_key`
   └─ Frontend: generate key per form submission

4. Idempotent Updates 🔵
   └─ Optional, but keeps PUT operations safe on retry
  
5.  Authentication & Authorization 🟠
   ├─ Backend: JWT or session-based auth
   │    └─ Protect /tasks POST, PUT, DELETE endpoints
   ├─ Frontend:
   │    ├─ Login / Logout page
   │    └─ Restrict TaskPage rendering to authenticated users
   ├─ TaskForm
   │    └─ Only allow authenticated users to create tasks
   └─ Optional: role-based access (e.g., "admin", "user")
