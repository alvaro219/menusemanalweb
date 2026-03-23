-- =====================================================
-- Supabase Schema para Menú Semanal Web
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================

-- Tabla de perfiles de usuario (se sincroniza con auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para crear perfil automáticamente al registrar usuario
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Tabla de comidas
CREATE TABLE IF NOT EXISTS meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  meal_time TEXT NOT NULL DEFAULT 'comida',
  type TEXT NOT NULL DEFAULT 'vegetables',
  is_favorite BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  custom_type_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de menús semanales
CREATE TABLE IF NOT EXISTS weekly_menus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  days JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de tipos de comida personalizados
CREATE TABLE IF NOT EXISTS custom_meal_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  icon TEXT NOT NULL DEFAULT 'restaurant',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de tiempos de comida
CREATE TABLE IF NOT EXISTS meal_times (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🍽️',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de configuración del menú
CREATE TABLE IF NOT EXISTS menu_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  type_distribution JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de solicitudes de amistad
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id)
);

-- Tabla de menús compartidos
CREATE TABLE IF NOT EXISTS shared_menus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shared_with_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  menu_data JSONB NOT NULL,
  shared_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_meal_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_menus ENABLE ROW LEVEL SECURITY;

-- Profiles: usuarios pueden ver todos los perfiles, editar solo el suyo
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Meals: solo el propietario puede CRUD
CREATE POLICY "Users can view own meals" ON meals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meals" ON meals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meals" ON meals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meals" ON meals FOR DELETE USING (auth.uid() = user_id);

-- Weekly Menus
CREATE POLICY "Users can view own menus" ON weekly_menus FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own menus" ON weekly_menus FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own menus" ON weekly_menus FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own menus" ON weekly_menus FOR DELETE USING (auth.uid() = user_id);

-- Custom Meal Types
CREATE POLICY "Users can view own types" ON custom_meal_types FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own types" ON custom_meal_types FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own types" ON custom_meal_types FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own types" ON custom_meal_types FOR DELETE USING (auth.uid() = user_id);

-- Meal Times
CREATE POLICY "Users can view own times" ON meal_times FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own times" ON meal_times FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own times" ON meal_times FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own times" ON meal_times FOR DELETE USING (auth.uid() = user_id);

-- Menu Config
CREATE POLICY "Users can view own config" ON menu_config FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own config" ON menu_config FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own config" ON menu_config FOR UPDATE USING (auth.uid() = user_id);

-- Friend Requests: sender y receiver pueden ver
CREATE POLICY "Users can view own requests" ON friend_requests FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send requests" ON friend_requests FOR INSERT
  WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Receiver can update request" ON friend_requests FOR UPDATE
  USING (auth.uid() = receiver_id);
CREATE POLICY "Users can delete own friendships" ON friend_requests FOR DELETE
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Shared Menus
CREATE POLICY "Users can view received menus" ON shared_menus FOR SELECT
  USING (auth.uid() = shared_with_id OR auth.uid() = owner_id);
CREATE POLICY "Users can share menus" ON shared_menus FOR INSERT
  WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can delete shared menus" ON shared_menus FOR DELETE
  USING (auth.uid() = shared_with_id OR auth.uid() = owner_id);
