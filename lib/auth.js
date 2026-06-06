import { getBrowserClient } from './supabase';

const mapProfile = (profile) => {
  if (!profile) return null;
  const providerInfo = profile.provider_info || {};
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    phoneNumber: profile.phone_number,
    dateOfBirth: profile.date_of_birth,
    address: profile.address || {},
    role: profile.role || 'attendee',
    currentMode: profile.current_mode || 'attendee',
    profilePicture: profile.profile_picture_url,
    providerInfo,
    avatar: providerInfo.partyLogo || profile.profile_picture_url || null,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
};

export async function fetchProfile(userId, client) {
  const supabase = client || getBrowserClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return mapProfile(data);
}

export async function checkEmail(email) {
  const { data, error } = await getBrowserClient().rpc('email_exists', {
    email_input: email.trim().toLowerCase(),
  });
  if (error) return { success: false, message: error.message };
  return { success: true, exists: !!data };
}

export async function login(email, password) {
  const { data, error } = await getBrowserClient().auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) return { success: false, message: error.message };

  const user = await fetchProfile(data.user.id);
  if (!user) return { success: false, message: 'Profile not found.' };
  return { success: true, user, session: data.session };
}

export async function logout() {
  await getBrowserClient().auth.signOut();
}

export async function getSession() {
  const { data } = await getBrowserClient().auth.getSession();
  return data.session;
}

export async function getCurrentUser() {
  const { data: { user: authUser } } = await getBrowserClient().auth.getUser();
  if (!authUser) return null;
  return fetchProfile(authUser.id);
}

export async function verifyCurrentPassword(email, password) {
  const { error } = await getBrowserClient().auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) return { success: false, message: 'Current password is incorrect' };
  return { success: true };
}

export async function updatePassword(currentPassword, newPassword, email) {
  if (!newPassword || newPassword.length < 8) {
    return { success: false, message: 'New password must be at least 8 characters' };
  }

  const verify = await verifyCurrentPassword(email, currentPassword);
  if (!verify.success) return verify;

  const { error } = await getBrowserClient().auth.updateUser({ password: newPassword });
  if (error) return { success: false, message: error.message };
  return { success: true };
}

export async function updateEmail(newEmail, currentPassword, currentEmail) {
  const trimmed = newEmail.trim().toLowerCase();
  if (!trimmed || !trimmed.includes('@')) {
    return { success: false, message: 'Enter a valid email address' };
  }

  const verify = await verifyCurrentPassword(currentEmail, currentPassword);
  if (!verify.success) return verify;

  const { error } = await getBrowserClient().auth.updateUser({ email: trimmed });
  if (error) return { success: false, message: error.message };
  return { success: true, email: trimmed };
}
