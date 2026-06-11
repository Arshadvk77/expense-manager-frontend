import LegalPage from '../components/LegalPage.jsx';

const SECTIONS = [
  { id: 'collect', h: 'What we collect', body: [
    'Khaleej collects only what it needs to keep your ledger accurate and your account secure. This falls into three buckets:',
    [
      'Account details — your name, email, country and primary currency.',
      'Ledger data — the transactions, wallets, goals and notes you enter.',
      'Technical data — device type, app version and anonymised usage events.',
    ],
    'We do not ask for, store, or sell government identity numbers beyond what a licensed transfer partner legally requires at the moment of a transfer.',
  ] },
  { id: 'use', h: 'How we use it', body: [
    'Your data is used to operate the product you asked for: showing your balances in two currencies, calculating rate equivalents, sending the alerts you switched on, and keeping your account safe.',
    'We use aggregated, de-identified trends to improve Khaleej. We never use the content of your ledger for advertising.',
  ] },
  { id: 'sharing', h: 'Sharing & transfers', body: [
    'We share data with processors only to deliver the service — for example a licensed remittance provider when you choose to send money, or our cloud host to store your encrypted ledger.',
    'Every processor is bound by contract to use your data only for the task we hand them, and never for their own purposes.',
  ] },
  { id: 'rights', h: 'Your rights', body: [
    'You own your ledger. At any time you can:',
    [
      'Export everything as Excel or PDF from Settings.',
      'Correct or delete individual entries.',
      'Close your account, which erases your personal data within 30 days.',
    ],
  ] },
  { id: 'security', h: 'Security', body: [
    'Data is encrypted in transit and at rest. Access on our side is limited to the few people who need it to support you, and every access is logged.',
    'No system is perfectly secure, but we treat your money data with the seriousness it deserves and will tell you promptly if anything ever goes wrong.',
  ] },
  { id: 'contact', h: 'Contacting us', body: [
    'Questions about your privacy can go to privacy@khaleej.app and we will respond within one business day.',
  ] },
];

export default function Privacy() {
  return (
    <LegalPage
      kind="privacy"
      title="Privacy Policy"
      updated="1 April 2026"
      intro="This policy explains, in plain language, what Khaleej collects, why, and the control you keep over it."
      sections={SECTIONS}
    />
  );
}
