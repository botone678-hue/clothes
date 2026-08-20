-- ==============================================================================
-- CLOTHES SPA LAUNDRY (Eldoret, Kenya) - Production Supabase PostgreSQL Schema
-- Location: Hawaii Area, Eldoret, Kenya | Phone: 0741775878
-- ==============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Customers, Drivers, Admins)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'driver', 'admin')),
    avatar_url TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CUSTOMER ADDRESSES TABLE (Eldoret locations)
CREATE TABLE IF NOT EXISTS customer_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    area TEXT NOT NULL, -- e.g. Hawaii, Elgon View, Annex, Kapsoya, Pioneer, CBD
    additional_details TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. SERVICES TABLE
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('wash_fold', 'wash_iron', 'dry_clean', 'bedding', 'curtains', 'suits', 'shoes', 'special')),
    price_type TEXT NOT NULL CHECK (price_type IN ('per_kg', 'per_item', 'per_pair', 'fixed')),
    base_price NUMERIC(10, 2) NOT NULL,
    image_url TEXT NOT NULL,
    estimated_duration TEXT NOT NULL DEFAULT '24-48 hours',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    pickup_address_id UUID REFERENCES customer_addresses(id) ON DELETE SET NULL,
    pickup_address_text TEXT NOT NULL,
    pickup_area TEXT NOT NULL,
    driver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'confirmed',
            'driver_assigned',
            'pickup_scheduled',
            'picked_up',
            'processing',
            'ready_for_delivery',
            'out_for_delivery',
            'delivered',
            'completed',
            'cancelled'
        )
    ),
    pickup_date DATE NOT NULL,
    pickup_time TEXT NOT NULL,
    delivery_date DATE,
    delivery_time TEXT,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 150.00,
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (
        payment_status IN ('pending', 'processing', 'paid', 'failed', 'cancelled', 'refunded')
    ),
    payment_method TEXT NOT NULL DEFAULT 'mpesa' CHECK (
        payment_method IN ('mpesa', 'cash_on_delivery', 'card')
    ),
    special_instructions TEXT,
    customer_notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    service_name TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. PAYMENTS TABLE (M-Pesa, Cash, Card)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'KES',
    payment_method TEXT NOT NULL,
    transaction_reference TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'processing', 'successful', 'failed', 'cancelled', 'refunded')
    ),
    provider_response JSONB,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. DRIVER ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS driver_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'accepted', 'declined', 'completed')
    ),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- 8. ORDER STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    changed_by_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. BUSINESS SETTINGS TABLE
CREATE TABLE IF NOT EXISTS business_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    business_name TEXT NOT NULL DEFAULT 'Clothes Spa Laundry',
    phone TEXT NOT NULL DEFAULT '0741775878',
    location TEXT NOT NULL DEFAULT 'Hawaii Area, Eldoret, Kenya',
    opening_hours TEXT NOT NULL DEFAULT 'Mon-Sat: 7:00 AM - 8:00 PM | Sun: 9:00 AM - 6:00 PM',
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 150.00,
    currency TEXT NOT NULL DEFAULT 'KES',
    minimum_order_amount NUMERIC(10, 2) NOT NULL DEFAULT 300.00,
    mpesa_shortcode TEXT NOT NULL DEFAULT '174379',
    mpesa_type TEXT NOT NULL DEFAULT 'Buy Goods / Till',
    support_email TEXT NOT NULL DEFAULT 'info@clothesspalaundry.co.ke',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SEED BUSINESS SETTINGS
INSERT INTO business_settings (id, business_name, phone, location, opening_hours, delivery_fee, currency, minimum_order_amount, mpesa_shortcode)
VALUES ('default', 'Clothes Spa Laundry', '0741775878', 'Hawaii Area, Eldoret, Kenya', 'Mon-Sat: 7:00 AM - 8:00 PM | Sun: 9:00 AM - 6:00 PM', 150.00, 'KES', 300.00, '174379')
ON CONFLICT (id) DO NOTHING;

-- SEED INITIAL SERVICES
INSERT INTO services (name, description, category, price_type, base_price, image_url, estimated_duration)
VALUES
('Wash, Dry & Fold', 'Everyday clothes thoroughly washed, sanitized with fresh scented fabric conditioner, tumble-dried, and crisply folded.', 'wash_fold', 'per_kg', 150.00, 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=800&q=80', '24 hours'),
('Wash & Professional Ironing', 'Complete wet wash followed by high-pressure steam pressing on hangers or precision folding.', 'wash_iron', 'per_item', 80.00, 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=800&q=80', '24-48 hours'),
('Executive Suits Dry Cleaning', 'Specialized gentle solvent cleaning, stain removal, and lapel contour pressing for two-piece and three-piece suits.', 'suits', 'per_item', 600.00, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80', '48 hours'),
('Heavy Duvet & Comforter Spa', 'Deep thermal extraction washing and allergen disinfection for double/king duvets, blankets, and bedspreads.', 'bedding', 'per_item', 700.00, 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80', '48 hours'),
('Curtains & Heavy Drapes', 'Dust extraction, gentle wash, and anti-static steam finishing for living room sheer and blackout curtains.', 'curtains', 'per_kg', 250.00, 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', '48 hours'),
('Sneakers & Shoe Restoration', 'Hand wash, sole deoxidization, insole sanitization, odor neutralization, and waterproof protector spray.', 'shoes', 'per_pair', 350.00, 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80', '24-48 hours'),
('Wedding Gown & Evening Dresses', 'Delicate lace, beadwork, and silk garment preservation with museum-grade protective packaging.', 'special', 'per_item', 2500.00, 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80', '72 hours'),
('Bed Sheets & Pillowcases (Set)', 'Deep wash, fabric softening, crisp hotel-finish flat-iron pressing for double/queen bed sets.', 'bedding', 'per_item', 300.00, 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=800&q=80', '24 hours')
ON CONFLICT DO NOTHING;

-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- Profiles: Users can view their own profile; Admins can view all; Users can update their own profile
CREATE POLICY "Public profiles are readable by authenticated users" ON profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Admins full access to profiles" ON profiles
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'admin')
    );

-- Services: Everyone can read active services; Admins can manage
CREATE POLICY "Active services are public" ON services
    FOR SELECT USING (active = TRUE OR EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins manage services" ON services
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'admin')
    );

-- Business Settings: Public read, Admin write
CREATE POLICY "Business settings readable" ON business_settings
    FOR SELECT USING (TRUE);

CREATE POLICY "Admins manage business settings" ON business_settings
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'admin')
    );

-- Orders:
-- Customers can view & create their own orders
-- Drivers can view orders assigned to them
-- Admins have full access
CREATE POLICY "Customers view own orders" ON orders
    FOR SELECT USING (
        customer_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
        OR driver_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Customers create orders" ON orders
    FOR INSERT WITH CHECK (
        customer_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "Admins update any order" ON orders
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'admin')
        OR driver_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    );

-- Order Items: Viewable by order owners, drivers, admins
CREATE POLICY "View order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND (
                orders.customer_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
                OR orders.driver_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
                OR EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'admin')
            )
        )
    );

-- Realtime Publication setup for orders and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE driver_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE order_status_history;
