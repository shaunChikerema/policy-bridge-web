# PolicyBridge API Documentation

> **Comprehensive API reference for Africa's most advanced insurance management platform**

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL & Versioning](#base-url--versioning)
4. [Request/Response Format](#requestresponse-format)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [API Endpoints](#api-endpoints)
   - [Authentication](#authentication-endpoints)
   - [Companies](#companies)
   - [Profiles](#profiles)
   - [Clients](#clients)
   - [Policies](#policies)
   - [Claims](#claims)
   - [Communications](#communications)
   - [Analytics](#analytics)
   - [Search](#search)
8. [Webhooks](#webhooks)
9. [SDK & Libraries](#sdk--libraries)
10. [Examples](#examples)

## 🎯 Overview

The PolicyBridge API provides programmatic access to all insurance management features. Built on Next.js 14 with Supabase PostgreSQL, it offers real-time capabilities, robust security, and African market-specific features.

### Key Features
- **RESTful Design:** Standard HTTP methods and status codes
- **Real-time Updates:** WebSocket connections for live data
- **Multi-tenant:** Company-based data isolation with Row Level Security
- **Type-safe:** Full TypeScript definitions available
- **African-focused:** Localized for Botswana and expanding across Africa

### Supported Operations
- Complete CRUD operations for all entities
- Advanced search and filtering
- Real-time subscriptions
- File uploads and document management
- Analytics and reporting
- Bulk operations for enterprise clients

## 🔐 Authentication

PolicyBridge uses Supabase Auth with JWT tokens for secure API access.

### Authentication Flow

```typescript
// 1. Sign in to get access token
POST /api/auth/signin
{
  "email": "user@company.co.bw",
  "password": "secure_password"
}

// Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "...",
  "expires_in": 3600,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@company.co.bw",
    "role": "agent"
  }
}
```

### Authorization Header

All API requests must include the JWT token:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Refresh

```typescript
POST /api/auth/refresh
{
  "refresh_token": "refresh_token_here"
}
```

## 🌐 Base URL & Versioning

### Production
```
https://api.policybridge.com/v1
```

### Staging
```
https://staging-api.policybridge.com/v1
```

### Development
```
http://localhost:3000/api/v1
```

### Versioning Strategy
- **Current Version:** `v1`
- **Deprecation Policy:** 12 months notice for breaking changes
- **Version Header:** `API-Version: v1` (optional, defaults to latest)

## 📨 Request/Response Format

### Content Type
All requests and responses use JSON:
```http
Content-Type: application/json
```

### Standard Request Structure
```typescript
{
  "data": {
    // Request payload
  },
  "meta": {
    "company_id": "uuid",
    "request_id": "uuid",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Standard Response Structure
```typescript
{
  "data": {
    // Response payload
  },
  "meta": {
    "request_id": "uuid",
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "v1"
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### Error Response Structure
```typescript
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "request_id": "uuid",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## ⚠️ Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| `200` | OK | Request successful |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid request data |
| `401` | Unauthorized | Invalid or missing authentication |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource not found |
| `409` | Conflict | Resource conflict (e.g., duplicate) |
| `422` | Unprocessable Entity | Validation errors |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error |

### Error Codes

| Code | Description | Action |
|------|-------------|--------|
| `INVALID_TOKEN` | JWT token invalid or expired | Refresh token or re-authenticate |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions | Contact administrator |
| `VALIDATION_ERROR` | Request data validation failed | Fix validation errors |
| `RESOURCE_NOT_FOUND` | Requested resource doesn't exist | Check resource ID |
| `COMPANY_MISMATCH` | Resource belongs to different company | Verify company context |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Wait before retrying |

## 🚦 Rate Limiting

### Limits by Plan

| Plan | Requests/Hour | Burst Limit | Real-time Connections |
|------|---------------|-------------|----------------------|
| **Basic** | 1,000 | 50/minute | 5 |
| **Professional** | 5,000 | 100/minute | 20 |
| **Enterprise** | 25,000 | 500/minute | 100 |

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1641024000
```

### Rate Limit Response
```typescript
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Limit: 1000/hour",
    "retry_after": 3600
  }
}
```

## 🔗 API Endpoints

### Authentication Endpoints

#### POST /api/auth/signin
Sign in user and return JWT tokens.

**Request:**
```typescript
{
  "email": "user@company.co.bw",
  "password": "secure_password"
}
```

**Response:**
```typescript
{
  "data": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_in": 3600,
    "user": {
      "id": "uuid",
      "email": "user@company.co.bw",
      "first_name": "John",
      "last_name": "Mogale",
      "role": "agent",
      "company_id": "uuid"
    }
  }
}
```

#### POST /api/auth/signup
Register new user account.

**Request:**
```typescript
{
  "email": "newuser@company.co.bw",
  "password": "secure_password",
  "first_name": "Mary",
  "last_name": "Setlhare",
  "company_name": "Gaborone Insurance Brokers",
  "phone": "+267 123 4567"
}
```

#### POST /api/auth/refresh
Refresh access token using refresh token.

#### POST /api/auth/logout
Invalidate current session.

#### POST /api/auth/forgot-password
Send password reset email.

#### POST /api/auth/reset-password
Reset password using reset token.

### Companies

#### GET /api/companies/me
Get current user's company information.

**Response:**
```typescript
{
  "data": {
    "id": "uuid",
    "name": "Gaborone Insurance Brokers",
    "registration_number": "BW2024001",
    "email": "info@gabinsurance.bw",
    "phone": "+267 123 4567",
    "settings": {
      "default_currency": "BWP",
      "timezone": "Africa/Gaborone"
    },
    "subscription_plan": "professional",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### PUT /api/companies/me
Update company information.

#### GET /api/companies/settings
Get company settings.

#### PUT /api/companies/settings
Update company settings.

### Profiles

#### GET /api/profiles
Get all profiles in company.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `role` (string): Filter by role
- `search` (string): Search by name or email
- `is_active` (boolean): Filter by active status

**Response:**
```typescript
{
  "data": [
    {
      "id": "uuid",
      "email": "agent@company.co.bw",
      "first_name": "David",
      "last_name": "Kgosi",
      "role": "agent",
      "is_active": true,
      "last_seen_at": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "pages": 1
  }
}
```

#### GET /api/profiles/:id
Get specific profile by ID.

#### POST /api/profiles
Create new profile.

**Request:**
```typescript
{
  "email": "newagent@company.co.bw",
  "first_name": "Sarah",
  "last_name": "Molefe",
  "role": "agent",
  "phone": "+267 123 4571"
}
```

#### PUT /api/profiles/:id
Update profile information.

#### DELETE /api/profiles/:id
Deactivate profile (soft delete).

### Clients

#### GET /api/clients
Get all clients in company.

**Query Parameters:**
- `page`, `limit`: Pagination
- `type` (string): Filter by client type (individual, corporate, sme, government)
- `status` (string): Filter by status (prospect, active, inactive, suspended, churned)
- `search` (string): Search across name, email, phone
- `agent_id` (uuid): Filter by assigned agent
- `created_after` (date): Filter by creation date
- `tags` (string[]): Filter by tags

**Response:**
```typescript
{
  "data": [
    {
      "id": "uuid",
      "client_type": "individual",
      "first_name": "Thabo",
      "last_name": "Mokoena",
      "email": "thabo@email.com",
      "phone": "+267 711 23456",
      "status": "active",
      "assigned_agent_id": "uuid",
      "assigned_agent_name": "David Kgosi",
      "policy_count": 3,
      "total_premium": 15000.00,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### GET /api/clients/:id
Get specific client with full details.

**Response:**
```typescript
{
  "data": {
    "id": "uuid",
    "client_type": "individual",
    "first_name": "Thabo",
    "last_name": "Mokoena",
    "email": "thabo@email.com",
    "phone": "+267 711 23456",
    "address": {
      "street": "Plot 123, Extension 10",
      "city": "Gaborone",
      "postal_code": "00000",
      "country": "Botswana"
    },
    "status": "active",
    "assigned_agent": {
      "id": "uuid",
      "name": "David Kgosi",
      "email": "david@company.co.bw"
    },
    "policies": [
      {
        "id": "uuid",
        "policy_number": "GIB-MOT-2024-0001",
        "policy_type": "motor",
        "status": "active",
        "premium_amount": 4500.00
      }
    ],
    "recent_activities": [
      {
        "id": "uuid",
        "type": "communication",
        "description": "Policy renewal discussion",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### POST /api/clients
Create new client.

**Request:**
```typescript
{
  "client_type": "individual",
  "first_name": "New",
  "last_name": "Client",
  "email": "newclient@email.com",
  "phone": "+267 711 23457",
  "address": {
    "street": "Plot 456, Block 8",
    "city": "Gaborone",
    "country": "Botswana"
  },
  "assigned_agent_id": "uuid",
  "tags": ["referral", "high-value"]
}
```

#### PUT /api/clients/:id
Update client information.

#### DELETE /api/clients/:id
Soft delete client.

#### GET /api/clients/:id/policies
Get all policies for a client.

#### GET /api/clients/:id/activities
Get activity history for a client.

#### POST /api/clients/:id/activities
Add new activity for client.

### Policies

#### GET /api/policies
Get all policies in company.

**Query Parameters:**
- Standard pagination parameters
- `type` (string): Filter by policy type
- `status` (string): Filter by status
- `client_id` (uuid): Filter by client
- `agent_id` (uuid): Filter by agent
- `insurer_id` (uuid): Filter by insurer
- `expiring_within` (number): Days until expiry
- `premium_min`, `premium_max` (number): Premium range
- `effective_date_from`, `effective_date_to` (date): Date range

**Response:**
```typescript
{
  "data": [
    {
      "id": "uuid",
      "policy_number": "GIB-MOT-2024-0001",
      "policy_type": "motor",
      "product_name": "Comprehensive Motor Insurance",
      "client": {
        "id": "uuid",
        "name": "Thabo Mokoena",
        "email": "thabo@email.com"
      },
      "insurer": {
        "id": "uuid",
        "name": "Old Mutual Botswana"
      },
      "coverage_amount": 150000.00,
      "premium_amount": 4500.00,
      "status": "active",
      "effective_date": "2024-01-01",
      "expiry_date": "2024-12-31",
      "days_to_expiry": 320
    }
  ]
}
```

#### GET /api/policies/:id
Get specific policy with full details.

#### POST /api/policies
Create new policy.

**Request:**
```typescript
{
  "client_id": "uuid",
  "policy_type": "motor",
  "product_name": "Comprehensive Motor Insurance",
  "insurer_id": "uuid",
  "coverage_amount": 150000.00,
  "premium_amount": 4500.00,
  "commission_rate": 0.15,
  "effective_date": "2024-01-01",
  "expiry_date": "2024-12-31",
  "payment_frequency": "annual",
  "coverage_details": {
    "vehicle_make": "Toyota",
    "vehicle_model": "Corolla",
    "vehicle_year": 2020,
    "license_plate": "B123ABC"
  }
}
```

#### PUT /api/policies/:id
Update policy information.

#### DELETE /api/policies/:id
Cancel policy (soft delete).

#### POST /api/policies/:id/renew
Initiate policy renewal.

**Request:**
```typescript
{
  "new_premium": 4725.00,
  "adjustment_reason": "Claims experience adjustment",
  "renewal_date": "2025-01-01"
}
```

#### GET /api/policies/expiring
Get policies expiring within specified timeframe.

**Query Parameters:**
- `days` (number): Days ahead to check (default: 30)

### Claims

#### GET /api/claims
Get all claims in company.

**Query Parameters:**
- Standard pagination and search
- `status` (string): Filter by claim status
- `policy_id` (uuid): Filter by policy
- `client_id` (uuid): Filter by client
- `priority` (string): Filter by priority
- `incident_date_from`, `incident_date_to` (date): Date range
- `amount_min`, `amount_max` (number): Claim amount range

**Response:**
```typescript
{
  "data": [
    {
      "id": "uuid",
      "claim_number": "CLM-2024-0001",
      "policy": {
        "id": "uuid",
        "policy_number": "GIB-MOT-2024-0001",
        "product_name": "Comprehensive Motor Insurance"
      },
      "client": {
        "id": "uuid",
        "name": "Thabo Mokoena"
      },
      "incident_date": "2024-01-10",
      "reported_date": "2024-01-11",
      "claim_amount": 25000.00,
      "status": "investigating",
      "priority": "medium",
      "days_open": 5
    }
  ]
}
```

#### GET /api/claims/:id
Get specific claim with full details.

#### POST /api/claims
Create new claim.

**Request:**
```typescript
{
  "policy_id": "uuid",
  "incident_date": "2024-01-10",
  "claim_amount": 25000.00,
  "incident_type": "Motor Vehicle Accident",
  "incident_location": "A1 Highway, Gaborone",
  "incident_description": "Rear-end collision at traffic light",
  "police_report_number": "GC123456/2024"
}
```

#### PUT /api/claims/:id
Update claim information.

#### POST /api/claims/:id/activities
Add activity to claim.

#### GET /api/claims/:id/activities
Get claim activity history.

#### POST /api/claims/:id/documents
Upload claim documents.

### Communications

#### GET /api/communications
Get communication history.

**Query Parameters:**
- `client_id` (uuid): Filter by client
- `type` (string): Filter by type (email, sms, phone, meeting)
- `direction` (string): Filter by direction (inbound, outbound)
- `date_from`, `date_to` (date): Date range

#### POST /api/communications
Record new communication.

**Request:**
```typescript
{
  "client_id": "uuid",
  "type": "email",
  "direction": "outbound",
  "subject": "Policy Renewal Reminder",
  "content": "Your policy expires in 30 days...",
  "recipient": "client@email.com"
}
```

#### POST /api/communications/send-email
Send email to client.

#### POST /api/communications/send-sms
Send SMS to client.

### Analytics

#### GET /api/analytics/dashboard
Get dashboard metrics for current company.

**Response:**
```typescript
{
  "data": {
    "total_clients": 150,
    "active_policies": 280,
    "expiring_policies": 25,
    "open_claims": 12,
    "monthly_premium": 125000.00,
    "monthly_commission": 18750.00,
    "growth_metrics": {
      "new_clients_this_month": 8,
      "client_growth_percentage": 5.7,
      "premium_growth_percentage": 12.3
    }
  }
}
```

#### GET /api/analytics/revenue
Get revenue analytics.

**Query Parameters:**
- `period` (string): time period (monthly, quarterly, yearly)
- `start_date`, `end_date` (date): Date range

#### GET /api/analytics/policies
Get policy analytics.

#### GET /api/analytics/claims
Get claims analytics.

#### GET /api/analytics/performance
Get agent performance metrics.

### Search

#### GET /api/search
Universal search across all entities.

**Query Parameters:**
- `q` (string): Search query (required)
- `types` (string[]): Entity types to search (clients, policies, claims)
- `limit` (number): Maximum results (default: 20)

**Response:**
```typescript
{
  "data": {
    "clients": [
      {
        "id": "uuid",
        "type": "client",
        "name": "Thabo Mokoena",
        "email": "thabo@email.com",
        "relevance": 0.95
      }
    ],
    "policies": [
      {
        "id": "uuid",
        "type": "policy",
        "policy_number": "GIB-MOT-2024-0001",
        "client_name": "Thabo Mokoena",
        "relevance": 0.87
      }
    ],
    "claims": []
  },
  "meta": {
    "total_results": 2,
    "search_time_ms": 45
  }
}
```

## 📡 Webhooks

PolicyBridge supports webhooks to notify your applications of events in real-time.

### Configuration

Configure webhooks in your company settings:

```typescript
PUT /api/companies/settings
{
  "webhook_url": "https://your-app.com/webhooks/policybridge",
  "webhook_secret": "your_secret_key",
  "webhook_events": [
    "policy.created",
    "policy.renewed",
    "claim.created",
    "claim.settled"
  ]
}
```

### Webhook Events

| Event | Description | Payload |
|-------|-------------|---------|
| `policy.created` | New policy created | Policy object |
| `policy.updated` | Policy information updated | Policy object |
| `policy.renewed` | Policy renewed | Policy object |
| `policy.cancelled` | Policy cancelled | Policy object |
| `claim.created` | New claim filed | Claim object |
| `claim.updated` | Claim status updated | Claim object |
| `claim.settled` | Claim settled | Claim object |
| `client.created` | New client added | Client object |
| `client.updated` | Client information updated | Client object |

### Webhook Payload

```typescript
{
  "event": "policy.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "id": "uuid",
    "policy_number": "GIB-MOT-2024-0001",
    // ... full policy object
  },
  "company_id": "uuid"
}
```

### Webhook Security

Verify webhook authenticity using HMAC SHA256:

```typescript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const computedSignature = 'sha256=' + hmac.digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  );
}
```

## 📚 SDK & Libraries

### JavaScript/TypeScript SDK

```bash
npm install @policybridge/sdk
```

```typescript
import { PolicyBridge } from '@policybridge/sdk';

const pb = new PolicyBridge({
  apiKey: 'your_api_key',
  environment: 'production' // or 'staging'
});

// Get clients
const clients = await pb.clients.list({
  page: 1,
  limit: 20,
  status: 'active'
});

// Create policy
const policy = await pb.policies.create({
  client_id: 'uuid',
  policy_type: 'motor',
  premium_amount: 4500.00
});
```

### Python SDK

```bash
pip install policybridge-python
```

```python
from policybridge import PolicyBridge

pb = PolicyBridge(
    api_key='your_api_key',
    environment='production'
)

# Get clients
clients = pb.clients.list(
    page=1,
    limit=20,
    status='active'
)

# Create policy
policy = pb.policies.create({
    'client_id': 'uuid',
    'policy_type': 'motor',
    'premium_amount': 4500.00
})
```

### PHP SDK

```bash
composer require policybridge/php-sdk
```

```php
<?php
require_once 'vendor/autoload.php';

use PolicyBridge\PolicyBridge;

$pb = new PolicyBridge([
    'api_key' => 'your_api_key',
    'environment' => 'production'
]);

// Get clients
$clients = $pb->clients->list([
    'page' => 1,
    'limit' => 20,
    'status' => 'active'
]);
```

## 💡 Examples

### Complete Client Management Flow

```typescript
// 1. Create new client
const client = await fetch('/api/clients', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    client_type: 'individual',
    first_name: 'Neo',
    last_name: 'Tshwane',
    email: 'neo@email.com',
    phone: '+267 711 23458'
  })
});

const clientData = await client.json();

// 2. Create policy for client
const policy = await fetch('/api/policies', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    client_id: clientData.data.id,
    policy_type: 'motor',
    product_name: 'Comprehensive Motor Insurance',
    premium_amount: 4800.00,
    effective_date: '2024-02-01',
    expiry_date: '2025-01-31'
  })
});

// 3. Record communication
const communication = await fetch('/api/communications', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    client_id: clientData.data.id,
    type: 'email',
    direction: 'outbound',
    subject: 'Welcome and Policy Details',
    content: 'Welcome to our services. Please find your policy details attached.'
  })
});
```

### Real-time Policy Monitoring

```typescript
// Using Supabase real-time subscriptions
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(supabaseUrl, supabaseKey);

// Subscribe to policy changes
const policySubscription = supabase
  .channel('policies')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'policies',
      filter: `company_id=eq.${companyId}`
    },
    (payload) => {
      console.log('Policy updated:', payload);
      // Update UI with new policy data
      updatePolicyInUI(payload.new);
    }
  )
  .subscribe();

// Subscribe to claim updates
const claimSubscription = supabase
  .channel('claims')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'claims',
      filter: `company_id=eq.${companyId}`
    },
    (payload) => {
      if (payload.new.status !== payload.old.status) {
        showNotification(`Claim ${payload.new.claim_number} status changed to ${payload.new.status}`);
      }
    }
  )
  .subscribe();
```

### Bulk Operations

```typescript
// Bulk update policies
const bulkUpdate = await fetch('/api/policies/bulk', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    policy_ids: ['uuid1', 'uuid2', 'uuid3'],
    updates: {
      status: 'renewed',
      premium_amount: 5000.00
    }
  })
});

// Bulk export clients
const exportData = await fetch('/api/clients/export', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    format: 'csv',
    filters: {
      status: 'active',
      created_after: '2024-01-01'
    },
    fields: ['first_name', 'last_name', 'email', 'phone', 'total_premium']
  })
});
```

### Advanced Search

```typescript
// Multi-entity search with filters
const searchResults = await fetch('/api/search?' + new URLSearchParams({
  q: 'thabo motor',
  types: 'clients,policies',
  limit: '10'
}), {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});

