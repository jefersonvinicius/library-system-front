import Observables from 'Observables';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import AppRoutes from './routes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigureToast } from 'components/Toast';

import './styles.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const queryClient = new QueryClient();

export default function App() {
  return (
    <RecoilRoot>
      <ConfigureToast />
      <Observables />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <DndProvider backend={HTML5Backend}>
            <AppRoutes />
          </DndProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </RecoilRoot>
  );
}
