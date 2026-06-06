export function formatSuggestionLabel(props) {
  const lines = [];
  if (props.name) lines.push(props.name);

  const streetLine = [props.housenumber, props.street].filter(Boolean).join(' ');
  if (streetLine) lines.push(streetLine);

  const cityLine = [props.city || props.locality, props.state, props.postcode]
    .filter(Boolean)
    .join(', ');
  if (cityLine) lines.push(cityLine);

  return lines.join(' · ') || 'Unknown address';
}

export function parsePhotonFeature(feature) {
  const props = feature?.properties || {};
  const street = [props.housenumber, props.street].filter(Boolean).join(' ').trim();
  const coords = feature?.geometry?.coordinates;

  return {
    venue: props.name || '',
    street,
    city: props.city || props.locality || props.district || '',
    state: props.state || '',
    zipCode: props.postcode || '',
    country: props.country || '',
    label: formatSuggestionLabel(props),
    coordinates: coords
      ? { lng: coords[0], lat: coords[1] }
      : null,
  };
}

export async function searchAddresses(query, { limit = 6, signal } = {}) {
  const q = query?.trim();
  if (!q || q.length < 3) return [];

  const url = new URL('https://photon.komoot.io/api/');
  url.searchParams.set('q', q);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('lang', 'en');

  const res = await fetch(url.toString(), { signal });
  if (!res.ok) throw new Error('Address lookup failed');

  const data = await res.json();
  const seen = new Set();

  return (data.features || [])
    .map(parsePhotonFeature)
    .filter((item) => {
      const key = [item.venue, item.street, item.city, item.state, item.zipCode].join('|');
      if (!key.replace(/\|/g, '').trim() || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
