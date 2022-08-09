import { useEffect } from 'react';
import { useUserGetter } from 'state/user';
import { subscribeTokenInterceptor, unsubscribeTokenInterceptor } from 'services/axios';

export default function Observables() {
  const user = useUserGetter();

  useEffect(() => {
    if (user?.accessToken) {
      let id: number;
      id = subscribeTokenInterceptor(user.accessToken);

      return () => {
        unsubscribeTokenInterceptor(id);
      };
    }
  }, [user?.accessToken]);

  return null;
}
