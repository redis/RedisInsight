#!/usr/bin/env bash
#
# Prints known vulnerabilities for a lockfile using osv-scanner.
# Informational only: finding vulnerabilities (exit 1) does not fail the step.
# The step fails only when osv-scanner cannot produce a report, so a broken
# scan is never mistaken for a clean one.
#
# Usage: deps-audit.sh <lockfile> <label>

set -uo pipefail

LOCKFILE="${1:?lockfile path is required}"
LABEL="${2:-deps}"

# osv-scanner return codes: https://google.github.io/osv-scanner/output/#return-codes
OSV_SUCCESS=0
OSV_VULNERABILITIES_FOUND=1

echo "::group::Dependency audit (${LABEL}): ${LOCKFILE}"
code=0
osv-scanner scan source --lockfile "${LOCKFILE}" --format table || code=$?
echo "::endgroup::"

if [ "${code}" -ne "${OSV_SUCCESS}" ] && [ "${code}" -ne "${OSV_VULNERABILITIES_FOUND}" ]; then
  echo "::error::osv-scanner failed to produce a report for ${LABEL} (exit code ${code})."
  exit "${code}"
fi

if [ "${code}" -eq "${OSV_VULNERABILITIES_FOUND}" ]; then
  echo "::warning::Known vulnerabilities found in ${LABEL} dependencies (see the table above). This does not block CI."
fi

exit 0
