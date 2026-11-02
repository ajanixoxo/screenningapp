"use client";

import { type FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  Printer,
  Download,
  ShieldCheck,
  RefreshCw,
  Lock,
  Sparkles,
  Gift,
  Clock,
  Tag,
  Award,
} from "lucide-react";
import AdmissionDialog from "@/components/AdmissionDialog";
import type { AdmissionOfferData } from "@/components/AdmissionLetter";

const courses = [
  "Accountancy",
  "Business Administration",
  "Computer-Science",
  "Mass Communication",
];

const subjects = [
  "Agricultural Science",
  "Basic Electricity",
  "Biology",
  "Book Keeping",
  "Building Construction",
  "Chemistry",
  "Christian Religious Studies",
  "Civic Education",
  "Commerce",
  "Computer Studies",
  "Data Processing",
  "Economics",
  "English Language",
  "Financial Accounting",
  "Fine Art",
  "Food and Nutrition",
  "French",
  "Further Mathematics",
  "Geography",
  "Government",
  "Hausa",
  "History",
  "Home Management",
  "Igbo",
  "Islamic Studies",
  "Literature in English",
  "Marketing",
  "Mathematics",
  "Music",
  "Office Practice",
  "Physics",
  "Technical Drawing",
  "Yoruba",
];

const grades = ["A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"];
const examBoards = [
  "WAEC (SSCE)",
  "WAEC (GCE)",
  "NECO (SSCE)",
  "NECO (GCE)",
  "NABTEB ",
];

const currentYear = new Date().getFullYear();
const examYears = Array.from({ length: 30 }, (_, index) =>
  String(currentYear - index),
);

type SubjectGrade = { subject: string; grade: string };
type Sitting = {
  id: number;
  oLevelRegistrationNumber: string;
  exam: string;
  year: string;
  subjects: SubjectGrade[];
};

function createSitting(id: number): Sitting {
  return {
    id,
    oLevelRegistrationNumber: "",
    exam: "",
    year: "",
    subjects: [
      { subject: "English Language", grade: "" },
      { subject: "Mathematics", grade: "" },
      { subject: "", grade: "" },
      { subject: "", grade: "" },
      { subject: "", grade: "" },
      { subject: "", grade: "" },
      { subject: "", grade: "" },
      { subject: "", grade: "" },
      { subject: "", grade: "" },
    ],
  };
}

