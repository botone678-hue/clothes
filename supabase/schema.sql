-- ==============================================================================
-- CLOTHES SPA LAUNDRY (Eldoret, Kenya) - Production Supabase PostgreSQL Schema
-- Hub Location: Hawaii Area, Eldoret, Kenya | Phone: 0741775878
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
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. DRIVERS TABLE (Extended Driver Metadata linked to Profiles)
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    vehicle_type TEXT NOT NULL DEFAULT 'Motorbike',
    vehicle_registration TEXT,
    zone TEXT DEFAULT 'Hawaii Area & Eldoret',
    availability_status TEXT NOT NULL DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'offline')),
    current_latitude DOUBLE PRECISION,
    current_longitude DOUBLE PRECISION,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ADDRESSES TABLE (Customer Saved Locations in Eldoret)
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    label TEXT NOT NULL DEFAULT 'Home',
    address_line TEXT NOT NULL,
    area TEXT NOT NULL, -- e.g. Hawaii Area, Elgon View, Annex, Kapsoya, Pioneer, CBD, Kimumu
    landmark TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Compatibility view for customer_addresses
CREATE OR REPLACE VIEW customer_addresses AS
SELECT 
    id,
    customer_id,
    label,
    address_line AS address,
    area,
    landmark AS additional_details,
    latitude,
    longitude,
    is_default,
    created_at,
    updated_at
FROM addresses;

-- 4. SERVICES TABLE
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL CHECK (category IN ('wash_fold', 'wash_iron', 'dry_clean', 'bedding', 'curtains', 'suits', 'shoes', 'special')),
    price_type TEXT NOT NULL CHECK (price_type IN ('per_kg', 'per_item', 'per_pair', 'fixed')),
    base_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    image_url TEXT,
    estimated_duration TEXT NOT NULL DEFAULT '24-48 hours',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
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
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (
        payment_status IN ('pending', 'processing', 'paid', 'failed', 'cancelled', 'refunded')
    ),
    payment_method TEXT NOT NULL DEFAULT 'mpesa' CHECK (
        payment_method IN ('mpesa', 'cash_on_delivery', 'card')
    ),
    pickup_address_text TEXT NOT NULL,
    pickup_area TEXT NOT NULL,
    pickup_latitude DOUBLE PRECISION,
    pickup_longitude DOUBLE PRECISION,
    pickup_date DATE NOT NULL,
    pickup_time TEXT NOT NULL,
    delivery_address_text TEXT,
    delivery_area TEXT,
    delivery_latitude DOUBLE PRECISION,
    delivery_longitude DOUBLE PRECISION,
    delivery_date DATE,
    delivery_time TEXT,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 150.00,
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    driver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    driver_name TEXT,
    driver_phone TEXT,
    notes TEXT,
    special_instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    service_name TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    provider TEXT NOT NULL DEFAULT 'mpesa',
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'processing', 'successful', 'paid', 'failed', 'cancelled', 'refunded')
    ),
    transaction_reference TEXT,
    checkout_request_id TEXT,
    receipt_number TEXT,
    provider_response JSONB,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. DRIVER ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS driver_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'assigned' CHECK (
        status IN ('assigned', 'accepted', 'in_transit', 'completed', 'cancelled')
    ),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. ORDER STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    changed_by_name TEXT,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'order_update',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. BUSINESS SETTINGS TABLE
CREATE TABLE IF NOT EXISTS business_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    business_name TEXT NOT NULL DEFAULT 'Clothes Spa Laundry',
    phone TEXT NOT NULL DEFAULT '0741775878',
    location TEXT NOT NULL DEFAULT 'Hawaii Area, Eldoret, Kenya',
    opening_hours TEXT NOT NULL DEFAULT 'Mon-Sat: 7:00 AM - 8:00 PM | Sun: 9:00 AM - 6:00 PM',
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 150.00,
    currency TEXT NOT NULL DEFAULT 'KES',
    minimum_order_amount NUMERIC(10, 2) NOT NULL DEFAULT 300.00,
    mpesa_phone TEXT NOT NULL DEFAULT '0741775878',
    mpesa_type TEXT NOT NULL DEFAULT 'Pochi la Biashara',
    mpesa_name TEXT NOT NULL DEFAULT 'Clothes Spa Laundry',
    support_email TEXT NOT NULL DEFAULT 'info@clothesspalaundry.co.ke',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SEED BUSINESS SETTINGS
INSERT INTO business_settings (id, business_name, phone, location, opening_hours, delivery_fee, currency, minimum_order_amount, mpesa_phone, mpesa_type, mpesa_name)
VALUES ('default', 'Clothes Spa Laundry', '0741775878', 'Hawaii Area, Eldoret, Kenya', 'Mon-Sat: 7:00 AM - 8:00 PM | Sun: 9:00 AM - 6:00 PM', 150.00, 'KES', 300.00, '0741775878', 'Pochi la Biashara', 'Clothes Spa Laundry')
ON CONFLICT (id) DO UPDATE SET
    phone = EXCLUDED.phone,
    location = EXCLUDED.location,
    delivery_fee = EXCLUDED.delivery_fee,
    mpesa_phone = EXCLUDED.mpesa_phone,
    mpesa_type = EXCLUDED.mpesa_type,
    mpesa_name = EXCLUDED.mpesa_name;

