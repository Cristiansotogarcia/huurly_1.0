# 🔧 HUURLY PROJECT REFACTOR PLAN

**Based on:** docs/audit-overview.md  
**Created:** June 10, 2025  
**Estimated Timeline:** 2-3 weeks  
**Priority:** 🔴 CRITICAL - Production readiness at risk

---

## 📋 **OVERVIEW**

This plan addresses the critical technical debt identified in the audit, focusing on database stabilization, code cleanup, and dashboard consistency. Each phase includes specific commands, expected outcomes, and verification steps.

---

## 🚨 **PHASE 1: EMERGENCY CLEANUP (Days 1-2)**

### **Step 1.1: Create Archive Structure**
```bash
# Create archive directories
mkdir -p archive/scripts
mkdir -p archive/docs
mkdir -p archive/tests
mkdir -p archive/migrations-backup

# Expected Outcome: Clean directory structure for organizing temporary files
```

### **Step 1.2: Archive Temporary Scripts**
```bash
# Move fix scripts (45+ files)
mv fix-*.js archive/scripts/
mv fix-*.cjs archive/scripts/
mv apply-*.js archive/scripts/
mv apply-*.cjs archive/scripts/

# Expected Outcome: Root directory reduced by ~45 files
```

### **Step 1.3: Archive Analysis Documents**
```bash
# Move analysis documents (35+ files)
mv *_ANALYSIS.md archive/docs/
mv *_SOLUTION.md archive/docs/
mv *_COMPLETE.md archive/docs/
mv *_FIX.md archive/docs/
mv *_SUMMARY.md archive/docs/

# Expected Outcome: Root directory reduced by ~35 documentation files
```

### **Step 1.4: Archive Test Scripts**
```bash
# Move test and debug scripts (15+ files)
mv test-*.js archive/tests/
mv debug-*.js archive/tests/
mv diagnose-*.js archive/tests/
mv comprehensive-*.js archive/tests/
mv simple-*.js archive/tests/

# Expected Outcome: Root directory reduced by ~15 test files
```

### **Step 1.5: Backup Database Migrations**
```bash
# Backup all migrations before consolidation
cp supabase/migrations/*.sql archive/migrations-backup/

# Expected Outcome: Safe backup of all 24 migration files
```

### **Step 1.6: Verify Cleanup**
```bash
# Count remaining files in root
Get-ChildItem -File | Where-Object { $_.Name -match '\.(js|cjs|md)$' -and $_.Name -notmatch '^(README|package|tsconfig|eslint|postcss|tailwind|vite)' } | Measure-Object

# Expected Outcome: Root directory should have <10 temporary files remaining
```

---

## 🗄️ **PHASE 2: DATABASE STABILIZATION (Days 3-5)**

### **Step 2.1: Analyze Current Schema**
```bash
# Export current database schema
supabase db dump --schema-only > current-schema.sql

# Expected Outcome: Complete schema export for analysis
```

### **Step 2.2: Create Consolidated Migration**
```sql
-- Create: supabase/migrations/20250611_consolidated_schema.sql
-- Consolidate all 24 migrations into single stable schema

-- Step 2.2a: Core Tables
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('huurder', 'verhuurder', 'beoordelaar', 'beheerder')),
  is_looking_for_place BOOLEAN DEFAULT false, -- FIX: Add missing field
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2.2b: Add missing indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Expected Outcome: Single migration file replacing 24 fragmented ones
```

### **Step 2.3: Test Migration**
```bash
# Reset database to clean state
supabase db reset

# Apply consolidated migration
supabase db push

# Expected Outcome: Clean database with stable schema
```

### **Step 2.4: Verify Schema Integrity**
```bash
# Check for missing fields referenced in code
grep -r "is_looking_for_place" src/ --include="*.tsx" --include="*.ts"

# Expected Outcome: All referenced fields exist in database
```

### **Step 2.5: Create RLS Policies**
```sql
-- Create: supabase/migrations/20250611_stable_rls_policies.sql
-- Implement secure, tested RLS policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- User can read/update own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Expected Outcome: Secure, non-recursive RLS policies
```

---

## 🎯 **PHASE 3: DASHBOARD STANDARDIZATION (Days 6-10)**

### **Step 3.1: Fix HuurderDashboard (Tenant) - WORST**
```typescript
// File: src/pages/HuurderDashboard.tsx

// Step 3.1a: Replace hardcoded beoordelaar-demo-id (Line 179)
// BEFORE:
const reviewerId = "beoordelaar-demo-id";
// AFTER:
const { data: reviewers } = await supabase
  .from('users')
  .select('id')
  .eq('role', 'beoordelaar')
  .limit(1);
const reviewerId = reviewers?.[0]?.id;

// Step 3.1b: Fix hardcoded stats (Lines 340-375)
// BEFORE:
const stats = { applications: 0, viewings: 0, favorites: 0 };
// AFTER:
const { data: userStats } = await supabase
  .from('user_stats')
  .select('*')
  .eq('user_id', user.id)
  .single();

// Expected Outcome: Real data integration, functional buttons
```

