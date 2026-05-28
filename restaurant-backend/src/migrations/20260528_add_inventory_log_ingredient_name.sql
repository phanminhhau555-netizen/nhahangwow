ALTER TABLE inventory_logs
ADD COLUMN ingredient_name VARCHAR(100) NULL AFTER ingredient_id;

UPDATE inventory_logs il
LEFT JOIN ingredients i ON il.ingredient_id = i.id
SET il.ingredient_name = i.name
WHERE il.ingredient_name IS NULL;
