import { useEffect, useState } from 'react';
import { currencyAPI } from '../api/currency';

let cache = null;
let inflight = null;

export function useCurrencies() {
  const [data, setData] = useState(cache);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;
    if (!inflight) inflight = currencyAPI.list().then((r) => { cache = r.currencies || []; return cache; });
    inflight.then((d) => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return { currencies: data || [], loading };
}