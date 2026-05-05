DO $$
DECLARE
    target_session_id UUID := '214f2684-cce5-434f-a277-fa32d4c66771';
    cat_main_id UUID;
    cat_side_id UUID;
    cat_veg_id UUID;
    cat_extra_id UUID;
    cat_drink_id UUID;
BEGIN
    -- 0. Xóa dữ liệu cũ của session này (nếu có)
    DELETE FROM menu_items WHERE category_id IN (SELECT id FROM menu_categories WHERE session_id = target_session_id);
    DELETE FROM menu_categories WHERE session_id = target_session_id;

    -- 1. Tạo các danh mục
    INSERT INTO menu_categories (id, session_id, name, display_order, created_at, updated_at)
    VALUES (gen_random_uuid(), target_session_id, '🥓🥩 Món Chính', 1, NOW(), NOW())
    RETURNING id INTO cat_main_id;

    INSERT INTO menu_categories (id, session_id, name, display_order, created_at, updated_at)
    VALUES (gen_random_uuid(), target_session_id, '🥜🍳 Món Phụ', 2, NOW(), NOW())
    RETURNING id INTO cat_side_id;

    INSERT INTO menu_categories (id, session_id, name, display_order, created_at, updated_at)
    VALUES (gen_random_uuid(), target_session_id, '🥦🥬🥗 Món Rau', 3, NOW(), NOW())
    RETURNING id INTO cat_veg_id;

    INSERT INTO menu_categories (id, session_id, name, display_order, created_at, updated_at)
    VALUES (gen_random_uuid(), target_session_id, '🥡 Gọi Thêm Món', 4, NOW(), NOW())
    RETURNING id INTO cat_extra_id;

    INSERT INTO menu_categories (id, session_id, name, display_order, created_at, updated_at)
    VALUES (gen_random_uuid(), target_session_id, '🍎 Đồ Uống', 5, NOW(), NOW())
    RETURNING id INTO cat_drink_id;

    -- 2. Món Chính (20k/món)
    INSERT INTO menu_items (id, category_id, name, price, is_available, created_at, updated_at)
    VALUES
        (gen_random_uuid(), cat_main_id, 'Sườn Sốt Cay Ngọt', 20000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_main_id, 'Gà Xào Sả Ớt', 20000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_main_id, 'Thịt Băm Ngô', 20000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_main_id, 'Thịt Sốt Đậu', 20000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_main_id, 'Chả Cá Sốt Cà Chua', 20000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_main_id, 'Heo Quay Giòn Bì', 20000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_main_id, 'Cá Trắm Rán', 20000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_main_id, 'Cá Sốt Cà Chua', 20000, true, NOW(), NOW());

    -- 3. Món Phụ (10k/món)
    INSERT INTO menu_items (id, category_id, name, price, is_available, created_at, updated_at)
    VALUES
        (gen_random_uuid(), cat_side_id, 'Trứng Ốp', 10000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_side_id, 'Trứng Cuộn', 10000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_side_id, 'Đậu Rán', 10000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_side_id, 'Đậu Sốt Cà Chua', 10000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_side_id, 'Lạc rang', 10000, true, NOW(), NOW());

    -- 4. Món Rau (10k/món)
    INSERT INTO menu_items (id, category_id, name, price, is_available, created_at, updated_at)
    VALUES
        (gen_random_uuid(), cat_veg_id, 'Rau Cải Luộc', 10000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_veg_id, 'Cải Thảo Xào', 10000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_veg_id, 'Giá Xào', 10000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_veg_id, 'Bí Đỏ Xào', 10000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_veg_id, 'Dưa Muối', 10000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_veg_id, 'Cà Muối', 10000, true, NOW(), NOW());

    -- 5. Gọi Thêm Món
    INSERT INTO menu_items (id, category_id, name, price, is_available, created_at, updated_at)
    VALUES
        (gen_random_uuid(), cat_extra_id, 'Heo Quay Giòn Bì (100g)', 35000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_extra_id, 'Canh Cua', 10000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_extra_id, 'Lạc rang (hộp)', 10000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_extra_id, 'Cơm trắng (hộp)', 10000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_extra_id, 'Cà pháo (hộp)', 10000, true, NOW(), NOW());

    -- 6. Đồ Uống
    INSERT INTO menu_items (id, category_id, name, price, is_available, created_at, updated_at)
    VALUES
        (gen_random_uuid(), cat_drink_id, 'Nước ép ổi', 25000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_drink_id, 'Nước ép Táo 🍎', 25000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_drink_id, 'Nước ép Cam 🍊', 25000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_drink_id, 'Nước ép Dưa hấu 🍉', 25000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_drink_id, 'Nước ép Cam dứa 🍍', 25000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_drink_id, 'Nước ép Chanh leo 🍋', 25000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_drink_id, 'Sinh tố mãng cầu 🥤', 25000, true, NOW(), NOW()),
        (gen_random_uuid(), cat_drink_id, 'Sinh tố Xoài 🥭', 25000, true, NOW(), NOW());

    RAISE NOTICE 'Done! Session: % has been populated with menu items.', target_session_id;
END $$;
