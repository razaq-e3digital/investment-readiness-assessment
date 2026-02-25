import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

// Main assessment record — created on form submission
export const assessments = pgTable(
  'assessments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    // Contact info
    contactName: text('contact_name').notNull(),
    contactEmail: text('contact_email').notNull(),
    contactCompany: text('contact_company'),
    contactLinkedin: text('contact_linkedin'),
    contactSource: text('contact_source'),
    // Full form responses as JSON
    responses: jsonb('responses').notNull(),
    // Scoring (populated after AI processing)
    overallScore: integer('overall_score'), // 0–100
    readinessLevel: text('readiness_level'), // 'investment_ready' | 'nearly_there' | 'early_stage' | 'too_early'
    categoryScores: jsonb('category_scores'), // { [category: string]: number }
    topGaps: jsonb('top_gaps'), // Array of gap objects
    recommendations: jsonb('recommendations'), // AI-generated recommendations
    quickWins: jsonb('quick_wins'), // Quick win actions
    // AI processing metadata
    aiScored: boolean('ai_scored').default(false),
    aiModel: text('ai_model'),
    aiProcessingTimeMs: integer('ai_processing_time_ms'),
    // Status flags
    emailSent: boolean('email_sent').default(false),
    brevoSynced: boolean('brevo_synced').default(false),
    booked: boolean('booked').default(false),
    bookedAt: timestamp('booked_at'),
    // Optional Clerk user (if they create an account after assessment)
    clerkUserId: text('clerk_user_id'),
    // Spam / rate limiting
    recaptchaScore: real('recaptcha_score'),
    ipHash: text('ip_hash'), // SHA-256 hashed IP — never store raw IPs
    // Timestamps
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    contactEmailIdx: index('assessments_contact_email_idx').on(table.contactEmail),
    readinessLevelIdx: index('assessments_readiness_level_idx').on(table.readinessLevel),
    createdAtIdx: index('assessments_created_at_idx').on(table.createdAt),
    clerkUserIdIdx: index('assessments_clerk_user_id_idx').on(table.clerkUserId),
  }),
);

// Email delivery tracking (Mailgun webhooks update this)
export const emailLogs = pgTable(
  'email_logs',
  {
    id: serial('id').primaryKey(),
    assessmentId: uuid('assessment_id')
      .references(() => assessments.id, { onDelete: 'cascade' })
      .notNull(),
    messageId: text('message_id'), // Mailgun message ID
    status: text('status').notNull().default('pending'), // pending | sent | delivered | opened | clicked | failed | bounced
    recipientEmail: text('recipient_email').notNull(),
    subject: text('subject'),
    sentAt: timestamp('sent_at'),
    deliveredAt: timestamp('delivered_at'),
    openedAt: timestamp('opened_at'),
    clickedAt: timestamp('clicked_at'),
    failedAt: timestamp('failed_at'),
    failureReason: text('failure_reason'),
    retryCount: integer('retry_count').default(0),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    assessmentIdIdx: index('email_logs_assessment_id_idx').on(table.assessmentId),
    statusIdx: index('email_logs_status_idx').on(table.status),
  }),
);

// Analytics event tracking (server-side, privacy-preserving)
export const analyticsEvents = pgTable(
  'analytics_events',
  {
    id: serial('id').primaryKey(),
    // 'assessment_started' | 'assessment_completed' | 'results_viewed' | 'cta_clicked' | 'email_opened'
    eventType: text('event_type').notNull(),
    assessmentId: uuid('assessment_id').references(() => assessments.id, {
      onDelete: 'set null',
    }),
    metadata: jsonb('metadata'), // Flexible event data
    ipHash: text('ip_hash'), // SHA-256 hashed IP
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    eventTypeIdx: index('analytics_events_event_type_idx').on(table.eventType),
    createdAtIdx: index('analytics_events_created_at_idx').on(table.createdAt),
    assessmentIdIdx: index('analytics_events_assessment_id_idx').on(table.assessmentId),
  }),
);

// IP-based rate limiting for form submissions
export const rateLimits = pgTable(
  'rate_limits',
  {
    id: serial('id').primaryKey(),
    ipHash: text('ip_hash').notNull(),
    action: text('action').notNull(), // 'assessment_submit'
    windowStart: timestamp('window_start').notNull(),
    count: integer('count').notNull().default(1),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    ipActionWindowIdx: uniqueIndex('rate_limits_ip_action_window_idx').on(
      table.ipHash,
      table.action,
      table.windowStart,
    ),
  }),
);
