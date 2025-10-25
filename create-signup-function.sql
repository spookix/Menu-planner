-- Script pour créer une fonction d'inscription complète
-- À exécuter dans l'éditeur SQL de Supabase

-- Fonction pour créer un utilisateur avec son profil
CREATE OR REPLACE FUNCTION public.signup_user(
  user_email text,
  user_password text,
  user_username text
)
RETURNS json AS $$
DECLARE
  new_user_id uuid;
  result json;
BEGIN
  -- Créer l'utilisateur dans auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    json_build_object('username', user_username),
    false,
    '',
    '',
    '',
    ''
  ) RETURNING id INTO new_user_id;

  -- Créer le profil utilisateur
  INSERT INTO public.user_profiles (id, username, full_name)
  VALUES (new_user_id, user_username, user_username);

  -- Retourner le résultat
  result := json_build_object(
    'success', true,
    'user_id', new_user_id,
    'message', 'Utilisateur créé avec succès'
  );

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    result := json_build_object(
      'success', false,
      'error', SQLERRM
    );
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permettre l'exécution de la fonction
GRANT EXECUTE ON FUNCTION public.signup_user TO anon;
GRANT EXECUTE ON FUNCTION public.signup_user TO authenticated;

