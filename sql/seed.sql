INSERT INTO students (name, email, phone, branch, cgpa, graduation_year)
VALUES
  ('Aarav Sharma', 'aarav@example.com', '9876543210', 'CSE', 8.40, 2026),
  ('Diya Verma', 'diya@example.com', '9988776655', 'ECE', 8.90, 2025),
  ('Rohan Mehta', 'rohan@example.com', '9123456780', 'IT', 7.80, 2027)
ON CONFLICT (email) DO NOTHING;

INSERT INTO companies (company_name, location, min_cgpa)
VALUES
  ('TechNova', 'Bangalore', 7.50),
  ('DataSphere', 'Hyderabad', 8.00)
ON CONFLICT DO NOTHING;

INSERT INTO profile_views (student_id, viewed_by)
SELECT seed.student_id, seed.viewed_by
FROM (
  VALUES
    (1, 'seed'),
    (2, 'seed'),
    (1, 'seed')
) AS seed(student_id, viewed_by)
WHERE NOT EXISTS (SELECT 1 FROM profile_views);
