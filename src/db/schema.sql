CREATE TABLE IF NOT EXISTS courses (
  id         TEXT    PRIMARY KEY,
  name       TEXT    NOT NULL,
  credits    INTEGER NOT NULL,
  department TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS prerequisites (
  course_id TEXT NOT NULL REFERENCES courses(id),
  prereq_id TEXT NOT NULL REFERENCES courses(id),
  PRIMARY KEY (course_id, prereq_id)
);

CREATE TABLE IF NOT EXISTS plan (
  course_id TEXT    PRIMARY KEY REFERENCES courses(id),
  semester  INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 4)
);
