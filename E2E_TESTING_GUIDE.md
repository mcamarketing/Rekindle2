# 🔬 Rekindle End-to-End Testing Guide

## Overview

This guide provides comprehensive end-to-end tests for the two critical paths:
1. **Revenue Path**: Calendar → Meeting → Billing → Stripe → UI
2. **Campaign Path**: UI → FastAPI → Orchestrator → Logging

---

## Prerequisites

Before running tests, ensure:

- [ ] All services are running:
  ```bash
  # FastAPI Server
  cd backend/crewai_agents
  uvicorn api_server:app --reload --port 8081

  # Node Worker (separate terminal)
  cd backend/node_scheduler_worker
  npm start

  # Frontend (separate terminal)
  npm run dev
  ```

- [ ] Environment variables configured (see `DEPLOYMENT_CHECKLIST.md`)
- [ ] Supabase database accessible
- [ ] Redis running and accessible
- [ ] Test user created in Supabase `profiles` table

---

## Test 1: Revenue Path E2E Test

### Scenario: Meeting Booked → Billing Charge → UI Update

**Goal:** Verify the complete billing lifecycle from meeting booking to UI reflection.

### Step 1: Create Test User Profile

```sql
-- Run in Supabase SQL Editor
INSERT INTO profiles (id, email, full_name, tier, metadata)
VALUES (
  'test_user_revenue_e2e',
  'test.revenue@rekindle.ai',
  'Revenue Test User',
  'pro',
  '{"stripe_customer_id": "cus_test_revenue_123"}'
)
ON CONFLICT (id) DO UPDATE
SET tier = 'pro', metadata = '{"stripe_customer_id": "cus_test_revenue_123"}'::jsonb;
```

### Step 2: Test Calendar Webhook (Meeting Booking Simulation)

**Endpoint:** `POST http://localhost:8081/api/calendar/webhook`

**Headers:**
```
Authorization: Bearer YOUR_TRACKER_API_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "user_id": "test_user_revenue_e2e",
  "event_type": "meeting.confirmed",
  "meeting_data": {
    "meeting_id": "meeting_test_001",
    "meeting_time": "2024-12-20T14:00:00Z",
    "lead_name": "John Doe - Test Lead",
    "lead_email": "john.doe@testcompany.com",
    "title": "Discovery Call - Rekindle Demo",
    "attendees": ["john.doe@testcompany.com"],
    "is_revival_lead": true
  }
}
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Meeting stored and billing process initiated."
}
```

**Validation Checks:**
- [ ] HTTP 200 response
- [ ] Check FastAPI logs for `CALENDAR_WEBHOOK_RECEIVED`
- [ ] Check FastAPI logs for `BILLING_TRIGGER_START`
- [ ] Verify background task queued (check logs for `BILLING_TRIGGER_MCP_REQUEST`)

### Step 3: Simulate Stripe Webhook (Charge Created)

**Endpoint:** `POST http://localhost:8081/api/billing/webhook`

**Headers:**
```
Authorization: Bearer YOUR_TRACKER_API_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "event_id": "evt_test_revenue_001",
  "event_type": "invoice.paid",
  "user_id": "test_user_revenue_e2e",
  "data": {
    "invoice_id": "in_test_revenue_001",
    "amount": 25000,
    "currency": "gbp",
    "status": "paid",
    "paid_at": "2024-12-20T14:05:00Z"
  }
}
```

**Expected Response:**
```json
{
  "status": "success"
}
```

**Validation Checks:**
- [ ] HTTP 200 response
- [ ] Check logs for `STRIPE_WEBHOOK_RECEIVED`
- [ ] Check logs for `STRIPE_WEBHOOK_INVOICE_PAID`
- [ ] Verify invoice status updated in database (check `invoices` table if exists)

### Step 4: Verify Billing Status in UI

**Endpoint:** `GET http://localhost:8081/api/billing/status?user_id=test_user_revenue_e2e`

**Headers:**
```
Authorization: Bearer YOUR_TRACKER_API_TOKEN
```

**Expected Response:**
```json
{
  "tier": "Pro",
  "status": "active",
  "billing_cycle": "monthly",
  "stripe_customer_id": "cus_test_revenue_123",
  "invoices": [
    {
      "invoice_id": "in_mock_001",
      "date": "2024-11-20",
      "amount": 299.0,
      "currency": "GBP",
      "status": "paid",
      "description": "Pro Plan - Monthly Subscription",
      "pdf_url": "https://billing.rekindle.ai/invoice/001.pdf"
    }
  ],
  "stripe_portal_url": "https://billing.rekindle.ai/portal?customer=cus_test_revenue_123"
}
```

**Validation Checks:**
- [ ] HTTP 200 response
- [ ] `tier` matches user's profile tier
- [ ] `status` is "active"
- [ ] Invoices array populated
- [ ] `stripe_portal_url` is valid

### Step 5: Verify in Frontend UI

