import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export interface NavigationControl {
  goBack(): void;
}

export function useNavigationControl(): NavigationControl {
  const navigate = useNavigate();

  return useMemo(() => {
    return {
      goBack: () => navigate(-1),
    };
  }, [navigate]);
}
