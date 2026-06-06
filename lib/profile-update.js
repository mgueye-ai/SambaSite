export async function updateOrganizerProfile(organizerId, payload, db) {
  const { data: existing, error: fetchError } = await db
    .from('profiles')
    .select('*')
    .eq('id', organizerId)
    .single();

  if (fetchError || !existing) throw new Error('Profile not found');

  const updates = { updated_at: new Date().toISOString() };

  if (payload.email !== undefined) {
    updates.email = payload.email.trim().toLowerCase();
  }

  if (payload.personal) {
    const p = payload.personal;
    if (p.name !== undefined) updates.name = p.name.trim() || null;
    if (p.phoneNumber !== undefined) updates.phone_number = p.phoneNumber.trim() || null;
    if (p.dateOfBirth !== undefined) updates.date_of_birth = p.dateOfBirth || null;
    if (p.address !== undefined) updates.address = p.address;
  }

  if (payload.organization) {
    const o = payload.organization;
    const providerInfo = { ...(existing.provider_info || {}) };
    if (o.organizationName !== undefined) providerInfo.organizationName = o.organizationName.trim();
    if (o.partyEmail !== undefined) providerInfo.partyEmail = o.partyEmail.trim();
    if (o.partyPhone !== undefined) providerInfo.partyPhone = o.partyPhone.trim();
    if (o.website !== undefined) providerInfo.website = o.website.trim();
    if (o.description !== undefined) providerInfo.description = o.description.trim();
    if (o.businessAddress !== undefined) providerInfo.businessAddress = o.businessAddress;
    updates.provider_info = providerInfo;
  }

  const { data, error } = await db
    .from('profiles')
    .update(updates)
    .eq('id', organizerId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
