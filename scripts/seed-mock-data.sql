-- ============================================================
--  SAMBA MOCK DATA SEED
--  Paste this entire file into Supabase → SQL Editor → Run
--  Safe to run multiple times (uses ON CONFLICT / DELETE+INSERT)
-- ============================================================

-- ── 1. Organizer profile ─────────────────────────────────────
UPDATE profiles
SET
  name            = 'Bizmous Collective',
  provider_info   = jsonb_build_object(
    'organizationName', 'Bizmous Collective',
    'partyLogo',        null,
    'bio',              'NYC-based event collective bringing premium nightlife, culture, and music experiences.',
    'website',          'https://bizmous.com',
    'instagram',        '@bizmous',
    'totalPaidOut',     2400,
    'stripeConnected',  true,
    'verificationStatus', 'verified'
  ),
  current_mode    = 'provider'
WHERE id = 'fc8f9366-88e6-446b-84ce-4b2be1d7c85a';


-- ── 2. Wipe old seeded data ────────────────────────────────────
DELETE FROM tickets
WHERE event_id IN (
  SELECT id FROM events
  WHERE organizer_id = 'fc8f9366-88e6-446b-84ce-4b2be1d7c85a'
    AND title IN (
      'Midnight Gala','Sunday Brunch Sessions','Brooklyn Art Collective',
      'Summer Rooftop Rave','Afrobeats Night','Jazz & Wine Evening',
      'Harlem Renaissance Night','NYE Countdown 2026'
    )
);

DELETE FROM ticket_orders
WHERE event_id IN (
  SELECT id FROM events
  WHERE organizer_id = 'fc8f9366-88e6-446b-84ce-4b2be1d7c85a'
    AND title IN (
      'Midnight Gala','Sunday Brunch Sessions','Brooklyn Art Collective',
      'Summer Rooftop Rave','Afrobeats Night','Jazz & Wine Evening',
      'Harlem Renaissance Night','NYE Countdown 2026'
    )
);

DELETE FROM events
WHERE organizer_id = 'fc8f9366-88e6-446b-84ce-4b2be1d7c85a'
  AND title IN (
    'Midnight Gala','Sunday Brunch Sessions','Brooklyn Art Collective',
    'Summer Rooftop Rave','Afrobeats Night','Jazz & Wine Evening',
    'Harlem Renaissance Night','NYE Countdown 2026'
  );


-- ── 3. Events ─────────────────────────────────────────────────
INSERT INTO events (
  id, title, description, date, start_time, end_time, has_end_time,
  venue, address, status, tickets, ticket_sales_open, show_on_explore,
  booked_spots, total_spots, spots_left, organizer_id, organizer,
  cover_image, flyers, category, created_at, updated_at
) VALUES

-- Past: Midnight Gala
(
  'mock_ev_gala',
  'Midnight Gala',
  'An exclusive evening of music, art, and culture under the stars. Featuring live performances, curated art installations, and a full open bar experience.',
  NOW() - INTERVAL '14 days',
  NOW() - INTERVAL '14 days',
  NOW() - INTERVAL '14 days' + INTERVAL '4 hours',
  true,
  'The Grand Pavilion',
  '{"street":"200 Riverside Dr","city":"New York","state":"NY","zipCode":"10025","formatted":"200 Riverside Dr, New York, NY 10025"}'::jsonb,
  'completed',
  '[
    {"id":"tkt_gala_ga","name":"General Admission","price":45,"isFree":false,"quantity":150,"isUnlimited":false,"availableQuantity":28,"sold":122,"includes":["Open bar","Live music","Art installations"]},
    {"id":"tkt_gala_vip","name":"VIP","price":120,"isFree":false,"quantity":40,"isUnlimited":false,"availableQuantity":5,"sold":35,"includes":["Open bar","Live music","Art installations","Priority entry","VIP lounge access"]}
  ]'::jsonb,
  false, true, 157, 190, 33,
  'fc8f9366-88e6-446b-84ce-4b2be1d7c85a',
  '{"id":"fc8f9366-88e6-446b-84ce-4b2be1d7c85a","name":"Bizmous Collective"}'::jsonb,
  null, '[]'::jsonb, 'Event',
  NOW() - INTERVAL '34 days', NOW() - INTERVAL '14 days'
),

-- Past: Sunday Brunch Sessions
(
  'mock_ev_brunch',
  'Sunday Brunch Sessions',
  'Live jazz, bottomless brunch, good vibes only. Join us every Sunday for an unforgettable afternoon of great food, great music, and great company.',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days' + INTERVAL '3 hours',
  true,
  'Rooftop at The 5th',
  '{"street":"5 West 35th St","city":"New York","state":"NY","zipCode":"10001","formatted":"5 West 35th St, New York, NY 10001"}'::jsonb,
  'completed',
  '[
    {"id":"tkt_brunch_main","name":"Brunch + Jazz","price":65,"isFree":false,"quantity":80,"isUnlimited":false,"availableQuantity":12,"sold":68,"includes":["Bottomless brunch","Live jazz","Welcome mimosa"]}
  ]'::jsonb,
  false, true, 68, 80, 12,
  'fc8f9366-88e6-446b-84ce-4b2be1d7c85a',
  '{"id":"fc8f9366-88e6-446b-84ce-4b2be1d7c85a","name":"Bizmous Collective"}'::jsonb,
  null, '[]'::jsonb, 'Event',
  NOW() - INTERVAL '21 days', NOW() - INTERVAL '7 days'
),

