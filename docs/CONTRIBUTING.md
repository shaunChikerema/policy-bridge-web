# Contributing to PolicyBridge 🇧🇼

> **Welcome to Africa's Most Advanced Insurance Management Platform**

Thank you for your interest in contributing to PolicyBridge! We're building the future of insurance technology in Africa, starting in Botswana and expanding across the continent. Every contribution helps us democratize access to professional insurance management tools.

## 🌍 Our Mission

**"Democratizing access to professional insurance management tools across Africa, starting with Botswana's vibrant insurance sector."**

We believe that every insurance professional in Africa deserves access to world-class technology that enhances their ability to serve clients, grow their business, and contribute to the continent's economic development.

## 🎯 Ways to Contribute

### 🐛 Bug Reports
Found a bug? Help us improve by reporting it! Before creating a bug report, please:
- Check existing issues to avoid duplicates
- Use the bug report template
- Include detailed reproduction steps
- Provide environment information (browser, OS, device)

### ✨ Feature Requests
Have an idea for a new feature? We'd love to hear it! Please:
- Check if the feature has already been requested
- Use the feature request template
- Explain the use case and business value
- Consider the African market context

### 🔧 Code Contributions
Ready to contribute code? Fantastic! We welcome:
- Bug fixes and performance improvements
- New features and enhancements
- Documentation improvements
- Test coverage expansion
- Accessibility improvements
- Mobile optimization

### 📚 Documentation
Help us improve our documentation:
- API documentation
- User guides and tutorials
- Developer onboarding materials
- Code comments and inline documentation
- Translation and localization

## 🚀 Getting Started

