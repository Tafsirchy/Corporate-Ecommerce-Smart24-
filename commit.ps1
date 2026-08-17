git add "apps/backend/src/auth/auth.service.ts"
git commit -m "feat(auth): update auth service"

git add "apps/backend/src/auth/dto/auth.dto.ts"
git commit -m "feat(auth): update auth dto"

git add "apps/frontend/src/app/business/bulk-order/page.tsx"
git commit -m "refactor(business): improve bulk order mobile UX"

git add "apps/frontend/src/app/business/invoices/page.tsx"
git commit -m "refactor(business): convert invoices to mobile-first cards"

git add "apps/frontend/src/app/business/layout.tsx"
git commit -m "feat(business): add mobile bottom sheet and dynamic FAB"

git add "apps/frontend/src/app/business/page.tsx"
git commit -m "refactor(business): update dashboard UI and link colors"

git add "apps/frontend/src/app/business/rfq/page.tsx"
git commit -m "refactor(business): implement mobile-first rfq form"

git add "apps/frontend/src/app/business/verify/page.tsx"
git commit -m "refactor(business): improve business verification mobile UX"

git rm "apps/frontend/src/app/forgot-password/page.tsx"
git commit -m "chore: remove unused forgot-password page"

git add "apps/frontend/src/app/globals.css"
git commit -m "style: update global css"

git add "apps/frontend/src/app/layout.tsx"
git commit -m "chore: update root layout"

git add "apps/frontend/src/app/subscriptions/builder/page.tsx"
git commit -m "refactor: update subscription builder page"

git add "apps/frontend/src/components/auth/AuthModal.tsx"
git commit -m "refactor(auth): update auth modal logic"

git add "apps/frontend/src/components/layout/Header.tsx"
git commit -m "fix: resolve mobile header overlap"

git add "apps/frontend/src/components/layout/HeaderNav.tsx"
git commit -m "fix: resolve hydration mismatch in header nav"

git add "apps/frontend/src/context/AuthContext.tsx"
git commit -m "feat(auth): update AuthContext for business roles"

git add "apps/frontend/src/app/business/pending-rfqs/"
git commit -m "feat(business): implement pending rfqs page"

git add "commit.ps1"
git commit -m "chore: update commit script"

git push