-- Past: Brooklyn Art Collective
(
  'mock_ev_art',
  'Brooklyn Art Collective',
  'A night celebrating emerging Brooklyn artists. Live painting, sculpture, and spoken word in a raw industrial space. No dress code, just real art.',
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '30 days' + INTERVAL '5 hours',
  true,
  'Industry City Lofts',
  '{"street":"220 36th St","city":"Brooklyn","state":"NY","zipCode":"11232","formatted":"220 36th St, Brooklyn, NY 11232"}'::jsonb,
  'completed',
  '[
    {"id":"tkt_art_lover","name":"Art Lover","price":30,"isFree":false,"quantity":200,"isUnlimited":false,"availableQuantity":12,"sold":188,"includes":["Event entry","Artist meet & greet","Complimentary drink"]},
    {"id":"tkt_art_patron","name":"Patron Circle","price":85,"isFree":false,"quantity":25,"isUnlimited":false,"availableQuantity":1,"sold":24,"includes":["Event entry","Artist meet & greet","Complimentary drink","Exclusive artwork print","Patron credit in program"]}
  ]'::jsonb,
  false, true, 212, 225, 13,
  'fc8f9366-88e6-446b-84ce-4b2be1d7c85a',
  '{"id":"fc8f9366-88e6-446b-84ce-4b2be1d7c85a","name":"Bizmous Collective"}'::jsonb,
  null, '[]'::jsonb, 'Event',
  NOW() - INTERVAL '50 days', NOW() - INTERVAL '30 days'
),

-- Past: Jazz & Wine Evening
(
  'mock_ev_jazz',
  'Jazz & Wine Evening',
  'An intimate evening of live jazz and fine wine in the heart of Manhattan. Limited seating for an exclusive experience.',
  NOW() - INTERVAL '45 days',
  NOW() - INTERVAL '45 days',
  NOW() - INTERVAL '45 days' + INTERVAL '3 hours',
  true,
  'Blue Note Lounge',
  '{"street":"131 W 3rd St","city":"New York","state":"NY","zipCode":"10012","formatted":"131 W 3rd St, New York, NY 10012"}'::jsonb,
  'completed',
  '[
    {"id":"tkt_jazz_std","name":"Standard","price":55,"isFree":false,"quantity":60,"isUnlimited":false,"availableQuantity":0,"sold":60,"includes":["Seating","Wine flight","Live jazz"]},
    {"id":"tkt_jazz_prem","name":"Premium","price":95,"isFree":false,"quantity":20,"isUnlimited":false,"availableQuantity":0,"sold":20,"includes":["Front row seating","Wine & cheese pairing","Live jazz","Meet the band"]}
  ]'::jsonb,
  false, true, 80, 80, 0,
  'fc8f9366-88e6-446b-84ce-4b2be1d7c85a',
  '{"id":"fc8f9366-88e6-446b-84ce-4b2be1d7c85a","name":"Bizmous Collective"}'::jsonb,
  null, '[]'::jsonb, 'Event',
  NOW() - INTERVAL '65 days', NOW() - INTERVAL '45 days'
),

-- Upcoming: Summer Rooftop Rave
(
  'mock_ev_rave',
  'Summer Rooftop Rave',
  'House music all night long with NYC''s finest DJs. Open bar, rooftop views, and good energy all night. Dress code enforced.',
  NOW() + INTERVAL '10 days',
  NOW() + INTERVAL '10 days',
  NOW() + INTERVAL '10 days' + INTERVAL '5 hours',
  true,
  'Sky Lounge',
  '{"street":"230 5th Ave","city":"New York","state":"NY","zipCode":"10001","formatted":"230 5th Ave, New York, NY 10001"}'::jsonb,
  'upcoming',
  '[
    {"id":"tkt_rave_early","name":"Early Bird","price":25,"isFree":false,"quantity":100,"isUnlimited":false,"availableQuantity":40,"sold":60,"includes":["Event entry","Welcome drink"]},
    {"id":"tkt_rave_gen","name":"General","price":40,"isFree":false,"quantity":200,"isUnlimited":false,"availableQuantity":130,"sold":70,"includes":["Event entry","Welcome drink"]},
    {"id":"tkt_rave_vip","name":"VIP Table","price":200,"isFree":false,"quantity":20,"isUnlimited":false,"availableQuantity":12,"sold":8,"includes":["Event entry","Welcome drink","Reserved table","Bottle service","Priority entry"]}
  ]'::jsonb,
  true, true, 138, 320, 182,
  'fc8f9366-88e6-446b-84ce-4b2be1d7c85a',
  '{"id":"fc8f9366-88e6-446b-84ce-4b2be1d7c85a","name":"Bizmous Collective"}'::jsonb,
  null, '[]'::jsonb, 'Event',
  NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day'
),

-- Upcoming: Afrobeats Night
(
  'mock_ev_afro',
  'Afrobeats Night',
  'The hottest Afrobeats night in the city. Two floors, three DJs, and vibes that last till sunrise. Afrobeats, Amapiano, and Dancehall.',
  NOW() + INTERVAL '22 days',
  NOW() + INTERVAL '22 days',
  NOW() + INTERVAL '22 days' + INTERVAL '6 hours',
  true,
  'LIV Nightclub',
  '{"street":"49 W 27th St","city":"New York","state":"NY","zipCode":"10001","formatted":"49 W 27th St, New York, NY 10001"}'::jsonb,
  'upcoming',
  '[
    {"id":"tkt_afro_gen","name":"General","price":35,"isFree":false,"quantity":300,"isUnlimited":false,"availableQuantity":155,"sold":145,"includes":["Event entry"]},
    {"id":"tkt_afro_vip","name":"VIP","price":100,"isFree":false,"quantity":50,"isUnlimited":false,"availableQuantity":28,"sold":22,"includes":["Event entry","VIP wristband","Priority entry","Dedicated bar"]}
  ]'::jsonb,
  true, true, 167, 350, 183,
  'fc8f9366-88e6-446b-84ce-4b2be1d7c85a',
  '{"id":"fc8f9366-88e6-446b-84ce-4b2be1d7c85a","name":"Bizmous Collective"}'::jsonb,
  null, '[]'::jsonb, 'Event',
  NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day'
),