### Prerequisites
Before you begin, ensure you have:
- **Node.js** 18.17 or later
- **npm** or **yarn** package manager
- **Git** for version control
- **Supabase** account ([supabase.com](https://supabase.com))
- Basic knowledge of TypeScript, React, and Next.js

### Development Environment Setup

1. **Fork & Clone the Repository**
   ```bash
   # Fork the repository on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/policy-bridge-web.git
   cd policy-bridge-web
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your development credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Database Setup**
   ```bash
   # Initialize Supabase locally (optional)
   npx supabase init
   npx supabase start
   
   # Or connect to your Supabase project
   npx supabase db reset
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Verify Setup**
   - Open [http://localhost:3000](http://localhost:3000)
   - Verify all features work correctly
   - Run tests: `npm test`

## 📋 Development Guidelines

### Code Style & Standards

We maintain high code quality standards to ensure consistency and maintainability:

**TypeScript Standards**
- Use TypeScript strict mode
- Define proper interfaces and types
- Avoid `any` types - use proper typing
- Use type imports where appropriate

**React & Next.js Best Practices**
- Use functional components with hooks
- Implement proper error boundaries
- Optimize for performance (React.memo, useMemo, useCallback)
- Follow Next.js App Router conventions
- Use server components where appropriate

**Styling Guidelines**
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain consistent design system
- Use CSS variables for theme values
- Avoid inline styles

**Code Organization**
```
src/
├── app/                    # Next.js App Router
├── components/             # Reusable React components
│   ├── ui/                # Base UI components
│   ├── forms/             # Form components
│   └── layout/            # Layout components
├── lib/                   # Utilities and configurations
├── types/                 # TypeScript type definitions
├── hooks/                 # Custom React hooks
├── utils/                 # Helper functions
└── constants/             # Application constants
```

### Naming Conventions

**Files & Directories**
- Use kebab-case for file and directory names
- Component files should use PascalCase: `PolicyCard.tsx`
- Utility files should use camelCase: `formatCurrency.ts`

**Variables & Functions**
- Use camelCase for variables and functions
- Use PascalCase for components and classes
- Use UPPER_SNAKE_CASE for constants
- Use descriptive names that reflect African context

**Git Branches**
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/documentation-update` - Documentation changes

### Commit Message Standards

We use [Conventional Commits](https://www.conventionalcommits.org/) for clear and consistent commit messages:

**Format:**
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**
```bash
feat(dashboard): add policy analytics widget
fix(auth): resolve login redirect issue
docs(contributing): update development setup guide
style(ui): improve mobile responsive design
refactor(api): optimize database queries for performance
test(policy): add unit tests for policy validation
chore(deps): update dependencies to latest versions
```

## 🔍 Pull Request Process

### Before Submitting a PR

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Write Quality Code**
   - Follow our coding standards
   - Add appropriate comments
   - Ensure TypeScript compilation
   - Test your changes thoroughly

3. **Run Quality Checks**
   ```bash
   # Run tests
   npm test
   
   # Check TypeScript compilation
   npm run type-check
   
   # Run linting
   npm run lint
   
   # Format code
   npm run format
   
   # Build the application
   npm run build
   ```

4. **Update Documentation**
   - Update relevant documentation
   - Add JSDoc comments for new functions
   - Update API documentation if applicable

### Submitting Your PR

1. **Push Your Branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Use our PR template
   - Provide clear title and description
   - Reference related issues
   - Include screenshots for UI changes
   - Add African market context if relevant

3. **PR Title Format**
   ```
   feat(scope): brief description of changes
   ```

4. **PR Description Template**
   ```markdown
   ## 🎯 What this PR does
   Brief description of the changes

   ## 🔗 Related Issues
   Fixes #123
   Related to #456

   ## 🧪 Testing
   - [ ] Unit tests added/updated
   - [ ] Integration tests passing
   - [ ] Manual testing completed
   - [ ] Mobile responsive tested

   ## 📱 Screenshots (if applicable)
   Before/after screenshots for UI changes

   ## 🌍 African Market Context
   How this change benefits African insurance professionals

   ## ✅ Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] Tests added/updated
   - [ ] No breaking changes
   ```

### PR Review Process

1. **Automated Checks**
   - All CI/CD checks must pass
   - Code coverage must maintain >80%
   - Performance benchmarks must be met
   - Security scans must pass

2. **Code Review**
   - At least one core team member review required
   - Address all review comments
   - Make requested changes promptly
   - Keep discussions professional and constructive

3. **Approval & Merge**
   - PR approved by maintainers
   - All checks passing
   - No merge conflicts
   - Squash and merge preferred

## 🧪 Testing Guidelines

### Test Coverage Requirements

We maintain high test coverage to ensure platform reliability:
- **Unit Tests:** >80% coverage for utilities and business logic
- **Integration Tests:** Critical user workflows
- **End-to-End Tests:** Core insurance broker workflows
- **Performance Tests:** API response times and load testing

### Testing Framework

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --testNamePattern="PolicyCard"

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

### Writing Good Tests

**Unit Test Example:**
```typescript
// utils/formatCurrency.test.ts
import { formatCurrency } from './formatCurrency';

describe('formatCurrency', () => {
  it('should format Botswana Pula correctly', () => {
    expect(formatCurrency(1234.56, 'BWP')).toBe('P 1,234.56');
  });

  it('should handle zero values', () => {
    expect(formatCurrency(0, 'BWP')).toBe('P 0.00');
  });
});
```

**Component Test Example:**
```typescript
// components/PolicyCard.test.tsx
import { render, screen } from '@testing-library/react';
import { PolicyCard } from './PolicyCard';

describe('PolicyCard', () => {
  const mockPolicy = {
    id: '1',
    policyNumber: 'POL-001',
    clientName: 'John Doe',
    premium: 1500,
    currency: 'BWP'
  };

  it('should display policy information correctly', () => {
    render(<PolicyCard policy={mockPolicy} />);
    
    expect(screen.getByText('POL-001')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('P 1,500.00')).toBeInTheDocument();
  });
});
```

## 🔒 Security Considerations

### Security Best Practices

When contributing to PolicyBridge, please follow these security guidelines:

**Data Protection**
- Never commit sensitive data (API keys, passwords, personal information)
- Use environment variables for configuration
- Implement proper input validation
- Sanitize user inputs to prevent XSS
- Use parameterized queries to prevent SQL injection

**Authentication & Authorization**
- Implement proper access controls
- Use secure session management
- Follow principle of least privilege
- Validate user permissions on server-side

**African Market Compliance**
- Ensure GDPR compliance for data protection
- Follow local regulatory requirements
- Implement audit trails for compliance
- Use encryption for sensitive data

### Reporting Security Issues

If you discover a security vulnerability, please:
1. **DO NOT** create a public GitHub issue
2. Email security@policybridge.com with details
3. Allow 90 days for response and fix
4. We'll acknowledge receipt within 48 hours

## 🌍 African Market Focus

### Localization Guidelines

When contributing features, consider African market needs:

**Currency Support**
- Primary: Botswana Pula (P)
- Secondary: USD, ZAR, EUR
- Format numbers according to local conventions

**Language Support**
- Primary: English
- Future: Setswana, Afrikaans, French
- Use internationalization (i18n) patterns

**Connectivity Considerations**
- Optimize for slower internet connections
- Implement offline functionality where possible
- Use progressive loading and caching
- Minimize bundle sizes

**Cultural Sensitivity**
- Use appropriate imagery and examples
- Consider local business practices
- Respect cultural nuances in UX design
- Include diverse representation

### Regional Compliance

**Regulatory Awareness**
- Bank of Botswana (BOB) requirements
- NBFIRA insurance regulations
- GDPR-style data protection
- Local tax and reporting requirements

**Integration Considerations**
- Local banking systems (FNB, Standard Chartered)
- Mobile money platforms (Orange Money, MyZaka)
- Government reporting systems
- Insurance company APIs

## 📊 Performance Standards

### Performance Requirements

All contributions must meet these performance standards:

**Loading Performance**
- Page load time: <2 seconds on 3G networks
- API response time: <500ms average
- Bundle size: Minimize JavaScript payload
- Core Web Vitals: All metrics in "Good" range

**Mobile Performance**
- Mobile-first responsive design
- Touch-friendly interfaces
- Offline functionality for core features
- Progressive Web App capabilities

**Monitoring & Analytics**
- Performance monitoring integration
- Error tracking and reporting
- User analytics (privacy-focused)
- Resource usage optimization

### Performance Testing

```bash
# Run performance tests
npm run perf

# Analyze bundle size
npm run analyze

# Lighthouse audit
npm run lighthouse

# Load testing
npm run load-test
```

## 🤝 Community Guidelines

### Code of Conduct

We are committed to providing a welcoming and inclusive environment:

**Our Standards**
- Use welcoming and inclusive language
- Respect different viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

**Unacceptable Behavior**
- Harassment or discriminatory language
- Personal attacks or trolling
- Public or private harassment
- Publishing private information
- Unprofessional conduct

### Communication Channels

**Development Discussions**
- GitHub Issues: Bug reports and feature requests
- GitHub Discussions: General development topics
- Pull Request Reviews: Code-specific feedback

**Community Support**
- Email: hello@policybridge.com
- Community Forum: (Coming soon)
- Documentation: In-repo docs and wiki

### Recognition & Attribution

We value all contributions and provide recognition:
- Contributors listed in CONTRIBUTORS.md
- Significant contributions highlighted in releases
- Community spotlight in newsletters
- Annual contributor appreciation events

## 📈 Development Roadmap Alignment

### Current Priorities (2-Week MVP)

High-priority contribution areas:
- **Dashboard Foundation:** Core UI components and layouts
- **Policy Management:** CRUD operations and validation
- **Client Management:** Database design and API endpoints
- **Mobile Optimization:** Responsive design improvements

### Phase 1 Goals (Months 1-2)

Focus areas for contributors:
- **Advanced Features:** Claims management, analytics
- **Integrations:** Local insurance company APIs
- **Performance:** Optimization and caching
- **Testing:** Automated test coverage expansion

### Long-term Vision

Future contribution opportunities:
- **AI/ML Integration:** Predictive analytics and automation
- **Mobile Apps:** Native iOS and Android applications
- **Blockchain:** Smart contracts and decentralized features
- **Continental Expansion:** Multi-country localization

## 📚 Learning Resources

### Technology Stack Learning

**Next.js & React**
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

**Supabase & PostgreSQL**
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/)
- [SQL Learning Resources](https://www.w3schools.com/sql/)

**Tailwind CSS**
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com)

### African Insurance Industry

**Market Understanding**
- Insurance industry reports for Botswana
- Regulatory frameworks (NBFIRA)
- Local business practices and customs
- Regional expansion opportunities

**Compliance & Regulations**
- Data protection laws (GDPR, POPIA)
- Financial services regulations
- Insurance industry standards
- Cross-border compliance requirements

## 🎉 Recognition & Rewards

### Contributor Benefits

**Development Benefits**
- Early access to new features
- Direct input on product roadmap
- Networking with African tech professionals
- Portfolio building opportunities

**Community Recognition**
- Contributor highlights in newsletters
- Speaking opportunities at events
- Mentorship program participation
- Annual contributor appreciation

**Career Development**
- Potential full-time opportunities
- Freelance project opportunities
- Reference letters and recommendations
- Industry networking connections

### Contribution Levels

**Bronze Contributors** (1-5 merged PRs)
- Listed in CONTRIBUTORS.md
- Community Discord access
- Beta feature access

**Silver Contributors** (6-15 merged PRs)
- Quarterly virtual meetups
- Direct feedback channel to product team
- Early access to new initiatives

**Gold Contributors** (16+ merged PRs)
- Annual contributor summit invitation
- Product roadmap consultation access
- Potential advisory role opportunities

## 📞 Getting Help

### Need Support?

**Technical Questions**
- GitHub Discussions for general questions
- Stack Overflow with `policybridge` tag
- Documentation wiki for detailed guides

**Contribution Guidance**
- Review existing issues and PRs
- Check documentation for patterns
- Reach out to maintainers for guidance

**Community Support**
- Email: contributors@policybridge.com
- Community forums (coming soon)
- Developer office hours (monthly)

### Maintainer Team

**Core Team**
- **Founder/CEO:** Strategic direction and product vision
- **CTO:** Technical architecture and code review
- **Lead Developer:** Day-to-day development and mentoring
- **Community Manager:** Contributor support and recognition

**Response Times**
- Issue responses: Within 48 hours
- PR reviews: Within 72 hours
- Security issues: Within 24 hours
- General questions: Within 5 business days

## 🚀 Ready to Contribute?

Thank you for taking the time to read our contributing guidelines! We're excited to have you join our mission to transform insurance technology in Africa.

### Next Steps

1. **Set up your development environment** following our setup guide
2. **Browse open issues** labeled "good first issue" or "help wanted"
3. **Join our community discussions** to introduce yourself
4. **Start with a small contribution** to get familiar with our process
5. **Ask questions** - we're here to help!

### Quick Start Checklist

- [ ] Fork and clone the repository
- [ ] Set up development environment
- [ ] Read and understand our code standards
- [ ] Find a good first issue to work on
- [ ] Create a feature branch
- [ ] Make your changes with tests
- [ ] Submit a pull request

---

**Made with ❤️ in Gaborone, Botswana 🇧🇼**

*"Every line of code you contribute helps democratize access to professional insurance tools across Africa. Together, we're building the future of African insurance technology."*

---

### Quick Links
- [🏠 Repository Home](https://github.com/shaunChikerema/policy-bridge-web)
- [🐛 Report Bug](https://github.com/shaunChikerema/policy-bridge-web/issues/new?template=bug_report.md)
- [✨ Request Feature](https://github.com/shaunChikerema/policy-bridge-web/issues/new?template=feature_request.md)
- [💬 Discussions](https://github.com/shaunChikerema/policy-bridge-web/discussions)
- [📚 Documentation](./docs/README.md)
- [🚀 Live Demo](https://policybridge.vercel.app)

---

*Last updated: August 03, 2025 | Version: 1.0 | Next review: Monthly*