### **Step 3.2: Fix VerhuurderDashboard (Landlord) - MIXED**
```typescript
// File: src/pages/VerhuurderDashboard.tsx

// Step 3.2a: Replace hardcoded stats (Lines 189-190)
// BEFORE:
const totalProperties = 5;
const activeListings = 12;
// AFTER:
const { data: propertyStats } = await supabase
  .from('properties')
  .select('id, status')
  .eq('owner_id', user.id);

const totalProperties = propertyStats?.length || 0;
const activeListings = propertyStats?.filter(p => p.status === 'active').length || 0;

// Expected Outcome: Real property statistics
```

### **Step 3.3: Fix BeheerderDashboard (Admin) - FAKE DATA**
```typescript
// File: src/pages/BeheerderDashboard.tsx

// Step 3.3a: Replace hardcoded user stats (Lines 264-270)
// BEFORE:
const totalUsers = 15420;
const activeUsers = 12340;
// AFTER:
const { data: userCounts } = await supabase
  .from('users')
  .select('id, role, last_login')
  .then(data => ({
    total: data.length,
    active: data.filter(u => isRecentlyActive(u.last_login)).length
  }));

// Expected Outcome: Real administrative statistics
```

### **Step 3.4: Standardize Loading States**
```typescript
// Create: src/hooks/useDashboardData.ts
export const useDashboardData = (userRole: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState(null);

  // Standardized data loading pattern for all dashboards
  // Expected Outcome: Consistent loading/error handling
};
```

### **Step 3.5: Test Dashboard Functionality**
```bash
# Start development server
npm run dev

# Test each dashboard role
# - Navigate to /huurder-dashboard
# - Navigate to /verhuurder-dashboard  
# - Navigate to /beoordelaar-dashboard
# - Navigate to /beheerder-dashboard

# Expected Outcome: All dashboards load real data, no hardcoded values
```

---

## 🔧 **PHASE 4: SERVICE LAYER REFACTORING (Days 11-15)**

### **Step 4.1: Split UserService.ts (29KB)**
```bash
# Create specialized services
touch src/services/UserProfileService.ts
touch src/services/UserAuthService.ts
touch src/services/UserPreferencesService.ts

# Expected Outcome: UserService.ts reduced to <10KB
```

```typescript
// File: src/services/UserProfileService.ts
export class UserProfileService {
  static async getProfile(userId: string) {
    // Profile-specific logic only
  }
  
  static async updateProfile(userId: string, data: ProfileData) {
    // Profile update logic only
  }
}

// Expected Outcome: Single responsibility services
```

### **Step 4.2: Refactor AnalyticsService.ts (23KB)**
```typescript
// File: src/services/AnalyticsService.ts
// Split into:
// - src/services/UserAnalyticsService.ts
// - src/services/PropertyAnalyticsService.ts  
// - src/services/SystemAnalyticsService.ts

// Expected Outcome: Focused analytics services
```

### **Step 4.3: Add Service Interfaces**
```typescript
// File: src/types/services.ts
export interface IUserService {
  getProfile(id: string): Promise<UserProfile>;
  updateProfile(id: string, data: Partial<UserProfile>): Promise<void>;
}

// Expected Outcome: Type-safe service contracts
```

### **Step 4.4: Implement Error Handling**
```typescript
// File: src/lib/serviceErrors.ts
export class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
  }
}

// Expected Outcome: Consistent error handling across services
```

---

## 🎨 **PHASE 5: COMPONENT OPTIMIZATION (Days 16-18)**

### **Step 5.1: Consolidate Modal Components**
```bash
# Analyze modal duplication
find src/components/modals -name "*.tsx" -exec wc -l {} + | sort -n

# Expected Outcome: Identify duplicate modal patterns
```

### **Step 5.2: Create Base Modal Component**
```typescript
// File: src/components/modals/BaseModal.tsx
interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const BaseModal: React.FC<BaseModalProps> = ({ isOpen, onClose, title, children }) => {
  // Standardized modal structure
  // Expected Outcome: Reusable modal foundation
};
```

### **Step 5.3: Refactor Existing Modals**
```typescript
// Update all modal components to extend BaseModal
// - ProfileCreationModal.tsx
// - DocumentUploadModal.tsx
// - DocumentReviewModal.tsx
// - EnhancedProfileCreationModal.tsx

// Expected Outcome: Consistent modal behavior, reduced code duplication
```

### **Step 5.4: Optimize UI Components**
```bash
# Analyze component sizes
find src/components/ui -name "*.tsx" -exec wc -l {} + | sort -nr | head -10

# Expected Outcome: Identify oversized UI components for optimization
```

---

## 📦 **PHASE 6: DEPENDENCY OPTIMIZATION (Days 19-21)**

