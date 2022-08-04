import { FormEvent, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { AuthService, LogInData } from 'services/auth';
import { useErrorMessage } from 'shared/errors';
import { useUser } from 'state/user';
import { useNavigate } from 'react-router-dom';

type Props = {
  authService: AuthService;
};

export default function LoginPage({ authService }: Props) {
  const logInError = useErrorMessage();
  const [, setUser] = useUser();

  const navigate = useNavigate();

  const logInForm = useRef<HTMLFormElement>(null);

  function handleLogin(event: FormEvent) {
    event.preventDefault();

    logInError.reset();
    const data = Object.fromEntries(new FormData(logInForm.current!).entries());
    authService
      .logIn(data as LogInData)
      .then((user) => {
        setUser(user);
        navigate('/home', { replace: true });
      })
      .catch(logInError.set);
  }

  return (
    <div className="p-d-flex p-flex-column">
      <form ref={logInForm} onSubmit={handleLogin}>
        <InputText type="email" name="email" placeholder="Email" />
        <InputText type="password" name="password" placeholder="Password" />
        <Button label="Log In" />
        {logInError.message}
      </form>
    </div>
  );
}
