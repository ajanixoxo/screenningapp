"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { Printer, Download, X, ShieldCheck, FileText, CheckCircle2, Award } from "lucide-react";
import type { Sitting } from "@/lib/db";

export interface AdmissionOfferData {
  referenceNumber: string;
  jambNumber: string;
  candidateName: string;
  surname: string;
  otherNames: string;
  email?: string;
  phoneNumber?: string;
  course: string;
  jambScore?: number;
  academicSession: string;
  status: string;
  dateOffered: string;
  sittings?: Sitting[];
}

interface AdmissionLetterProps {
  data: AdmissionOfferData;
  onClose?: () => void;
  standalone?: boolean;
}

export function getFacultyForCourse(course: string): string {
  switch (course) {
    case "Computer-Science":
    case "Computer Science":
      return "School of Science and Technology";
    case "Accountancy":
    case "Business Administration":
      return "School of Business and Management Studies";
    case "Mass Communication":
      return "School of Communication and Media Arts";
    default:
      return "School of Technology and Applied Sciences";
  }
}

export default function AdmissionLetter({
  data,
  onClose,
  standalone = false,
}: AdmissionLetterProps) {
  const [activeTab, setActiveTab] = useState<"all" | "letter" | "factsheet" | "acceptance" | "foundation">("all");
  const letterRef = useRef<HTMLDivElement>(null);

  const formattedDate = new Date(data.dateOffered || Date.now()).toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  const handlePrint = () => {
    window.print();
  };

  const candidateFullName = data.candidateName || `${data.surname} ${data.otherNames}`.trim();

  return (
    <div className={`admission-letter-container ${standalone ? "standalone" : "modal-mode"}`}>
      {/* Top Action Bar (Screen Only - Hidden in Print) */}
      <div className="letter-action-bar no-print">
        <div className="action-bar-left">
          <span className="doc-pill">
            <ShieldCheck size={16} className="text-emerald-400 inline mr-1" />
            4 ADMISSION DOCUMENTS
          </span>
          <span className="doc-ref">Ref: {data.referenceNumber}</span>
        </div>

        {/* View Switcher Tabs (Screen Only) */}
        <div className="doc-tabs-nav">
          <button
            type="button"
            className={`doc-tab-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All 4 Forms
          </button>
          <button
            type="button"
            className={`doc-tab-btn ${activeTab === "letter" ? "active" : ""}`}
            onClick={() => setActiveTab("letter")}
          >
            1. Admission Letter
          </button>
          <button
            type="button"
            className={`doc-tab-btn ${activeTab === "factsheet" ? "active" : ""}`}
            onClick={() => setActiveTab("factsheet")}
          >
            2. Fact Sheet
          </button>
          <button
            type="button"
            className={`doc-tab-btn ${activeTab === "acceptance" ? "active" : ""}`}
            onClick={() => setActiveTab("acceptance")}
          >
            3. Acceptance Form
          </button>
          <button
            type="button"
            className={`doc-tab-btn ${activeTab === "foundation" ? "active" : ""}`}
            onClick={() => setActiveTab("foundation")}
          >
            4. Foundation (50%)
          </button>
        </div>

        <div className="action-bar-right">
          {/* SINGLE PRINT BUTTON THAT PRINTS ALL 4 DOCUMENTS */}
          <button
            type="button"
            onClick={handlePrint}
            className="action-btn primary-action font-bold"
            title="Print all 4 documents or save as a combined PDF"
          >
            <Printer size={16} />
            <span>Print All (4 Docs)</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="action-btn secondary-action"
            title="Download complete documentation as PDF"
          >
            <Download size={16} />
            <span>Download PDF</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="action-btn close-action"
              aria-label="Close preview"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Printable Letter Sheet Wrapper (All 4 Documents rendered sequentially) */}
      <div className="letter-sheet-wrapper" ref={letterRef}>
        <div className="print-all-container">

          {/* ==============================================================
              DOCUMENT 1: OFFER OF PROVISIONAL ADMISSION LETTER
              (Matched from ADMISSION LETTERS ALL 1.docx)
             ============================================================== */}
          <article
            className={`official-letter-sheet print-doc-page doc-page-1 ${
              activeTab !== "all" && activeTab !== "letter" ? "screen-hidden" : ""
            }`}
          >
            {/* Official Letterhead Banner Image */}
            <div className="doc-header-banner">
              <Image
                src="/hct-letterhead-banner.png"
                alt="Highland College of Technology Letterhead"
                width={800}
                height={150}
                priority
                className="banner-image"
              />
            </div>

            {/* Official Subheader Contact Info */}
            <div className="doc-contact-row">
              <div className="doc-contact-text">
                <span><strong>Tel:</strong> 07085142576, 08033502136</span>
                <span className="separator">&bull;</span>
                <span><strong>Web:</strong> www.highlandtech.edu.ng</span>
                <span className="separator">&bull;</span>
                <span><strong>Email:</strong> info@highlandtech.edu.ng</span>
              </div>
            </div>

            <div className="thin-rule" />

            {/* Date & Ref Line */}
            <div className="letter-date-line">
              <span className="letter-ref-pill">Ref: {data.referenceNumber}</span>
              <span className="letter-date-text">{formattedDate}</span>
            </div>

            {/* Addressee Particulars */}
            <div className="letter-addressee-block">
              <p className="candidate-greeting">
                Dear <strong className="candidate-name-bold">{candidateFullName}</strong>,
              </p>
              <p className="candidate-utme">
                <strong>UTME NO:</strong> <span className="font-mono">{data.jambNumber}</span>
              </p>
            </div>

            {/* Subject Title */}
            <div className="letter-subject-title">
              <h2>
                OFFER OF PROVISIONAL ADMISSION TO NATIONAL DIPLOMA PROGRAMME {data.academicSession || "2026/2027"} SESSION
              </h2>
            </div>

            {/* Official Letter Body Text - Word for Word from ADMISSION LETTERS ALL 1.docx */}
            <div className="official-letter-body">
              <ol className="numbered-body-list">
                <li>
                  I am pleased to inform you that you have been offered admission for a two year <strong>NATIONAL DIPLOMA</strong> programme in <strong>{data.course}</strong>.
                </li>
                <li>
                  This offer of admission is however provisional. The confirmation of admission is subjected to your obtaining minimum entry qualifications for the course for which you have been offered admission and the payment of a non-refundable fee of <strong>Twenty Thousand Naira (N20, 000.00)</strong>.
                </li>
                <li>
                  After the successful payment of the acceptance fee, visit the school campus to complete the registration.
                </li>
                <li>
                  In the absence of any response from you within reasonable time, the institution will assume that you are not interested in the offer and will proceed to fill your place.
                </li>
                <li>
                  I enclose herewith for your information the Highland College Fact Sheet and Acceptance form.
                </li>
              </ol>

              {/* Bold Warning Notice */}
              <div className="jamb-caps-warning">
                <p>
                  PLEASE NOTE THAT IT IS ONLY AFTER YOU HAVE SATISFIED THE ABOVE CONDITIONS THAT THE INSTITUTION WILL RECOMMEND YOU FOR ADMISSION ON JAMB CAPS
                </p>
              </div>

              <p className="congrats-line">
                Accept my congratulations on your admission.
              </p>

              <div className="sign-off-section">
                <p className="yours-faithfully">Yours faithfully,</p>
                <div className="signature-container">
                  <Image
                    src="/adegbite-signature.png"
                    alt="Adegbite Adenike Signature"
                    width={180}
                    height={50}
                    className="officer-signature"
                  />
                </div>
                <p className="officer-name">Adegbite Adenike</p>
                <p className="officer-role">Admission Officer</p>
              </div>
            </div>

            {/* Page 1 Footer */}
            <div className="doc-page-footer">
              <span>Highland College of Technology &bull; Admissions Directorate</span>
              <span>Page 1 of 4 &bull; Official Admission Letter</span>
            </div>
          </article>


          {/* ==============================================================
              DOCUMENT 2: HIGHLAND COLLEGE FACT SHEET FOR 2026/2027
              (Matched from Factsheet 2026-2027.docx - Send to Adegbite)
             ============================================================== */}
          <article
            className={`official-letter-sheet print-doc-page doc-page-2 print-page-break ${
              activeTab !== "all" && activeTab !== "factsheet" ? "screen-hidden" : ""
            }`}
          >
            {/* Factsheet Header */}
            <div className="factsheet-header">
              <div className="factsheet-crest">
                <Image
                  src="/hct-crest-shield.png"
                  alt="Highland College of Technology Crest"
                  width={55}
                  height={60}
                  className="crest-shield"
                />
              </div>
              <div className="factsheet-header-text">
                <h1>HIGHLAND COLLEGE OF TECHNOLOGY</h1>
                <h2>FACT SHEET FOR {data.academicSession || "2026/2027"} SESSION</h2>
                <p className="motto-text">Moving you technically higher...</p>
              </div>
            </div>

            <div className="thin-rule" />

            {/* Send to Adegbite Notice Box */}
            <div className="send-to-adegbite-box">
              <span className="send-label">SUBMISSION INSTRUCTION (SEND TO ADEGBITE):</span>
              <p>
                Upon payment of the Acceptance Fee (N20,000.00) or Semester Fees, send evidence of payment / bank teller to <strong>Adegbite Adenike (Admission Officer)</strong> on <strong>07085142576</strong> or <strong>08033502136</strong> (WhatsApp / SMS) or email <strong>info@highlandtech.edu.ng</strong> for immediate verification and admission processing.
              </p>
            </div>

            {/* Payment Guidelines & Bank Accounts */}
            <div className="factsheet-section">
              <h3 className="section-title-sm">Payment Guidelines</h3>
              <p className="section-sub-sm">All fees can be paid to: <strong>HIGHLAND COLLEGE OF TECHNOLOGY</strong> in any of the following banks:</p>

              <table className="factsheet-table">
                <thead>
                  <tr>
                    <th style={{ width: "45px" }}>S/N</th>
                    <th>BANK NAME</th>
                    <th>ACCOUNT NUMBER</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td><strong>First Bank Plc</strong></td>
                    <td className="font-mono font-bold text-primary">2014297193</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td><strong>Zenith Bank</strong></td>
                    <td className="font-mono font-bold text-primary">1015127597</td>
                  </tr>
                </tbody>
              </table>

              <div className="acceptance-fee-callout">
                <span>Acceptance Fee:</span>
                <strong className="text-primary font-bold">N20,000.00</strong>
                <span className="text-xs text-muted">(Payable immediately to secure admission)</span>
              </div>
            </div>

            {/* Semester Fee Tables (2 Column Grid for clean A4 fit) */}
            <div className="fees-grid-row">
              {/* First Semester Table */}
              <div className="fee-table-col">
                <h4 className="fee-table-heading">Applicable Fees for First Semester</h4>
                <table className="factsheet-table table-condensed">
                  <thead>
                    <tr>
                      <th style={{ width: "30px" }}>S/N</th>
                      <th>Fee Description</th>
                      <th className="text-right">Amount (N)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>1</td><td>Medical Insurance</td><td className="text-right">10,000.00</td></tr>
                    <tr><td>2</td><td>I.D Card</td><td className="text-right">5,000.00</td></tr>
                    <tr><td>3</td><td>Tuition</td><td className="text-right font-semibold">80,000.00</td></tr>
                    <tr><td>4</td><td>Matriculation</td><td className="text-right">15,000.00</td></tr>
                    <tr><td>5</td><td>Lab/Library Use</td><td className="text-right">15,000.00</td></tr>
                    <tr><td>6</td><td>Utility Charges</td><td className="text-right">10,000.00</td></tr>
                    <tr><td>7</td><td>Portal Management</td><td className="text-right">8,000.00</td></tr>
                    <tr><td>8</td><td>Administrative Charges</td><td className="text-right">12,000.00</td></tr>
                    <tr><td>9</td><td>Professional Certification Exams</td><td className="text-right">10,000.00</td></tr>
                    <tr className="table-total-row">
                      <td colSpan={2}><strong>TOTAL FIRST SEMESTER</strong></td>
                      <td className="text-right font-bold text-primary">N165,000.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Second Semester Table */}
              <div className="fee-table-col">
                <h4 className="fee-table-heading">Second Semester Fees</h4>
                <table className="factsheet-table table-condensed">
                  <thead>
                    <tr>
                      <th style={{ width: "30px" }}>S/N</th>
                      <th>Fee Description</th>
                      <th className="text-right">Amount (N)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>1</td><td>Tuition</td><td className="text-right font-semibold">80,000.00</td></tr>
                    <tr><td>2</td><td>Professional Certification Exams</td><td className="text-right">15,000.00</td></tr>
                    <tr><td>3</td><td>Utility Charges</td><td className="text-right">10,000.00</td></tr>
                    <tr><td>4</td><td>Portal Management</td><td className="text-right">10,000.00</td></tr>
                    <tr className="table-total-row">
                      <td colSpan={2}><strong>TOTAL SECOND SEMESTER</strong></td>
                      <td className="text-right font-bold text-primary">N115,000.00</td>
                    </tr>
                  </tbody>
                </table>

                {/* Important Notes Box */}
                <div className="factsheet-notes-card">
                  <p className="note-alert">Acceptance &amp; Medical fees must be paid immediately.</p>
                  <p className="scholarship-alert">
                    <strong>NOTE:</strong> Indigent students may apply for the <strong>Olayinka and Adesegun Fatoki Foundation Scholarship offer</strong> (50% Tuition Waiver &mdash; see Page 4). Details available on the Polytechnic Website.
                  </p>
                </div>
              </div>
            </div>

            {/* Factsheet Contact Footer */}
            <div className="factsheet-footer-bar">
              <div>
                <span><strong>Website:</strong> www.highlandtech.edu.ng</span>
                <span className="mx-2">&bull;</span>
                <span><strong>Email:</strong> info@highlandtech.edu.ng</span>
                <span className="mx-2">&bull;</span>
                <span><strong>Tel:</strong> 07085142576, 08033502136</span>
              </div>
              <span className="font-semibold text-xs">Page 2 of 4 &bull; Official Fact Sheet</span>
            </div>
          </article>


          {/* ==============================================================
              DOCUMENT 3: ACCEPTANCE OF OFFER OF PROVISIONAL ADMISSION FORM
             ============================================================== */}
          <article
            className={`official-letter-sheet print-doc-page doc-page-3 print-page-break ${
              activeTab !== "all" && activeTab !== "acceptance" ? "screen-hidden" : ""
            }`}
          >
            {/* Header Banner */}
            <div className="doc-header-banner">
              <Image
                src="/hct-letterhead-banner.png"
                alt="Highland College of Technology"
                width={800}
                height={150}
                className="banner-image"
              />
            </div>

            <div className="form-title-block">
              <h2>DIRECTORATE OF ADMISSIONS &amp; ACADEMIC AFFAIRS</h2>
              <h3>ACCEPTANCE OF OFFER OF PROVISIONAL ADMISSION ({data.academicSession || "2026/2027"} SESSION)</h3>
              <p className="form-sub-instructions">
                To be completed by candidate and returned to the Admissions Office (Adegbite Adenike) alongside bank evidence of Acceptance Fee payment.
              </p>
            </div>

            {/* Pre-filled Student Details Card */}
            <div className="student-profile-strip">
              <div className="profile-row">
                <div className="profile-cell">
                  <span className="cell-label">CANDIDATE FULL NAME:</span>
                  <strong className="cell-val">{candidateFullName}</strong>
                </div>
                <div className="profile-cell">
                  <span className="cell-label">UTME / JAMB REG. NO:</span>
                  <strong className="cell-val font-mono">{data.jambNumber}</strong>
                </div>
              </div>

              <div className="profile-row">
                <div className="profile-cell">
                  <span className="cell-label">PROGRAMME / COURSE OFFERED:</span>
                  <strong className="cell-val text-primary font-bold">{data.course}</strong>
                </div>
                <div className="profile-cell">
                  <span className="cell-label">ADMISSION REF NUMBER:</span>
                  <strong className="cell-val font-mono text-primary">{data.referenceNumber}</strong>
                </div>
              </div>

              <div className="profile-row">
                <div className="profile-cell">
                  <span className="cell-label">PHONE NUMBER:</span>
                  <strong className="cell-val">{data.phoneNumber || "_____________________"}</strong>
                </div>
                <div className="profile-cell">
                  <span className="cell-label">EMAIL ADDRESS:</span>
                  <strong className="cell-val">{data.email || "_____________________"}</strong>
                </div>
              </div>
            </div>

            {/* Formal Declaration Text */}
            <div className="acceptance-declaration-box">
              <p>
                I, <strong>{candidateFullName}</strong>, hereby formally accept the offer of provisional admission into Highland College of Technology for the National Diploma (ND) programme in <strong>{data.course}</strong> for the <strong>{data.academicSession || "2026/2027"}</strong> Academic Session.
              </p>
              <p>
                I confirm payment of the non-refundable acceptance fee of <strong>Twenty Thousand Naira (N20,000.00)</strong> into the designated Highland College of Technology bank account.
              </p>
            </div>

            {/* Acceptance Fee Payment Verification Slip */}
            <div className="payment-slip-box">
              <h4 className="slip-heading">ACCEPTANCE FEE PAYMENT DETAILS (N20,000.00)</h4>
              <div className="slip-grid">
                <div>
                  <span className="slip-label">Bank Paid Into:</span>
                  <div className="bank-checkbox-row">
                    <span>[&nbsp;&nbsp;] First Bank (2014297193)</span>
                    <span className="ml-4">[&nbsp;&nbsp;] Zenith Bank (1015127597)</span>
                  </div>
                </div>
                <div>
                  <span className="slip-label">Amount Paid:</span>
                  <span className="font-bold">N20,000.00</span>
                </div>
                <div>
                  <span className="slip-label">Teller / Transfer Reference No:</span>
                  <span className="fill-line">____________________________________</span>
                </div>
                <div>
                  <span className="slip-label">Date of Payment:</span>
                  <span className="fill-line">________________________</span>
                </div>
                <div className="col-span-2">
                  <span className="slip-label">Name of Depositor / Payer:</span>
                  <span className="fill-line">____________________________________________________________________</span>
                </div>
              </div>
            </div>

            {/* Student Code of Conduct Undertaking */}
            <div className="undertaking-clause">
              <p>
                <strong>Undertaking:</strong> I understand that this offer of admission is provisional and subject to physical verification of my original O&apos;Level qualifying credentials. I promise to abide by all the rules, regulations, and statutes of Highland College of Technology.
              </p>
            </div>

            {/* Signatures Grid */}
            <div className="signatures-two-col">
              <div className="sig-column">
                <div className="sig-line" />
                <span className="sig-title">Candidate&apos;s Signature &amp; Date</span>
              </div>
              <div className="sig-column">
                <div className="sig-line" />
                <span className="sig-title">Parent / Guardian&apos;s Signature &amp; Phone</span>
              </div>
            </div>

            {/* For Official Use (Admissions Office Verification) */}
            <div className="official-use-strip">
              <div className="official-use-left">
                <span className="font-bold text-xs uppercase">FOR OFFICIAL USE ONLY (ADMISSIONS OFFICE):</span>
                <p className="text-xs text-muted m-0">Verified by: <strong>Adegbite Adenike</strong> &bull; Admission Officer</p>
                <p className="text-xs m-0">CAPS Recommendation: [&nbsp;&nbsp;] Approved &nbsp;&nbsp; [&nbsp;&nbsp;] Pending</p>
              </div>
              <div className="official-use-right">
                <div className="sig-line-mini" />
                <span className="text-xs">Signature &amp; Date Stamp</span>
              </div>
            </div>

            {/* Page 3 Footer */}
            <div className="doc-page-footer">
              <span>Highland College of Technology &bull; Student Acceptance Form</span>
              <span>Page 3 of 4 &bull; Return to Admissions Office</span>
            </div>
          </article>


          {/* ==============================================================
              DOCUMENT 4: OLAYINKA AND ADESEGUN FATOKI FOUNDATION
              SCHOLARSHIP FORM (BEARS THE 50% TUITION WAIVER)
             ============================================================== */}
          <article
            className={`official-letter-sheet print-doc-page doc-page-4 print-page-break ${
              activeTab !== "all" && activeTab !== "foundation" ? "screen-hidden" : ""
            }`}
          >
            {/* Foundation Header */}
            <div className="foundation-header">
              <div className="foundation-badge-crest">
                <Image
                  src="/hct-crest-shield.png"
                  alt="Highland Crest"
                  width={55}
                  height={60}
                  className="crest-shield"
                />
              </div>
              <div className="foundation-header-copy">
                <h1>OLAYINKA AND ADESEGUN FATOKI FOUNDATION</h1>
                <p className="foundation-affil">In Educational Partnership with Highland College of Technology</p>
                <h2>50% TUITION SCHOLARSHIP &amp; BENEFICIARY GRANT FORM</h2>
                <p className="session-tag">2026/2027 ACADEMIC SESSION</p>
              </div>
            </div>

            {/* Prominent 50% Scholarship Badge */}
            <div className="foundation-scholarship-banner">
              <div className="badge-50-percent">
                <Award size={28} className="text-amber-500" />
                <div>
                  <span className="badge-heading">APPROVED 50% TUITION SCHOLARSHIP BENEFICIARY GRANT</span>
                  <p className="badge-desc">
                    Bears 50% of candidate&apos;s annual tuition fee across First and Second Semesters at Highland College of Technology.
                  </p>
                </div>
              </div>
            </div>

            {/* Beneficiary Student Details */}
            <div className="student-profile-strip">
              <div className="profile-row">
                <div className="profile-cell">
                  <span className="cell-label">BENEFICIARY NAME:</span>
                  <strong className="cell-val">{candidateFullName}</strong>
                </div>
                <div className="profile-cell">
                  <span className="cell-label">UTME / JAMB REG. NO:</span>
                  <strong className="cell-val font-mono">{data.jambNumber}</strong>
                </div>
              </div>

              <div className="profile-row">
                <div className="profile-cell">
                  <span className="cell-label">PROGRAMME ENROLLED:</span>
                  <strong className="cell-val text-primary font-bold">{data.course}</strong>
                </div>
                <div className="profile-cell">
                  <span className="cell-label">ADMISSION REFERENCE:</span>
                  <strong className="cell-val font-mono text-primary">{data.referenceNumber}</strong>
                </div>
              </div>

              <div className="profile-row">
                <div className="profile-cell">
                  <span className="cell-label">PHONE NUMBER:</span>
                  <strong className="cell-val">{data.phoneNumber || "_____________________"}</strong>
                </div>
                <div className="profile-cell">
                  <span className="cell-label">EMAIL ADDRESS:</span>
                  <strong className="cell-val">{data.email || "_____________________"}</strong>
                </div>
              </div>
            </div>

            {/* 50% Tuition Waiver Fee Breakdown Table */}
            <div className="foundation-table-wrap">
              <h4 className="table-caption-strong">OFFICIAL 50% TUITION SCHOLARSHIP GRANT SCHEDULE</h4>
              <table className="factsheet-table">
                <thead>
                  <tr>
                    <th>Academic Semester</th>
                    <th className="text-right">Standard Tuition Fee</th>
                    <th className="text-right">50% Fatoki Foundation Grant</th>
                    <th className="text-right">Net Tuition Payable by Student</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>First Semester</strong></td>
                    <td className="text-right">N80,000.00</td>
                    <td className="text-right text-emerald-700 font-bold">-N40,000.00 (50% WAIVER)</td>
                    <td className="text-right font-bold text-primary">N40,000.00</td>
                  </tr>
                  <tr>
                    <td><strong>Second Semester</strong></td>
                    <td className="text-right">N80,000.00</td>
                    <td className="text-right text-emerald-700 font-bold">-N40,000.00 (50% WAIVER)</td>
                    <td className="text-right font-bold text-primary">N40,000.00</td>
                  </tr>
                  <tr className="table-total-row">
                    <td><strong>TOTAL ANNUAL TUITION</strong></td>
                    <td className="text-right"><strong>N160,000.00</strong></td>
                    <td className="text-right text-emerald-700 font-bold">-N80,000.00 (50% SAVINGS)</td>
                    <td className="text-right font-bold text-primary">N80,000.00</td>
                  </tr>
                </tbody>
              </table>
              <p className="table-disclaimer">
                * Note: The 50% scholarship grant applies strictly to tuition fees. Non-tuition administrative, matriculation, and medical fees remain payable as stated on the Fact Sheet.
              </p>
            </div>

            {/* Socio-Economic Need Assessment (Fillable) */}
            <div className="need-assessment-card">
              <h4 className="need-card-title">APPLICANT SOCIO-ECONOMIC INFORMATION</h4>
              <div className="need-grid">
                <div>
                  <span className="need-label">State of Origin &amp; LGA:</span>
                  <span className="fill-line">__________________________________</span>
                </div>
                <div>
                  <span className="need-label">Parent / Sponsor Name:</span>
                  <span className="fill-line">__________________________________</span>
                </div>
                <div>
                  <span className="need-label">Parent / Sponsor Occupation:</span>
                  <span className="fill-line">__________________________________</span>
                </div>
                <div>
                  <span className="need-label">Parent / Sponsor Phone:</span>
                  <span className="fill-line">__________________________________</span>
                </div>
                <div className="col-span-2">
                  <span className="need-label">Brief Statement of Financial Need / Justification:</span>
                  <span className="fill-line">____________________________________________________________________________________________________</span>
                </div>
              </div>
            </div>

            {/* Beneficiary Declaration & Endorsement */}
            <div className="undertaking-clause">
              <p>
                <strong>Beneficiary Declaration:</strong> I hereby confirm my application for the 50% Tuition Scholarship provided by the Olayinka and Adesegun Fatoki Foundation. I declare that the details provided are genuine and undertake to maintain excellent academic progress and discipline throughout my studies.
              </p>
            </div>

            {/* Signatures & Foundation Approval */}
            <div className="signatures-three-col">
              <div className="sig-column">
                <div className="sig-line" />
                <span className="sig-title">Beneficiary Signature &amp; Date</span>
              </div>
              <div className="sig-column">
                <div className="sig-line" />
                <span className="sig-title">Parent / Sponsor Signature</span>
              </div>
              <div className="sig-column approval-col">
                <div className="officer-sig-mini">
                  <Image
                    src="/adegbite-signature.png"
                    alt="Adegbite Adenike Signature"
                    width={110}
                    height={32}
                  />
                </div>
                <span className="sig-title font-bold text-primary">Adegbite Adenike</span>
                <span className="text-[10px] text-muted">Sec. Admissions &amp; Scholarship Board</span>
              </div>
            </div>

            {/* Page 4 Footer */}
            <div className="doc-page-footer">
              <span>Olayinka and Adesegun Fatoki Foundation &bull; Highland College of Technology</span>
              <span>Page 4 of 4 &bull; 50% Tuition Scholarship Beneficiary Form</span>
            </div>
          </article>

        </div>
      </div>
    </div>
  );
}