### **Step 6.1: Analyze Bundle Size**
```bash
# Install bundle analyzer
npm install --save-dev webpack-bundle-analyzer

# Analyze current bundle
npm run build
npx webpack-bundle-analyzer dist/assets/*.js

# Expected Outcome: Visual bundle size analysis
```

### **Step 6.2: Remove Unused Dependencies**
```bash
# Find unused dependencies
npx depcheck

# Remove unused packages
npm uninstall [unused-packages]

# Expected Outcome: Reduced node_modules size from 198MB
```

### **Step 6.3: Implement Code Splitting**
```typescript
// File: src/App.tsx
import { lazy, Suspense } from 'react';

// Lazy load dashboard components
const HuurderDashboard = lazy(() => import('./pages/HuurderDashboard'));
const VerhuurderDashboard = lazy(() => import('./pages/VerhuurderDashboard'));

// Expected Outcome: Smaller initial bundle size
```

### **Step 6.4: Optimize Asset Loading**
```typescript
// File: vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  }
});

// Expected Outcome: Optimized chunk splitting
```

---

## ✅ **VERIFICATION & TESTING**

### **Step 7.1: Automated Testing**
```bash
# Run existing tests
npm test

# Add integration tests for dashboards
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Expected Outcome: All tests pass, no regressions
```

### **Step 7.2: Manual Testing Checklist**
```markdown
## Dashboard Testing
- [ ] HuurderDashboard loads real data
- [ ] VerhuurderDashboard shows actual properties
- [ ] BeoordelaarDashboard processes real documents
- [ ] BeheerderDashboard displays live statistics

## Database Testing
- [ ] All migrations apply cleanly
- [ ] RLS policies work correctly
- [ ] No missing field errors
- [ ] Performance is acceptable

## UI Testing
- [ ] All buttons are functional
- [ ] Modals open/close properly
- [ ] Loading states work correctly
- [ ] Error handling displays properly
```

### **Step 7.3: Performance Testing**
```bash
# Test build performance
npm run build
# Expected: Build completes in <2 minutes

# Test bundle size
ls -lh dist/assets/
# Expected: Main bundle <500KB gzipped

# Test database queries
# Expected: Dashboard loads in <2 seconds
```

---

## 📊 **SUCCESS METRICS**

| Metric | Before | Target | Verification |
|--------|--------|--------|--------------|
| **Root Files** | 80+ temp files | <10 temp files | `ls *.js *.md \| wc -l` |
| **Migrations** | 24 files | 2-3 stable files | `ls supabase/migrations/ \| wc -l` |
| **UserService Size** | 29KB | <10KB | `wc -c src/services/UserService.ts` |
| **Bundle Size** | Unknown | <500KB gzipped | `ls -lh dist/assets/` |
| **Dashboard Data** | 75% hardcoded | 100% real | Manual testing |
| **Build Time** | Unknown | <2 minutes | `time npm run build` |

---

## 🚨 **ROLLBACK PLAN**

### **Emergency Rollback Steps**
```bash
# If Phase 1 fails:
cp -r archive/* ./  # Restore archived files

# If Phase 2 fails:
supabase db reset  # Reset to last known good state
cp archive/migrations-backup/* supabase/migrations/

# If Phase 3+ fails:
git checkout HEAD~1  # Revert to previous commit
npm install  # Restore dependencies
```

### **Backup Strategy**
```bash
# Before each phase:
git add .
git commit -m "Pre-phase backup: [Phase Name]"
git tag "backup-phase-[N]"

# Database backup before Phase 2:
supabase db dump > backup-$(date +%Y%m%d).sql
```

---

## 📋 **DAILY CHECKLIST**

### **Daily Standup Questions**
1. What phase/step was completed yesterday?
2. What issues were encountered?
3. What is planned for today?
4. Are there any blockers?

### **End-of-Day Verification**
```bash
# Verify no regressions
npm run build  # Should complete successfully
npm test       # All tests should pass
git status     # Clean working directory
```

---

## 🎯 **COMPLETION CRITERIA**

### **Phase 1 Complete When:**
- [ ] Root directory has <10 temporary files
- [ ] All temporary files archived with clear organization
- [ ] Git repository is clean and organized

### **Phase 2 Complete When:**
- [ ] Database has <5 migration files
- [ ] All dashboard queries work without errors
- [ ] RLS policies are secure and tested

### **Phase 3 Complete When:**
- [ ] All 4 dashboards show 100% real data
- [ ] No hardcoded values in production code
- [ ] All buttons and features are functional

### **Project Complete When:**
- [ ] All success metrics are met
- [ ] Manual testing checklist passes 100%
- [ ] Performance targets are achieved
- [ ] Code review approval received

---

**Plan Created:** June 10, 2025  
**Estimated Completion:** June 30, 2025  
**Next Review:** After Phase 1 completion  
**Risk Level:** 🟡 MEDIUM - With proper execution and testing
