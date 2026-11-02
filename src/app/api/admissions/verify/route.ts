import { NextResponse } from "next/server";
import { z } from "zod";
import { saveOrGetSubmission, SubmissionInput } from "@/lib/db";

const subjectGradeSchema = z.object({
  subject: z.string().min(1, "Subject name is required"),
  grade: z.string().min(1, "Grade is required"),
});

const sittingSchema = z.object({
  id: z.number(),
  oLevelRegistrationNumber: z
    .string()
    .trim()
    .min(5, "O'Level registration number must be at least 5 characters"),
  exam: z.string().min(1, "Exam body is required"),
  year: z.string().min(4, "Exam year is required"),
  subjects: z
    .array(subjectGradeSchema)
    .min(5, "At least 5 subjects are required per sitting")
    .refine(
      (subs) => {
        const names = subs.map((s) => s.subject.trim().toLowerCase()).filter(Boolean);
        return new Set(names).size === names.length;
      },
      { message: "Duplicate subjects detected in the same exam sitting" }
    ),
});

const verifySubmissionSchema = z.object({
  jambNumber: z
    .string()
    .trim()
    .min(6, "JAMB registration number must be at least 6 characters")
    .max(20, "JAMB registration number cannot exceed 20 characters")
    .regex(
      /^[a-zA-Z0-9]+$/,
      "JAMB registration number must contain only letters and numbers"
    ),
  jambScore: z
    .coerce
    .number()
    .int("JAMB score must be an integer")
    .min(0, "JAMB score cannot be less than 0")
    .max(400, "JAMB score cannot exceed 400"),
  surname: z
    .string()
    .trim()
    .min(2, "Surname must be at least 2 characters")
    .max(50, "Surname cannot exceed 50 characters"),
  otherNames: z
    .string()
    .trim()
    .min(2, "Other names must be at least 2 characters")
    .max(80, "Other names cannot exceed 80 characters"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address (e.g. name@example.com)"),
  phoneNumber: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number (at least 7 digits)")
    .max(20, "Phone number cannot exceed 20 characters"),
  course: z
    .string()
    .trim()
    .min(1, "Please select an approved course of study"),
  sittings: z
    .array(sittingSchema)
    .min(1, "At least one O'Level sitting is required")
    .max(2, "A maximum of two O'Level sittings are permitted"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validationResult = verifySubmissionSchema.safeParse(body);

    if (!validationResult.success) {
      const firstIssue = validationResult.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: firstIssue.message || "Invalid submission data",
          details: validationResult.error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const inputData: SubmissionInput = validationResult.data;

    // Verify submission against academic records & persist
    const { submission, isExisting } = await saveOrGetSubmission(inputData);

    return NextResponse.json(
      {
        success: true,
        message: isExisting
          ? "Existing provisional admission record verified."
          : "Provisional admission granted successfully.",
        isExisting,
        admissionOffer: {
          referenceNumber: submission.referenceNumber,
          jambNumber: submission.jambNumber,
          candidateName: `${submission.surname} ${submission.otherNames}`,
          surname: submission.surname,
          otherNames: submission.otherNames,
          email: submission.email,
          phoneNumber: submission.phoneNumber,
          course: submission.course,
          jambScore: submission.jambScore,
          academicSession: "2026/2027",
          status: submission.status,
          dateOffered: submission.createdAt,
          sittings: submission.sittings,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error verifying admission submission:", error);
    const message = error instanceof Error ? error.message : "Internal server error occurred";
    return NextResponse.json(
      {
        success: false,
        error: "Unable to verify submission at this time. Please check your data and try again.",
        technicalDetails: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 }
    );
  }
}
