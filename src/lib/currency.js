// Currency formatting + FX rates (illustrative — wire to live API in prod)

export const RATES = { AED: 22.65, OMR: 216.20, SAR: 22.18, QAR: 22.85 };
export const SYMBOL = { AED: 'AED', OMR: 'OMR', SAR: 'SAR', QAR: 'QAR' };

export const toINR = (amt, ccy) => amt * (RATES[ccy] || 1);

// Grouped thousands, optional decimals
export const fmt = (n, dec = 0) => {
  const s = Math.abs(n).toFixed(dec);
  const [whole, frac] = s.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (n < 0 ? '-' : '') + grouped + (frac ? '.' + frac : '');
};
