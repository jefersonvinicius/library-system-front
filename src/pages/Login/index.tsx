import { FormEvent } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { AuthService } from 'services/auth';
import { useErrorMessage } from 'hooks/errors';

type Props = {
  authService: AuthService;
};

export default function LoginPage({ authService }: Props) {
  const logInError = useErrorMessage();

  function handleLogin(event: FormEvent) {
    event.preventDefault();
    logInError.reset();
    authService.logIn({ email: 'any@gmail.com', password: 'any' }).catch(logInError.set);
  }

  return (
    <div className="p-d-flex p-flex-column">
      <form onSubmit={handleLogin}>
        <InputText type="email" placeholder="Email" />
        <InputText type="password" placeholder="Password" />
        <Button label="Log In" />
        {logInError.message}
      </form>
    </div>
  );
}
