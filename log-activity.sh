#!/bin/bash
# Log an activity to Mission Control dashboard
# Usage: ./log-activity.sh <actionType> <title> [details] [status]
#
# Examples:
#   ./log-activity.sh deployment "Deployed to Vercel" "Production build successful"
#   ./log-activity.sh voice_call "Morning wake-up call" "Briefed on 3 calendar events"
#   ./log-activity.sh cron_executed "Content monitor ran" "Found 2 new videos" success

ACTION_TYPE="${1:?Usage: log-activity.sh <type> <title> [details] [status]}"
TITLE="${2:?Missing title}"
DETAILS="${3:-}"
STATUS="${4:-success}"
TIMESTAMP=$(date +%s000)

CONVEX_URL="https://elated-lion-930.convex.cloud"

# Build JSON payload
if [ -n "$DETAILS" ]; then
  PAYLOAD=$(cat <<EOF
{"path":"activities:create","args":{"timestamp":${TIMESTAMP},"actionType":"${ACTION_TYPE}","title":"${TITLE}","details":"${DETAILS}","status":"${STATUS}"}}
EOF
)
else
  PAYLOAD=$(cat <<EOF
{"path":"activities:create","args":{"timestamp":${TIMESTAMP},"actionType":"${ACTION_TYPE}","title":"${TITLE}","status":"${STATUS}"}}
EOF
)
fi

curl -s -X POST "${CONVEX_URL}/api/mutation" \
  -H "Content-Type: application/json" \
  -d "${PAYLOAD}" | python3 -c "import sys,json; d=json.load(sys.stdin); print('✅ Logged' if d.get('status')=='success' else '❌ Failed:', d)" 2>/dev/null || echo "❌ Request failed"
