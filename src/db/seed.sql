DELETE FROM plan;
DELETE FROM prerequisites;
DELETE FROM courses;

-- Real Brandeis courses (University Bulletin). Each is a 4-credit course.
INSERT INTO courses (id, name, credits, department) VALUES
  ('anth5a',   'Human Origins',                                      4, 'ANTH'),
  ('anth137a', 'GIS: Mapping Culture from Land, Air and Space',      4, 'ANTH'),
  ('cosi10a',  'Introduction to Problem Solving in Python',          4, 'COSI'),
  ('cosi12b',  'Advanced Programming Techniques in Java',            4, 'COSI'),
  ('cosi21a',  'Data Structures & the Fundamentals of Computing',    4, 'COSI'),
  ('cosi29a',  'Discrete Structures',                                4, 'COSI'),
  ('cosi103a', 'Fundamentals of Software Engineering',               4, 'COSI'),
  ('cosi106b', 'Automation in Software Development',                 4, 'COSI'),
  ('cosi127b', 'Database Management Systems',                        4, 'COSI'),
  ('cosi130a', 'Introduction to the Theory of Computation',          4, 'COSI'),
  ('math10a',  'Techniques of Calculus (a)',                         4, 'MATH'),
  ('math15a',  'Linear Algebra',                                     4, 'MATH'),
  ('math39a',  'Introduction to Combinatorics',                      4, 'MATH');

INSERT INTO prerequisites (course_id, prereq_id) VALUES
  ('cosi12b',  'cosi10a'),
  ('cosi21a',  'cosi12b'),
  ('cosi103a', 'cosi12b'),
  ('cosi106b', 'cosi21a'),
  ('cosi127b', 'cosi21a'),
  ('cosi127b', 'cosi29a'),
  ('cosi130a', 'cosi29a'),
  ('math15a',  'math10a'),
  ('math39a',  'cosi29a');  -- cross-department prerequisite
