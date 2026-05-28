ALTER TABLE inventory_logs
ADD COLUMN unit VARCHAR(20) NULL AFTER quantity;

UPDATE inventory_logs il
LEFT JOIN ingredients i ON il.ingredient_id = i.id
SET il.unit = i.unit
WHERE il.unit IS NULL;
