'use client';

import { useCallback, useState } from 'react';
import SambaLogo from './SambaLogo';
import { formatShareEventDate } from '../lib/ticket-share';
import {
  ticketShareSchemeUrl,
  IOS_APP_STORE_URL,
  ANDROID_PLAY_STORE_URL,
} from '../lib/app-links';

export default function TicketShareView({ token, preview }) {
  const [opening, setOpening] = useState(false);
  const [showStores, setShowStores] = useState(false);

  const openInApp = useCallback(() => {
    if (opening) return;
    setOpening(true);
    setShowStores(false);

    let appOpened = false;
    const markOpened = () => {
      appOpened = true;
    };

    document.addEventListener('visibilitychange', markOpened);
    window.addEventListener('blur', markOpened);
    window.addEventListener('pagehide', markOpened);

    window.location.href = ticketShareSchemeUrl(token);

    window.setTimeout(() => {
      document.removeEventListener('visibilitychange', markOpened);
      window.removeEventListener('blur', markOpened);
      window.removeEventListener('pagehide', markOpened);
      if (!appOpened) setShowStores(true);
      setOpening(false);
    }, 2000);
  }, [opening, token]);

  const dateLabel = formatShareEventDate(preview.eventDate);
  const initial = preview.eventTitle?.[0]?.toUpperCase() || 'S';

  return (
    <div className="tsx-root">
      <div className="tsx-card">
        <div className="tsx-cover">
          {preview.eventImage ? (
            <img src={preview.eventImage} alt="" />
          ) : (
            <div className="tsx-cover-ph">{initial}</div>
          )}
          <div className="tsx-cover-gradient" />
        </div>

        <div className="tsx-body">
          <div className="tsx-brand">
            <SambaLogo size={28} />
            <span>Samba ticket</span>
          </div>

          <h1 className="tsx-title">{preview.eventTitle}</h1>
          {dateLabel && <p className="tsx-date">{dateLabel}</p>}

          <p className={`tsx-message${preview.alreadyClaimed ? ' claimed' : ''}`}>
            {preview.alreadyClaimed
              ? 'This ticket was already claimed'
              : 'Claim your ticket in the Samba app'}
          </p>

          <div className="tsx-actions">
            <button
              type="button"
              className="tsx-btn-primary"
              onClick={openInApp}
              disabled={opening}
            >
              {opening ? 'Opening Samba…' : 'Open in Samba'}
            </button>

            {showStores && (
              <div className="tsx-store-row">
                <p className="tsx-store-hint">Don&apos;t have the app yet? Download Samba:</p>
                <a
                  href={IOS_APP_STORE_URL}
                  className="tsx-btn-store ios"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  App Store
                </a>
                <a
                  href={ANDROID_PLAY_STORE_URL}
                  className="tsx-btn-store android"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Play
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
