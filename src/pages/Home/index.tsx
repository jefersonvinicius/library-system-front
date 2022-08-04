import { useUser } from 'state/user';

export default function HomePage() {
  const [user] = useUser();

  return <span>Home: {JSON.stringify(user, null, 4)}</span>;
}
