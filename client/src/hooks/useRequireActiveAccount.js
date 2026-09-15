import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

// Checks login status + trial/plan status. Returns { loading, allowed, reason }.
// reason is "NOT_LOGGED_IN" | "TRIAL_EXPIRED" | null
export function useRequireActiveAccount() {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [reason, setReason] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        if (!cancelled) {
          setReason('NOT_LOGGED_IN');
          setAllowed(false);
          setLoading(false);
        }
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('plan_status, trial_ends_at')
        .eq('id', session.user.id)
        .single();

      if (cancelled) return;

      if (error || !profile) {
        setReason('NOT_LOGGED_IN');
        setAllowed(false);
        setLoading(false);
        return;
      }

      const trialExpired = new Date(profile.trial_ends_at) < new Date();
      const hasAccess = profile.plan_status === 'paid' || profile.plan_status === 'manual' ||
        (profile.plan_status === 'trial' && !trialExpired);

      setAllowed(hasAccess);
      setReason(hasAccess ? null : 'TRIAL_EXPIRED');
      setLoading(false);
    }

    check();
    return () => { cancelled = true; };
  }, []);

  return { loading, allowed, reason };
}
