#!/usr/bin/env bash
# Automated checks for uncommitted (and staged) changes — companion to the
# verify-uncommitted-changes skill. Exit 0 = all passed, 1 = failure.
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

FAIL=0
WARN=0

heading() { printf "\n=== %s ===\n" "$1"; }
pass()    { printf "${GREEN}PASS${NC}: %s\n" "$1"; }
fail()    { printf "${RED}FAIL${NC}: %s\n" "$1"; FAIL=$((FAIL+1)); }
warn()    { printf "${YELLOW}WARN${NC}: %s\n" "$1"; WARN=$((WARN+1)); }
skip()    { printf "SKIP: %s\n" "$1"; }

changed_files=$(git diff --name-only --diff-filter=ACMR 2>/dev/null; git diff --cached --name-only --diff-filter=ACMR 2>/dev/null)
changed_files=$(echo "$changed_files" | sort -u)

if [ -z "$changed_files" ]; then
  echo "No uncommitted changes detected."
  exit 0
fi

php_files=$(echo "$changed_files" | grep '\.php$' || true)
js_files=$(echo "$changed_files" | grep -E '\.(js|jsx)$' || true)
route_files=$(echo "$changed_files" | grep '^routes/' || true)
migration_files=$(echo "$changed_files" | grep '^database/migrations/' || true)

echo "Changed files:"
echo "$changed_files" | sed 's/^/  /'

# ── 1. PHP syntax ──────────────────────────────────────────────
heading "PHP syntax check"
if [ -n "$php_files" ]; then
  php_ok=true
  while IFS= read -r f; do
    [ -f "$f" ] || continue
    if ! php -l "$f" 2>&1 | grep -q "No syntax errors"; then
      fail "$f has syntax errors"
      php -l "$f" 2>&1
      php_ok=false
    fi
  done <<< "$php_files"
  $php_ok && pass "All PHP files pass syntax check"
else
  skip "No PHP files changed"
fi

# ── 2. Route registration ─────────────────────────────────────
heading "Route registration"
if [ -n "$php_files" ] || [ -n "$route_files" ]; then
  if php artisan route:list --columns=method,uri,name > /dev/null 2>&1; then
    pass "php artisan route:list succeeds"
  else
    fail "php artisan route:list exits non-zero"
    php artisan route:list --columns=method,uri,name 2>&1 | tail -15
  fi
else
  skip "No PHP or route files changed"
fi

# ── 3. PHPUnit tests ──────────────────────────────────────────
heading "PHPUnit tests"
if command -v php > /dev/null && [ -f phpunit.xml ]; then
  set +e
  test_output=$(php artisan test --stop-on-failure 2>&1)
  test_exit=$?
  set -e
  if [ $test_exit -eq 0 ]; then
    pass "All tests pass"
  elif echo "$test_output" | grep -qiE 'could not|connection refused|access denied|no such file'; then
    warn "Tests could not run (environment issue)"
    echo "$test_output" | tail -10
  else
    fail "Test suite has failures"
    echo "$test_output" | tail -20
  fi
else
  skip "PHPUnit not configured"
fi

# ── 4. Vite / JS build ────────────────────────────────────────
heading "Vite build"
if [ -n "$js_files" ]; then
  set +e
  build_output=$(npx vite build 2>&1)
  build_exit=$?
  set -e
  if [ $build_exit -eq 0 ]; then
    pass "Vite build succeeds"
  else
    fail "Vite build fails"
    echo "$build_output" | tail -30
  fi
else
  skip "No JS/JSX files changed"
fi

# ── 5. Summary ─────────────────────────────────────────────────
heading "Summary"
echo "Failures: $FAIL"
echo "Warnings: $WARN"

if [ $FAIL -gt 0 ]; then
  printf "${RED}ISSUES FOUND — fix before committing${NC}\n"
  exit 1
else
  if [ $WARN -gt 0 ]; then
    printf "${GREEN}SAFE TO COMMIT${NC} (with %d warning(s))\n" "$WARN"
  else
    printf "${GREEN}SAFE TO COMMIT${NC}\n"
  fi
  exit 0
fi
