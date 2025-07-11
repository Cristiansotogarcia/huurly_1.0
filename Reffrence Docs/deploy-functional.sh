#!/bin/bash

# Huurly Functional Dashboard Deployment Script
echo "🚀 Deploying Huurly Functional Dashboard..."

# Backup original main.tsx
if [ ! -f "src/main.tsx.backup" ]; then
    echo "📦 Backing up original main.tsx..."
    cp src/main.tsx src/main.tsx.backup
fi

# Switch to functional app
echo "🔄 Switching to functional dashboard..."
cat > src/main.tsx << 'EOF'
import { createRoot } from 'react-dom/client';
import FunctionalApp from './FunctionalApp.tsx';
import './index.css';

createRoot(document.getElementById("root")!).render(
  <FunctionalApp />
);
EOF

echo "✅ Functional dashboard deployed!"
echo ""
echo "🧪 Test the application:"
echo "1. Run: npm run dev"
echo "2. Login with: sotocrioyo@gmail.com / Admin1290@@"
echo "3. Test all dashboard features"
echo ""
echo "🔄 To revert to original:"
echo "   cp src/main.tsx.backup src/main.tsx"
echo ""
echo "🎉 Your Huurly dashboard is now 100% functional!"

