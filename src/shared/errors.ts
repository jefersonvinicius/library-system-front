import { useCallback, useState } from 'react';
import { InvalidCredentialsError } from 'services/auth';

export function useErrorMessage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<any>(null);

  const set = useCallback((error: any) => {
    setError(error);

    if (error instanceof InvalidCredentialsError) setMessage('Credenciais Incorretas');
    else setMessage('Um error ocorreu! Tente novamente mais tarde!');
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setMessage(null);
  }, []);

  return { set, reset, message, error };
}