-- Upcoming: Harlem Renaissance Night
(
  'mock_ev_harlem',
  'Harlem Renaissance Night',
  'A celebration of Black art, music, and culture. Live poetry, jazz, soul food bites, and a gallery of Black artists from across the city.',
  NOW() + INTERVAL '35 days',
  NOW() + INTERVAL '35 days',
  NOW() + INTERVAL '35 days' + INTERVAL '4 hours',
  true,
  'Harlem Cultural Center',
  '{"street":"1 West 110th St","city":"New York","state":"NY","zipCode":"10026","formatted":"1 West 110th St, New York, NY 10026"}'::jsonb,
  'upcoming',
  '[
    {"id":"tkt_har_cult","name":"Cultural Pass","price":20,"isFree":false,"quantity":250,"isUnlimited":false,"availableQuantity":180,"sold":70,"includes":["Event entry","Gallery access","Live performances"]},
    {"id":"tkt_har_prem","name":"Premiere","price":60,"isFree":false,"quantity":50,"isUnlimited":false,"availableQuantity":38,"sold":12,"includes":["Event entry","Gallery access","Live performances","Artist reception","Gift bag"]}
  ]'::jsonb,
  true, true, 82, 300, 218,
  'fc8f9366-88e6-446b-84ce-4b2be1d7c85a',
  '{"id":"fc8f9366-88e6-446b-84ce-4b2be1d7c85a","name":"Bizmous Collective"}'::jsonb,
  null, '[]'::jsonb, 'Event',
  NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'
),

-- Upcoming: NYE Countdown 2026
(
  'mock_ev_nye',
  'NYE Countdown 2026',
  'Ring in the new year in style. Multiple rooms, live performances, countdown with champagne toast, and an exclusive after-party.',
  '2026-12-31 21:00:00+00',
  '2026-12-31 21:00:00+00',
  '2027-01-01 03:00:00+00',
  true,
  'The Plaza Hotel Ballroom',
  '{"street":"768 5th Ave","city":"New York","state":"NY","zipCode":"10019","formatted":"768 5th Ave, New York, NY 10019"}'::jsonb,
  'upcoming',
  '[
    {"id":"tkt_nye_gen","name":"General","price":75,"isFree":false,"quantity":500,"isUnlimited":false,"availableQuantity":312,"sold":188,"includes":["Event entry","Welcome drink","Midnight champagne toast"]},
    {"id":"tkt_nye_vip","name":"VIP","price":175,"isFree":false,"quantity":100,"isUnlimited":false,"availableQuantity":62,"sold":38,"includes":["Event entry","Open bar","Midnight champagne toast","VIP lounge","Gift bag"]},
    {"id":"tkt_nye_table","name":"Table Package","price":500,"isFree":false,"quantity":30,"isUnlimited":false,"availableQuantity":18,"sold":12,"includes":["Reserved table (4)","Bottle service","Open bar","All VIP perks"]}
  ]'::jsonb,
  true, true, 238, 630, 392,
  'fc8f9366-88e6-446b-84ce-4b2be1d7c85a',
  '{"id":"fc8f9366-88e6-446b-84ce-4b2be1d7c85a","name":"Bizmous Collective"}'::jsonb,
  null, '[]'::jsonb, 'Event',
  NOW() - INTERVAL '10 days', NOW() - INTERVAL '1 day'
);


-- ── 4. Ticket orders + tickets for past events ────────────────
-- We use a helper approach: insert orders first, then tickets.
-- Each INSERT block is one guest at one event.

-- ---- Midnight Gala guests ----
INSERT INTO ticket_orders (id, event_id, ticket_number, buyer_name, buyer_email, payment_id, payment_status) VALUES
('ord_gala_01','mock_ev_gala','TKN_GALA','Marcus Johnson','marcus.j@gmail.com','pay_gala_01','completed'),
('ord_gala_02','mock_ev_gala','TKN_GALA','Ava Williams','ava.w@icloud.com','pay_gala_02','completed'),
('ord_gala_03','mock_ev_gala','TKN_GALA','Liam Brown','liam.b@gmail.com','pay_gala_03','completed'),
('ord_gala_04','mock_ev_gala','TKN_GALA','Sophia Davis','sophia.d@yahoo.com','pay_gala_04','completed'),
('ord_gala_05','mock_ev_gala','TKN_GALA','Noah Wilson','noah.w@gmail.com','pay_gala_05','completed'),
('ord_gala_06','mock_ev_gala','TKN_GALA','Isabella Moore','bella.moore@outlook.com','pay_gala_06','completed'),
('ord_gala_07','mock_ev_gala','TKN_GALA','Elijah Taylor','elijah.t@gmail.com','pay_gala_07','completed'),
('ord_gala_08','mock_ev_gala','TKN_GALA','Mia Anderson','mia.anderson@icloud.com','pay_gala_08','completed'),
('ord_gala_09','mock_ev_gala','TKN_GALA','James Thomas','james.t@gmail.com','pay_gala_09','completed'),
('ord_gala_10','mock_ev_gala','TKN_GALA','Charlotte Jackson','charlotte.j@yahoo.com','pay_gala_10','completed'),
('ord_gala_11','mock_ev_gala','TKN_GALA','Oliver White','oliver.w@gmail.com','pay_gala_11','completed'),
('ord_gala_12','mock_ev_gala','TKN_GALA','Amelia Harris','amelia.h@icloud.com','pay_gala_12','completed'),
('ord_gala_13','mock_ev_gala','TKN_GALA','Benjamin Martin','ben.martin@gmail.com','pay_gala_13','completed'),
('ord_gala_14','mock_ev_gala','TKN_GALA','Evelyn Thompson','evelyn.t@outlook.com','pay_gala_14','completed'),
('ord_gala_15','mock_ev_gala','TKN_GALA','Lucas Garcia','lucas.g@gmail.com','pay_gala_15','completed'),
('ord_gala_16','mock_ev_gala','TKN_GALA','Harper Martinez','harper.m@icloud.com','pay_gala_16','completed'),
('ord_gala_17','mock_ev_gala','TKN_GALA','Mason Robinson','mason.r@gmail.com','pay_gala_17','completed'),
('ord_gala_18','mock_ev_gala','TKN_GALA','Abigail Clark','abby.clark@yahoo.com','pay_gala_18','completed'),
('ord_gala_19','mock_ev_gala','TKN_GALA','Ethan Lewis','ethan.l@gmail.com','pay_gala_19','completed'),
('ord_gala_20','mock_ev_gala','TKN_GALA','Emily Lee','emily.lee@icloud.com','pay_gala_20','completed'),
('ord_gala_21','mock_ev_gala','TKN_GALA','Alexander Walker','alex.w@gmail.com','pay_gala_21','completed'),
('ord_gala_22','mock_ev_gala','TKN_GALA','Scarlett Hall','scarlett.h@yahoo.com','pay_gala_22','completed');

