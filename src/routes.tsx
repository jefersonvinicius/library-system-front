import { Route, Routes } from 'react-router-dom';
import LoginPage from './pages/Login';
import { authService } from 'services';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage authService={authService} />} />
      <Route path="/login" element={<LoginPage authService={authService} />} />
    </Routes>
  );
}