1. Navigate to `/billing` page in browser
2. Log in as test user (or use test_user_revenue_e2e if auth supports it)
3. Check UI displays:
   - [ ] Current subscription tier (Pro)
   - [ ] Subscription status (Active)
   - [ ] "Manage Subscription" button visible
   - [ ] Invoices table displayed with mock invoices
   - [ ] Invoice status badges correct (paid/due)
   - [ ] "View PDF" links functional

**Full Revenue Path Validation:**
- [x] Calendar webhook received
- [x] Billing charge triggered
- [x] Stripe webhook processed
- [x] Invoice status updated
- [x] Billing status API returns correct data
- [x] Frontend UI displays correctly

---

## Test 2: Campaign Path E2E Test

### Scenario: Campaign Launch → Orchestration → Message Generation → Queue

**Goal:** Verify complete campaign workflow from UI click to message queued in Redis.

### Step 1: Create Test Lead with AI Insights

```sql
-- Run in Supabase SQL Editor
INSERT INTO leads (
  id, user_id, email, first_name, last_name, company,
  job_title, ai_score, ai_insights, status
)
VALUES (
  'test_lead_campaign_e2e',
  'test_user_revenue_e2e',
  'jane.smith@testcompany.com',
  'Jane',
  'Smith',
  'Test Company Inc',
  'VP Marketing',
  85,
  '{
    "summary": "High-value lead with recent funding and active hiring.",
    "hooks": [
      {
        "reason": "Recently raised Series B funding",
        "evidence": "Funding announcement 30 days ago",
        "channel": "email"
      }
    ],
    "signals": {
      "news": [{"title": "Series B $10M", "type": "funding"}],
      "linkedin": {"headline": "VP Marketing", "recent_changes": ["Promoted to VP"]},
      "job_signals": {"postings": [{"title": "Marketing Manager", "department": "Marketing"}]}
    }
  }'::jsonb,
  'cold'
)
ON CONFLICT (id) DO UPDATE
SET ai_insights = '{
  "summary": "High-value lead with recent funding and active hiring.",
  "hooks": [
    {
      "reason": "Recently raised Series B funding",
      "evidence": "Funding announcement 30 days ago",
      "channel": "email"
    }
  ]
}'::jsonb, ai_score = 85, status = 'cold';
```

### Step 2: Create Test Campaign

```sql
-- Run in Supabase SQL Editor
INSERT INTO campaigns (
  id, user_id, name, description, status
)
VALUES (
  'test_campaign_e2e_001',
  'test_user_revenue_e2e',
  'E2E Test Campaign',
  'End-to-end testing campaign',
  'draft'
)
ON CONFLICT (id) DO UPDATE
SET status = 'draft';
```

### Step 3: Launch Campaign via FastAPI

**Endpoint:** `POST http://localhost:8081/api/campaigns/test_campaign_e2e_001/launch`

**Headers:**
```
Authorization: Bearer YOUR_TRACKER_API_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "lead_ids": ["test_lead_campaign_e2e"]
}
```

**Expected Response:**
```json
{
  "status": "accepted",
  "message": "Campaign launch queued for background processing",
  "campaign_id": "test_campaign_e2e_001"
}
```

**Validation Checks:**
- [ ] HTTP 202 Accepted response
- [ ] Check FastAPI logs for `CAMPAIGN_LAUNCH_START`
- [ ] Verify background task queued

### Step 4: Monitor Orchestration Service Logs

Watch the FastAPI logs for the following sequence:

```
ORCHESTRATION_START: lead_id=test_lead_campaign_e2e, lead_name=Jane Smith, company=Test Company Inc
ORCHESTRATION_BUILD_CONTEXT: lead_id=test_lead_campaign_e2e
ORCHESTRATION_GENERATE_SEQUENCE: lead_id=test_lead_campaign_e2e, channels=['email', 'email', 'sms', 'email', 'whatsapp'], length=5
ORCHESTRATION_SEQUENCE_GENERATED: lead_id=test_lead_campaign_e2e, message_count=5
ORCHESTRATION_ENQUEUE_FIRST: lead_id=test_lead_campaign_e2e
ORCHESTRATION_SUCCESS: lead_id=test_lead_campaign_e2e, messages_generated=5, redis_result=Job enqueued
```

**Validation Checks:**
- [ ] All log messages appear in sequence
- [ ] `ORCHESTRATION_SUCCESS` message appears
- [ ] `messages_generated=5` (5 messages created)
- [ ] Redis result confirms job enqueued

### Step 5: Verify Messages Created in Database

```sql
-- Run in Supabase SQL Editor
SELECT 
  id, lead_id, channel, status, content, 
  created_at, metadata
FROM messages
WHERE lead_id = 'test_lead_campaign_e2e'
ORDER BY created_at ASC;
```

**Expected Results:**
- [ ] 5 messages created
- [ ] Status = 'queued' for all messages
- [ ] Channels match: email, email, sms, email, whatsapp
- [ ] Content populated for each message
- [ ] Metadata contains `sequenceIndex` and `offsetMinutes`

### Step 6: Verify Job Queued in Redis

**Using Redis CLI:**
```bash
redis-cli
> LLEN message_scheduler_queue
> LRANGE message_scheduler_queue 0 -1
```

