import Observables from 'Observables';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import AppRoutes from './routes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import './styles.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

const queryClient = new QueryClient();

export default function App() {
  return (
    <RecoilRoot>
      <Observables />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </QueryClientProvider>
    </RecoilRoot>
  );
}