// Advanced policy search
const policySearch = await fetch('/api/policies?' + new URLSearchParams({
  search: 'motor',
  status: 'active',
  expiring_within: '60',
  premium_min: '1000',
  premium_max: '10000',
  page: '1',
  limit: '20'
}), {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});
```

### Analytics Dashboard

```typescript
// Get comprehensive dashboard data
async function loadDashboard() {
  const [metrics, revenue, policies, claims] = await Promise.all([
    fetch('/api/analytics/dashboard', {
      headers: { 'Authorization': 'Bearer ' + token }
    }).then(r => r.json()),
    
    fetch('/api/analytics/revenue?period=monthly', {
      headers: { 'Authorization': 'Bearer ' + token }
    }).then(r => r.json()),
    
    fetch('/api/analytics/policies', {
      headers: { 'Authorization': 'Bearer ' + token }
    }).then(r => r.json()),
    
    fetch('/api/analytics/claims', {
      headers: { 'Authorization': 'Bearer ' + token }
    }).then(r => r.json())
  ]);

  return {
    metrics: metrics.data,
    revenue: revenue.data,
    policies: policies.data,
    claims: claims.data
  };
}

// Usage
const dashboardData = await loadDashboard();
console.log('Total clients:', dashboardData.metrics.total_clients);
console.log('Monthly revenue:', dashboardData.revenue.monthly_total);
```

### File Upload Example

```typescript
// Upload policy documents
const uploadDocument = async (policyId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('document_type', 'policy_certificate');
  formData.append('description', 'Policy certificate document');

  const response = await fetch(`/api/policies/${policyId}/documents`, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token
    },
    body: formData
  });

  return response.json();
};

