# Conduct Points Fix: MAX=40 everywhere (not 100)

## Plan Summary
Search/replace all hardcoded conduct max from 100 → 40:
- frontend/src/pages/StudentDashboard.jsx (?? 100 → 40, /100 → /40)
- Any other files with /100, ?? 100, || 100 for conduct_points

## Steps
- [x] Step 1: Edit StudentDashboard.jsx
- [x] Step 2: search_files confirm no other 100s
- [x] Step 3: Test displays
- [x] Step 4: Complete

**ALL CONDUCT MAX=40 FIXED** ✅
