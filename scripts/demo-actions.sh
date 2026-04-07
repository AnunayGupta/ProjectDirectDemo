#!/usr/bin/env bash
# =============================================================================
# Clinch Demo Actions Script
# Run all key platform actions via API for demo / testing purposes.
# Usage:  ./scripts/demo-actions.sh
# Prereq: Dev server running at localhost:3000
# =============================================================================

set -euo pipefail

BASE="http://localhost:3000"
CLIENT="client_001"       # Seán O'Brien
ADVISOR="advisor_andrew"

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

step() { echo -e "\n${CYAN}━━━ $1 ━━━${NC}"; }
ok()   { echo -e "${GREEN}  ✓ $1${NC}"; }
info() { echo -e "${YELLOW}  → $1${NC}"; }

# ── 0. Health check ──────────────────────────────────────────────────────────
step "Health check"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE")
if [ "$STATUS" != "200" ]; then
  echo "ERROR: Server not running at $BASE (got $STATUS). Start with 'npm run dev'."
  exit 1
fi
ok "Server is up"

# ── 1. Reset all state ───────────────────────────────────────────────────────
step "1. Reset all KV state"
curl -s -X POST "$BASE/api/dev/reset" | python3 -m json.tool
ok "State reset"

# ── 2. Fetch client list ─────────────────────────────────────────────────────
step "2. Fetch client list"
COUNT=$(curl -s "$BASE/api/clients" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))")
ok "Fetched $COUNT clients"

