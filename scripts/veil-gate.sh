#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export PATH="$HOME/.foundry/bin:$PATH"
OLD_TITLE="Inden""ture"
OLD_UPPER="INDEN""TURE"
OLD_LOWER="inden""ture"
EXPECTED_TESTS="${EXPECTED_VEIL_TESTS:-39}"

cd "$REPO_ROOT"

echo "== VEIL gate: old-name scan =="
if git grep -n -E "$OLD_TITLE|$OLD_UPPER|$OLD_LOWER" -- ':!pnpm-lock.yaml'; then
  echo "VEIL gate failed: tracked source still contains the old name." >&2
  exit 1
fi

echo "== VEIL gate: forge build =="
(
  cd packages/foundry
  forge build --sizes
)

echo "== VEIL gate: forge test =="
test_log="$(mktemp)"
trap 'rm -f "$test_log"' EXIT
(
  cd packages/foundry
  forge test -vv
) | tee "$test_log"

if ! grep -Eq "Ran [0-9]+ test suites .*: ${EXPECTED_TESTS} tests passed, 0 failed, 0 skipped \\(${EXPECTED_TESTS} total tests\\)" "$test_log"; then
  echo "VEIL gate failed: expected exactly ${EXPECTED_TESTS} passing Foundry tests." >&2
  exit 1
fi

echo "== VEIL gate: frontend typecheck =="
pnpm --filter ./packages/nextjs check-types

echo "== VEIL gate: off-ramp typecheck =="
pnpm --filter @veil/offramp check-types

echo "== VEIL gate: prettier =="
pnpm exec prettier --check .

echo "== VEIL gate: passed =="
