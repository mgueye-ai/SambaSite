import { Suspense } from 'react';
import DashboardView from '../../components/DashboardView';

export default function DashboardPage() {
  return (
    <div className="dash-page">
      <Suspense fallback={<div className="sdc-loading">Loading dashboard...</div>}>
        <DashboardView />
      </Suspense>
    </div>
  );
}
