-- 1. Create enum for user roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'admin', 'staff');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'customer';

-- 3. Create pizzas table
CREATE TABLE IF NOT EXISTS pizzas (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    image_url TEXT NOT NULL,
    is_vegetarian BOOLEAN DEFAULT false,
    is_spicy BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create toppings table
CREATE TABLE IF NOT EXISTS toppings (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Seed Pizzas
INSERT INTO pizzas (id, name, description, base_price, image_url, is_vegetarian, is_spicy)
VALUES 
    ('p1', 'Margherita', 'Classic delight with 100% real mozzarella cheese and signature tomato sauce', 12.99, '/margherita_base_1773520640500.png', true, false),
    ('p2', 'Pepperoni', 'Double pepperonis and mozzarella cheese on a classic crust', 14.99, '/pepperoni_base_1773520658070.png', false, true),
    ('p3', 'Veggie Supreme', 'Mushrooms, bell peppers, onions, black olives, and tomatoes', 15.99, '/veggie_supreme_base_1773520675502.png', true, false),
    ('p4', 'BBQ Chicken', 'Grilled chicken, red onions, cilantro, and BBQ sauce', 16.99, '/bbq_chicken_base_1773520692477.png', false, false),
    ('p5', 'Meat Lovers', 'The ultimate feast: Pepperoni, Italian sausage, smoked ham, and crispy bacon', 18.99, '/meat_lovers_base_1773952192832.png', false, false),
    ('p6', 'Hawaiian Paradise', 'Sweet and savory harmony with succulent ham and fresh juicy pineapple chunks', 15.99, '/hawaiian_paradise_base_1773952209302.png', false, false),
    ('p7', 'Buffalo Heat', 'Buffalo chicken, red onions, and cool ranch drizzle', 17.99, '/buffalo_heat_base_1773952227370.png', false, true),
    ('p8', 'Truffle Bliss', 'Wild mushrooms, truffle oil, and fresh baby arugula', 19.99, '/truffle_bliss_base_1773952247350.png', true, false)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    base_price = EXCLUDED.base_price,
    image_url = EXCLUDED.image_url,
    is_vegetarian = EXCLUDED.is_vegetarian,
    is_spicy = EXCLUDED.is_spicy;

-- 6. Seed Toppings
INSERT INTO toppings (id, name, price)
VALUES 
    ('t1', 'Extra Cheese', 1.50),
    ('t2', 'Mushrooms', 1.00),
    ('t3', 'Onions', 0.75),
    ('t4', 'Black Olives', 1.00),
    ('t5', 'Jalapeños', 0.75),
    ('t6', 'Bacon', 2.00)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price;