# ── 3. Fetch single client + portfolio ────────────────────────────────────────
step "3. Fetch client detail ($CLIENT)"
curl -s "$BASE/api/clients/$CLIENT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
c = d['client']
print(f\"  Name:  {c['name']}\")
print(f\"  Value: €{c['totalValue']:,.0f}\")
print(f\"  Holdings:\")
for h in d['portfolio']['accepted']['holdings']:
    print(f\"    {h['ticker']:10s} {h['currentWeighting']:6.1f}%  {h['name']}\")
"
ok "Client detail loaded"

# ── 4. Save a rebalance draft (increase MSFT, decrease CASH) ─────────────────
step "4. Save rebalance draft — increase MSFT by 2%, decrease CASH by 2%"
HOLDINGS=$(curl -s "$BASE/api/clients/$CLIENT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
holdings = d['portfolio']['accepted']['holdings']
for h in holdings:
    if h['ticker'] == 'MSFT':
        h['targetWeighting'] = h['currentWeighting'] + 2.0
    elif h['ticker'] == 'CASH':
        h['targetWeighting'] = max(0, h['currentWeighting'] - 2.0)
print(json.dumps(holdings))
")

curl -s -X PUT "$BASE/api/portfolio/$CLIENT/draft" \
  -H "Content-Type: application/json" \
  -d "{
    \"clientId\": \"$CLIENT\",
    \"holdings\": $HOLDINGS,
    \"status\": \"draft\",
    \"draftStartedAt\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
    \"sentForApprovalAt\": null,
    \"advisorId\": \"$ADVISOR\"
  }" | python3 -m json.tool
ok "Rebalance draft saved"

# ── 5. Add a new instrument (GOOGL at 0%) ────────────────────────────────────
step "5. Add new instrument — GOOGL at 0%"
HOLDINGS_WITH_GOOGL=$(curl -s "$BASE/api/portfolio/$CLIENT/draft" | python3 -c "
import sys, json
d = json.load(sys.stdin)
holdings = d['draft']['holdings']
holdings.append({
    'ticker': 'GOOGL',
    'name': 'Alphabet Inc.',
    'assetClass': 'equity',
    'currentWeighting': 0,
    'targetWeighting': 0,
    'value': 0,
    'performance': 0
})
print(json.dumps(holdings))
")

curl -s -X PUT "$BASE/api/portfolio/$CLIENT/draft" \
  -H "Content-Type: application/json" \
  -d "{
    \"clientId\": \"$CLIENT\",
    \"holdings\": $HOLDINGS_WITH_GOOGL,
    \"status\": \"draft\",
    \"draftStartedAt\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
    \"sentForApprovalAt\": null,
    \"advisorId\": \"$ADVISOR\"
  }" | python3 -m json.tool
ok "GOOGL added at 0%"

# ── 6. Increase GOOGL to 3%, take from CASH ──────────────────────────────────
step "6. Increase GOOGL to 3% (taken from CASH)"
HOLDINGS_GOOGL_UP=$(curl -s "$BASE/api/portfolio/$CLIENT/draft" | python3 -c "
import sys, json
d = json.load(sys.stdin)
holdings = d['draft']['holdings']
for h in holdings:
    if h['ticker'] == 'GOOGL':
        h['targetWeighting'] = 3.0
    elif h['ticker'] == 'CASH':
        h['targetWeighting'] = max(0, h['targetWeighting'] - 3.0)
print(json.dumps(holdings))
")

curl -s -X PUT "$BASE/api/portfolio/$CLIENT/draft" \
  -H "Content-Type: application/json" \
  -d "{
    \"clientId\": \"$CLIENT\",
    \"holdings\": $HOLDINGS_GOOGL_UP,
    \"status\": \"draft\",
    \"draftStartedAt\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
    \"sentForApprovalAt\": null,
    \"advisorId\": \"$ADVISOR\"
  }" | python3 -m json.tool
ok "GOOGL increased to 3%, CASH decreased"

# ── 7. Remove LVMH (weight goes to CASH) ─────────────────────────────────────
step "7. Remove LVMH — weight transferred to CASH"
HOLDINGS_NO_LVMH=$(curl -s "$BASE/api/portfolio/$CLIENT/draft" | python3 -c "
import sys, json
d = json.load(sys.stdin)
holdings = d['draft']['holdings']
lvmh_weight = 0
for h in holdings:
    if h['ticker'] == 'LVMH.PA':
        lvmh_weight = h['targetWeighting']
filtered = [h for h in holdings if h['ticker'] != 'LVMH.PA']
for h in filtered:
    if h['ticker'] == 'CASH':
        h['targetWeighting'] += lvmh_weight
print(json.dumps(filtered))
")

curl -s -X PUT "$BASE/api/portfolio/$CLIENT/draft" \
  -H "Content-Type: application/json" \
  -d "{
    \"clientId\": \"$CLIENT\",
    \"holdings\": $HOLDINGS_NO_LVMH,
    \"status\": \"draft\",
    \"draftStartedAt\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
    \"sentForApprovalAt\": null,
    \"advisorId\": \"$ADVISOR\"
  }" | python3 -m json.tool
ok "LVMH removed, weight moved to CASH"

# ── 8. Send for approval ─────────────────────────────────────────────────────
step "8. Send draft for approval"
FINAL_HOLDINGS=$(curl -s "$BASE/api/portfolio/$CLIENT/draft" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(json.dumps(d['draft']['holdings']))
")

curl -s -X PUT "$BASE/api/portfolio/$CLIENT/draft" \
  -H "Content-Type: application/json" \
  -d "{
    \"clientId\": \"$CLIENT\",
    \"holdings\": $FINAL_HOLDINGS,
    \"actionType\": \"rebalance\",
    \"status\": \"pending_approval\",
    \"draftStartedAt\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
    \"sentForApprovalAt\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
    \"advisorId\": \"$ADVISOR\"
  }" | python3 -m json.tool
ok "Sent for approval"

# ── 9. Mark client as reviewed ────────────────────────────────────────────────
step "9. Mark client as reviewed"
curl -s -X PUT "$BASE/api/clients/$CLIENT/reviewed" | python3 -m json.tool
ok "Client marked as reviewed"

# ── 10. Generate reports for all clients ──────────────────────────────────────
step "10. Generate reports for all clients"
curl -s -X POST "$BASE/api/reports/generate" \
  -H "Content-Type: application/json" \
  -d '{"clientIds": []}' | python3 -m json.tool
ok "Reports generated"

# ── 11. Download a PDF report ─────────────────────────────────────────────────
step "11. Download PDF report for $CLIENT"
PDF_FILE="/tmp/clinch-report-$CLIENT.pdf"
HTTP_CODE=$(curl -s -o "$PDF_FILE" -w "%{http_code}" "$BASE/api/reports/$CLIENT/pdf")
if [ "$HTTP_CODE" = "200" ]; then
  SIZE=$(wc -c < "$PDF_FILE" | tr -d ' ')
  ok "PDF downloaded: $PDF_FILE ($SIZE bytes)"
else
  echo "  ERROR: PDF download failed with HTTP $HTTP_CODE"
fi

# ── 12. Verify final state ───────────────────────────────────────────────────
step "12. Verify final portfolio state"
curl -s "$BASE/api/portfolio/$CLIENT/draft" | python3 -c "
import sys, json
d = json.load(sys.stdin)
draft = d['draft']
print(f\"  Status: {draft['status']}\")
print(f\"  Holdings:\")
for h in draft['holdings']:
    print(f\"    {h['ticker']:10s} current={h['currentWeighting']:5.1f}%  target={h['targetWeighting']:5.1f}%\")
total = sum(h['targetWeighting'] for h in draft['holdings'])
print(f\"  Total target: {total:.1f}%\")
"
ok "Done"

# ── Summary ───────────────────────────────────────────────────────────────────
step "All demo actions completed successfully!"
echo "
  Actions performed:
    1.  Reset KV state
    2.  Fetched client list
    3.  Fetched client detail
    4.  Saved rebalance draft (MSFT +2%, CASH -2%)
    5.  Added GOOGL at 0%
    6.  Increased GOOGL to 3% (from CASH)
    7.  Removed LVMH (weight → CASH)
    8.  Sent for approval
    9.  Marked client as reviewed
    10. Generated reports for all clients
    11. Downloaded PDF report
    12. Verified final state
"