INSERT INTO tickets (id, event_id, order_id, ticket_number, ticket_type, price, is_free, buyer_name, buyer_email, qr_code, status, payment_id) VALUES
('tk_gala_01','mock_ev_gala','ord_gala_01','TKN_GALA','General Admission',45,false,'Marcus Johnson','marcus.j@gmail.com','qr_gala_01','used','pay_gala_01'),
('tk_gala_02','mock_ev_gala','ord_gala_02','TKN_GALA','General Admission',45,false,'Ava Williams','ava.w@icloud.com','qr_gala_02','used','pay_gala_02'),
('tk_gala_03','mock_ev_gala','ord_gala_03','TKN_GALA','General Admission',45,false,'Liam Brown','liam.b@gmail.com','qr_gala_03','used','pay_gala_03'),
('tk_gala_04','mock_ev_gala','ord_gala_04','TKN_GALA','General Admission',45,false,'Sophia Davis','sophia.d@yahoo.com','qr_gala_04','used','pay_gala_04'),
('tk_gala_05','mock_ev_gala','ord_gala_05','TKN_GALA','General Admission',45,false,'Noah Wilson','noah.w@gmail.com','qr_gala_05','used','pay_gala_05'),
('tk_gala_06','mock_ev_gala','ord_gala_06','TKN_GALA','VIP',120,false,'Isabella Moore','bella.moore@outlook.com','qr_gala_06','used','pay_gala_06'),
('tk_gala_07','mock_ev_gala','ord_gala_07','TKN_GALA','VIP',120,false,'Elijah Taylor','elijah.t@gmail.com','qr_gala_07','used','pay_gala_07'),
('tk_gala_08','mock_ev_gala','ord_gala_08','TKN_GALA','General Admission',45,false,'Mia Anderson','mia.anderson@icloud.com','qr_gala_08','used','pay_gala_08'),
('tk_gala_09','mock_ev_gala','ord_gala_09','TKN_GALA','General Admission',45,false,'James Thomas','james.t@gmail.com','qr_gala_09','used','pay_gala_09'),
('tk_gala_10','mock_ev_gala','ord_gala_10','TKN_GALA','General Admission',45,false,'Charlotte Jackson','charlotte.j@yahoo.com','qr_gala_10','used','pay_gala_10'),
('tk_gala_11','mock_ev_gala','ord_gala_11','TKN_GALA','VIP',120,false,'Oliver White','oliver.w@gmail.com','qr_gala_11','used','pay_gala_11'),
('tk_gala_12','mock_ev_gala','ord_gala_12','TKN_GALA','General Admission',45,false,'Amelia Harris','amelia.h@icloud.com','qr_gala_12','used','pay_gala_12'),
('tk_gala_13','mock_ev_gala','ord_gala_13','TKN_GALA','General Admission',45,false,'Benjamin Martin','ben.martin@gmail.com','qr_gala_13','used','pay_gala_13'),
('tk_gala_14','mock_ev_gala','ord_gala_14','TKN_GALA','VIP',120,false,'Evelyn Thompson','evelyn.t@outlook.com','qr_gala_14','used','pay_gala_14'),
('tk_gala_15','mock_ev_gala','ord_gala_15','TKN_GALA','General Admission',45,false,'Lucas Garcia','lucas.g@gmail.com','qr_gala_15','used','pay_gala_15'),
('tk_gala_16','mock_ev_gala','ord_gala_16','TKN_GALA','General Admission',45,false,'Harper Martinez','harper.m@icloud.com','qr_gala_16','used','pay_gala_16'),
('tk_gala_17','mock_ev_gala','ord_gala_17','TKN_GALA','General Admission',45,false,'Mason Robinson','mason.r@gmail.com','qr_gala_17','used','pay_gala_17'),
('tk_gala_18','mock_ev_gala','ord_gala_18','TKN_GALA','VIP',120,false,'Abigail Clark','abby.clark@yahoo.com','qr_gala_18','upcoming','pay_gala_18'),
('tk_gala_19','mock_ev_gala','ord_gala_19','TKN_GALA','General Admission',45,false,'Ethan Lewis','ethan.l@gmail.com','qr_gala_19','upcoming','pay_gala_19'),
('tk_gala_20','mock_ev_gala','ord_gala_20','TKN_GALA','General Admission',45,false,'Emily Lee','emily.lee@icloud.com','qr_gala_20','upcoming','pay_gala_20'),
('tk_gala_21','mock_ev_gala','ord_gala_21','TKN_GALA','VIP',120,false,'Alexander Walker','alex.w@gmail.com','qr_gala_21','upcoming','pay_gala_21'),
('tk_gala_22','mock_ev_gala','ord_gala_22','TKN_GALA','General Admission',45,false,'Scarlett Hall','scarlett.h@yahoo.com','qr_gala_22','upcoming','pay_gala_22');