// Usage
const fileInput = document.getElementById('file-upload') as HTMLInputElement;
const file = fileInput.files[0];
const result = await uploadDocument('policy-uuid', file);
```

## 🔧 Advanced Features

### Filtering and Sorting

Most list endpoints support advanced filtering and sorting:

```typescript
// Advanced client filtering
const clients = await fetch('/api/clients?' + new URLSearchParams({
  // Pagination
  page: '1',
  limit: '50',
  
  // Filters
  type: 'individual',
  status: 'active',
  agent_id: 'agent-uuid',
  created_after: '2024-01-01',
  created_before: '2024-12-31',
  has_policies: 'true',
  premium_min: '1000',
  tags: 'high-value,referral',
  
  // Search
  search: 'thabo gaborone',
  
  // Sorting
  sort: 'created_at',
  order: 'desc', // or 'asc'
  
  // Field selection
  fields: 'id,first_name,last_name,email,total_premium'
}), {
  headers: { 'Authorization': 'Bearer ' + token }
});
```

### Batch Operations

```typescript
// Batch create clients
const batchCreate = await fetch('/api/clients/batch', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    clients: [
      {
        client_type: 'individual',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com'
      },
      {
        client_type: 'individual',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com'
      }
    ]
  })
});

// Response includes success/failure for each item
const result = await batchCreate.json();
console.log('Created:', result.data.successful);
console.log('Failed:', result.data.failed);
```

### Data Export

```typescript
// Export policies to Excel
const exportPolicies = async (filters = {}) => {
  const response = await fetch('/api/policies/export', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      format: 'xlsx', // 'csv', 'xlsx', 'pdf'
      filters: filters,
      columns: [
        'policy_number',
        'client_name',
        'policy_type',
        'premium_amount',
        'status',
        'effective_date',
        'expiry_date'
      ],
      include_summary: true
    })
  });

  // Response will be a file download
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'policies_export.xlsx';
  a.click();
};
```

## 🚨 Error Handling Best Practices

### Comprehensive Error Handling

```typescript
class PolicyBridgeAPI {
  private async request(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        throw new RateLimitError(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
      }

      // Handle authentication errors
      if (response.status === 401) {
        await this.refreshToken();
        return this.request(endpoint, options); // Retry once
      }

      // Handle other errors
      if (!response.ok) {
        const errorData = await response.json();
        throw new APIError(errorData.error, response.status);
      }

      return response.json();
    } catch (error) {
      if (error instanceof APIError || error instanceof RateLimitError) {
        throw error;
      }
      throw new NetworkError('Network request failed', error);
    }
  }
}

