import Observables from 'Observables';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import AppRoutes from './routes';

export default function App() {
  return (
    <RecoilRoot>
      <Observables />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </RecoilRoot>
  );
}