-- ---- Sunday Brunch Sessions guests ----
INSERT INTO ticket_orders (id, event_id, ticket_number, buyer_name, buyer_email, payment_id, payment_status) VALUES
('ord_brunch_01','mock_ev_brunch','TKN_BRUNCH','Marcus Johnson','marcus.j@gmail.com','pay_brunch_01','completed'),
('ord_brunch_02','mock_ev_brunch','TKN_BRUNCH','Ava Williams','ava.w@icloud.com','pay_brunch_02','completed'),
('ord_brunch_03','mock_ev_brunch','TKN_BRUNCH','Noah Wilson','noah.w@gmail.com','pay_brunch_03','completed'),
('ord_brunch_04','mock_ev_brunch','TKN_BRUNCH','Sophia Davis','sophia.d@yahoo.com','pay_brunch_04','completed'),
('ord_brunch_05','mock_ev_brunch','TKN_BRUNCH','Elijah Taylor','elijah.t@gmail.com','pay_brunch_05','completed'),
('ord_brunch_06','mock_ev_brunch','TKN_BRUNCH','Mia Anderson','mia.anderson@icloud.com','pay_brunch_06','completed'),
('ord_brunch_07','mock_ev_brunch','TKN_BRUNCH','James Thomas','james.t@gmail.com','pay_brunch_07','completed'),
('ord_brunch_08','mock_ev_brunch','TKN_BRUNCH','Charlotte Jackson','charlotte.j@yahoo.com','pay_brunch_08','completed'),
('ord_brunch_09','mock_ev_brunch','TKN_BRUNCH','Oliver White','oliver.w@gmail.com','pay_brunch_09','completed'),
('ord_brunch_10','mock_ev_brunch','TKN_BRUNCH','Amelia Harris','amelia.h@icloud.com','pay_brunch_10','completed'),
('ord_brunch_11','mock_ev_brunch','TKN_BRUNCH','Benjamin Martin','ben.martin@gmail.com','pay_brunch_11','completed'),
('ord_brunch_12','mock_ev_brunch','TKN_BRUNCH','Evelyn Thompson','evelyn.t@outlook.com','pay_brunch_12','completed'),
('ord_brunch_13','mock_ev_brunch','TKN_BRUNCH','Lucas Garcia','lucas.g@gmail.com','pay_brunch_13','completed'),
('ord_brunch_14','mock_ev_brunch','TKN_BRUNCH','Harper Martinez','harper.m@icloud.com','pay_brunch_14','completed');

INSERT INTO tickets (id, event_id, order_id, ticket_number, ticket_type, price, is_free, buyer_name, buyer_email, qr_code, status, payment_id) VALUES
('tk_brunch_01','mock_ev_brunch','ord_brunch_01','TKN_BRUNCH','Brunch + Jazz',65,false,'Marcus Johnson','marcus.j@gmail.com','qr_brunch_01','used','pay_brunch_01'),
('tk_brunch_02','mock_ev_brunch','ord_brunch_02','TKN_BRUNCH','Brunch + Jazz',65,false,'Ava Williams','ava.w@icloud.com','qr_brunch_02','used','pay_brunch_02'),
('tk_brunch_03','mock_ev_brunch','ord_brunch_03','TKN_BRUNCH','Brunch + Jazz',65,false,'Noah Wilson','noah.w@gmail.com','qr_brunch_03','used','pay_brunch_03'),
('tk_brunch_04','mock_ev_brunch','ord_brunch_04','TKN_BRUNCH','Brunch + Jazz',65,false,'Sophia Davis','sophia.d@yahoo.com','qr_brunch_04','used','pay_brunch_04'),
('tk_brunch_05','mock_ev_brunch','ord_brunch_05','TKN_BRUNCH','Brunch + Jazz',65,false,'Elijah Taylor','elijah.t@gmail.com','qr_brunch_05','used','pay_brunch_05'),
('tk_brunch_06','mock_ev_brunch','ord_brunch_06','TKN_BRUNCH','Brunch + Jazz',65,false,'Mia Anderson','mia.anderson@icloud.com','qr_brunch_06','used','pay_brunch_06'),
('tk_brunch_07','mock_ev_brunch','ord_brunch_07','TKN_BRUNCH','Brunch + Jazz',65,false,'James Thomas','james.t@gmail.com','qr_brunch_07','used','pay_brunch_07'),
('tk_brunch_08','mock_ev_brunch','ord_brunch_08','TKN_BRUNCH','Brunch + Jazz',65,false,'Charlotte Jackson','charlotte.j@yahoo.com','qr_brunch_08','used','pay_brunch_08'),
('tk_brunch_09','mock_ev_brunch','ord_brunch_09','TKN_BRUNCH','Brunch + Jazz',65,false,'Oliver White','oliver.w@gmail.com','qr_brunch_09','used','pay_brunch_09'),
('tk_brunch_10','mock_ev_brunch','ord_brunch_10','TKN_BRUNCH','Brunch + Jazz',65,false,'Amelia Harris','amelia.h@icloud.com','qr_brunch_10','used','pay_brunch_10'),
('tk_brunch_11','mock_ev_brunch','ord_brunch_11','TKN_BRUNCH','Brunch + Jazz',65,false,'Benjamin Martin','ben.martin@gmail.com','qr_brunch_11','used','pay_brunch_11'),
('tk_brunch_12','mock_ev_brunch','ord_brunch_12','TKN_BRUNCH','Brunch + Jazz',65,false,'Evelyn Thompson','evelyn.t@outlook.com','qr_brunch_12','used','pay_brunch_12'),
('tk_brunch_13','mock_ev_brunch','ord_brunch_13','TKN_BRUNCH','Brunch + Jazz',65,false,'Lucas Garcia','lucas.g@gmail.com','qr_brunch_13','upcoming','pay_brunch_13'),
('tk_brunch_14','mock_ev_brunch','ord_brunch_14','TKN_BRUNCH','Brunch + Jazz',65,false,'Harper Martinez','harper.m@icloud.com','qr_brunch_14','upcoming','pay_brunch_14');


