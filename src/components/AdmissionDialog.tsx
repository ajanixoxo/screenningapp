"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle2, Printer, X, Award, ExternalLink, Calendar, BookOpen, Hash, Mail, Phone } from "lucide-react";
import AdmissionLetter, { AdmissionOfferData } from "./AdmissionLetter";

interface AdmissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: AdmissionOfferData | null;
}

export default function AdmissionDialog({
  isOpen,
  onClose,
  data,
}: AdmissionDialogProps) {
  const [showFullLetter, setShowFullLetter] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (showFullLetter) {
          setShowFullLetter(false);
        } else {
          onClose();
        }
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, showFullLetter, onClose]);

  if (!isOpen || !data) return null;

  // If user requested to view/print full letter
  if (showFullLetter) {
    return (
      <div className="letter-modal-backdrop" role="dialog" aria-modal="true">
        <AdmissionLetter
          data={data}
          onClose={() => setShowFullLetter(false)}
        />
      </div>
    );
  }

  const formattedDate = new Date(data.dateOffered || Date.now()).toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );

  return (
    <div
      className="dialog-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div className="dialog-shell">
        {/* Header Ribbon / Crest */}
        <div className="dialog-header-crest">
          <div className="crest-badge">
            <Image
              src="/images.png"
              alt="Highland College of Technology Crest"
              width={64}
              height={64}
              priority
              className="dialog-crest-img"
            />
          </div>
          <button
            type="button"
            className="dialog-close-btn"
            onClick={onClose}
            aria-label="Close confirmation dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="dialog-content">
          <div className="success-status-tag">
            <CheckCircle2 size={18} className="text-emerald-600 inline mr-1.5" />
            <span>PROVISIONAL ADMISSION OFFERED</span>
          </div>

          <h2 id="dialog-title" className="dialog-main-heading">
            Congratulations, {data.surname}!
          </h2>

          <p className="dialog-subtext">
            Your screening submission has been verified successfully. You have been offered provisional admission into <strong>Highland College of Technology</strong> for the <strong>2026/2027</strong> Academic Session.
          </p>

          {/* Student & Course Summary Card */}
          <div className="dialog-summary-card">
            <div className="summary-field full">
              <span className="summary-label">FULL NAME:</span>
              <strong className="summary-value text-ink">
                {data.candidateName || `${data.surname} ${data.otherNames}`}
              </strong>
            </div>

            <div className="summary-row">
              <div className="summary-field">
                <span className="summary-label">
                  <BookOpen size={13} className="inline mr-1 text-primary" />
                  PROGRAMME:
                </span>
                <strong className="summary-value text-primary font-bold">
                  {data.course}
                </strong>
              </div>

              <div className="summary-field">
                <span className="summary-label">
                  <Hash size={13} className="inline mr-1 text-primary" />
                  JAMB REG NO:
                </span>
                <strong className="summary-value">{data.jambNumber}</strong>
              </div>
            </div>

            <div className="summary-row">
              <div className="summary-field">
                <span className="summary-label">
                  <Award size={13} className="inline mr-1 text-amber-600" />
                  ADMISSION REF:
                </span>
                <strong className="summary-value font-mono text-primary">
                  {data.referenceNumber}
                </strong>
              </div>

              <div className="summary-field">
                <span className="summary-label">
                  <Calendar size={13} className="inline mr-1 text-slate-500" />
                  OFFER DATE:
                </span>
                <strong className="summary-value">{formattedDate}</strong>
              </div>
            </div>

            {(data.email || data.phoneNumber) && (
              <div className="summary-row">
                {data.email && (
                  <div className="summary-field">
                    <span className="summary-label">
                      <Mail size={13} className="inline mr-1 text-slate-500" />
                      EMAIL:
                    </span>
                    <strong className="summary-value text-xs">{data.email}</strong>
                  </div>
                )}
                {data.phoneNumber && (
                  <div className="summary-field">
                    <span className="summary-label">
                      <Phone size={13} className="inline mr-1 text-slate-500" />
                      PHONE:
                    </span>
                    <strong className="summary-value text-xs">{data.phoneNumber}</strong>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Important Notice with 4 Documents Breakdown */}
          <div className="dialog-notice-box">
            <p className="font-semibold text-amber-900 mb-1.5">
              Your Complete Admission Package is ready with 4 Official Documents:
            </p>
            <ul className="text-xs space-y-1 text-amber-800 list-disc list-inside">
              <li><strong>1. Offer of Provisional Admission Letter</strong> (with HCT Letterhead &amp; Admission Officer signature)</li>
              <li><strong>2. Fact Sheet</strong> (2026/2027 fee schedule, bank details &amp; send to Adegbite)</li>
              <li><strong>3. Acceptance Form</strong> (Acceptance declaration &amp; bank payment verification)</li>
              <li><strong>4. Foundation Form</strong> (Olayinka &amp; Adesegun Fatoki Foundation 50% Tuition Scholarship)</li>
            </ul>
          </div>

          {/* Action CTAs */}
          <div className="dialog-actions">
            <button
              type="button"
              className="btn-print-letter"
              onClick={() => setShowFullLetter(true)}
            >
              <Printer size={18} />
              <span>Print All 4 Documents</span>
            </button>

            <button
              type="button"
              className="btn-dialog-secondary"
              onClick={onClose}
            >
              <span>Close / Return Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
