DO $$
DECLARE
    target_session_id UUID := 'c9baaa51-006c-42a7-b4e7-8cfa8fb32024';
    cat_main_id UUID;
    cat_side_id UUID;
    cat_veg_id UUID;
BEGIN
    -- 0. Clean up existing categories for this session to avoid duplicates if re-run
    DELETE FROM menu_items WHERE category_id IN (SELECT id FROM menu_categories WHERE session_id = target_session_id);
    DELETE FROM menu_categories WHERE session_id = target_session_id;

    -- 1. Insert Categories
    INSERT INTO menu_categories (id, session_id, name, display_order, created_at, updated_at)
    VALUES (gen_random_uuid(), target_session_id, '🥓🥩 Món Chính', 1, NOW(), NOW())
    RETURNING id INTO cat_main_id;

    INSERT INTO menu_categories (id, session_id, name, display_order, created_at, updated_at)
    VALUES (gen_random_uuid(), target_session_id, '🥜🍳 Món Phụ', 2, NOW(), NOW())
    RETURNING id INTO cat_side_id;

    INSERT INTO menu_categories (id, session_id, name, display_order, created_at, updated_at)
    VALUES (gen_random_uuid(), target_session_id, '🥦🥬🥗 Món Rau', 3, NOW(), NOW())
    RETURNING id INTO cat_veg_id;

    -- 2. Insert Main Dishes (Món Chính)
    INSERT INTO menu_items (id, category_id, name, price, is_available, created_at, updated_at)
    VALUES 
        (gen_random_uuid(), cat_main_id, 'Thịt Rán Xá Xíu', 25000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_main_id, 'Gà Rang Gừng', 25000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_main_id, 'Thịt Luộc', 25000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_main_id, 'Thịt Kho Su Hào', 25000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_main_id, 'Bò Xào Cần Tỏi Hoa Lơ', 30000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_main_id, 'Chả Lá Lốt', 25000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_main_id, 'Cá Trắm Rán', 25000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_main_id, 'Cá Sốt Cà Chua', 25000, true, NOW(), NOW());

    -- 3. Insert Side Dishes (Món Phụ)
    INSERT INTO menu_items (id, category_id, name, price, is_available, created_at, updated_at)
    VALUES 
        (gen_random_uuid(), cat_side_id, 'Trứng Kho', 10000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_side_id, 'Trứng Ngâm Xì Dầu', 10000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_side_id, 'Đậu Rán', 10000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_side_id, 'Đậu Sốt Ớt Hàn', 12000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_side_id, 'Lạc rang', 5000, true, NOW(), NOW());

    -- 4. Insert Vegetable Dishes (Món Rau)
    INSERT INTO menu_items (id, category_id, name, price, is_available, created_at, updated_at)
    VALUES 
        (gen_random_uuid(), cat_veg_id, 'Su Su Luộc', 10000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_veg_id, 'Hoa Lơ Luộc', 10000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_veg_id, 'Cải Ngọt Xào', 10000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_veg_id, 'Su Hào Xào', 10000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_veg_id, 'Mướp Đắng Xào Thịt Băm', 15000, true, NOW(), NOW());

    -- 5. Activate Combo Rule
    UPDATE combo_rules SET is_active = true WHERE session_id = target_session_id;

END $$;
