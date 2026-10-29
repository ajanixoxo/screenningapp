"use client";

import { type FormEvent, useState } from "react";
import Image from "next/image";
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
  const [sittings, setSittings] = useState<Sitting[]>([createSitting(1)]);
  const [submitted, setSubmitted] = useState(false);
  const [mobileFormTabOpen, setMobileFormTabOpen] = useState(false);

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="screening-page">
      
<header className="topbar">
  <a
    className="brand"
    href="#"
    aria-label="Highland College of Technology home"
  >
    <span className="brand-mark">
      <Image
        src="/images.png"
        width={350}
        height={400}
        alt="Highland College of Technology logo"
      />
    </span>

    <span className="brand-name">
      Highland COLLEGE OF TECHNOLOGY
    </span>
  </a>

  <div className="topbar-right">
    <span className="application-label">
      2026/2027 ADMISSIONS
    </span>

    <span className="secure-label">
      
    </span>
  </div>
</header>


      <section className="application-section" id="application">
        <div className="application-shell">
          <aside className="form-aside">
            <button
              className="mobile-form-tab"
              type="button"
              aria-expanded={mobileFormTabOpen}
              aria-controls="application-form-details"
              onClick={() => setMobileFormTabOpen((open) => !open)}
            >
              <span>APPLICATION FORM</span>
              <span className="mobile-form-tab-indicator" aria-hidden="true" />
            </button>
            <div
              className={`aside-sticky${mobileFormTabOpen ? " is-open" : ""}`}
              id="application-form-details"
            >
              <span className="form-kicker">APPLICATION FORM</span>
              <h2>Let&apos;s get to know you.</h2>
              <p>
                A few details to get your application underway. This should
                only take a couple of minutes.
              </p>
              <div className="step-list">
                <div className="step-item active">
                  <span className="step-number">01</span>
                  <span>
                    <strong>Your details</strong>
                    <small>Personal information</small>
                  </span>
                  <span className="step-indicator" />
                </div>
                <div className="step-item">
                  <span className="step-number">02</span>
                  <span>
                    <strong>Your results</strong>
                    <small>O&apos;Level qualifications</small>
                  </span>
                </div>
                <div className="step-item">
                  <span className="step-number">03</span>
                  <span>
                    <strong>Review &amp; submit</strong>
                    <small>Almost there</small>
                  </span>
                </div>
              </div>
              <div className="aside-note">
                <span className="note-mark">i</span>
                <p>
                  Have your JAMB registration number and O&apos;Level results
                  handy before you begin.
                </p>
              </div>
            </div>
          </aside>

          <div className="form-main">
            {submitted ? (
              <div className="success-panel" role="status">
                <span className="success-icon">
                  <Icon name="check" size={28} />
                </span>
                <span className="form-kicker">DETAILS RECEIVED</span>
                <h2>You&apos;re one step closer.</h2>
                <p>
                  Your screening details have been completed. In a live
                  application, you would now be able to review and submit them
                  to the admissions office.
                </p>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => setSubmitted(false)}
                >
                  Review your details <Icon name="arrow" size={16} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-section">
                  <div className="section-heading">
                    <span className="section-number">01</span>
                    <div>
                      <h3>Personal information</h3>
                      <p>Let&apos;s start with the essentials.</p>
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
                        required
                      />
                      <small>Enter the registration number on your JAMB slip.</small>
                    </label>
                    <label className="field field-full">
                      <span>
                        JAMB score
                      </span>
                      <input
                        name="jambScore"
                        type="number"
                        min="0"
                        max="400"
                        step="1"
                        inputMode="numeric"
                        placeholder="e.g. 250"
                        required
                      />
                      <small>Enter your total score, from 0 to 400.</small>
                    </label>
                    <label className="field">
                      <span>
                        Surname 
                      </span>
                      <input
                        name="surname"
                        type="text"
                        placeholder="Your surname"
                        autoComplete="family-name"
                        required
                      />
                    </label>
                    <label className="field">
                      <span>
                        Other name(s) 
                      </span>
                      <input
                        name="otherNames"
                        type="text"
                        placeholder="First and middle name(s)"
                        autoComplete="given-name"
                        required
                      />
                    </label>
                    <label className="field field-full">
                      <span>
                        Course of study 
                      </span>
                      <span className="select-wrap">
                        <select name="course" defaultValue="" required>
                          <option value="" disabled>
                            Select your preferred course
                          </option>
                          {courses.map((course) => (
                            <option key={course} value={course}>
                              {course}
                            </option>
                          ))}
                        </select>
                      </span>
                    </label>
                  </div>
                </div>

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
                                  current.filter(
                                    (item) => item.id !== sitting.id,
                                  ),
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
                            <span>O&apos;Level registration number <b>*</b></span>
                            <input
                              name={`oLevelRegistrationNumber-${sitting.id}`}
                              type="text"
                              value={sitting.oLevelRegistrationNumber}
                              onChange={(event) =>
                                updateSitting(
                                  sitting.id,
                                  "oLevelRegistrationNumber",
                                  event.target.value,
                                )
                              }
                              placeholder="Enter your exam registration number"
                              autoComplete="off"
                              required
                            />
                          </label>
                          <label className="field">
                            <span>
                              Exam body
                            </span>
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
                                  Select exam
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
                            <span>
                              Year sat 
                            </span>
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
                                  Select year
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
                          <span>SUBJECT</span>
                          <span>GRADE</span>
                        </div>
                        <div className="subject-list">
                          {sitting.subjects.map((entry, subjectIndex) => (
                            <div
                              className="subject-row"
                              key={`${sitting.id}-${subjectIndex}`}
                            >
                              <label className="visually-hidden" htmlFor={`subject-${sitting.id}-${subjectIndex}`}>
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
                                  {subjects.map((subject) => (
                                    <option key={subject} value={subject}>
                                      {subject}
                                    </option>
                                  ))}
                                </select>
                              </span>
                              <label className="visually-hidden" htmlFor={`grade-${sitting.id}-${subjectIndex}`}>
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
                        <small>Combine results from another exam year</small>
                      </span>
                      <span className="optional-label">OPTIONAL</span>
                    </button>
                  )}
                  <p className="results-hint">
                    You can enter up to 9 subjects for each sitting.
                  </p>
                </div>

                <div className="form-footer">
                  <p>
                    <span className="required-star">*</span> Required fields
                  </p>
                  <button className="submit-button" type="submit">
                    Continue to review <Icon name="arrow" size={17} />
                  </button>
                </div>
                <p className="privacy-caption">
                  By continuing, you confirm that the information provided is
                  accurate and belongs to you.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <span>© {currentYear} Highland College Of Technology</span>
        <span>Admissions office <i /> Here to help you get started.</span>
      </footer>
    </main>
  );
}
https://github.com/esther295/Screening-project.git