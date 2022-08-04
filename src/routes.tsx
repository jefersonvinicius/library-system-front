import { Route, Routes } from 'react-router-dom';
import LoginPage from './pages/Login';
import { authService } from 'services';
import HomePage from 'pages/Home';
import RequireAuth from 'components/RequireAuth';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage authService={authService} />} />
      <Route path="/login" element={<LoginPage authService={authService} />} />
      <Route path="/home" element={<RequireAuth component={<HomePage />} />} />
    </Routes>
  );
}
