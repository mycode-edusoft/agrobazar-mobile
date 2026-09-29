import { useCallback, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/services';
import { useAuthStore } from '@/store/auth';
import type { PaymentIntent, PaymentStatus } from '@/types/domain';
import { qk } from './queries';

const POLL_MS = 2000;
const MAX_WAIT_MS = 40_000;

// BRD XI: kart ödənişi yalnız bank serverə təsdiq göndərəndən sonra tamamlanmış sayılır;
// istifadəçi qayıdandan sonra 30-40 saniyəyə qədər "yoxlanılır" vəziyyəti göstərilir.
export function usePaymentFlow() {
  const qc = useQueryClient();
  const [verifying, setVerifying] = useState(false);

  const refresh = useCallback(async () => {
    const me = await api.auth.me().catch(() => null);
    if (me) useAuthStore.getState().setUser(me);
    await Promise.all([
      qc.invalidateQueries({ queryKey: qk.transactions }),
      qc.invalidateQueries({ queryKey: qk.subscription }),
      qc.invalidateQueries({ queryKey: qk.entitlements }),
    ]);
  }, [qc]);

  const complete = useCallback(
    async (intent: PaymentIntent): Promise<PaymentStatus> => {
      if (intent.status === 'completed') {
        await refresh();
        return 'completed';
      }
      if (intent.redirectUrl) {
        await WebBrowser.openBrowserAsync(intent.redirectUrl).catch(() => undefined);
      }
      setVerifying(true);
      const started = Date.now();
      let status: PaymentStatus = 'pending';
      try {
        while (Date.now() - started < MAX_WAIT_MS) {
          status = await api.balance.paymentStatus(intent.id);
          if (status !== 'pending') break;
          await new Promise((r) => setTimeout(r, POLL_MS));
        }
      } finally {
        setVerifying(false);
      }
      await refresh();
      return status;
    },
    [refresh],
  );

  return { verifying, complete };
}