-- ---- Brooklyn Art Collective guests ----
INSERT INTO ticket_orders (id, event_id, ticket_number, buyer_name, buyer_email, payment_id, payment_status) VALUES
('ord_art_01','mock_ev_art','TKN_ART','Mason Robinson','mason.r@gmail.com','pay_art_01','completed'),
('ord_art_02','mock_ev_art','TKN_ART','Abigail Clark','abby.clark@yahoo.com','pay_art_02','completed'),
('ord_art_03','mock_ev_art','TKN_ART','Ethan Lewis','ethan.l@gmail.com','pay_art_03','completed'),
('ord_art_04','mock_ev_art','TKN_ART','Emily Lee','emily.lee@icloud.com','pay_art_04','completed'),
('ord_art_05','mock_ev_art','TKN_ART','Alexander Walker','alex.w@gmail.com','pay_art_05','completed'),
('ord_art_06','mock_ev_art','TKN_ART','Scarlett Hall','scarlett.h@yahoo.com','pay_art_06','completed'),
('ord_art_07','mock_ev_art','TKN_ART','Michael Allen','mike.allen@gmail.com','pay_art_07','completed'),
('ord_art_08','mock_ev_art','TKN_ART','Victoria Young','vicky.y@icloud.com','pay_art_08','completed'),
('ord_art_09','mock_ev_art','TKN_ART','Marcus Johnson','marcus.j@gmail.com','pay_art_09','completed'),
('ord_art_10','mock_ev_art','TKN_ART','Ava Williams','ava.w@icloud.com','pay_art_10','completed'),
('ord_art_11','mock_ev_art','TKN_ART','Liam Brown','liam.b@gmail.com','pay_art_11','completed'),
('ord_art_12','mock_ev_art','TKN_ART','Sophia Davis','sophia.d@yahoo.com','pay_art_12','completed'),
('ord_art_13','mock_ev_art','TKN_ART','Noah Wilson','noah.w@gmail.com','pay_art_13','completed'),
('ord_art_14','mock_ev_art','TKN_ART','Isabella Moore','bella.moore@outlook.com','pay_art_14','completed'),
('ord_art_15','mock_ev_art','TKN_ART','Elijah Taylor','elijah.t@gmail.com','pay_art_15','completed'),
('ord_art_16','mock_ev_art','TKN_ART','Mia Anderson','mia.anderson@icloud.com','pay_art_16','completed'),
('ord_art_17','mock_ev_art','TKN_ART','James Thomas','james.t@gmail.com','pay_art_17','completed'),
('ord_art_18','mock_ev_art','TKN_ART','Charlotte Jackson','charlotte.j@yahoo.com','pay_art_18','completed'),
('ord_art_19','mock_ev_art','TKN_ART','Oliver White','oliver.w@gmail.com','pay_art_19','completed'),
('ord_art_20','mock_ev_art','TKN_ART','Amelia Harris','amelia.h@icloud.com','pay_art_20','completed');

INSERT INTO tickets (id, event_id, order_id, ticket_number, ticket_type, price, is_free, buyer_name, buyer_email, qr_code, status, payment_id) VALUES
('tk_art_01','mock_ev_art','ord_art_01','TKN_ART','Art Lover',30,false,'Mason Robinson','mason.r@gmail.com','qr_art_01','used','pay_art_01'),
('tk_art_02','mock_ev_art','ord_art_02','TKN_ART','Patron Circle',85,false,'Abigail Clark','abby.clark@yahoo.com','qr_art_02','used','pay_art_02'),
('tk_art_03','mock_ev_art','ord_art_03','TKN_ART','Art Lover',30,false,'Ethan Lewis','ethan.l@gmail.com','qr_art_03','used','pay_art_03'),
('tk_art_04','mock_ev_art','ord_art_04','TKN_ART','Art Lover',30,false,'Emily Lee','emily.lee@icloud.com','qr_art_04','used','pay_art_04'),
('tk_art_05','mock_ev_art','ord_art_05','TKN_ART','Patron Circle',85,false,'Alexander Walker','alex.w@gmail.com','qr_art_05','used','pay_art_05'),
('tk_art_06','mock_ev_art','ord_art_06','TKN_ART','Art Lover',30,false,'Scarlett Hall','scarlett.h@yahoo.com','qr_art_06','used','pay_art_06'),
('tk_art_07','mock_ev_art','ord_art_07','TKN_ART','Art Lover',30,false,'Michael Allen','mike.allen@gmail.com','qr_art_07','used','pay_art_07'),
('tk_art_08','mock_ev_art','ord_art_08','TKN_ART','Patron Circle',85,false,'Victoria Young','vicky.y@icloud.com','qr_art_08','used','pay_art_08'),
('tk_art_09','mock_ev_art','ord_art_09','TKN_ART','Art Lover',30,false,'Marcus Johnson','marcus.j@gmail.com','qr_art_09','used','pay_art_09'),
('tk_art_10','mock_ev_art','ord_art_10','TKN_ART','Art Lover',30,false,'Ava Williams','ava.w@icloud.com','qr_art_10','used','pay_art_10'),
('tk_art_11','mock_ev_art','ord_art_11','TKN_ART','Art Lover',30,false,'Liam Brown','liam.b@gmail.com','qr_art_11','used','pay_art_11'),
('tk_art_12','mock_ev_art','ord_art_12','TKN_ART','Patron Circle',85,false,'Sophia Davis','sophia.d@yahoo.com','qr_art_12','used','pay_art_12'),
('tk_art_13','mock_ev_art','ord_art_13','TKN_ART','Art Lover',30,false,'Noah Wilson','noah.w@gmail.com','qr_art_13','used','pay_art_13'),
('tk_art_14','mock_ev_art','ord_art_14','TKN_ART','Art Lover',30,false,'Isabella Moore','bella.moore@outlook.com','qr_art_14','used','pay_art_14'),
('tk_art_15','mock_ev_art','ord_art_15','TKN_ART','Art Lover',30,false,'Elijah Taylor','elijah.t@gmail.com','qr_art_15','used','pay_art_15'),
('tk_art_16','mock_ev_art','ord_art_16','TKN_ART','Art Lover',30,false,'Mia Anderson','mia.anderson@icloud.com','qr_art_16','used','pay_art_16'),
('tk_art_17','mock_ev_art','ord_art_17','TKN_ART','Art Lover',30,false,'James Thomas','james.t@gmail.com','qr_art_17','used','pay_art_17'),
('tk_art_18','mock_ev_art','ord_art_18','TKN_ART','Art Lover',30,false,'Charlotte Jackson','charlotte.j@yahoo.com','qr_art_18','used','pay_art_18'),
('tk_art_19','mock_ev_art','ord_art_19','TKN_ART','Art Lover',30,false,'Oliver White','oliver.w@gmail.com','qr_art_19','used','pay_art_19'),
('tk_art_20','mock_ev_art','ord_art_20','TKN_ART','Art Lover',30,false,'Amelia Harris','amelia.h@icloud.com','qr_art_20','used','pay_art_20');