**Or check Node Worker logs:**
- [ ] Look for `WORKER_JOB_START` in worker logs
- [ ] Verify job contains `lead_id`, `message_id`, `channel`, `scheduled_time`

### Step 7: Monitor Node Worker Processing

Watch Node Worker logs for:

```
WORKER_JOB_START: jobId=xxx, lead_id=test_lead_campaign_e2e, message_id=xxx, channel=email, action=SEND_MESSAGE
WORKER_DELIVERY_START: lead_id=test_lead_campaign_e2e, message_id=xxx, channel=email, action=SEND_MESSAGE
WORKER_DELIVERY_SUCCESS: message_id=xxx, status=sent, provider_id=email_xxx
WORKER_JOB_SUCCESS: jobId=xxx, lead_id=test_lead_campaign_e2e, messageId=xxx, status=SENT
```

**Validation Checks:**
- [ ] Worker picks up job from queue
- [ ] Message status updated to 'sent' in database
- [ ] `sent_at` timestamp populated
- [ ] Provider ID stored in metadata

### Step 8: Verify Message Status in Database

```sql
-- Run in Supabase SQL Editor
SELECT 
  id, channel, status, sent_at,
  metadata->>'providerId' as provider_id
FROM messages
WHERE lead_id = 'test_lead_campaign_e2e'
AND status = 'sent'
ORDER BY sent_at ASC
LIMIT 1;
```

**Expected Results:**
- [ ] At least one message with `status = 'sent'`
- [ ] `sent_at` timestamp present
- [ ] `provider_id` in metadata

**Full Campaign Path Validation:**
- [x] Campaign launch API accepts request
- [x] Orchestration service starts
- [x] Context loaded successfully
- [x] 5 messages generated
- [x] Messages saved to database
- [x] First message enqueued to Redis
- [x] Node worker processes job
- [x] Message status updated to 'sent'
- [x] Structured logging throughout

---

## Test 3: Inbound Reply Tracking E2E Test

### Scenario: Inbound Email Reply → Classification → CRM Sync

### Step 1: Send Inbound Reply Webhook

**Endpoint:** `POST http://localhost:8081/api/inbound-reply`

**Headers:**
```
Authorization: Bearer YOUR_TRACKER_API_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "lead_id": "test_lead_campaign_e2e",
  "lead_name": "Jane Smith",
  "reply_text": "Hi! Thanks for reaching out. I'd be interested in learning more about Rekindle. Can we schedule a call for next week?"
}
```

**Expected Response:**
```json
{
  "classification": {
    "intent": "MEETING_REQUEST",
    "sentiment": "Positive",
    "summary": "Lead requested meeting for next week"
  },
  "sync": {
    "slack": "Slack notification successfully processed",
    "crm": "CRM status updated for Lead test_lead_campaign_e2e"
  }
}
```

**Validation Checks:**
- [ ] HTTP 200 response
- [ ] Intent classified as "MEETING_REQUEST"
- [ ] Sentiment is "Positive"
- [ ] Slack notification sent (check logs)
- [ ] CRM status updated (check logs)

### Step 2: Verify Lead Status Updated

```sql
-- Run in Supabase SQL Editor
SELECT status, sentiment, updated_at
FROM leads
WHERE id = 'test_lead_campaign_e2e';
```

**Expected Results:**
- [ ] Status updated (likely to 'responded')
- [ ] Sentiment field populated
- [ ] `updated_at` timestamp reflects recent update

---

## Test Execution Script

Create a test script to automate these tests:

**File:** `scripts/run_e2e_tests.sh` (or `.ps1` for Windows)

```bash
#!/bin/bash

# Set environment variables
export TRACKER_API_TOKEN="your_token_here"
export API_BASE="http://localhost:8081"

# Test 1: Revenue Path
echo "🧪 Testing Revenue Path..."
# ... test commands here

# Test 2: Campaign Path
echo "🧪 Testing Campaign Path..."
# ... test commands here

# Test 3: Inbound Reply
echo "🧪 Testing Inbound Reply..."
# ... test commands here

echo "✅ All E2E tests completed!"
```

---

## Troubleshooting

### Common Issues:

1. **FastAPI not responding:**
   - Check if running: `curl http://localhost:8081/health`
   - Check logs for errors
   - Verify environment variables loaded

2. **Redis connection failed:**
   - Check Redis running: `redis-cli ping`
   - Verify `REDIS_HOST` and `REDIS_PORT` correct

3. **Supabase connection failed:**
   - Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
   - Check Supabase project status

4. **Messages not generating:**
   - Check Anthropic API key valid
   - Verify lead has `ai_insights` populated
   - Check orchestration service logs

5. **Worker not processing:**
   - Check worker logs for errors
   - Verify Redis queue has jobs
   - Check Supabase connection from worker

---

## Success Criteria

All tests pass when:
- ✅ Revenue Path completes without errors
- ✅ Campaign Path generates 5 messages and queues first
- ✅ Inbound Reply classifies correctly
- ✅ All structured logs appear as expected
- ✅ Database updates reflect changes
- ✅ Frontend UI displays correct data

---

**Last Updated:** 2024-12-20
**Status:** Ready for Testing

