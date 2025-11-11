# Error Codes

## File Operations
2. Duplicate filename
3. Insufficient disk space
4. Insufficient permissions
5. File not found
6. File already exists at destination
7. File read error
8. File write error
9. File delete error
10. File copy error
11. Directory not found
12. Directory creation failed
13. Directory not writable
14. Directory not readable

## Settings & Configuration
15. Settings file missing
16. Settings file invalid JSON
17. Settings file corrupt
18. DT_BASE_DIR not configured
19. STASH_DIR not configured
20. DT_BASE_DIR path invalid
21. STASH_DIR path invalid
22. DT_BASE_DIR not accessible
23. STASH_DIR not accessible

## Database
24. Database connection failed
25. Database schema invalid
26. Database query error
27. Database write error
28. Record not found

## Model Operations
29. Model type unknown
30. Model not in JSON file
31. Invalid model type
32. Model has dependencies (cannot delete)
33. Model is orphan
34. Model already stashed
35. Model not stashed
36. Parent models exist (file in use)
37. Child files missing

## JSON Operations
38. JSON file not found
39. JSON parse error
40. JSON write error
41. Invalid JSON structure
42. JSON file locked

## Copy/Move/Delete Safety
43. Only copy exists (cannot delete)
44. File referenced by multiple models
45. Attempting to write to DT_BASE_DIR (read-only)
46. Source and destination same
47. Source file missing
48. Destination path invalid

## Network/Updates
49. Network connection failed
50. Update check failed
51. Download failed
52. Invalid download URL
53. Parquet file unavailable

## Initialization
54. App not initialized
55. First-time setup incomplete
56. Database initialization failed

## General
100. Unknown error