// Custom error classes
class APIError extends Error {
  constructor(public errorData: any, public status: number) {
    super(errorData.message);
    this.name = 'APIError';
  }
}

class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

class NetworkError extends Error {
  constructor(message: string, public originalError: any) {
    super(message);
    this.name = 'NetworkError';
  }
}
```

### Retry Logic

```typescript
async function apiRequestWithRetry(
  requestFn: () => Promise<any>,
  maxRetries = 3,
  baseDelay = 1000
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      // Don't retry on client errors (4xx)
      if (error instanceof APIError && error.status >= 400 && error.status < 500) {
        throw error;
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Usage
const policies = await apiRequestWithRetry(() => 
  fetch('/api/policies').then(r => r.json())
);
```

## 📊 Performance Optimization

### Caching Strategies

```typescript
// Client-side caching with TTL
class CachedAPIClient {
  private cache = new Map<string, { data: any; expires: number }>();
  
  private getCacheKey(endpoint: string, params?: any): string {
    return `${endpoint}:${JSON.stringify(params || {})}`;
  }
  
  private isExpired(entry: { expires: number }): boolean {
    return Date.now() > entry.expires;
  }
  
  async get(endpoint: string, params?: any, ttlSeconds = 300): Promise<any> {
    const cacheKey = this.getCacheKey(endpoint, params);
    const cached = this.cache.get(cacheKey);
    
    if (cached && !this.isExpired(cached)) {
      return cached.data;
    }
    
    const data = await this.request(endpoint, { params });
    this.cache.set(cacheKey, {
      data,
      expires: Date.now() + (ttlSeconds * 1000)
    });
    
    return data;
  }
  
  invalidateCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}
```

### Pagination Best Practices

```typescript
// Cursor-based pagination for large datasets
async function getAllPolicies(companyId: string) {
  const allPolicies = [];
  let cursor = null;
  
  do {
    const params = new URLSearchParams({
      limit: '100',
      ...(cursor && { cursor })
    });
    
    const response = await fetch(`/api/policies?${params}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    const data = await response.json();
    allPolicies.push(...data.data);
    cursor = data.pagination.next_cursor;
    
  } while (cursor);
  
  return allPolicies;
}

// Efficient infinite scrolling
class InfiniteScroll {
  private loading = false;
  private hasMore = true;
  private page = 1;
  
  async loadMore(endpoint: string, container: HTMLElement) {
    if (this.loading || !this.hasMore) return;
    
    this.loading = true;
    
    try {
      const response = await fetch(`${endpoint}?page=${this.page}&limit=20`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      
      const data = await response.json();
      
      // Append new items to container
      data.data.forEach(item => {
        const element = this.createItemElement(item);
        container.appendChild(element);
      });
      
      this.hasMore = this.page < data.pagination.pages;
      this.page++;
      
    } finally {
      this.loading = false;
    }
  }
}
```

## 🔐 Security Best Practices

### Token Management

```typescript
class TokenManager {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;
  
  async getValidToken(): Promise<string> {
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.token;
    }
    
    if (this.refreshToken) {
      await this.refreshAccessToken();
      return this.token!;
    }
    
    throw new Error('No valid token available. Please authenticate.');
  }
  
  private async refreshAccessToken(): Promise<void> {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: this.refreshToken })
    });
    
    if (!response.ok) {
      throw new Error('Token refresh failed');
    }
    
    const data = await response.json();
    this.setTokens(data.access_token, data.refresh_token, data.expires_in);
  }
  
  setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    this.token = accessToken;
    this.refreshToken = refreshToken;
    this.tokenExpiry = Date.now() + (expiresIn * 1000) - 30000; // 30s buffer
    
    // Store in secure storage
    localStorage.setItem('pb_refresh_token', refreshToken);
  }
  
  clearTokens(): void {
    this.token = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    localStorage.removeItem('pb_refresh_token');
  }
}
```

### Request Signing

```typescript
// For high-security environments, implement request signing
class SecureAPIClient {
  private apiKey: string;
  private apiSecret: string;
  
  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }
  
  private generateSignature(
    method: string,
    path: string,
    timestamp: string,
    body: string = ''
  ): string {
    const message = `${method}\n${path}\n${timestamp}\n${body}`;
    return crypto.createHmac('sha256', this.apiSecret)
      .update(message)
      .digest('hex');
  }
  
  private getAuthHeaders(method: string, path: string, body?: string): Record<string, string> {
    const timestamp = Date.now().toString();
    const signature = this.generateSignature(method, path, timestamp, body);
    
    return {
      'X-API-Key': this.apiKey,
      'X-Timestamp': timestamp,
      'X-Signature': signature
    };
  }
  
  async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = new URL(endpoint, this.baseUrl);
    const body = options.body as string;
    
    const response = await fetch(url.toString(), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(options.method || 'GET', url.pathname, body),
        ...options.headers
      }
    });
    
    return response.json();
  }
}
```

## 🧪 Testing

### API Testing Examples

```typescript
// Jest test examples
describe('PolicyBridge API', () => {
  let apiClient: PolicyBridgeAPI;
  
  beforeEach(() => {
    apiClient = new PolicyBridgeAPI({
      baseUrl: 'http://localhost:3000/api/v1',
      token: 'test-token'
    });
  });
  
  describe('Clients API', () => {
    test('should create a new client', async () => {
      const clientData = {
        client_type: 'individual',
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com'
      };
      
      const client = await apiClient.clients.create(clientData);
      
      expect(client.data.id).toBeDefined();
      expect(client.data.first_name).toBe('Test');
      expect(client.data.email).toBe('test@example.com');
    });
    
    test('should handle validation errors', async () => {
      const invalidData = {
        client_type: 'individual',
        // Missing required fields
      };
      
      await expect(apiClient.clients.create(invalidData))
        .rejects.toThrow('Validation error');
    });
  });
  
  describe('Policies API', () => {
    test('should calculate commission correctly', async () => {
      const policyData = {
        client_id: 'client-uuid',
        premium_amount: 1000.00,
        commission_rate: 0.15
      };
      
      const policy = await apiClient.policies.create(policyData);
      
      expect(policy.data.commission_amount).toBe(150.00);
    });
  });
});

// Integration tests
describe('End-to-end workflows', () => {
  test('complete client onboarding flow', async () => {
    // 1. Create client
    const client = await apiClient.clients.create({
      client_type: 'individual',
      first_name: 'Integration',
      last_name: 'Test',
      email: 'integration@test.com'
    });
    
    // 2. Create policy
    const policy = await apiClient.policies.create({
      client_id: client.data.id,
      policy_type: 'motor',
      premium_amount: 2000.00
    });
    
    // 3. Record communication
    const communication = await apiClient.communications.create({
      client_id: client.data.id,
      type: 'email',
      subject: 'Welcome message'
    });
    
    // Verify relationships
    expect(policy.data.client_id).toBe(client.data.id);
    expect(communication.data.client_id).toBe(client.data.id);
  });
});
```

## 📖 Additional Resources

### OpenAPI Specification

The complete OpenAPI 3.0 specification is available at:
- **Production:** `https://api.policybridge.com/v1/openapi.json`
- **Interactive Docs:** `https://api.policybridge.com/v1/docs`

### Postman Collection

Import our Postman collection for quick API testing:
```bash
curl -o policybridge-api.json https://api.policybridge.com/v1/postman-collection.json
```

### GraphQL Endpoint (Beta)

For advanced querying needs, we also provide a GraphQL endpoint:
- **Endpoint:** `https://api.policybridge.com/v1/graphql`
- **Playground:** `https://api.policybridge.com/v1/graphql-playground`

```graphql
# Example GraphQL query
query GetClientWithPolicies($clientId: ID!) {
  client(id: $clientId) {
    id
    firstName
    lastName
    email
    policies {
      id
      policyNumber
      policyType
      premiumAmount
      status
      claims {
        id
        claimNumber
        status
        claimAmount
      }
    }
  }
}
```

### Status Page

Monitor API uptime and performance:
- **Status Page:** `https://status.policybridge.com`
- **RSS Feed:** `https://status.policybridge.com/rss`

## 📞 Support

### Developer Support
- **Email:** developers@policybridge.com
- **Documentation:** [docs.policybridge.com](https://docs.policybridge.com)
- **GitHub Issues:** [github.com/policybridge/api-issues](https://github.com/policybridge/api-issues)
- **Discord:** [discord.gg/policybridge-dev](https://discord.gg/policybridge-dev)

### Business Support
- **Sales:** business@policybridge.com
- **Phone:** +267 760 51623 (Botswana business hours)
- **WhatsApp:** +267 760 51623

### Emergency Support
For production issues affecting business operations:
- **24/7 Hotline:** +267 760 51624
- **Slack:** #emergency-support (for enterprise customers)

---

## 📄 Changelog

### v1.2.0 (Current)
- ✅ Added GraphQL endpoint (beta)
- ✅ Enhanced search capabilities with full-text search
- ✅ Improved rate limiting with burst allowances
- ✅ Added batch operations for bulk data management
- ✅ Enhanced webhook security with HMAC verification

### v1.1.0
- ✅ Added real-time subscriptions via WebSockets
- ✅ Implemented advanced filtering and sorting
- ✅ Added file upload capabilities
- ✅ Enhanced error handling and validation
- ✅ Added analytics and reporting endpoints

### v1.0.0
- ✅ Initial API release
- ✅ Core CRUD operations for all entities
- ✅ JWT authentication with refresh tokens
- ✅ Multi-tenant architecture with RLS
- ✅ Basic search and pagination

---

**🇧🇼 Built for Botswana, Designed for Africa, Engineered for Scale**

*Last updated: January 2024 | API Version: v1.2.0*