import LegalPage from '../components/LegalPage.jsx';

const SECTIONS = [
  { id: 'accept', h: 'Acceptance', body: [
    'By creating a Khaleej account or using the app, you agree to these terms. If you are using Khaleej on behalf of an employer or family, you confirm you are allowed to do so.',
  ] },
  { id: 'service', h: 'What Khaleej is', body: [
    'Khaleej is a personal ledger for tracking income, expenses and savings across Gulf currencies and Indian rupees.',
    'Rates shown in the app are illustrative mid-market references for tracking. Khaleej is not itself a bank or a money transmitter. Actual transfers are carried out by licensed partners, under their own terms.',
  ] },
  { id: 'account', h: 'Your account', body: [
    'You are responsible for keeping your login details safe and for the activity on your account. Tell us quickly if you suspect unauthorised access.',
    'You agree to provide accurate information and to use Khaleej only for lawful, personal money management.',
  ] },
  { id: 'plans', h: 'Plans & billing', body: [
    'Starter is free. Paid plans are billed monthly or yearly in advance and renew automatically until cancelled.',
    [
      'You can cancel anytime; access continues until the end of the paid period.',
      'Downgrades take effect at the next renewal.',
      'Taxes may apply depending on your location.',
    ],
  ] },
  { id: 'acceptable', h: 'Acceptable use', body: [
    'Please do not misuse Khaleej. That means no attempting to break security, scrape data, resell the service, or use it to launder funds or evade sanctions.',
    'We may suspend accounts that put other users, our partners, or the law at risk.',
  ] },
  { id: 'liability', h: 'Liability', body: [
    'Khaleej is provided "as is". We work hard to keep rates and calculations accurate, but figures are for tracking and planning, not a guarantee of any transfer outcome.',
    'To the extent the law allows, Khaleej is not liable for indirect losses arising from decisions made using the app.',
  ] },
  { id: 'changes', h: 'Changes', body: [
    'We may update these terms as the product grows. If a change is significant, we will notify you in-app or by email before it takes effect. Continued use means you accept the updated terms.',
  ] },
];

export default function Terms() {
  return (
    <LegalPage
      kind="terms"
      title="Terms of Service"
      updated="1 April 2026"
      intro="The plain-language agreement between you and Khaleej for using the app."
      sections={SECTIONS}
    />
  );
}
