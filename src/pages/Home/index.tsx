import { Button } from 'primereact/button';
import { useUserGetter } from 'state/user';
import { Card } from 'primereact/card';
import { Link } from 'react-router-dom';

const menus = [
  { label: 'Authors', icon: '', description: 'See, register and update many authors you want', to: '/authors' },
];

export default function HomePage() {
  const user = useUserGetter();

  return (
    <div>
      <h1>Olá, {user?.name}</h1>
      <div className="p-grid">
        {menus.map((menu) => (
          <div className="p-col-4">
            <Card
              title={menu.label}
              footer={
                <span>
                  <Link to={menu.to}>
                    <Button label="Go" icon="pi pi-arrow-right" />
                  </Link>
                </span>
              }
            >
              {menu.description}
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
