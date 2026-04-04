# PolicyBridge - Complete Updated Project Structure with Payslip Generation

_Updated: September 13, 2025_

```
policy-bridge-web/
├── public/
│   ├── icons/
│   ├── images/
│   ├── templates/                      # 🆕 NEW - Payslip templates
│   │   ├── payslip-default.html
│   │   ├── payslip-modern.html
│   │   └── payslip-corporate.html
│   ├── policybridge-logo.png
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx                 # Root layout with ThemeProvider
│   │   ├── page.tsx                   # Splash screen (homepage)
│   │   ├── loading.tsx
│   │   ├── not-found.tsx
│   │   │
│   │   ├── landing/
│   │   │   └── page.tsx              # Marketing landing page
│   │   │
│   │   ├── auth/                    # Auth group route
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx             # Auth layout
│   │   │
│   │   ├── dashboard/               # Dashboard group route
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx           # Main dashboard
│   │   │   ├── client-management/
│   │   │   │   ├── page.tsx           # Client list
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx       # Client details
│   │   │   │   │   ├── payslips/      # 🆕 NEW - Client payslip history
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── edit/
│   │   │   │   │       └── page.tsx   # Edit client
│   │   │   │   └── new/
│   │   │   │       └── page.tsx       # New client
│   │   │   ├── policy-management/
│   │   │   │   ├── page.tsx           # ✅ EXISTS - Policy list
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx       # ✅ COMPLETED - Policy details wrapper
│   │   │   │   │   ├── policy-details-page.tsx  # ✅ COMPLETED - Policy details component
│   │   │   │   │   ├── payslips/      # 🆕 NEW - Policy-related payslips
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── edit/
│   │   │   │   │       └── page.tsx   # ✅ EXISTS - Edit policy
│   │   │   │   └── create/
│   │   │   │       └── page.tsx       # ✅ EXISTS - Create policy
│   │   │   ├── claims-management/
│   │   │   │   ├── page.tsx           # Claims list
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx       # Claim details
│   │   │   │   │   └── payslips/      # 🆕 NEW - Claim settlement payslips
│   │   │   │   │       └── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx       # New claim
│   │   │   ├── payment-management/
│   │   │   │   ├── page.tsx           # ✅ EXISTS - Payments list
│   │   │   │   ├── payslips/          # 🆕 NEW - Payslip Management Hub
│   │   │   │   │   ├── page.tsx       # Payslip dashboard & history
│   │   │   │   │   ├── generate/      # Bulk payslip generation
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── templates/     # Payslip template management
│   │   │   │   │   │   ├── page.tsx   # Template list & editor
│   │   │   │   │   │   ├── [id]/
│   │   │   │   │   │   │   └── page.tsx  # Template editor
│   │   │   │   │   │   └── new/
│   │   │   │   │   │       └── page.tsx  # Create new template
│   │   │   │   │   ├── [id]/          # Individual payslip management
│   │   │   │   │   │   ├── page.tsx   # Payslip details & preview
│   │   │   │   │   │   ├── edit/
│   │   │   │   │   │   │   └── page.tsx  # Edit payslip
│   │   │   │   │   │   └── download/
│   │   │   │   │   │       └── page.tsx  # Download & email options
│   │   │   │   │   └── settings/      # Payslip automation settings
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── [id]/              # Payment details
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── generate-payslip/  # 🆕 NEW - Generate from payment
│   │   │   │   │       └── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx       # ✅ EXISTS - New payment
│   │   │   ├── reports/
│   │   │   │   ├── page.tsx           # Reports dashboard
│   │   │   │   ├── revenue/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── renewals/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── process-time/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── payslips/          # 🆕 NEW - Payslip Reports & Analytics
│   │   │   │       ├── page.tsx       # Payslip analytics dashboard
│   │   │   │       ├── generation/
│   │   │   │       │   └── page.tsx   # Generation statistics
│   │   │   │       ├── delivery/
│   │   │   │       │   └── page.tsx   # Delivery & download stats
│   │   │   │       └── reconciliation/
│   │   │   │           └── page.tsx   # Payment vs payslip reconciliation
│   │   │   ├── calendar/
│   │   │   │   └── page.tsx
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx
│   │   │   ├── profile/
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx
│   │   │   │   └── payslips/          # 🆕 NEW - Global payslip settings
│   │   │   │       └── page.tsx       # Default templates, automation rules
│   │   │   ├── help/
│   │   │   │   └── page.tsx
│   │   │   ├── subscription/
│   │   │   │   └── page.tsx
│   │   │   ├── system-status/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx             # Dashboard layout with LayoutProvider
│   │   │
│   │   └── api/                       # API routes
│   │       ├── auth/
│   │       │   ├── login/
│   │       │   │   └── route.ts
│   │       │   ├── logout/
│   │       │   │   └── route.ts
│   │       │   └── register/
│   │       │       └── route.ts
│   │       ├── clients/
│   │       │   ├── route.ts           # GET, POST /api/clients
│   │       │   └── [id]/
│   │       │       ├── route.ts       # GET, PUT, DELETE /api/clients/[id]
│   │       │       └── payslips/      # 🆕 NEW - Client payslip history
│   │       │           └── route.ts   # GET /api/clients/[id]/payslips
│   │       ├── policies/
│   │       │   ├── route.ts           # ✅ COMPLETED - GET, POST /api/policies
│   │       │   └── [id]/
│   │       │       ├── route.ts       # ✅ COMPLETED - GET, PUT, DELETE /api/policies/[id]
│   │       │       └── payslips/      # 🆕 NEW - Policy payslip history
│   │       │           └── route.ts   # GET /api/policies/[id]/payslips
│   │       ├── claims/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       ├── route.ts
│   │       │       └── payslips/      # 🆕 NEW - Claim settlement payslips
│   │       │           └── route.ts
│   │       ├── payments/
│   │       │   ├── route.ts           # GET, POST /api/payments
│   │       │   ├── [id]/
│   │       │   │   ├── route.ts       # GET, PUT, DELETE /api/payments/[id]
│   │       │   │   └── payslip/       # 🆕 NEW - Generate payslip from payment
│   │       │   │       └── route.ts   # POST /api/payments/[id]/payslip
│   │       │   └── payslips/          # 🆕 NEW - Payslip Management API
│   │       │       ├── route.ts       # GET payslips list, POST create payslip
│   │       │       ├── bulk-generate/
│   │       │       │   └── route.ts   # POST bulk payslip generation
│   │       │       ├── templates/
│   │       │       │   ├── route.ts   # GET, POST templates
│   │       │       │   └── [id]/
│   │       │       │       └── route.ts  # GET, PUT, DELETE template
│   │       │       ├── [id]/
│   │       │       │   ├── route.ts   # GET, PUT, DELETE payslip
│   │       │       │   ├── download/
│   │       │       │   │   └── route.ts  # GET PDF download
│   │       │       │   ├── email/
│   │       │       │   │   └── route.ts  # POST send via email
│   │       │       │   └── regenerate/
│   │       │       │       └── route.ts  # POST regenerate payslip
│   │       │       └── settings/
│   │       │           └── route.ts   # GET, PUT payslip automation settings
│   │       ├── notifications/
│   │       │   └── route.ts
│   │       └── reports/
│   │           ├── route.ts
│   │           └── payslips/          # 🆕 NEW - Payslip reporting API
│   │               ├── route.ts       # GET payslip analytics
│   │               ├── generation/
│   │               │   └── route.ts   # GET generation statistics
│   │               ├── delivery/
│   │               │   └── route.ts   # GET delivery statistics
│   │               └── reconciliation/
│   │                   └── route.ts   # GET reconciliation data
│   │
│   ├── components/
│   │   ├── ui/                        # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── table.tsx
│   │   │   ├── card.tsx
│   │   │   ├── pdf-viewer.tsx         # 🆕 NEW - PDF preview component
│   │   │   ├── file-upload.tsx        # 🆕 NEW - Template upload
│   │   │   └── index.ts
│   │   ├── layout/                    # Layout system components
│   │   │   ├── layout-context.tsx     # ✅ COMPLETED - Centralized layout state
│   │   │   ├── header.tsx             # ✅ COMPLETED - Moved from dashboard/header.tsx
│   │   │   ├── sidebar.tsx            # ✅ COMPLETED - Unified sidebar component
│   │   │   └── dashboard-layout.tsx   # ✅ COMPLETED - Unified dashboard layout
│   │   ├── auth/                      # Auth-specific components
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   └── auth-guard.tsx
│   │   ├── dashboard/                 # Dashboard-specific components
│   │   │   ├── stats-card.tsx
│   │   │   ├── quick-actions.tsx
│   │   │   └── recent-activity.tsx
│   │   ├── clients/                   # Client-specific components
│   │   │   ├── client-list.tsx
│   │   │   ├── client-card.tsx
│   │   │   ├── client-form.tsx
│   │   │   └── client-search.tsx
│   │   ├── policies/                  # Policy-specific components
│   │   │   ├── policy-list.tsx
│   │   │   ├── policy-card.tsx
│   │   │   ├── policy-form.tsx
│   │   │   └── policy-status.tsx
│   │   ├── claims/                    # Claims-specific components
│   │   │   ├── claim-list.tsx
│   │   │   ├── claim-card.tsx
│   │   │   └── claim-form.tsx
│   │   ├── payments/                  # 🆕 NEW - Payment & Payslip components
│   │   │   ├── payment-list.tsx       # Enhanced with payslip actions
│   │   │   ├── payment-card.tsx
│   │   │   ├── payment-form.tsx
│   │   │   ├── payslip-generator.tsx  # Bulk payslip generation interface
│   │   │   ├── payslip-preview.tsx    # PDF preview with zoom/download
│   │   │   ├── payslip-template-editor.tsx  # Visual template editor
│   │   │   ├── payslip-list.tsx       # Payslip history table
│   │   │   ├── payslip-card.tsx       # Individual payslip display
│   │   │   ├── payslip-form.tsx       # Manual payslip creation/edit
│   │   │   ├── payslip-status.tsx     # Status indicators and actions
│   │   │   ├── payslip-settings.tsx   # Automation and template settings
│   │   │   ├── payment-to-payslip.tsx # Convert payment to payslip
│   │   │   └── bulk-actions.tsx       # Bulk operations component
│   │   ├── reports/                   # 🆕 NEW - Enhanced reporting components
│   │   │   ├── payslip-analytics.tsx  # Charts and statistics
│   │   │   ├── generation-stats.tsx   # Generation performance metrics
│   │   │   ├── delivery-tracking.tsx  # Email delivery and download tracking
│   │   │   └── reconciliation-table.tsx  # Payment vs payslip matching
│   │   └── shared/                    # Shared components
│   │       ├── navigation.tsx
│   │       ├── breadcrumbs.tsx
│   │       ├── pagination.tsx
│   │       ├── loading-spinner.tsx
│   │       ├── date-range-picker.tsx  # 🆕 NEW - For reports and filtering
│   │       ├── export-options.tsx     # 🆕 NEW - Export data functionality
│   │       └── confirmation-modal.tsx # 🆕 NEW - Confirmation dialogs
│   │
│   ├── lib/                           # Utility functions and configurations
│   │   ├── auth.ts                    # Authentication logic
│   │   ├── database.ts                # Database connection
│   │   ├── validations.ts             # Form validations
│   │   ├── utils.ts                   # General utilities
│   │   ├── constants.ts               # App constants
│   │   ├── types.ts                   # TypeScript types
│   │   ├── pdf-generator.ts           # 🆕 NEW - PDF generation utilities
│   │   ├── payslip-templates.ts       # 🆕 NEW - Template management
│   │   ├── email-service.ts           # 🆕 NEW - Email sending service
│   │   └── file-storage.ts            # 🆕 NEW - File upload/storage utilities
│   │
│   ├── hooks/                         # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useClients.ts              # ⚠️ REQUIRED - For policy forms
│   │   ├── usePolicies.ts             # ✅ EXISTS - Policy management
│   │   ├── useClaims.ts
│   │   ├── usePayments.ts             # 🆕 NEW - Payment management
│   │   ├── usePayslips.ts             # 🆕 NEW - Payslip operations
│   │   ├── usePayslipGeneration.ts    # 🆕 NEW - Generation workflows
│   │   ├── usePayslipTemplates.ts     # 🆕 NEW - Template management
│   │   ├── usePDFGeneration.ts        # 🆕 NEW - PDF creation utilities
│   │   ├── useFileUpload.ts           # 🆕 NEW - File handling
│   │   └── useLocalStorage.ts
│   │
│   ├── context/                       # React Context providers
│   │   ├── auth-context.tsx
│   │   ├── theme-context.tsx          # ✅ COMPLETED - Theme management
│   │   ├── notification-context.tsx
│   │   └── payslip-context.tsx        # 🆕 NEW - Payslip state management
│   │
│   └── styles/                        # Additional styles
│       ├── components.css
│       ├── utilities.css
│       └── payslip-templates.css      # 🆕 NEW - Payslip styling
│
├── .env.local                         # ✅ CONFIGURED - Supabase credentials
├── .env.example
├── .gitignore
├── next.config.js
├── package.json                       # 🆕 UPDATED - New dependencies needed
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🆕 New Dependencies Required

```json
{
  "dependencies": {
    "@react-pdf/renderer": "^3.1.14",
    "puppeteer": "^21.3.6",
    "jspdf": "^2.5.1",
    "html2canvas": "^1.4.1",
    "nodemailer": "^6.9.7",
    "@types/nodemailer": "^6.4.13",
    "multer": "^1.4.5-lts.1",
    "@types/multer": "^1.4.8"
  }
}
```

## Status Update - September 13, 2025

### ✅ Previously Completed

- **Policy Management System** (September 10, 2025) - Full CRUD with details view
- **Layout System** (September 8, 2025) - Responsive layout with theme management

### 🆕 New Payslip Generation System Structure

**Core Features Added:**

1. **Payslip Management Hub** - Central location for all payslip operations
2. **Template System** - Customizable payslip templates with visual editor
3. **Bulk Generation** - Generate multiple payslips from payment selections
4. **PDF Generation** - Multiple PDF creation methods (Puppeteer, jsPDF, React-PDF)
5. **Email Integration** - Send payslips directly to clients
6. **Analytics & Reporting** - Track payslip generation and delivery statistics
7. **Automation Settings** - Configure automatic payslip generation rules

**Integration Points:**

- **Payment Management** - Generate payslips from existing payments
- **Client Management** - Client-specific payslip history
- **Policy Management** - Policy-related payment slips
- **Claims Management** - Settlement payslips for claims
- **Reporting System** - Comprehensive payslip analytics

**Key Navigation Enhancements:**

- "Generate Payslips" in sidebar → `/dashboard/payment-management/payslips`
- Payslip actions integrated into payment list
- Template management for customization
- Bulk operations for efficiency

### 🎯 Implementation Roadmap

**Phase 1 - Foundation (Week 1)**

- Basic payslip data models and API endpoints
- Simple PDF generation from payments
- Individual payslip preview and download

**Phase 2 - Management Features (Week 2)**

- Payslip dashboard and history
- Template system with basic customization
- Bulk generation interface

**Phase 3 - Advanced Features (Week 3)**

- Email integration for sending payslips
- Advanced template editor
- Automation rules and settings

**Phase 4 - Analytics & Optimization (Week 4)**

- Comprehensive reporting dashboard
- Performance optimization
- Advanced reconciliation features

This structure transforms your payment management system into a comprehensive financial documentation platform, providing professional payslip generation capabilities that integrate seamlessly with your existing insurance management workflow.
