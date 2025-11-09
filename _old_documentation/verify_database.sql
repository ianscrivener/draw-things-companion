-- Database Verification Script
-- Run this after reloading the app with a fresh database
-- Usage: sqlite3 ~/.drawthings_companion/drawthings_companion.sqlite < verify_database.sql

.mode column
.headers on
.width 50 15 15 10 10

-- ================================================================================
-- 1. Count models by location
-- ================================================================================
.print ""
.print "=================================================="
.print "1. MODEL COUNT BY LOCATION"
.print "=================================================="
SELECT
    COUNT(*) as total_models,
    SUM(exists_mac_hd) as mac_hd_count,
    SUM(exists_stash) as stash_count,
    SUM(CASE WHEN exists_mac_hd = 1 AND exists_stash = 1 THEN 1 ELSE 0 END) as in_both
FROM ckpt_models;

-- ================================================================================
-- 2. Count models by type
-- ================================================================================
.print ""
.print "=================================================="
.print "2. MODEL COUNT BY TYPE"
.print "=================================================="
SELECT
    model_type,
    COUNT(*) as count,
    SUM(exists_mac_hd) as on_mac_hd,
    SUM(exists_stash) as in_stash
FROM ckpt_models
GROUP BY model_type
ORDER BY count DESC;

-- ================================================================================
-- 3. Relationship count
-- ================================================================================
.print ""
.print "=================================================="
.print "3. RELATIONSHIP COUNT"
.print "=================================================="
SELECT COUNT(*) as total_relationships FROM ckpt_x_ckpt;

-- ================================================================================
-- 4. Main models with their display names
-- ================================================================================
.print ""
.print "=================================================="
.print "4. MAIN MODELS (Should have display names)"
.print "=================================================="
.width 50 40 10
SELECT
    filename,
    COALESCE(display_name, '*** NULL ***') as display_name,
    model_type
FROM ckpt_models
WHERE model_type = 'model'
ORDER BY mac_display_order;

-- ================================================================================
-- 5. LoRAs with strength values
-- ================================================================================
.print ""
.print "=================================================="
.print "5. LORAS (Should have display names & strengths)"
.print "=================================================="
.width 50 40 10
SELECT
    filename,
    COALESCE(display_name, '*** NULL ***') as display_name,
    COALESCE(CAST(lora_strength as TEXT), '*** NULL ***') as strength_x10
FROM ckpt_models
WHERE model_type = 'lora'
ORDER BY mac_display_order
LIMIT 10;

-- ================================================================================
-- 6. Encoders (should be typed as clip, text, or vae)
-- ================================================================================
.print ""
.print "=================================================="
.print "6. ENCODERS (Should be clip, text, or vae types)"
.print "=================================================="
.width 50 15 10
SELECT
    filename,
    model_type,
    CASE
        WHEN exists_mac_hd = 1 AND exists_stash = 1 THEN 'Both'
        WHEN exists_mac_hd = 1 THEN 'Mac HD'
        WHEN exists_stash = 1 THEN 'Stash'
        ELSE 'Neither'
    END as location
FROM ckpt_models
WHERE model_type IN ('clip', 'text', 'vae')
ORDER BY model_type, filename;

-- ================================================================================
-- 7. Model relationships (main models → encoders)
-- ================================================================================
.print ""
.print "=================================================="
.print "7. MODEL RELATIONSHIPS (Main → Encoders)"
.print "=================================================="
.width 40 40 10
SELECT
    COALESCE(p.display_name, p.filename) as main_model,
    c.filename as encoder_file,
    c.model_type as encoder_type
FROM ckpt_x_ckpt r
JOIN ckpt_models p ON r.parent_ckpt_filename = p.filename
JOIN ckpt_models c ON r.child_ckpt_filename = c.filename
ORDER BY p.mac_display_order, c.model_type;

-- ================================================================================
-- 8. Check for issues
-- ================================================================================
.print ""
.print "=================================================="
.print "8. POTENTIAL ISSUES CHECK"
.print "=================================================="

.print ""
.print "Models with no display name (excluding encoders):"
SELECT COUNT(*) as count
FROM ckpt_models
WHERE display_name IS NULL
  AND model_type NOT IN ('clip', 'text', 'vae', 'unknown');

.print ""
.print "LoRAs missing strength values:"
SELECT COUNT(*) as count
FROM ckpt_models
WHERE model_type = 'lora' AND lora_strength IS NULL;

.print ""
.print "Main models with no relationships:"
SELECT COUNT(*) as count
FROM ckpt_models m
WHERE m.model_type = 'model'
  AND NOT EXISTS (
    SELECT 1 FROM ckpt_x_ckpt r WHERE r.parent_ckpt_filename = m.filename
  );

.print ""
.print "Models marked as neither Mac HD nor Stash:"
SELECT COUNT(*) as count
FROM ckpt_models
WHERE exists_mac_hd = 0 AND exists_stash = 0;

-- ================================================================================
-- 9. Shared encoders (used by multiple main models)
-- ================================================================================
.print ""
.print "=================================================="
.print "9. SHARED ENCODERS (Used by multiple models)"
.print "=================================================="
.width 40 15 10
SELECT
    c.filename as encoder_file,
    c.model_type as encoder_type,
    COUNT(DISTINCT r.parent_ckpt_filename) as used_by_count
FROM ckpt_x_ckpt r
JOIN ckpt_models c ON r.child_ckpt_filename = c.filename
GROUP BY c.filename, c.model_type
HAVING COUNT(DISTINCT r.parent_ckpt_filename) > 1
ORDER BY used_by_count DESC, c.model_type;

.print ""
.print "=================================================="
.print "Verification complete!"
.print "=================================================="
.print ""