-- ---- Jazz & Wine Evening guests (sold out) ----
INSERT INTO ticket_orders (id, event_id, ticket_number, buyer_name, buyer_email, payment_id, payment_status) VALUES
('ord_jazz_01','mock_ev_jazz','TKN_JAZZ','Marcus Johnson','marcus.j@gmail.com','pay_jazz_01','completed'),
('ord_jazz_02','mock_ev_jazz','TKN_JAZZ','Ava Williams','ava.w@icloud.com','pay_jazz_02','completed'),
('ord_jazz_03','mock_ev_jazz','TKN_JAZZ','Liam Brown','liam.b@gmail.com','pay_jazz_03','completed'),
('ord_jazz_04','mock_ev_jazz','TKN_JAZZ','Sophia Davis','sophia.d@yahoo.com','pay_jazz_04','completed'),
('ord_jazz_05','mock_ev_jazz','TKN_JAZZ','Noah Wilson','noah.w@gmail.com','pay_jazz_05','completed'),
('ord_jazz_06','mock_ev_jazz','TKN_JAZZ','Isabella Moore','bella.moore@outlook.com','pay_jazz_06','completed'),
('ord_jazz_07','mock_ev_jazz','TKN_JAZZ','Elijah Taylor','elijah.t@gmail.com','pay_jazz_07','completed'),
('ord_jazz_08','mock_ev_jazz','TKN_JAZZ','Mia Anderson','mia.anderson@icloud.com','pay_jazz_08','completed'),
('ord_jazz_09','mock_ev_jazz','TKN_JAZZ','James Thomas','james.t@gmail.com','pay_jazz_09','completed'),
('ord_jazz_10','mock_ev_jazz','TKN_JAZZ','Charlotte Jackson','charlotte.j@yahoo.com','pay_jazz_10','completed'),
('ord_jazz_11','mock_ev_jazz','TKN_JAZZ','Oliver White','oliver.w@gmail.com','pay_jazz_11','completed'),
('ord_jazz_12','mock_ev_jazz','TKN_JAZZ','Amelia Harris','amelia.h@icloud.com','pay_jazz_12','completed'),
('ord_jazz_13','mock_ev_jazz','TKN_JAZZ','Benjamin Martin','ben.martin@gmail.com','pay_jazz_13','completed'),
('ord_jazz_14','mock_ev_jazz','TKN_JAZZ','Victoria Young','vicky.y@icloud.com','pay_jazz_14','completed'),
('ord_jazz_15','mock_ev_jazz','TKN_JAZZ','Michael Allen','mike.allen@gmail.com','pay_jazz_15','completed');

