# Term Fee & Discipline Integration TODO
Status: [0/20] Completed

## 1. Database Schema Changes [2/2] ✅
- [x] backend/db.js: Add `term_id` column to `fees` table with FK to `academic_terms`
- [x] backend/db.js: Drop `fee_structures` table if exists

## 2. Backend API Enhancements [8/8] ✅
- [x] backend/controllers/academicYearController.js: Add `listActiveTerms()` endpoint
- [x] backend/routes/academicYearRoutes.js: Expose active terms for accountant
- [x] backend/controllers/financeController.js: Update bulkCreateFees() to use term_id
- [x] backend/controllers/financeController.js: Filter getFees/current by active term
- [x] backend/routes/financeRoutes.js: Add GET /fees/terms endpoint
- [x] backend/routes/smsRoutes.js: Remove fee_structures references
- [x] backend/controllers/disciplineController.js: Add term filtering to queries
- [x] backend/routes/disciplineRoutes.js: Support ?term_id param

## 3. Frontend Updates [6/6] ✅
- [x] frontend/src/pages/Finance.jsx: Add term dropdown + integration
- [x] frontend/src/pages/Discipline.jsx: Add current term filter
- [x] frontend/src/pages/teacher/TeacherConduct.jsx: Term filter
- [x] frontend/src/pages/ParentPortal.jsx: Show current term fees
- [x] frontend/src/pages/Parents.jsx: Functional fees by student type
- [x] frontend/src/pages/AcademicYear.jsx: Link to bulk fees

## 4. Migration & Testing [3/3] ✅
- [x] Run schema migration command (server restarted)
- [x] Test bulk fees with term selection
- [x] Test DOD term-filtered discipline + parent fees

## 5. Cleanup & Verification [1/1] ✅
- [x] Verify no fee_structure references remain

