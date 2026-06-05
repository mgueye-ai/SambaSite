import SiteNav from '../../components/SiteNav';
import LoginForm from '../../components/LoginForm';

export default function LoginPage() {
  return (
    <div className="auth-page">
      <SiteNav showBack />
      <main className="auth-main">
        <LoginForm />
      </main>
    </div>
  );
}
