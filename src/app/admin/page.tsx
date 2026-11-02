"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  Download,
  Lock,
  LogOut,
  CheckCircle,
  Eye,
  FileText,
  Calendar,
  BookOpen,
  ArrowUpDown,
  RefreshCw,
  X,
} from "lucide-react";
import type { StudentSubmission } from "@/lib/db";
import AdmissionLetter from "@/components/AdmissionLetter";

interface AdminStats {
  totalSubmissions: number;
  todaySubmissions: number;
  courseBreakdown: Array<{ course: string; count: number }>;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passkeyInput, setPasskeyInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("ALL");

  // Selected student for detail modal or letter preview
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);
  const [previewLetterFor, setPreviewLetterFor] = useState<StudentSubmission | null>(null);

  // Check auth status on load
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/auth");
        if (res.ok) {
          setIsAuthenticated(true);
          loadSubmissions();
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setIsSubmittingLogin(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passkey: passkeyInput }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setPasskeyInput("");
        loadSubmissions();
      } else {
        setLoginError(data.error || "Authentication failed. Incorrect passkey.");
      }
    } catch {
      setLoginError("Network error. Please try again.");
    } finally {
      setIsSubmittingLogin(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
    } finally {
      setIsAuthenticated(false);
      setSubmissions([]);
      setStats(null);
    }
  }

  async function loadSubmissions() {
    setIsLoadingData(true);
    try {
      const res = await fetch("/api/admin/submissions");
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmissions(data.submissions || []);
        setStats(data.stats || null);
      }
    } catch (err) {
      console.error("Failed to load submissions:", err);
    } finally {
      setIsLoadingData(false);
    }
  }

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((item) => {
      const matchesCourse =
        selectedCourse === "ALL" || item.course === selectedCourse;

      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.jambNumber.toLowerCase().includes(q) ||
        item.surname.toLowerCase().includes(q) ||
        item.otherNames.toLowerCase().includes(q) ||
        (item.email && item.email.toLowerCase().includes(q)) ||
        (item.phoneNumber && item.phoneNumber.toLowerCase().includes(q)) ||
        item.referenceNumber.toLowerCase().includes(q);

      return matchesCourse && matchesSearch;
    });
  }, [submissions, selectedCourse, searchTerm]);

  // Export to CSV
  function handleExportCsv() {
    if (filteredSubmissions.length === 0) {
      alert("No student records available to export with the current filter.");
      return;
    }

    const headers = [
      "Reference Number",
      "JAMB Registration Number",
      "Surname",
      "Other Names",
      "Email Address",
      "Phone Number",
      "Course of Study",
      "JAMB Score",
      "O-Level Sittings Count",
      "O-Level Summary",
      "Status",
      "Submission Date",
    ];

    const rows = filteredSubmissions.map((s) => {
      const oLevelSummary = s.sittings
        .map(
          (sit, idx) =>
            `[Sitting ${idx + 1}: ${sit.exam} ${sit.year} - Reg: ${
              sit.oLevelRegistrationNumber
            } - Subjects: ${sit.subjects
              .map((sub) => `${sub.subject}: ${sub.grade}`)
              .join("; ")}]`
        )
        .join(" | ");

      return [
        `"${s.referenceNumber}"`,
        `"${s.jambNumber}"`,
        `"${s.surname}"`,
        `"${s.otherNames}"`,
        `"${s.email || ""}"`,
        `"${s.phoneNumber || ""}"`,
        `"${s.course}"`,
        `"${s.jambScore}"`,
        `"${s.sittings.length}"`,
        `"${oLevelSummary.replace(/"/g, '""')}"`,
        `"${s.status}"`,
        `"${new Date(s.createdAt).toLocaleString("en-GB")}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `HCT_Admissions_Export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // 1. Loading State
  if (isAuthenticated === null) {
    return (
      <div className="admin-loading-screen">
        <RefreshCw className="animate-spin text-primary" size={32} />
        <p>Connecting to Highland College Administration Portal...</p>
      </div>
    );
  }

  // 2. Authentication Screen
  if (!isAuthenticated) {
    return (
      <main className="admin-login-layout">
        <div className="admin-login-card">
          <div className="login-crest">
            <Image
              src="/images.png"
              alt="Highland College Crest"
              width={75}
              height={75}
              priority
            />
          </div>
          <h1>Highland College of Technology</h1>
          <p className="login-subtitle">
            Directorate of Admissions &bull; Administrative Console
          </p>

          <form onSubmit={handleLogin} className="login-form">
            {loginError && <div className="login-error-alert">{loginError}</div>}

            <label className="login-field">
              <span>Enter Administrative Passkey</span>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  placeholder="Enter administrative passkey"
                  required
                  autoFocus
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={isSubmittingLogin}
              className="login-submit-btn"
            >
              {isSubmittingLogin ? "Verifying..." : "Access Administrative Portal"}
            </button>
          </form>

          <div className="login-footer">
            <Link href="/" className="back-link">
              &larr; Return to Student Screening Portal
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 3. Authenticated Admin Dashboard
  return (
    <div className="admin-dashboard">
      {/* Top Navigation */}
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-brand">
            <Image
              src="/images.png"
              alt="Highland College of Technology"
              width={46}
              height={46}
            />
            <div>
              <h2>Highland College of Technology</h2>
              <span>Admissions Administration &amp; Student Tracking Portal</span>
            </div>
          </div>

          <div className="admin-header-actions">
            <Link href="/" className="header-link" target="_blank">
              View Student Portal
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="btn-admin-logout"
              title="Log out"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="admin-body">
        {/* KPI Summary Cards */}
        <section className="admin-kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon-wrap bg-blue-50 text-blue-700">
              <Users size={22} />
            </div>
            <div>
              <span className="kpi-label">TOTAL STUDENTS ADMITTED</span>
              <strong className="kpi-value">{stats?.totalSubmissions || 0}</strong>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap bg-emerald-50 text-emerald-700">
              <Calendar size={22} />
            </div>
            <div>
              <span className="kpi-label">TODAY&apos;S SUBMISSIONS</span>
              <strong className="kpi-value">{stats?.todaySubmissions || 0}</strong>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap bg-amber-50 text-amber-700">
              <BookOpen size={22} />
            </div>
            <div>
              <span className="kpi-label">ACTIVE PROGRAMMES</span>
              <strong className="kpi-value">4 Departments</strong>
            </div>
          </div>
        </section>

        {/* Toolbar & Filters */}
        <section className="admin-toolbar">
          <div className="toolbar-search">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by JAMB number, Student Name, or Ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="clear-search-btn"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="toolbar-filters">
            <div className="filter-select-wrap">
              <Filter size={14} className="filter-icon" />
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="ALL">All Programmes</option>
                <option value="Accountancy">Accountancy</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Computer-Science">Computer Science</option>
                <option value="Mass Communication">Mass Communication</option>
              </select>
            </div>

            <button
              type="button"
              onClick={loadSubmissions}
              className="btn-refresh"
              title="Refresh Data"
            >
              <RefreshCw size={15} className={isLoadingData ? "animate-spin" : ""} />
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="btn-export-csv"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>
          </div>
        </section>

        {/* Submissions Table */}
        <section className="admin-table-card">
          <div className="table-header-meta">
            <span>
              Showing <strong>{filteredSubmissions.length}</strong> of{" "}
              <strong>{submissions.length}</strong> admitted students
            </span>
            {selectedCourse !== "ALL" && (
              <span className="active-filter-badge">
                Filtered: {selectedCourse}
              </span>
            )}
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>REF NUMBER</th>
                  <th>CANDIDATE NAME</th>
                  <th>JAMB REG NO</th>
                  <th>COURSE</th>
                  <th>JAMB SCORE</th>
                  <th>SITTINGS</th>
                  <th>DATE</th>
                  <th className="text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="empty-table-cell">
                      {isLoadingData
                        ? "Loading student records..."
                        : "No student admission records found matching your filters."}
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((s) => (
                    <tr key={s.id}>
                      <td className="font-mono text-xs font-bold text-primary">
                        {s.referenceNumber}
                      </td>
                      <td>
                        <strong className="block text-ink">
                          {s.surname}, {s.otherNames}
                        </strong>
                        {s.email && (
                          <span className="block text-xs text-muted font-normal">
                            {s.email}
                          </span>
                        )}
                      </td>
                      <td className="font-mono text-xs">{s.jambNumber}</td>
                      <td>
                        <span className="course-pill">{s.course}</span>
                      </td>
                      <td>
                        <span className="font-semibold text-slate-700">
                          {s.jambScore} / 400
                        </span>
                      </td>
                      <td>
                        <span className="sittings-badge">
                          {s.sittings.length} {s.sittings.length === 1 ? "Sitting" : "Sittings"}
                        </span>
                      </td>
                      <td className="text-xs text-muted">
                        {new Date(s.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="text-right">
                        <div className="action-button-group">
                          <button
                            type="button"
                            onClick={() => setSelectedSubmission(s)}
                            className="btn-table-action"
                            title="View Full O'Level Qualifications"
                          >
                            <Eye size={14} />
                            <span>Details</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewLetterFor(s)}
                            className="btn-table-action btn-letter-action"
                            title="Preview / Print Admission Package (4 Forms)"
                          >
                            <FileText size={14} />
                            <span>4 Documents</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Student Details Inspection Modal */}
      {selectedSubmission && (
        <div className="dialog-backdrop" role="dialog" aria-modal="true">
          <div className="dialog-shell detail-modal-shell">
            <div className="dialog-header-crest">
              <div>
                <span className="kicker-tag">STUDENT ADMISSION PROFILE</span>
                <h3 className="modal-title">
                  {selectedSubmission.surname}, {selectedSubmission.otherNames}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="dialog-close-btn"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-detail-content">
              {/* Primary Info */}
              <div className="detail-meta-grid">
                <div>
                  <span className="detail-meta-label">ADMISSION REFERENCE:</span>
                  <strong className="detail-meta-val font-mono text-primary">
                    {selectedSubmission.referenceNumber}
                  </strong>
                </div>
                <div>
                  <span className="detail-meta-label">JAMB REG NUMBER:</span>
                  <strong className="detail-meta-val font-mono">
                    {selectedSubmission.jambNumber}
                  </strong>
                </div>
                <div>
                  <span className="detail-meta-label">JAMB SCORE:</span>
                  <strong className="detail-meta-val">
                    {selectedSubmission.jambScore} / 400
                  </strong>
                </div>
                <div>
                  <span className="detail-meta-label">PROGRAMME OFFERED:</span>
                  <strong className="detail-meta-val text-primary">
                    {selectedSubmission.course}
                  </strong>
                </div>
                <div>
                  <span className="detail-meta-label">EMAIL ADDRESS:</span>
                  <strong className="detail-meta-val">
                    {selectedSubmission.email || "Not specified"}
                  </strong>
                </div>
                <div>
                  <span className="detail-meta-label">PHONE NUMBER:</span>
                  <strong className="detail-meta-val">
                    {selectedSubmission.phoneNumber || "Not specified"}
                  </strong>
                </div>
              </div>

              {/* O'Level Sittings Detailed breakdown */}
              <div className="detail-sittings-section">
                <h4>Verified O&apos;Level Examination Results</h4>
                {selectedSubmission.sittings.map((sitting, idx) => (
                  <div key={idx} className="sitting-inspect-card">
                    <div className="sitting-inspect-header">
                      <span className="font-bold">
                        SITTING {idx + 1}: {sitting.exam} ({sitting.year})
                      </span>
                      <span className="text-xs font-mono text-slate-600">
                        Exam Reg No: {sitting.oLevelRegistrationNumber}
                      </span>
                    </div>

                    <div className="sitting-inspect-grid">
                      {sitting.subjects.map((sub, sIdx) => (
                        <div key={sIdx} className="subject-grade-pill">
                          <span className="sub-name">{sub.subject}</span>
                          <strong className="sub-grade">{sub.grade}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="modal-actions-footer">
                <button
                  type="button"
                  onClick={() => {
                    const toPreview = selectedSubmission;
                    setSelectedSubmission(null);
                    setPreviewLetterFor(toPreview);
                  }}
                  className="btn-print-letter"
                >
                  <FileText size={16} />
                  <span>Preview All 4 Admission Documents</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="btn-dialog-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admission Letter Full View Modal */}
      {previewLetterFor && (
        <div className="letter-modal-backdrop" role="dialog" aria-modal="true">
          <AdmissionLetter
            data={{
              referenceNumber: previewLetterFor.referenceNumber,
              jambNumber: previewLetterFor.jambNumber,
              candidateName: `${previewLetterFor.surname} ${previewLetterFor.otherNames}`,
              surname: previewLetterFor.surname,
              otherNames: previewLetterFor.otherNames,
              course: previewLetterFor.course,
              jambScore: previewLetterFor.jambScore,
              academicSession: "2026/2027",
              status: previewLetterFor.status,
              dateOffered: previewLetterFor.createdAt,
              sittings: previewLetterFor.sittings,
            }}
            onClose={() => setPreviewLetterFor(null)}
          />
        </div>
      )}
    </div>
  );
}