INSERT INTO tickets (id, event_id, order_id, ticket_number, ticket_type, price, is_free, buyer_name, buyer_email, qr_code, status, payment_id) VALUES
('tk_jazz_01','mock_ev_jazz','ord_jazz_01','TKN_JAZZ','Standard',55,false,'Marcus Johnson','marcus.j@gmail.com','qr_jazz_01','used','pay_jazz_01'),
('tk_jazz_02','mock_ev_jazz','ord_jazz_02','TKN_JAZZ','Premium',95,false,'Ava Williams','ava.w@icloud.com','qr_jazz_02','used','pay_jazz_02'),
('tk_jazz_03','mock_ev_jazz','ord_jazz_03','TKN_JAZZ','Standard',55,false,'Liam Brown','liam.b@gmail.com','qr_jazz_03','used','pay_jazz_03'),
('tk_jazz_04','mock_ev_jazz','ord_jazz_04','TKN_JAZZ','Standard',55,false,'Sophia Davis','sophia.d@yahoo.com','qr_jazz_04','used','pay_jazz_04'),
('tk_jazz_05','mock_ev_jazz','ord_jazz_05','TKN_JAZZ','Premium',95,false,'Noah Wilson','noah.w@gmail.com','qr_jazz_05','used','pay_jazz_05'),
('tk_jazz_06','mock_ev_jazz','ord_jazz_06','TKN_JAZZ','Standard',55,false,'Isabella Moore','bella.moore@outlook.com','qr_jazz_06','used','pay_jazz_06'),
('tk_jazz_07','mock_ev_jazz','ord_jazz_07','TKN_JAZZ','Standard',55,false,'Elijah Taylor','elijah.t@gmail.com','qr_jazz_07','used','pay_jazz_07'),
('tk_jazz_08','mock_ev_jazz','ord_jazz_08','TKN_JAZZ','Standard',55,false,'Mia Anderson','mia.anderson@icloud.com','qr_jazz_08','used','pay_jazz_08'),
('tk_jazz_09','mock_ev_jazz','ord_jazz_09','TKN_JAZZ','Premium',95,false,'James Thomas','james.t@gmail.com','qr_jazz_09','used','pay_jazz_09'),
('tk_jazz_10','mock_ev_jazz','ord_jazz_10','TKN_JAZZ','Standard',55,false,'Charlotte Jackson','charlotte.j@yahoo.com','qr_jazz_10','used','pay_jazz_10'),
('tk_jazz_11','mock_ev_jazz','ord_jazz_11','TKN_JAZZ','Standard',55,false,'Oliver White','oliver.w@gmail.com','qr_jazz_11','used','pay_jazz_11'),
('tk_jazz_12','mock_ev_jazz','ord_jazz_12','TKN_JAZZ','Premium',95,false,'Amelia Harris','amelia.h@icloud.com','qr_jazz_12','used','pay_jazz_12'),
('tk_jazz_13','mock_ev_jazz','ord_jazz_13','TKN_JAZZ','Standard',55,false,'Benjamin Martin','ben.martin@gmail.com','qr_jazz_13','used','pay_jazz_13'),
('tk_jazz_14','mock_ev_jazz','ord_jazz_14','TKN_JAZZ','Premium',95,false,'Victoria Young','vicky.y@icloud.com','qr_jazz_14','used','pay_jazz_14'),
('tk_jazz_15','mock_ev_jazz','ord_jazz_15','TKN_JAZZ','Standard',55,false,'Michael Allen','mike.allen@gmail.com','qr_jazz_15','used','pay_jazz_15');


-- ---- Summer Rooftop Rave (upcoming — pre-sale buyers) ----
INSERT INTO ticket_orders (id, event_id, ticket_number, buyer_name, buyer_email, payment_id, payment_status) VALUES
('ord_rave_01','mock_ev_rave','TKN_RAVE','Marcus Johnson','marcus.j@gmail.com','pay_rave_01','completed'),
('ord_rave_02','mock_ev_rave','TKN_RAVE','Ava Williams','ava.w@icloud.com','pay_rave_02','completed'),
('ord_rave_03','mock_ev_rave','TKN_RAVE','Liam Brown','liam.b@gmail.com','pay_rave_03','completed'),
('ord_rave_04','mock_ev_rave','TKN_RAVE','Noah Wilson','noah.w@gmail.com','pay_rave_04','completed'),
('ord_rave_05','mock_ev_rave','TKN_RAVE','Elijah Taylor','elijah.t@gmail.com','pay_rave_05','completed'),
('ord_rave_06','mock_ev_rave','TKN_RAVE','Isabella Moore','bella.moore@outlook.com','pay_rave_06','completed'),
('ord_rave_07','mock_ev_rave','TKN_RAVE','Mia Anderson','mia.anderson@icloud.com','pay_rave_07','completed'),
('ord_rave_08','mock_ev_rave','TKN_RAVE','Charlotte Jackson','charlotte.j@yahoo.com','pay_rave_08','completed');

INSERT INTO tickets (id, event_id, order_id, ticket_number, ticket_type, price, is_free, buyer_name, buyer_email, qr_code, status, payment_id) VALUES
('tk_rave_01','mock_ev_rave','ord_rave_01','TKN_RAVE','Early Bird',25,false,'Marcus Johnson','marcus.j@gmail.com','qr_rave_01','upcoming','pay_rave_01'),
('tk_rave_02','mock_ev_rave','ord_rave_02','TKN_RAVE','VIP Table',200,false,'Ava Williams','ava.w@icloud.com','qr_rave_02','upcoming','pay_rave_02'),
('tk_rave_03','mock_ev_rave','ord_rave_03','TKN_RAVE','General',40,false,'Liam Brown','liam.b@gmail.com','qr_rave_03','upcoming','pay_rave_03'),
('tk_rave_04','mock_ev_rave','ord_rave_04','TKN_RAVE','Early Bird',25,false,'Noah Wilson','noah.w@gmail.com','qr_rave_04','upcoming','pay_rave_04'),
('tk_rave_05','mock_ev_rave','ord_rave_05','TKN_RAVE','General',40,false,'Elijah Taylor','elijah.t@gmail.com','qr_rave_05','upcoming','pay_rave_05'),
('tk_rave_06','mock_ev_rave','ord_rave_06','TKN_RAVE','VIP Table',200,false,'Isabella Moore','bella.moore@outlook.com','qr_rave_06','upcoming','pay_rave_06'),
('tk_rave_07','mock_ev_rave','ord_rave_07','TKN_RAVE','General',40,false,'Mia Anderson','mia.anderson@icloud.com','qr_rave_07','upcoming','pay_rave_07'),
('tk_rave_08','mock_ev_rave','ord_rave_08','TKN_RAVE','Early Bird',25,false,'Charlotte Jackson','charlotte.j@yahoo.com','qr_rave_08','upcoming','pay_rave_08');


-- ============================================================
--  DONE — refresh your dashboard to see all data
-- ============================================================
