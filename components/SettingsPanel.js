'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api-client';
import { updateEmail, updatePassword } from '../lib/auth';
import { AnalyticsBand, DashboardAvatar, StatusBadge } from './dashboard/ui';

function emptyAddress(addr) {
  return {
    street: addr?.street || '',
    addressLine2: addr?.addressLine2 || '',
    city: addr?.city || '',
    state: addr?.state || '',
    zipCode: addr?.zipCode || addr?.zip || '',
    country: addr?.country || '',
  };
}

function Field({ label, children }) {
  return (
    <label className="sdc-settings-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Row({ children }) {
  return <div className="sdc-settings-field-row">{children}</div>;
}

function SaveBtn({ saving, label, loadingLabel, disabled }) {
  return (
    <div className="sdc-settings-actions">
      <button type="submit" className="sdc-payout-withdraw-btn" disabled={saving || disabled}>
        {saving ? loadingLabel : label}
      </button>
    </div>
  );
}

function AddressFields({ values, onChange }) {
  const set = (key, val) => onChange({ ...values, [key]: val });
  return (
    <>
      <Field label="Street">
        <input value={values.street} onChange={(e) => set('street', e.target.value)} />
      </Field>
      <Field label="Address line 2">
        <input value={values.addressLine2} onChange={(e) => set('addressLine2', e.target.value)} />
      </Field>
      <Row>
        <Field label="City">
          <input value={values.city} onChange={(e) => set('city', e.target.value)} />
        </Field>
        <Field label="State">
          <input value={values.state} onChange={(e) => set('state', e.target.value)} />
        </Field>
      </Row>
      <Row>
        <Field label="ZIP">
          <input value={values.zipCode} onChange={(e) => set('zipCode', e.target.value)} />
        </Field>
        <Field label="Country">
          <input value={values.country} onChange={(e) => set('country', e.target.value)} />
        </Field>
      </Row>
    </>
  );
}

export default function SettingsPanel({
  profile,
  user,
  organizerId,
  impersonation,
  payouts,
  onSaved,
  onError,
}) {
  const canEditAuth = !impersonation && user?.id === organizerId;
  const pi = profile?.providerInfo || {};

  const [personal, setPersonal] = useState({
    name: profile?.name || '',
    phoneNumber: profile?.phoneNumber || '',
    dateOfBirth: profile?.dateOfBirth || '',
    address: emptyAddress(profile?.address),
  });

  const [organization, setOrganization] = useState({
    organizationName: pi.organizationName || '',
    partyEmail: pi.partyEmail || profile?.email || '',
    partyPhone: pi.partyPhone || profile?.phoneNumber || '',
    website: pi.website || '',
    description: pi.description || '',
    businessAddress: emptyAddress(pi.businessAddress),
  });

  const [newEmail, setNewEmail] = useState(profile?.email || '');
  const [emailPassword, setEmailPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    setPersonal({
      name: profile?.name || '',
      phoneNumber: profile?.phoneNumber || '',
      dateOfBirth: profile?.dateOfBirth || '',
      address: emptyAddress(profile?.address),
    });
    setOrganization({
      organizationName: pi.organizationName || '',
      partyEmail: pi.partyEmail || profile?.email || '',
      partyPhone: pi.partyPhone || profile?.phoneNumber || '',
      website: pi.website || '',
      description: pi.description || '',
      businessAddress: emptyAddress(pi.businessAddress),
    });
    setNewEmail(profile?.email || '');
  }, [profile]);

  const flash = (text, isError = false) => {
    if (isError) { setErr(text); setMsg(''); onError?.(text); }
    else { setMsg(text); setErr(''); onSaved?.(text); }
    setTimeout(() => { setMsg(''); setErr(''); }, 4000);
  };

  const saveProfile = async (section, payload) => {
    setSaving(section);
    setErr('');
    try {
      await apiFetch('/api/dashboard/profile', {
        method: 'PATCH',
        body: JSON.stringify({ organizerId, ...payload }),
      });
      flash(`${section} saved`);
    } catch (e) {
      flash(e.message, true);
    } finally {
      setSaving('');
    }
  };

  const handlePersonalSave = (e) => { e.preventDefault(); saveProfile('Personal', { personal }); };
  const handleOrgSave = (e) => { e.preventDefault(); saveProfile('Organization', { organization }); };

  const handleEmailSave = async (e) => {
    e.preventDefault();
    if (!canEditAuth) return;
    setSaving('email');
    try {
      const result = await updateEmail(newEmail, emailPassword, profile?.email || user?.email);
      if (!result.success) { flash(result.message, true); return; }
      await apiFetch('/api/dashboard/profile', {
        method: 'PATCH',
        body: JSON.stringify({ organizerId, email: result.email }),
      });
      setEmailPassword('');
      flash('Email update started — check your inbox to confirm');
    } catch (e) {
      flash(e.message, true);
    } finally {
      setSaving('');
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!canEditAuth) return;
    if (newPassword !== confirmPassword) { flash('New passwords do not match', true); return; }
    setSaving('password');
    try {
      const result = await updatePassword(currentPassword, newPassword, profile?.email || user?.email);
      if (!result.success) { flash(result.message, true); return; }
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      flash('Password updated');
    } catch (e) {
      flash(e.message, true);
    } finally {
      setSaving('');
    }
  };

  const displayName = organization.organizationName || personal.name || 'Organizer';

  return (
    <div className="sdc-stack sdc-settings">

      {/* ── Hero ── */}
      <section className="sdc-analytics-hero-wrap">
        <div className="sdc-analytics-hero">
          <div className="sdc-settings-hero-inner">
            <DashboardAvatar url={profile?.avatar} name={displayName} size="lg" />
            <div className="sdc-settings-hero-text">
              <span className="sdc-analytics-kicker">Account settings</span>
              <p className="sdc-analytics-amount sdc-settings-hero-name">{displayName}</p>
              {organization.description && (
                <p className="sdc-analytics-caption">{organization.description}</p>
              )}
              <div className="sdc-settings-hero-tags">
                <StatusBadge status={payouts?.verificationStatus} />
                {profile?.role && <span className="sdc-settings-role-tag">{profile.role}</span>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {(msg || err) && (
        <div className={`sdc-settings-flash${err ? ' error' : ''}`}>{err || msg}</div>
      )}

      {impersonation && (
        <p className="sdc-settings-note">
          Managing as Samba Team. Sign-in credentials can only be changed by the organizer.
        </p>
      )}

      {/* ── Personal + Organization ── */}
      <div className="sdc-analytics-grid sdc-analytics-grid-2">
        <AnalyticsBand title="Personal">
          <form onSubmit={handlePersonalSave} className="sdc-settings-form">
            <Field label="Display name">
              <input value={personal.name} onChange={(e) => setPersonal((p) => ({ ...p, name: e.target.value }))} required />
            </Field>
            <Field label="Phone">
              <input type="tel" value={personal.phoneNumber} onChange={(e) => setPersonal((p) => ({ ...p, phoneNumber: e.target.value }))} />
            </Field>
            <Field label="Date of birth">
              <input type="date" value={personal.dateOfBirth || ''} onChange={(e) => setPersonal((p) => ({ ...p, dateOfBirth: e.target.value }))} />
            </Field>
            <p className="sdc-settings-section-label">Home address</p>
            <AddressFields values={personal.address} onChange={(address) => setPersonal((p) => ({ ...p, address }))} />
            <SaveBtn saving={saving === 'Personal'} label="Save personal" loadingLabel="Saving…" />
          </form>
        </AnalyticsBand>

        <AnalyticsBand title="Organization">
          <form onSubmit={handleOrgSave} className="sdc-settings-form">
            <Field label="Organization name">
              <input value={organization.organizationName} onChange={(e) => setOrganization((o) => ({ ...o, organizationName: e.target.value }))} />
            </Field>
            <Field label="Contact email">
              <input type="email" value={organization.partyEmail} onChange={(e) => setOrganization((o) => ({ ...o, partyEmail: e.target.value }))} />
            </Field>
            <Field label="Phone">
              <input type="tel" value={organization.partyPhone} onChange={(e) => setOrganization((o) => ({ ...o, partyPhone: e.target.value }))} />
            </Field>
            <Field label="Website">
              <input type="url" value={organization.website} onChange={(e) => setOrganization((o) => ({ ...o, website: e.target.value }))} placeholder="https://" />
            </Field>
            <Field label="Description">
              <textarea rows={3} value={organization.description} onChange={(e) => setOrganization((o) => ({ ...o, description: e.target.value }))} />
            </Field>
            <p className="sdc-settings-section-label">Business address</p>
            <AddressFields values={organization.businessAddress} onChange={(businessAddress) => setOrganization((o) => ({ ...o, businessAddress }))} />
            <SaveBtn saving={saving === 'Organization'} label="Save organization" loadingLabel="Saving…" />
          </form>
        </AnalyticsBand>
      </div>

      {/* ── Security ── */}
      <div className="sdc-analytics-grid sdc-analytics-grid-2">
        <AnalyticsBand title="Sign-in email">
          <form onSubmit={handleEmailSave} className="sdc-settings-form">
            <p className="sdc-settings-current">Current: <strong>{profile?.email || '—'}</strong></p>
            <Field label="New email">
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} disabled={!canEditAuth} required />
            </Field>
            <Field label="Current password">
              <input type="password" value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)} disabled={!canEditAuth} autoComplete="current-password" required />
            </Field>
            <SaveBtn saving={saving === 'email'} label="Update email" loadingLabel="Updating…" disabled={!canEditAuth} />
          </form>
        </AnalyticsBand>

        <AnalyticsBand title="Password">
          <form onSubmit={handlePasswordSave} className="sdc-settings-form">
            <Field label="Current password">
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} disabled={!canEditAuth} autoComplete="current-password" required />
            </Field>
            <Field label="New password">
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={!canEditAuth} autoComplete="new-password" minLength={8} required />
            </Field>
            <Field label="Confirm new password">
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={!canEditAuth} autoComplete="new-password" minLength={8} required />
            </Field>
            <SaveBtn saving={saving === 'password'} label="Update password" loadingLabel="Updating…" disabled={!canEditAuth} />
          </form>
        </AnalyticsBand>
      </div>

      {/* ── Verification + Account ── */}
      <div className="sdc-analytics-grid sdc-analytics-grid-2">
        <AnalyticsBand title="Verification">
          <div className="sdc-payout-kv-list">
            <div className="sdc-payout-kv"><span>Status</span><StatusBadge status={payouts?.verificationStatus} /></div>
            <div className="sdc-payout-kv"><span>Stripe</span><strong>{payouts?.stripeConnected ? '✓ Connected' : 'Not connected'}</strong></div>
            <div className="sdc-payout-kv"><span>Tax info</span><strong>{pi.taxInfo ? 'On file' : 'Not submitted'}</strong></div>
            <div className="sdc-payout-kv"><span>Bank account</span><strong>{pi.bankAccountInfo ? 'On file' : 'Not submitted'}</strong></div>
            <div className="sdc-payout-kv"><span>ID verification</span><strong>{pi.identityVerification ? 'Submitted' : 'Not submitted'}</strong></div>
          </div>
        </AnalyticsBand>

        <AnalyticsBand title="Account">
          <div className="sdc-payout-kv-list">
            <div className="sdc-payout-kv"><span>Role</span><strong>{profile?.role || '—'}</strong></div>
            <div className="sdc-payout-kv"><span>Member since</span><strong>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}</strong></div>
            <div className="sdc-payout-kv" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
              <span>User ID</span>
              <strong style={{ fontSize: 11, fontFamily: 'monospace', opacity: 0.5, wordBreak: 'break-all' }}>{profile?.id}</strong>
            </div>
          </div>
        </AnalyticsBand>
      </div>

    </div>
  );
}