-- SEED INITIAL SERVICES FOR CLOTHES SPA LAUNDRY
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

-- -----------------------------------------------------------------------------
-- AUTOMATIC PROFILE CREATION TRIGGER FOR AUTH.USERS
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        auth_user_id,
        full_name,
        email,
        phone,
        role,
        status,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (auth_user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS checks
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE auth_user_id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_current_profile_id()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles RLS
CREATE POLICY "Profiles readable by owner and admin" ON profiles
    FOR SELECT USING (
        auth_user_id = auth.uid()
        OR public.is_admin()
        OR role = 'driver'
    );

CREATE POLICY "Users update own profile" ON profiles
    FOR UPDATE USING (auth_user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admin insert/delete profiles" ON profiles
    FOR ALL USING (public.is_admin());

-- 2. Drivers RLS
CREATE POLICY "Drivers readable by authenticated" ON drivers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Drivers manageable by admin and owner" ON drivers
    FOR ALL USING (
        profile_id = public.get_current_profile_id()
        OR public.is_admin()
    );

-- 3. Addresses RLS
CREATE POLICY "Addresses accessed by owner and admin" ON addresses
    FOR ALL USING (
        customer_id = public.get_current_profile_id()
        OR public.is_admin()
    );

-- 4. Services RLS
CREATE POLICY "Services readable by all" ON services
    FOR SELECT USING (active = TRUE OR public.is_admin());

CREATE POLICY "Services managed by admin" ON services
    FOR ALL USING (public.is_admin());

-- 5. Business Settings RLS
CREATE POLICY "Business settings readable by all" ON business_settings
    FOR SELECT USING (TRUE);

CREATE POLICY "Business settings managed by admin" ON business_settings
    FOR ALL USING (public.is_admin());

-- 6. Orders RLS
CREATE POLICY "Customers view own orders" ON orders
    FOR SELECT USING (
        customer_id = public.get_current_profile_id()
        OR driver_id = public.get_current_profile_id()
        OR public.is_admin()
    );

CREATE POLICY "Customers and guests create orders" ON orders
    FOR INSERT WITH CHECK (
        customer_id = public.get_current_profile_id()
        OR customer_id IS NULL
        OR public.is_admin()
    );

CREATE POLICY "Orders updated by admin or assigned driver" ON orders
    FOR UPDATE USING (
        public.is_admin()
        OR driver_id = public.get_current_profile_id()
        OR (customer_id = public.get_current_profile_id() AND status = 'pending')
    );

-- 7. Order Items RLS
CREATE POLICY "Order items viewable by authorized parties" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND (
                orders.customer_id = public.get_current_profile_id()
                OR orders.driver_id = public.get_current_profile_id()
                OR public.is_admin()
            )
        )
    );

CREATE POLICY "Order items insertable on order creation" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND (
                orders.customer_id = public.get_current_profile_id()
                OR orders.customer_id IS NULL
                OR public.is_admin()
            )
        )
    );

-- 8. Payments RLS
CREATE POLICY "Payments viewable by customer and admin" ON payments
    FOR SELECT USING (
        customer_id = public.get_current_profile_id()
        OR public.is_admin()
    );

CREATE POLICY "Payments insertable during checkout" ON payments
    FOR INSERT WITH CHECK (
        customer_id = public.get_current_profile_id()
        OR customer_id IS NULL
        OR public.is_admin()
    );

CREATE POLICY "Payments updatable by admin" ON payments
    FOR UPDATE USING (public.is_admin());

-- 9. Driver Assignments RLS
CREATE POLICY "Driver assignments viewable by driver and admin" ON driver_assignments
    FOR SELECT USING (
        driver_id = public.get_current_profile_id()
        OR public.is_admin()
    );

CREATE POLICY "Driver assignments manageable by admin and assigned driver" ON driver_assignments
    FOR ALL USING (
        driver_id = public.get_current_profile_id()
        OR public.is_admin()
    );

-- 10. Order Status History RLS
CREATE POLICY "Status history viewable by order parties" ON order_status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_status_history.order_id
            AND (
                orders.customer_id = public.get_current_profile_id()
                OR orders.driver_id = public.get_current_profile_id()
                OR public.is_admin()
            )
        )
    );

CREATE POLICY "Status history insertable by admin and driver" ON order_status_history
    FOR INSERT WITH CHECK (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_status_history.order_id
            AND orders.driver_id = public.get_current_profile_id()
        )
    );

-- 11. Notifications RLS
CREATE POLICY "Notifications accessed by recipient" ON notifications
    FOR ALL USING (recipient_id = public.get_current_profile_id() OR public.is_admin());

-- -----------------------------------------------------------------------------
-- REALTIME PUBLICATION CONFIGURATION
-- -----------------------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_status_history;
ALTER PUBLICATION supabase_realtime ADD TABLE driver_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
