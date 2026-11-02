import { createClient, type Client, type Row } from "@libsql/client";

export interface SubjectGrade {
  subject: string;
  grade: string;
}

export interface Sitting {
  id: number;
  oLevelRegistrationNumber: string;
  exam: string;
  year: string;
  subjects: SubjectGrade[];
}

export interface StudentSubmission {
  id: string;
  jambNumber: string;
  jambScore: number;
  surname: string;
  otherNames: string;
  email: string;
  phoneNumber: string;
  course: string;
  sittings: Sitting[];
  referenceNumber: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionInput {
  jambNumber: string;
  jambScore: number;
  surname: string;
  otherNames: string;
  email: string;
  phoneNumber: string;
  course: string;
  sittings: Sitting[];
}

const url = process.env.TURSO_DATABASE_URL || "file:data/admissions.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

// Singleton client across requests / hot-reloads in serverless environments
declare global {
  // eslint-disable-next-line no-var
  var __tursoClient: Client | undefined;
}

export const db: Client =
  global.__tursoClient ??
  (global.__tursoClient = createClient({
    url,
    authToken,
  }));

let schemaInitialized = false;
export async function ensureSchema(): Promise<void> {
  if (schemaInitialized) return;
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS submissions (
        id TEXT PRIMARY KEY,
        jambNumber TEXT UNIQUE NOT NULL,
        jambScore INTEGER NOT NULL,
        surname TEXT NOT NULL,
        otherNames TEXT NOT NULL,
        email TEXT NOT NULL DEFAULT '',
        phoneNumber TEXT NOT NULL DEFAULT '',
        course TEXT NOT NULL,
        sittings TEXT NOT NULL,
        referenceNumber TEXT UNIQUE NOT NULL,
        status TEXT NOT NULL DEFAULT 'PROVISIONAL_ADMISSION',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);
    await db.execute("CREATE INDEX IF NOT EXISTS idx_submissions_jambNumber ON submissions(jambNumber);");
    await db.execute("CREATE INDEX IF NOT EXISTS idx_submissions_course ON submissions(course);");
    await db.execute("CREATE INDEX IF NOT EXISTS idx_submissions_createdAt ON submissions(createdAt);");
    schemaInitialized = true;
  } catch (err) {
    console.warn("Turso schema ensure note:", err);
  }
}

// Helper to generate official reference numbers: e.g. HCT/2026/ADM-48219
export function generateReferenceNumber(): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `HCT/2026/ADM-${randomNum}`;
}

