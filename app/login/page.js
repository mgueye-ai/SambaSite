import LoginForm from '../../components/LoginForm';

export const metadata = { title: 'Sign in — Samba' };

export default function LoginPage() {
  return (
    <div className="app-login-page">
      <div className="app-login-bg" aria-hidden="true" />
      <LoginForm />
    </div>
  );
}
