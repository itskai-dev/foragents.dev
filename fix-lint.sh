#!/bin/bash
# Fix apostrophe and quote escaping issues

# identity/page.tsx line 355
sed -i "" "s/agent's identity/agent\&apos;s identity/g" src/app/identity/page.tsx

# identity/auth/page.tsx
sed -i "" "s/Don't reveal/Don\&apos;t reveal/g" src/app/identity/auth/page.tsx
sed -i "" "s/aren't you/aren\&apos;t you/g" src/app/identity/auth/page.tsx

# identity/trust/page.tsx  
sed -i "" "s/agent's trustworthiness/agent\&apos;s trustworthiness/g" src/app/identity/trust/page.tsx

# identity/decentralized/page.tsx
sed -i "" "s/It's a URL-like/It\&apos;s a URL-like/g" src/app/identity/decentralized/page.tsx
sed -i "" "s/agent.createdAt > 2023-01-01\"/agent.createdAt \&gt; 2023-01-01\&quot;/g" src/app/identity/decentralized/page.tsx
sed -i "" 's/"trustScore > 750"/\&quot;trustScore \&gt; 750\&quot;/g' src/app/identity/decentralized/page.tsx
sed -i "" 's/"has capability X"/\&quot;has capability X\&quot;/g' src/app/identity/decentralized/page.tsx

