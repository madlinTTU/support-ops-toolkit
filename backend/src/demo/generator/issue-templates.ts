import type { TicketCategory, TicketPriority } from '../../src/tickets/ticket.types.js'

export interface IssueTemplate {
  id: string
  category: TicketCategory
  priority: TicketPriority
  weight: number
  subjects: string[]
  bodies: string[]
  extras: string[]
  resolutions: string[]
  vague?: { subjects: string[]; bodies: string[] }
}

export const RECURRING_TEMPLATES: IssueTemplate[] = [
  {
    id: 'password-reset-email-missing',
    category: 'account_access',
    priority: 'normal',
    weight: 10,
    subjects: ['Password reset email not arriving', 'Cannot reset my password', 'Reset link never comes'],
    bodies: [
      'I asked for a password reset three times but the email never arrives. I checked the spam folder too.',
      'The reset password link I received says it has expired right away. Can you send a new one?',
      'I forgot my password and the reset email does not show up in my inbox.',
    ],
    extras: [
      'I am using the same address I registered with.',
      'This is the third time I am trying today.',
      'Please let me know what else I can try.',
    ],
    resolutions: [
      'Reset email resent after clearing a mail delivery block.',
      'Reset link regenerated and confirmed by the customer.',
    ],
    vague: {
      subjects: ['Cannot get into my account', 'Problem with my account'],
      bodies: ['Hi, I tried the usual way to get back in and nothing reaches me. Please help.'],
    },
  },
  {
    id: 'account-locked-after-attempts',
    category: 'account_access',
    priority: 'high',
    weight: 7,
    subjects: ['Locked out of my account', 'Account locked after too many attempts', 'Cannot sign in, account locked'],
    bodies: [
      'My account got locked after a few wrong attempts and now I cannot sign in at all. It is urgent, I have a deadline today.',
      'I am locked out since this morning. The page says the account is blocked for security reasons.',
      'Cannot sign in, the system says my account is locked. How long does it stay like this?',
    ],
    extras: ['I need access as soon as possible.', 'My colleague has the same problem.'],
    resolutions: [
      'Account unlocked and the customer asked to enable two-factor sign-in.',
      'Lock removed after identity check.',
    ],
  },
  {
    id: 'two-factor-code-rejected',
    category: 'account_access',
    priority: 'high',
    weight: 6,
    subjects: ['2FA code not accepted', 'Verification code invalid', 'Authenticator app codes rejected'],
    bodies: [
      'The code from my authenticator app is rejected every time. I cannot sign in because of it.',
      'I get "invalid verification code" even though I type the new code immediately.',
      'Two-factor sign in fails for me since I changed my phone.',
    ],
    extras: ['The time on my phone is correct.', 'I do not have the backup codes anymore.'],
    resolutions: [
      'Two-factor reset after identity check, customer enrolled the new device.',
      'Clock drift on the phone fixed, codes accepted.',
    ],
  },
  {
    id: 'charged-twice',
    category: 'billing',
    priority: 'critical',
    weight: 9,
    subjects: ['Charged twice for my subscription', 'Duplicate payment on my card', 'Double charge this month'],
    bodies: [
      'I was charged twice for the same month. Two identical payments appear on my card statement.',
      'There is a duplicate payment for my plan, please fix this today and return the extra amount.',
      'My card was charged twice after I changed the plan. I want the second payment back.',
    ],
    extras: ['I can send a screenshot of the statement.', 'This is the second month in a row.'],
    resolutions: ['Duplicate payment refunded in full.', 'Second charge reversed, customer confirmed the balance.'],
  },
  {
    id: 'invoice-missing',
    category: 'billing',
    priority: 'normal',
    weight: 8,
    subjects: ['Cannot download invoice', 'Invoice missing for last month', 'Need a copy of my invoice'],
    bodies: [
      'The invoice for last month is not in my billing page. I need it for accounting.',
      'Download invoice button gives an empty file. Could you send the PDF by email?',
      'I need a copy of the invoice with our company details for the finance team.',
    ],
    extras: ['It is needed before the end of the week.', 'The previous invoices were fine.'],
    resolutions: ['Invoice regenerated and sent by email.', 'PDF generation fixed for the account, invoice delivered.'],
    vague: {
      subjects: ['Question about my last payment'],
      bodies: ['Hello, our accountant is asking for a paper from you about the last payment. Where do I find it?'],
    },
  },
  {
    id: 'refund-request',
    category: 'billing',
    priority: 'normal',
    weight: 6,
    subjects: ['Refund for cancelled plan', 'Request a refund', 'Refund not received yet'],
    bodies: [
      'I cancelled my plan last week and would like a refund for the unused days.',
      'Please refund the annual payment, I did not use the service at all.',
      'You confirmed my refund ten days ago but the money has not arrived.',
    ],
    extras: ['The payment was made by card.', 'Please confirm the amount.'],
    resolutions: [
      'Refund issued to the original payment method.',
      'Refund explained: bank needs up to ten days to show it.',
    ],
  },
  {
    id: 'change-account-email',
    category: 'data_change',
    priority: 'normal',
    weight: 7,
    subjects: ['Change email address on my account', 'Update account email', 'Need to change my login email'],
    bodies: [
      'I changed jobs and need to change the email address on my account to my new one.',
      'Please update the email on my account, the old mailbox does not exist anymore.',
      'How can I change my login email? I cannot find it in the settings and need it updated.',
    ],
    extras: [
      'The new address is in the signature of this message.',
      'I can still read mail on the old address until Friday.',
    ],
    resolutions: [
      'Email address updated after confirmation from the old address.',
      'Email changed manually after identity check.',
    ],
  },
  {
    id: 'feature-request',
    category: 'other',
    priority: 'low',
    weight: 5,
    subjects: ['Feature request: dark mode', 'Suggestion for the dashboard', 'Idea: more export formats'],
    bodies: [
      'It would be great to have a dark mode, I work late and the white screen is hard on the eyes.',
      'A suggestion: add saved filters to the dashboard so we do not rebuild them every day.',
      'Could you consider supporting more export formats in the future?',
    ],
    extras: ['Thanks for the great product.', 'Several of my colleagues would like this too.'],
    resolutions: ['Suggestion logged for the product team, customer informed.', 'Added to the feature request list.'],
  },
  {
    id: 'csv-export-fails',
    category: 'bug',
    priority: 'normal',
    weight: 8,
    subjects: ['CSV export fails with error', 'Export button shows an error', 'Report export not working'],
    bodies: [
      'When I click export to CSV I get an error message and no file is downloaded.',
      'The report export has been broken since yesterday. It shows "something went wrong".',
      'Export is not working for reports with more than a few thousand rows, the page just crashes.',
    ],
    extras: ['I tried two different browsers.', 'It worked fine last week.'],
    resolutions: [
      'Bug confirmed and fixed in the next release, export done manually for the customer.',
      'Workaround provided, fix scheduled.',
    ],
    vague: {
      subjects: ['Download does not work'],
      bodies: ['I press the button to get my data out and nothing comes. Last week it was fine.'],
    },
  },
  {
    id: 'dashboard-blank-page',
    category: 'bug',
    priority: 'high',
    weight: 7,
    subjects: ['Dashboard shows a blank page', 'Page will not load after update', 'Dashboard stuck on loading'],
    bodies: [
      'After the latest update the dashboard is a blank white page. The whole team sees it.',
      'The dashboard keeps loading forever and never shows the data. This is blocking our daily work.',
      'Page crashes with an error right after sign in, I only see a white screen.',
    ],
    extras: ['Clearing the cache did not help.', 'It happens on Chrome and Safari.'],
    resolutions: ['Regression fixed with a hotfix, customer confirmed.', 'Cache issue on the platform side cleared.'],
  },
  {
    id: 'how-to-invite-member',
    category: 'how_to',
    priority: 'low',
    weight: 8,
    subjects: ['How do I invite a team member?', 'How to add a new user', 'Where can I add colleagues?'],
    bodies: [
      'How do I invite a new colleague to our workspace? I cannot find the button.',
      'Can you explain how to add a new user and give them read-only access?',
      'Where in the settings can I add more people to our team?',
    ],
    extras: ['We are on the standard plan.', 'I am the account owner.'],
    resolutions: [
      'Sent the steps to invite users and linked the help article.',
      'Explained roles and invitations, customer succeeded.',
    ],
    vague: {
      subjects: ['New person starting Monday'],
      bodies: ['We have a new colleague starting Monday and she needs to see our reports. What should I do?'],
    },
  },
  {
    id: 'how-to-api-key',
    category: 'how_to',
    priority: 'low',
    weight: 6,
    subjects: ['How do I create an API key?', 'Where to find the API token', 'How to connect via API'],
    bodies: [
      'How do I create an API key for our integration? I looked in the settings but did not find it.',
      'Where can I find the API token and how do I rotate it?',
      'Is there a guide on how to connect our system through the API?',
    ],
    extras: ['We use it only for reading data.', 'Our developer is waiting for this.'],
    resolutions: [
      'Explained where API keys are created and shared the guide.',
      'Customer created a key following the instructions.',
    ],
  },
]

