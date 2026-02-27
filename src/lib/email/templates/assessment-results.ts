// ── Design system color constants ───────────────────────────────────────────
const COLORS = {
  navy: '#0f172a',
  accentBlue: '#2563eb',
  ctaGreen: '#10b981',
  scoreGreen: '#22c55e',
  scoreBlue: '#3b82f6',
  scoreOrange: '#f97316',
  scoreRed: '#ef4444',
  pageBg: '#f8fafc',
  cardBorder: '#e2e8f0',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  white: '#ffffff',
} as const;

// ── Readiness level display labels ──────────────────────────────────────────
const READINESS_LABELS: Record<string, string> = {
  investment_ready: 'Investment Ready',
  nearly_there: 'Nearly There',
  early_stage: 'Early Stage',
  too_early: 'Too Early',
};

// ── Score colour helper ──────────────────────────────────────────────────────
function scoreColor(score: number): string {
  if (score >= 75) {
    return COLORS.scoreGreen;
  }
  if (score >= 60) {
    return COLORS.scoreBlue;
  }
  if (score >= 40) {
    return COLORS.scoreOrange;
  }
  return COLORS.scoreRed;
}

// ── Score bar HTML ───────────────────────────────────────────────────────────
function scoreBar(score: number): string {
  const color = scoreColor(score);
  const width = Math.max(4, score);
  return `
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="background:${COLORS.cardBorder};border-radius:4px;height:8px;overflow:hidden;">
          <table cellpadding="0" cellspacing="0" border="0" width="${width}%">
            <tr>
              <td style="background:${color};height:8px;border-radius:4px;">&nbsp;</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
}

// ── Category row ─────────────────────────────────────────────────────────────
function categoryRow(name: string, score: number): string {
  return `
    <tr>
      <td style="padding:8px 0;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="font-size:13px;color:${COLORS.navy};font-weight:600;padding-bottom:4px;">${name}</td>
            <td align="right" style="font-size:13px;color:${scoreColor(score)};font-weight:700;padding-bottom:4px;">${score}/100</td>
          </tr>
          <tr>
            <td colspan="2">${scoreBar(score)}</td>
          </tr>
        </table>
      </td>
    </tr>`;
}

// ── Gap card ─────────────────────────────────────────────────────────────────
function gapCard(title: string, currentState: string, firstAction: string): string {
  return `
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:12px;border:1px solid ${COLORS.cardBorder};border-radius:8px;overflow:hidden;">
      <tr>
        <td style="background:${COLORS.pageBg};padding:14px 16px;">
          <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:${COLORS.navy};">${title}</p>
          <p style="margin:0 0 8px;font-size:13px;color:${COLORS.textSecondary};">${currentState}</p>
          <p style="margin:0;font-size:13px;color:${COLORS.accentBlue};font-weight:600;">Action: ${firstAction}</p>
        </td>
      </tr>
    </table>`;
}

// ── Quick win row ────────────────────────────────────────────────────────────
function quickWinRow(win: string): string {
  return `
    <tr>
      <td style="padding:6px 0;font-size:14px;color:${COLORS.textSecondary};">
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding-right:10px;color:${COLORS.ctaGreen};font-size:16px;vertical-align:top;">&#10003;</td>
            <td style="vertical-align:top;">${win}</td>
          </tr>
        </table>
      </td>
    </tr>`;
}

// ── Types ───────────────────────────────────────────────────────────────────
export type AssessmentEmailData = {
  contactName: string;
  contactCompany?: string;
  overallScore: number;
  readinessLevel: string;
  categoryScores: Array<{ name: string; score: number }>;
  topGaps: Array<{ title: string; currentState: string; recommendedActions: string[] }>;
  quickWins: string[];
  resultsUrl: string;
  bookingUrl: string;
  unsubscribeUrl: string;
};

// ── Main builder ─────────────────────────────────────────────────────────────
export function buildAssessmentResultsEmail(data: AssessmentEmailData): string {
  const {
    contactName,
    contactCompany,
    overallScore,
    readinessLevel,
    categoryScores,
    topGaps,
    quickWins,
    resultsUrl,
    bookingUrl,
    unsubscribeUrl,
  } = data;

  const firstName = contactName.split(' ')[0] ?? contactName;
  const readinessLabel = READINESS_LABELS[readinessLevel] ?? readinessLevel;
  const scoreCol = scoreColor(overallScore);

  // Sort categories: highest first for "strongest", lowest first for "weakest"
  const sorted = [...categoryScores].sort((a, b) => b.score - a.score);
  const strongest = sorted.slice(0, 3);
  const weakest = [...categoryScores].sort((a, b) => a.score - b.score).slice(0, 3);

  const top3Gaps = topGaps.slice(0, 3);
  const top3QuickWins = quickWins.slice(0, 3);

  const strongestRows = strongest.map(c => categoryRow(c.name, c.score)).join('');
  const weakestRows = weakest.map(c => categoryRow(c.name, c.score)).join('');
  const gapCards = top3Gaps.map(g => gapCard(g.title, g.currentState, g.recommendedActions[0] ?? '')).join('');
  const quickWinRows = top3QuickWins.map(w => quickWinRow(w)).join('');

  const companyLine = contactCompany ? ` at ${contactCompany}` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Investor Readiness Score — E3 Digital</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.pageBg};font-family:Arial,Helvetica,sans-serif;">

  <!-- Outer wrapper -->
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${COLORS.pageBg};padding:24px 0;">
    <tr>
      <td align="center">
        <!-- Email container -->
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:${COLORS.white};border-radius:12px;overflow:hidden;border:1px solid ${COLORS.cardBorder};">

          <!-- ── HEADER ─────────────────────────────────────────────────── -->
          <tr>
            <td style="background:${COLORS.navy};padding:28px 32px;text-align:center;">
              <p style="margin:0 0 4px;font-size:22px;font-weight:700;color:${COLORS.white};letter-spacing:-0.5px;">E3 Digital</p>
              <p style="margin:0;font-size:13px;color:${COLORS.textMuted};">Investor Readiness Assessment</p>
            </td>
          </tr>

          <!-- ── SCORE HERO ──────────────────────────────────────────────── -->
          <tr>
            <td style="padding:36px 32px 28px;text-align:center;background:${COLORS.white};">
              <p style="margin:0 0 8px;font-size:16px;color:${COLORS.textSecondary};">Hi ${firstName}${companyLine},</p>
              <p style="margin:0 0 24px;font-size:15px;color:${COLORS.textSecondary};">Here is your investor readiness assessment result:</p>

              <!-- Score circle (table-based) -->
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 16px;">
                <tr>
                  <td style="width:120px;height:120px;border-radius:50%;background:${COLORS.pageBg};border:6px solid ${scoreCol};text-align:center;vertical-align:middle;">
                    <p style="margin:0;font-size:42px;font-weight:700;color:${scoreCol};line-height:1;">${overallScore}</p>
                    <p style="margin:0;font-size:13px;color:${COLORS.textMuted};">/ 100</p>
                  </td>
                </tr>
              </table>

              <!-- Readiness badge -->
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
                <tr>
                  <td style="background:${scoreCol};border-radius:20px;padding:6px 20px;">
                    <p style="margin:0;font-size:14px;font-weight:700;color:${COLORS.white};">${readinessLabel}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── CATEGORY BREAKDOWN ──────────────────────────────────────── -->
          <tr>
            <td style="padding:0 32px 28px;">

              <!-- Side-by-side table: Strongest | Weakest -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <!-- Strongest -->
                  <td width="48%" valign="top" style="padding-right:8px;">
                    <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:${COLORS.navy};">Top Strengths</p>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      ${strongestRows}
                    </table>
                  </td>

                  <!-- Spacer -->
                  <td width="4%" style="padding:0 4px;">&nbsp;</td>

                  <!-- Weakest -->
                  <td width="48%" valign="top" style="padding-left:8px;">
                    <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:${COLORS.navy};">Key Gaps</p>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      ${weakestRows}
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ── DIVIDER ─────────────────────────────────────────────────── -->
          <tr>
            <td style="padding:0 32px;"><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="border-top:1px solid ${COLORS.cardBorder};height:1px;">&nbsp;</td></tr></table></td>
          </tr>

          <!-- ── TOP 3 GAPS ──────────────────────────────────────────────── -->
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 16px;font-size:16px;font-weight:700;color:${COLORS.navy};">Your Top Priority Gaps</p>
              ${gapCards}
            </td>
          </tr>

          <!-- ── DIVIDER ─────────────────────────────────────────────────── -->
          <tr>
            <td style="padding:0 32px;"><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="border-top:1px solid ${COLORS.cardBorder};height:1px;">&nbsp;</td></tr></table></td>
          </tr>

          <!-- ── QUICK WINS ──────────────────────────────────────────────── -->
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 16px;font-size:16px;font-weight:700;color:${COLORS.navy};">Quick Wins to Start This Week</p>
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                ${quickWinRows}
              </table>
            </td>
          </tr>

          <!-- ── DIVIDER ─────────────────────────────────────────────────── -->
          <tr>
            <td style="padding:0 32px;"><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="border-top:1px solid ${COLORS.cardBorder};height:1px;">&nbsp;</td></tr></table></td>
          </tr>

          <!-- ── CTA BUTTONS ─────────────────────────────────────────────── -->
          <tr>
            <td style="padding:28px 32px;text-align:center;">
              <p style="margin:0 0 20px;font-size:15px;color:${COLORS.textSecondary};">Ready to close your gaps and get investment-ready?</p>

              <!-- Primary CTA -->
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 12px;">
                <tr>
                  <td style="background:${COLORS.accentBlue};border-radius:8px;">
                    <a href="${resultsUrl}" style="display:block;padding:14px 32px;font-size:15px;font-weight:700;color:${COLORS.white};text-decoration:none;">View Full Results &rarr;</a>
                  </td>
                </tr>
              </table>

              <!-- Secondary CTA -->
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
                <tr>
                  <td style="background:${COLORS.ctaGreen};border-radius:8px;">
                    <a href="${bookingUrl}" style="display:block;padding:14px 32px;font-size:15px;font-weight:700;color:${COLORS.white};text-decoration:none;">Book a Free Strategy Call</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── FOOTER ──────────────────────────────────────────────────── -->
          <tr>
            <td style="background:${COLORS.pageBg};padding:20px 32px;border-top:1px solid ${COLORS.cardBorder};">
              <p style="margin:0 0 6px;font-size:13px;color:${COLORS.textMuted};text-align:center;">
                Questions? Reply to this email or contact us at
                <a href="mailto:razaq@e3.digital" style="color:${COLORS.accentBlue};text-decoration:none;">razaq@e3.digital</a>
              </p>
              <p style="margin:0;font-size:12px;color:${COLORS.textMuted};text-align:center;">
                E3 Digital &bull;
                <a href="${unsubscribeUrl}" style="color:${COLORS.textMuted};text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
        <!-- /Email container -->
      </td>
    </tr>
  </table>
  <!-- /Outer wrapper -->

</body>
</html>`;
}
