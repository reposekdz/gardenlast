#!/bin/bash
# Student Portal Implementation - Validation Script
# This script validates all changes made for the student portal implementation

echo "=========================================="
echo "Student Portal Implementation Validation"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PASS=0
FAIL=0

# Function to check file content
check_content() {
    local file="$1"
    local pattern="$2"
    local desc="$3"
    
    if grep -q "$pattern" "$file" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $desc"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $desc"
        ((FAIL++))
    fi
}

# Function to check file exists
check_file() {
    local file="$1"
    local desc="$2"
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $desc ($file)"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $desc ($file)"
        ((FAIL++))
    fi
}

echo "Checking modified files..."
echo "------------------------------------------"

# 1. Check studentAuthRoutes.js
check_content "backend/routes/studentAuthRoutes.js" "return '123456'" "Default password is 123456"
check_content "backend/routes/studentAuthRoutes.js" "computeDefaultPassword" "computeDefaultPassword function exists"
check_content "backend/routes/studentAuthRoutes.js" "module.exports.computeDefaultPassword" "computeDefaultPassword exported"

echo ""
echo "Checking applicationController.js..."
echo "------------------------------------------"

# 2. Check applicationController.js
check_content "backend/controllers/applicationController.js" "defaultPassword = '123456'" "Enrollment uses 123456 as default"
check_content "backend/controllers/applicationController.js" "must_change_password = 1" "Enrollment sets must_change_password"
check_content "backend/controllers/applicationController.js" "password_hash" "Enrollment sets password_hash"

echo ""
echo "Checking studentController.js..."
echo "------------------------------------------"

# 3. Check studentController.js
check_content "backend/controllers/studentController.js" "Ijambobanga: 123456" "SMS mentions 123456"
check_content "backend/controllers/studentController.js" "computeDefaultPassword" "Uses computeDefaultPassword"
check_content "backend/controllers/studentController.js" "password_hash" "Sets password_hash"

echo ""
echo "Checking local_setup.js..."
echo "------------------------------------------"

# 4. Check local_setup.js schema
check_file "backend/scripts/local_setup.js" "Local setup script exists"
check_content "backend/scripts/local_setup.js" "password_hash VARCHAR(255)" "Schema includes password_hash"
check_content "backend/scripts/local_setup.js" "must_change_password TINYINT" "Schema includes must_change_password"
check_content "backend/scripts/local_setup.js" "default_password_hint VARCHAR" "Schema includes default_password_hint"
check_content "backend/scripts/local_setup.js" "'123456'" "Seed data uses 123456"
check_content "backend/scripts/local_setup.js" "bcrypt.hashSync('123456'" "Seed hashes 123456"

echo ""
echo "Checking frontend files (should exist, unchanged)..."
echo "------------------------------------------"

# 5. Check frontend exists and is functional
check_file "frontend/src/pages/StudentDashboard.jsx" "Student Dashboard exists"
check_content "frontend/src/pages/StudentDashboard.jsx" "change-password" "Has password change form"
check_content "frontend/src/pages/StudentDashboard.jsx" "current_password" "Requires current password"
check_content "frontend/src/pages/StudentDashboard.jsx" "must_change_password" "Checks must_change_password"

check_file "frontend/src/layouts/StudentLayout.jsx" "Student Layout exists"
check_file "frontend/src/App.jsx" "App.jsx exists"

check_content "frontend/src/App.jsx" "/student-dashboard" "Student dashboard route configured"

echo ""
echo "=========================================="
echo "Validation Results"
echo "=========================================="
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}All checks passed!${NC}"
    echo ""
    echo "Summary of Changes:"
    echo "  1. backend/routes/studentAuthRoutes.js"
    echo "     - Default password: 123456"
    echo ""
    echo "  2. backend/controllers/applicationController.js"
    echo "     - Enrollment sets password hash"
    echo ""
    echo "  3. backend/controllers/studentController.js"
    echo "     - SMS reflects 123456 default"
    echo ""
    echo "  4. backend/scripts/local_setup.js"
    echo "     - Schema includes password columns"
    echo "     - Seed data hashed with 123456"
    echo ""
    echo "  5. Frontend (unchanged, already working)"
    echo "     - StudentDashboard.jsx: Full portal UI"
    echo "     - StudentLayout.jsx: Navigation"
    echo "     - App.jsx: Routes configured"
    echo ""
    exit 0
else
    echo -e "${RED}Some checks failed!${NC}"
    exit 1
fi