function parseSubmissionRow(row: Row): StudentSubmission {
  return {
    id: String(row.id),
    jambNumber: String(row.jambNumber),
    jambScore: Number(row.jambScore),
    surname: String(row.surname),
    otherNames: String(row.otherNames),
    email: String(row.email || ""),
    phoneNumber: String(row.phoneNumber || ""),
    course: String(row.course),
    sittings: typeof row.sittings === "string" ? JSON.parse(row.sittings) : ((row.sittings as unknown) as Sitting[]),
    referenceNumber: String(row.referenceNumber),
    status: String(row.status || "PROVISIONAL_ADMISSION"),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

export async function saveOrGetSubmission(input: SubmissionInput): Promise<{
  submission: StudentSubmission;
  isExisting: boolean;
}> {
  await ensureSchema();
  const normalizedJamb = input.jambNumber.trim().toUpperCase();

  // Check if candidate already exists
  const existingResult = await db.execute({
    sql: "SELECT * FROM submissions WHERE jambNumber = ? LIMIT 1",
    args: [normalizedJamb],
  });

  if (existingResult.rows.length > 0) {
    const existing = parseSubmissionRow(existingResult.rows[0]);
    return {
      submission: {
        ...existing,
        email: existing.email || input.email.trim().toLowerCase(),
        phoneNumber: existing.phoneNumber || input.phoneNumber.trim(),
      },
      isExisting: true,
    };
  }

  // Create new submission
  const id = crypto.randomUUID();
  let referenceNumber = generateReferenceNumber();

  // Ensure reference uniqueness
  let attempts = 0;
  while (attempts < 5) {
    const checkRef = await db.execute({
      sql: "SELECT id FROM submissions WHERE referenceNumber = ? LIMIT 1",
      args: [referenceNumber],
    });
    if (checkRef.rows.length === 0) break;
    referenceNumber = generateReferenceNumber();
    attempts++;
  }

  const now = new Date().toISOString();
  const sittingsJson = JSON.stringify(input.sittings);
  const normalizedEmail = input.email.trim().toLowerCase();
  const normalizedPhone = input.phoneNumber.trim();
  const normalizedSurname = input.surname.trim().toUpperCase();
  const normalizedOtherNames = input.otherNames.trim().toUpperCase();
  const normalizedCourse = input.course.trim();

  await db.execute({
    sql: `
      INSERT INTO submissions (
        id, jambNumber, jambScore, surname, otherNames, email, phoneNumber, course, sittings, referenceNumber, status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PROVISIONAL_ADMISSION', ?, ?)
    `,
    args: [
      id,
      normalizedJamb,
      input.jambScore,
      normalizedSurname,
      normalizedOtherNames,
      normalizedEmail,
      normalizedPhone,
      normalizedCourse,
      sittingsJson,
      referenceNumber,
      now,
      now,
    ],
  });

  return {
    submission: {
      id,
      jambNumber: normalizedJamb,
      jambScore: input.jambScore,
      surname: normalizedSurname,
      otherNames: normalizedOtherNames,
      email: normalizedEmail,
      phoneNumber: normalizedPhone,
      course: normalizedCourse,
      sittings: input.sittings,
      referenceNumber,
      status: "PROVISIONAL_ADMISSION",
      createdAt: now,
      updatedAt: now,
    },
    isExisting: false,
  };
}

export async function getSubmissionByJamb(jambNumber: string): Promise<StudentSubmission | null> {
  await ensureSchema();
  const normalized = jambNumber.trim().toUpperCase();
  const result = await db.execute({
    sql: "SELECT * FROM submissions WHERE jambNumber = ? LIMIT 1",
    args: [normalized],
  });

  if (result.rows.length === 0) return null;
  return parseSubmissionRow(result.rows[0]);
}

export async function getSubmissionByReference(referenceNumber: string): Promise<StudentSubmission | null> {
  await ensureSchema();
  const normalized = referenceNumber.trim().toUpperCase();
  const result = await db.execute({
    sql: "SELECT * FROM submissions WHERE referenceNumber = ? LIMIT 1",
    args: [normalized],
  });

  if (result.rows.length === 0) return null;
  return parseSubmissionRow(result.rows[0]);
}

export async function getAllSubmissions(filters?: {
  course?: string;
  search?: string;
}): Promise<StudentSubmission[]> {
  await ensureSchema();
  let query = "SELECT * FROM submissions WHERE 1=1";
  const params: unknown[] = [];

  if (filters?.course && filters.course !== "ALL") {
    query += " AND course = ?";
    params.push(filters.course);
  }

  if (filters?.search && filters.search.trim()) {
    const term = `%${filters.search.trim().toUpperCase()}%`;
    const emailTerm = `%${filters.search.trim().toLowerCase()}%`;
    query += " AND (jambNumber LIKE ? OR surname LIKE ? OR otherNames LIKE ? OR referenceNumber LIKE ? OR email LIKE ? OR phoneNumber LIKE ?)";
    params.push(term, term, term, term, emailTerm, term);
  }

  query += " ORDER BY createdAt DESC";

  const result = await db.execute({
    sql: query,
    args: params as any[],
  });

  return result.rows.map(parseSubmissionRow);
}

export async function getAdminStats(): Promise<{
  totalSubmissions: number;
  todaySubmissions: number;
  courseBreakdown: Array<{ course: string; count: number }>;
}> {
  await ensureSchema();
  const totalRes = await db.execute("SELECT COUNT(*) as count FROM submissions");
  const totalCount = Number(totalRes.rows[0]?.count ?? 0);

  const byCourseRes = await db.execute(
    "SELECT course, COUNT(*) as count FROM submissions GROUP BY course"
  );
  const byCourse = byCourseRes.rows.map((r) => ({
    course: String(r.course),
    count: Number(r.count),
  }));

  const today = new Date().toISOString().slice(0, 10);
  const todayRes = await db.execute({
    sql: "SELECT COUNT(*) as count FROM submissions WHERE createdAt LIKE ?",
    args: [`${today}%`],
  });
  const todayCount = Number(todayRes.rows[0]?.count ?? 0);

  return {
    totalSubmissions: totalCount,
    todaySubmissions: todayCount,
    courseBreakdown: byCourse,
  };
}