function Icon({
  name,
  size = 18,
}: {
  name: "arrow" | "check" | "plus" | "trash" | "spark";
  size?: number;
}) {
  const paths = {
    arrow: <path d="M5 12h14m-7-7 7 7-7 7" />,
    check: <path d="m5 12 4 4L19 6" />,
    plus: <path d="M12 5v14m-7-7h14" />,
    trash: (
      <>
        <path d="M3 6h18m-2 0-.9 14H5.9L5 6m4 0V4h6v2" />
        <path d="M10 11v5m4-5v5" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" />
        <path d="m19 14 1 2.5 2 1-2 1-1 2.5-1-2.5-2-1 2-1 1-2.5Z" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

export default function Home() {
  // Form State
  const [jambNumber, setJambNumber] = useState("");
  const [jambScore, setJambScore] = useState("");
  const [surname, setSurname] = useState("");
  const [otherNames, setOtherNames] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [course, setCourse] = useState("");
  const [sittings, setSittings] = useState<Sitting[]>([createSitting(1)]);

  // UI & Flow State
  const [mobileFormTabOpen, setMobileFormTabOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [duplicateOffer, setDuplicateOffer] = useState<AdmissionOfferData | null>(null);
  const [admissionOffer, setAdmissionOffer] = useState<AdmissionOfferData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  function updateSitting(
    id: number,
    field: "oLevelRegistrationNumber" | "exam" | "year",
    value: string,
  ) {
    setSittings((current) =>
      current.map((sitting) =>
        sitting.id === id ? { ...sitting, [field]: value } : sitting,
      ),
    );
  }

  function updateSubject(
    sittingId: number,
    subjectIndex: number,
    field: keyof SubjectGrade,
    value: string,
  ) {
    setSittings((current) =>
      current.map((sitting) =>
        sitting.id === sittingId
          ? {
              ...sitting,
              subjects: sitting.subjects.map((entry, index) =>
                index === subjectIndex ? { ...entry, [field]: value } : entry,
              ),
            }
          : sitting,
      ),
    );
  }

  function resetSubject(sittingId: number, subjectIndex: number) {
    setSittings((current) =>
      current.map((sitting) =>
        sitting.id === sittingId
          ? {
              ...sitting,
              subjects: sitting.subjects.map((entry, index) => {
                if (index !== subjectIndex) return entry;
                if (index === 0) return { subject: "English Language", grade: "" };
                if (index === 1) return { subject: "Mathematics", grade: "" };
                return { subject: "", grade: "" };
              }),
            }
          : sitting,
      ),
    );
  }

  function handleCourseSelect(selectedCourse: string) {
    setCourse(selectedCourse);

    // Subject preselection rules:
    // Math & English are compulsory defaults in slots 1 & 2.
    // Science (Computer-Science): Physics, Chemistry, Biology
    // Commerce (Accountancy, Business Administration): Financial Accounting, Commerce, Economics
    // Arts (Mass Communication): Government, Literature in English, Economics
    let courseDefaults: string[] = [];
    if (selectedCourse === "Computer-Science") {
      courseDefaults = ["Physics", "Chemistry", "Biology"];
    } else if (selectedCourse === "Accountancy" || selectedCourse === "Business Administration") {
      courseDefaults = ["Financial Accounting", "Commerce", "Economics"];
    } else if (selectedCourse === "Mass Communication") {
      courseDefaults = ["Government", "Literature in English", "Economics"];
    }

    setSittings((current) =>
      current.map((sit, sitIndex) => {
        if (sitIndex !== 0) return sit;
        const newSubjects = [...sit.subjects];
        newSubjects[0] = { subject: "English Language", grade: newSubjects[0]?.grade || "" };
        newSubjects[1] = { subject: "Mathematics", grade: newSubjects[1]?.grade || "" };

        courseDefaults.forEach((sub, i) => {
          const targetIndex = 2 + i;
          if (targetIndex < newSubjects.length) {
            newSubjects[targetIndex] = {
              subject: sub,
              grade: newSubjects[targetIndex]?.grade || "",
            };
          }
        });
        return { ...sit, subjects: newSubjects };
      })
    );
  }

  // Check for duplicate subjects within any sitting
  function getSittingDuplicateWarnings(): string[] {
    const warnings: string[] = [];
    sittings.forEach((sit, idx) => {
      const chosen = sit.subjects
        .map((s) => s.subject.trim())
        .filter(Boolean);
      const unique = new Set(chosen);
      if (unique.size < chosen.length) {
        warnings.push(`Sitting ${idx + 1} has duplicate subject selections.`);
      }
    });
    return warnings;
  }

  async function handleVerifySubmission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setDuplicateOffer(null);

    // 1. Validate JAMB score
    const score = Number(jambScore);
    if (!jambScore || isNaN(score)) {
      setErrorMessage("Please enter a valid numeric JAMB score.");
      window.scrollTo({ top: 350, behavior: "smooth" });
      return;
    }
    if (score < 0 || score > 400) {
      setErrorMessage(
        score > 400
          ? "JAMB score cannot exceed 400. The maximum possible UTME score is 400."
          : "JAMB score cannot be less than 0."
      );
      window.scrollTo({ top: 350, behavior: "smooth" });
      return;
    }

    // 2. Validate duplicate subjects within sittings
    const dupWarnings = getSittingDuplicateWarnings();
    if (dupWarnings.length > 0) {
      setErrorMessage(dupWarnings.join(" "));
      window.scrollTo({ top: 350, behavior: "smooth" });
      return;
    }

    // 3. Validate that exactly 9 subjects are provided and filled for each sitting
    for (let i = 0; i < sittings.length; i++) {
      const sit = sittings[i];
      if (sit.subjects.length !== 9) {
        setErrorMessage(
          `Sitting ${i + 1} must contain exactly 9 qualifying subjects (no more, no less).`
        );
        window.scrollTo({ top: 350, behavior: "smooth" });
        return;
      }
      const incomplete = sit.subjects.some((s) => !s.subject.trim() || !s.grade.trim());
      if (incomplete) {
        setErrorMessage(
          `Please select both subject and grade for all 9 subjects in Sitting ${i + 1}. Exactly 9 subjects are required.`
        );
        window.scrollTo({ top: 350, behavior: "smooth" });
        return;
      }
    }

    // 4. Validate mandatory English Language and Mathematics across all sittings
    const allChosenSubjects = sittings.flatMap((sit) =>
      sit.subjects.map((s) => s.subject.trim().toLowerCase())
    );
    const hasEnglish = allChosenSubjects.includes("english language");
    const hasMaths = allChosenSubjects.includes("mathematics");

    if (!hasEnglish && !hasMaths) {
      setErrorMessage(
        "Both English Language and Mathematics are mandatory qualifying subjects and must be included in your O'Level sittings."
      );
      window.scrollTo({ top: 350, behavior: "smooth" });
      return;
    }
    if (!hasEnglish) {
      setErrorMessage(
        "English Language is a mandatory qualifying subject and must be included in your O'Level sittings."
      );
      window.scrollTo({ top: 350, behavior: "smooth" });
      return;
    }
    if (!hasMaths) {
      setErrorMessage(
        "Mathematics is a mandatory qualifying subject and must be included in your O'Level sittings."
      );
      window.scrollTo({ top: 350, behavior: "smooth" });
      return;
    }

    // 5. Validate duplicate sitting exams
    if (sittings.length === 2) {
      const sit1 = sittings[0];
      const sit2 = sittings[1];
      if (
        sit1.oLevelRegistrationNumber.trim().toLowerCase() ===
          sit2.oLevelRegistrationNumber.trim().toLowerCase() &&
        sit1.exam.trim().toLowerCase() === sit2.exam.trim().toLowerCase()
      ) {
        setErrorMessage(
          "Sitting 1 and Sitting 2 cannot use the same exam body and registration number."
        );
        window.scrollTo({ top: 350, behavior: "smooth" });
        return;
      }
    }

    // 6. Validate Registration Numbers
    const cleanJamb = jambNumber.trim().toUpperCase();
    if (cleanJamb.length < 5) {
      setErrorMessage("Please enter a valid JAMB registration number.");
      window.scrollTo({ top: 350, behavior: "smooth" });
      return;
    }

    for (let i = 0; i < sittings.length; i++) {
      const cleanOLevel = sittings[i].oLevelRegistrationNumber.trim().toUpperCase();
      if (cleanOLevel.length < 5) {
        setErrorMessage(
          `Please enter a valid O'Level registration number for Sitting ${i + 1}.`
        );
        window.scrollTo({ top: 350, behavior: "smooth" });
        return;
      }
    }

    setIsVerifying(true);

    try {
      const payload = {
        jambNumber: jambNumber.trim().toUpperCase(),
        jambScore: score,
        surname: surname.trim().toUpperCase(),
        otherNames: otherNames.trim().toUpperCase(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        course,
        sittings,
      };

      const res = await fetch("/api/admissions/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(
          data.error || "Unable to verify submission. Please check your data."
        );
        if (data.isDuplicate && data.existingOffer) {
          setDuplicateOffer(data.existingOffer);
        }
        window.scrollTo({ top: 350, behavior: "smooth" });
        return;
      }

      // Verification Succeeded -> Offer Provisional Admission
      setAdmissionOffer(data.admissionOffer);
      setDialogOpen(true);
    } catch {
      setErrorMessage(
        "A network error occurred while verifying your submission. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  }

  const duplicateWarnings = getSittingDuplicateWarnings();

  return (
    <main className="screening-page">
      {/* Top Special 50% Tuition Discount Alert Ribbon */}
      <div className="top-discount-ribbon">
        <div className="ribbon-inner">
          <div className="ribbon-badge">
            <Sparkles size={16} className="inline mr-1.5 text-amber-300" />
            <span>SPECIAL ADMISSION OFFER</span>
          </div>
          <p className="ribbon-text">
            <strong>50% Discount on Tuition Fees</strong> for the <strong>First 100 Admitted Students!</strong>
          </p>
          <div className="ribbon-tag">
            <Tag size={14} className="inline mr-1" />
            <span>Save ₦80,000 Annually &bull; Fatoki Foundation Grant</span>
          </div>
        </div>
      </div>

      {/* Top Navigation */}
      <header className="topbar">
        <Link
          className="brand"
          href="/"
          aria-label="Highland College of Technology home"
        >
          <span className="brand-mark">
            <Image
              src="/images.png"
              width={68}
              height={68}
              priority
              alt="Highland College of Technology logo"
            />
          </span>

          <span className="brand-name">
            Highland COLLEGE OF TECHNOLOGY
          </span>
        </Link>

        <div className="topbar-right">
          <span className="application-label">
            2026/2027 ADMISSIONS
          </span>

          <Link href="/admin" className="header-link flex items-center gap-1.5" title="Administrative Access">
            <Lock size={14} className="text-slate-600" />
            <span>Admin Portal</span>
          </Link>
        </div>
      </header>

      <section className="application-section" id="application">
        <div className="application-shell">
          {/* Aside Sidebar */}
          <aside className="form-aside">
            <button
              className="mobile-form-tab"
              type="button"
              aria-expanded={mobileFormTabOpen}
              aria-controls="application-form-details"
              onClick={() => setMobileFormTabOpen((open) => !open)}
            >
              <span>APPLICATION &amp; 50% DISCOUNT GUIDE</span>
              <span className="mobile-form-tab-indicator" aria-hidden="true" />
            </button>
            <div
              className={`aside-sticky${mobileFormTabOpen ? " is-open" : ""}`}
              id="application-form-details"
            >
              <span className="form-kicker">ADMISSION SCREENING PORTAL</span>
              <h2>Instant Admission Verification</h2>
              <p>
                Complete your screening information and verify your submission to receive your official offer of Provisional Admission into Highland College of Technology.
              </p>

              {/* Compact 50% Tuition Discount Notice (30% Small) */}
              <div className="tuition-scholarship-compact">
                <span className="compact-discount-badge">
                  <Gift size={13} className="inline mr-1" />
                  50% TUITION WAIVER
                </span>
                <p className="compact-discount-text">
                  <strong>First 100 Students:</strong> 50% tuition waiver (Save ₦80,000 annually) sponsored by the Olayinka &amp; Adesegun Fatoki Foundation.
                </p>
              </div>

              <div className="step-list">
                <div className={`step-item ${!admissionOffer ? "active" : ""}`}>
                  <span className="step-number">01</span>
                  <span>
                    <strong>Your details</strong>
                    <small>Personal, contact &amp; JAMB score</small>
                  </span>
                  {!admissionOffer && <span className="step-indicator" />}
                </div>
                <div className={`step-item ${!admissionOffer ? "active" : ""}`}>
                  <span className="step-number">02</span>
                  <span>
                    <strong>O&apos;Level results</strong>
                    <small>SSCE / NECO qualifications</small>
                  </span>
                </div>
                <div className={`step-item ${admissionOffer ? "active" : ""}`}>
                  <span className="step-number">03</span>
                  <span>
                    <strong>Provisional Admission</strong>
                    <small>Official 4-document letter package</small>
                  </span>
                  {admissionOffer && <span className="step-indicator" />}
                </div>
              </div>
              <div className="aside-note">
                <span className="note-mark">i</span>
                <p>
                  Have your JAMB registration number and qualifying O&apos;Level results ready before verifying your submission.
                </p>
              </div>
            </div>
          </aside>

          {/* Form Main Area */}
          <div className="form-main">
            {/* If Student Has Already Been Verified in this session */}
            {admissionOffer && (
              <div className="success-offer-banner">
                <div>
                  <span className="offer-banner-title">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    Provisional Admission Confirmed!
                  </span>
                  <p className="offer-banner-meta">
                    Admission Ref: <strong>{admissionOffer.referenceNumber}</strong> &bull; Candidate: <strong>{admissionOffer.candidateName}</strong> &bull; Programme: <strong>{admissionOffer.course}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDialogOpen(true)}
                  className="btn-open-offer-dialog"
                >
                  <Download size={15} />
                  <span>Download / Print 4 Docs</span>
                </button>
              </div>
            )}

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="form-error-banner" role="alert">
                <AlertCircle size={18} className="banner-alert-icon" />
                <div style={{ flex: 1 }}>
                  <strong>Verification Error:</strong> {errorMessage}
                  {duplicateOffer && (
                    <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1px solid rgba(180, 64, 58, 0.2)" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setAdmissionOffer(duplicateOffer);
                          setDialogOpen(true);
                        }}
                        style={{
                          background: "#ffffff",
                          border: "1.5px solid #b4403a",
                          color: "#b4403a",
                          padding: "6px 14px",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: 800,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Printer size={14} />
                        <span>View Existing Admission Letter ({duplicateOffer.referenceNumber})</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleVerifySubmission}>
              {/* Section 1: Personal Details */}
              <div className="form-section">
                <div className="section-heading">
                  <span className="section-number">01</span>
                  <div>
                    <h3>Personal information</h3>
                    <p>Enter your JAMB registration details and legal name.</p>
                  </div>
                </div>

                <div className="field-grid">
                  <label className="field field-full">
                    <span>
                      JAMB registration number <b>*</b>
                    </span>
                    <input
                      name="jambNumber"
                      type="text"
                      placeholder="e.g. 202612345678AB"
                      autoComplete="off"
                      value={jambNumber}
                      onChange={(e) => setJambNumber(e.target.value.toUpperCase().trim())}
                      required
                    />
                    <small>Enter the official registration number on your JAMB slip.</small>
                  </label>

                  <label className="field field-full">
                    <span>
                      JAMB score <b>*</b>
                    </span>
                    <input
                      name="jambScore"
                      type="number"
                      min="0"
                      max="400"
                      step="1"
                      inputMode="numeric"
                      placeholder="e.g. 210"
                      value={jambScore}
                      onChange={(e) => setJambScore(e.target.value)}
                      required
                    />
                    <small>Enter your total aggregate score (between 0 and 400).</small>
                  </label>

                  <label className="field">
                    <span>
                      Surname <b>*</b>
                    </span>
                    <input
                      name="surname"
                      type="text"
                      placeholder="Your surname"
                      autoComplete="family-name"
                      value={surname}
                      onChange={(e) => setSurname(e.target.value.toUpperCase())}
                      required
                    />
                  </label>

                  <label className="field">
                    <span>
                      Other name(s) <b>*</b>
                    </span>
                    <input
                      name="otherNames"
                      type="text"
                      placeholder="First and middle name(s)"
                      autoComplete="given-name"
                      value={otherNames}
                      onChange={(e) => setOtherNames(e.target.value.toUpperCase())}
                      required
                    />
                  </label>

                  <label className="field">
                    <span>
                      Email address <b>*</b>
                    </span>
                    <input
                      name="email"
                      type="email"
                      placeholder="e.g. candidate@example.com"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
                      required
                    />
                    <small>Official admission notices will be delivered here.</small>
                  </label>

                  <label className="field">
                    <span>
                      Phone number <b>*</b>
                    </span>
                    <input
                      name="phoneNumber"
                      type="tel"
                      placeholder="e.g. 08012345678"
                      autoComplete="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.trim())}
                      required
                    />
                    <small>For SMS alerts and urgent institutional contact.</small>
                  </label>

                  <label className="field field-full">
                    <span>
                      Course of study <b>*</b>
                    </span>
                    <span className="select-wrap">
                      <select
                        name="course"
                        value={course}
                        onChange={(e) => handleCourseSelect(e.target.value)}
                        required
                      >
                        <option value="" disabled>
                          Select your preferred course of study
                        </option>
                        {courses.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </span>
                  </label>
                </div>
              </div>

              {/* Section 2: O'Level Results */}
              <div className="form-section results-section">
                <div className="section-heading">
                  <span className="section-number">02</span>
                  <div>
                    <h3>Your O&apos;Level results</h3>
                    <p>
                      Add your subjects and grades for one sitting, or combine
                      a maximum of two sittings.
                    </p>
                  </div>
                </div>

                {duplicateWarnings.length > 0 && (
                  <div className="duplicate-subject-warning">
                    {duplicateWarnings.map((w, i) => (
                      <div key={i}>{w}</div>
                    ))}
                  </div>
                )}

                <div className="sittings-list">
                  {sittings.map((sitting, sittingIndex) => (
                    <div className="sitting-card" key={sitting.id}>
                      <div className="sitting-heading">
                        <span className="sitting-tag">
                          SITTING {sittingIndex + 1}
                        </span>
                        {sittings.length > 1 && (
                          <button
                            className="remove-sitting"
                            type="button"
                            onClick={() =>
                              setSittings((current) =>
                                current.filter((item) => item.id !== sitting.id),
                              )
                            }
                            aria-label={`Remove sitting ${sittingIndex + 1}`}
                          >
                            <Icon name="trash" size={15} />
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="field-grid sitting-fields">
                        <label className="field field-full">
                          <span>
                            O&apos;Level registration number <b>*</b>
                          </span>
                          <input
                            name={`oLevelRegistrationNumber-${sitting.id}`}
                            type="text"
                            value={sitting.oLevelRegistrationNumber}
                            onChange={(event) =>
                              updateSitting(
                                sitting.id,
                                "oLevelRegistrationNumber",
                                event.target.value.toUpperCase().trim(),
                              )
                            }
                            placeholder="e.g. 4251029410"
                            autoComplete="off"
                            required
                          />
                        </label>

                        <label className="field">
                          <span>Exam body <b>*</b></span>
                          <span className="select-wrap">
                            <select
                              value={sitting.exam}
                              onChange={(event) =>
                                updateSitting(
                                  sitting.id,
                                  "exam",
                                  event.target.value,
                                )
                              }
                              required
                            >
                              <option value="" disabled>
                                Select exam body
                              </option>
                              {examBoards.map((exam) => (
                                <option key={exam} value={exam}>
                                  {exam}
                                </option>
                              ))}
                            </select>
                          </span>
                        </label>

                        <label className="field">
                          <span>Year sat <b>*</b></span>
                          <span className="select-wrap">
                            <select
                              value={sitting.year}
                              onChange={(event) =>
                                updateSitting(
                                  sitting.id,
                                  "year",
                                  event.target.value,
                                )
                              }
                              required
                            >
                              <option value="" disabled>
                                Select examination year
                              </option>
                              {examYears.map((year) => (
                                <option key={year} value={year}>
                                  {year}
                                </option>
                              ))}
                            </select>
                          </span>
                        </label>
                      </div>

                      <div className="subjects-header">
                        <span style={{ width: "28px", textAlign: "center" }}>#</span>
                        <span>QUALIFYING SUBJECT (9 REQUIRED)</span>
                        <span>GRADE</span>
                        <span style={{ textAlign: "center" }}>ACTION</span>
                      </div>

                      <div className="subject-list">
                        {sitting.subjects.map((entry, subjectIndex) => (
                          <div
                            className="subject-row"
                            key={`${sitting.id}-${subjectIndex}`}
                          >
                            <span className="subject-num-badge">
                              {subjectIndex + 1}
                            </span>

                            <label
                              className="visually-hidden"
                              htmlFor={`subject-${sitting.id}-${subjectIndex}`}
                            >
                              Subject {subjectIndex + 1}
                            </label>
                            <span className="select-wrap subject-select">
                              <select
                                id={`subject-${sitting.id}-${subjectIndex}`}
                                value={entry.subject}
                                onChange={(event) =>
                                  updateSubject(
                                    sitting.id,
                                    subjectIndex,
                                    "subject",
                                    event.target.value,
                                  )
                                }
                                required
                              >
                                <option value="" disabled>
                                  Choose subject {subjectIndex + 1}
                                </option>
                                {subjects.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                            </span>

                            <label
                              className="visually-hidden"
                              htmlFor={`grade-${sitting.id}-${subjectIndex}`}
                            >
                              Grade for subject {subjectIndex + 1}
                            </label>
                            <span className="select-wrap grade-select">
                              <select
                                id={`grade-${sitting.id}-${subjectIndex}`}
                                value={entry.grade}
                                onChange={(event) =>
                                  updateSubject(
                                    sitting.id,
                                    subjectIndex,
                                    "grade",
                                    event.target.value,
                                  )
                                }
                                required
                              >
                                <option value="" disabled>
                                  Grade
                                </option>
                                {grades.map((grade) => (
                                  <option key={grade} value={grade}>
                                    {grade}
                                  </option>
                                ))}
                              </select>
                            </span>

                            <button
                              className="remove-subject"
                              type="button"
                              onClick={() =>
                                resetSubject(sitting.id, subjectIndex)
                              }
                              title={`Reset subject ${subjectIndex + 1}`}
                              aria-label={`Reset subject ${subjectIndex + 1}`}
                            >
                              <Icon name="trash" size={15} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {sittings.length < 2 && (
                  <button
                    className="add-sitting"
                    type="button"
                    onClick={() =>
                      setSittings((current) => [
                        ...current,
                        createSitting(
                          Math.max(...current.map((item) => item.id)) + 1,
                        ),
                      ])
                    }
                  >
                    <span className="add-sitting-icon">
                      <Icon name="plus" size={17} />
                    </span>
                    <span>
                      <strong>Add a second sitting</strong>
                      <small>Combine results from another exam sitting</small>
                    </span>
                    <span className="optional-label">OPTIONAL</span>
                  </button>
                )}
                <p className="results-hint">
                  Each sitting must contain exactly 9 qualifying subjects (including English Language and Mathematics). Exactly 9 subjects are required.
                </p>
              </div>

              {/* Form Footer with Verification CTA */}
              <div className="form-footer">
                <p>
                  <span className="required-star">*</span> Required fields
                </p>

                <button
                  className="submit-button"
                  type="submit"
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw size={17} className="animate-spin" />
                      <span>Verifying Submission...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      <span>Verify Submission</span>
                    </>
                  )}
                </button>
              </div>

              <p className="privacy-caption">
                By clicking <strong>Verify Submission</strong>, your details will be verified against the Highland College of Technology admission records to generate your official provisional admission offer.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Confirmation Dialog Component */}
      <AdmissionDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        data={admissionOffer}
      />

      {/* Site Footer */}
      <footer className="site-footer">
        <span>&copy; {currentYear} Highland College of Technology</span>
        <span>Directorate of Admissions &bull; Official Verification Portal</span>
      </footer>
    </main>
  );
}
