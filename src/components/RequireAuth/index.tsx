import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from 'state/user';

export default function RequireAuth(props: { component: JSX.Element }) {
  const [user] = useUser();
  const location = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return props.component;
}
