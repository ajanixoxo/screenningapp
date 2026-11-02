"use client";

import { type FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  Printer,
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
    subjects: Array.from({ length: 5 }, () => ({ subject: "", grade: "" })),
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

  function addSubject(sittingId: number) {
    setSittings((current) =>
      current.map((sitting) =>
        sitting.id === sittingId && sitting.subjects.length < 9
          ? {
              ...sitting,
              subjects: [...sitting.subjects, { subject: "", grade: "" }],
            }
          : sitting,
      ),
    );
  }

  function removeSubject(sittingId: number, subjectIndex: number) {
    setSittings((current) =>
      current.map((sitting) =>
        sitting.id === sittingId
          ? {
              ...sitting,
              subjects: sitting.subjects.filter(
                (_, index) => index !== subjectIndex,
              ),
            }
          : sitting,
      ),
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

    // Validate duplicate subjects
    const dupWarnings = getSittingDuplicateWarnings();
    if (dupWarnings.length > 0) {
      setErrorMessage(dupWarnings.join(" "));
      return;
    }

    // Validate subject completeness
    for (let i = 0; i < sittings.length; i++) {
      const sit = sittings[i];
      const incomplete = sit.subjects.some((s) => !s.subject || !s.grade);
      if (incomplete) {
        setErrorMessage(
          `Please select both subject and grade for all entries in Sitting ${i + 1}.`
        );
        return;
      }
    }

    setIsVerifying(true);

    try {
      const payload = {
        jambNumber: jambNumber.trim().toUpperCase(),
        jambScore: Number(jambScore),
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
                  <Printer size={15} />
                  <span>Print 4 Admission Docs</span>
                </button>
              </div>
            )}

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="form-error-banner" role="alert">
                <AlertCircle size={18} className="banner-alert-icon" />
                <div>
                  <strong>Verification Error:</strong> {errorMessage}
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
                        onChange={(e) => setCourse(e.target.value)}
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
                        <span>QUALIFYING SUBJECT</span>
                        <span>GRADE</span>
                      </div>

                      <div className="subject-list">
                        {sitting.subjects.map((entry, subjectIndex) => (
                          <div
                            className="subject-row"
                            key={`${sitting.id}-${subjectIndex}`}
                          >
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
                                  Choose a subject
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

                            {sitting.subjects.length > 5 && (
                              <button
                                className="remove-subject"
                                type="button"
                                onClick={() =>
                                  removeSubject(sitting.id, subjectIndex)
                                }
                                aria-label={`Remove subject ${subjectIndex + 1}`}
                              >
                                <Icon name="trash" size={15} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {sitting.subjects.length < 9 && (
                        <button
                          className="add-subject"
                          type="button"
                          onClick={() => addSubject(sitting.id)}
                        >
                          <Icon name="plus" size={15} />
                          Add another subject
                        </button>
                      )}
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
                  You can enter up to 9 subjects for each sitting. Minimum 5 subjects required.
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
