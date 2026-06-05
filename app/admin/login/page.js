import AdminLoginForm from '../../../components/AdminLoginForm';

export const metadata = {
  title: 'Admin Login — Samba',
};

export default function AdminLoginPage() {
  return (
    <div className="auth-page">
      <AdminLoginForm />
    </div>
  );
}
