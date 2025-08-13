#!/bin/bash

# Update all API routes to use the improved session helper

echo "Updating API routes to use improved session handling..."

# List of files to update
files=(
  "app/api/students/export/route.ts"
  "app/api/sse/route.ts"
  "app/api/consequences/route.ts"
  "app/api/rewards/route.ts"
  "app/api/reports/route.ts"
  "app/api/courses/route.ts"
  "app/api/events/route.ts"
  "app/api/courses/[id]/updates/route.ts"
  "app/api/students/import/route.ts"
  "app/api/rewards/redeem/route.ts"
  "app/api/consequences/apply/route.ts"
  "app/api/consequences/[id]/route.ts"
  "app/api/rewards/[id]/route.ts"
  "app/api/courses/[id]/students/route.ts"
  "app/api/students/[id]/route.ts"
  "app/api/courses/[id]/route.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    # Replace the imports
    sed -i '' "s/import { getServerSession } from 'next-auth';//" "$file"
    sed -i '' "s/import { authOptions } from '@\/lib\/auth\/config';/import { getAuthSession } from '@\/lib\/auth\/session';/" "$file"
    
    # Replace the session calls
    sed -i '' "s/const session = await getServerSession(authOptions);/const session = await getAuthSession(request);/" "$file"
    
    echo "✓ Updated $file"
  else
    echo "⚠ File not found: $file"
  fi
done

echo "✅ Session update complete!"