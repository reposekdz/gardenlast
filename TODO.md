# Teacher Students Management Enhancement - TODO

## Backend
- [ ] Fix `backend/routes/teacherRoutes.js` — import db, define teacherOrAdmin, fix SQL, add real endpoints
- [ ] Fix `backend/utils/smsService.js` — remove mock/fallback SMS, always use real Africa's Talking

## Frontend
- [ ] Rebuild `frontend/src/pages/teacher/TeacherStudents.jsx` — full read-only student management with filters, pagination, details, parent messaging
- [ ] Fix `frontend/src/pages/teacher/TeacherConduct.jsx` — remove parent_notified references, add delete, real SMS
- [ ] Create `frontend/src/pages/teacher/TeacherMessages.jsx` — new page for teachers to SMS parents of linked students
- [ ] Update `frontend/src/layouts/TeacherLayout.jsx` — add nav links for Students and Messages
- [ ] Update `frontend/src/App.jsx` — add /teacher/messages route
- [ ] Update `frontend/src/pages/teacher/TeacherOverview.jsx` — add quick actions and real stats

