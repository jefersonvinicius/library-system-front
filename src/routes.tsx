import { Route, Routes } from 'react-router-dom';
import LoginPage from './pages/Login';
import { authService } from 'services';
import HomePage from 'pages/Home';
import RequireAuth from 'components/RequireAuth';
import AuthorsHomePage from 'modules/authors/pages/Home';
import { authorsService } from 'modules/authors/services';
import AuthorPage from 'modules/authors/pages/Author';

export default function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage authService={authService} />} />
        <Route path="/login" element={<LoginPage authService={authService} />} />
        <Route path="/home" element={<RequireAuth component={<HomePage />} />} />
        <Route
          path="/authors"
          element={<RequireAuth component={<AuthorsHomePage authorsService={authorsService} />} />}
        />
        <Route
          path="/authors/:id"
          element={<RequireAuth component={<AuthorPage authorsService={authorsService} />} />}
        />
      </Routes>
    </>
  );
}