export const ONE_OFF_TEMPLATES: IssueTemplate[] = [
  {
    id: 'one-off-account-compromised',
    category: 'account_access',
    priority: 'critical',
    weight: 1,
    subjects: ['Our admin account may be hacked'],
    bodies: [
      'We see logins from a country we have no staff in, and settings were changed. I think the admin account is hacked.',
    ],
    extras: [],
    resolutions: ['Sessions revoked, password reset, access log reviewed with the customer.'],
  },
  {
    id: 'one-off-data-deletion',
    category: 'data_change',
    priority: 'high',
    weight: 1,
    subjects: ['Please delete all my personal data'],
    bodies: ['I would like all my personal data deleted from your systems and a written confirmation when it is done.'],
    extras: [],
    resolutions: ['Deletion request processed, confirmation sent.'],
  },
  {
    id: 'one-off-webhook-error',
    category: 'bug',
    priority: 'normal',
    weight: 1,
    subjects: ['Webhook returns 500 only on Tuesdays'],
    bodies: [
      'Our webhook endpoint receives a 500 error from your side, but only on Tuesdays around noon. Other days it works.',
    ],
    extras: [],
    resolutions: ['Traced to a weekly maintenance job, schedule changed.'],
  },
  {
    id: 'one-off-partnership',
    category: 'other',
    priority: 'low',
    weight: 1,
    subjects: ['Question about a partnership'],
    bodies: ['We are a small agency and would like to talk about becoming a reseller. Who should we contact?'],
    extras: [],
    resolutions: ['Forwarded to the partnerships team.'],
  },
  {
    id: 'one-off-pricing-typo',
    category: 'other',
    priority: 'low',
    weight: 1,
    subjects: ['Typo on the pricing page'],
    bodies: ['There is a typo in the second plan description on the pricing page: "unlimted" should be "unlimited".'],
    extras: [],
    resolutions: ['Typo fixed, customer thanked.'],
  },
  {
    id: 'one-off-wrong-currency',
    category: 'billing',
    priority: 'normal',
    weight: 1,
    subjects: ['Wrong currency shown on invoice'],
    bodies: ['Our invoice shows US dollars but our contract is in euros. Please correct the invoice.'],
    extras: [],
    resolutions: ['Invoice reissued in euros.'],
  },
  {
    id: 'one-off-data-migration',
    category: 'how_to',
    priority: 'low',
    weight: 1,
    subjects: ['How to migrate data from another tool?'],
    bodies: ['We want to move our history from another support tool to yours. Is there an import guide?'],
    extras: [],
    resolutions: ['Shared the import guide and file format.'],
  },
  {
    id: 'one-off-urgent-demo',
    category: 'account_access',
    priority: 'high',
    weight: 1,
    subjects: ['Cannot sign in, demo in one hour'],
    bodies: ['I cannot sign in and I have a customer demo in one hour. Urgent, please help.'],
    extras: [],
    resolutions: ['Session cache cleared, customer signed in on time.'],
  },
]
