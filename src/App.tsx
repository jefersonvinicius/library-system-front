import Observables from 'Observables';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import AppRoutes from './routes';
import { QueryClientProvider } from '@tanstack/react-query';
import { ConfigureToast } from 'components/Toast';
import { queryClient } from 'shared/react-query';

import './styles.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

export default function App() {
  return (
    <RecoilRoot>
      <ConfigureToast />
      <Observables />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </QueryClientProvider>
    </RecoilRoot>
  );
}
