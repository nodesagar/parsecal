"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  Image,
  Type,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Plus,
} from "lucide-react";
import Link from "next/link";

type InputMode = "file" | "text";
type Step = "upload" | "processing" | "done";

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/heic",
];

export default function NewParsePage() {
  const [mode, setMode] = useState<InputMode>("file");
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const [step, setStep] = useState<Step>("upload");
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const router = useRouter();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleft") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && ACCEPTED_TYPES.includes(droppedFile.type)) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError("Unsupported file type. Use PDF, PNG, JPG, or WebP.");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
        setError("Unsupported file type. Use PDF, PNG, JPG, or WebP.");
        return;
      }
      const maxSize =
        selectedFile.type === "application/pdf"
          ? 25 * 1024 * 1024
          : 10 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setError(
          `File too large. Max ${selectedFile.type === "application/pdf" ? "25MB" : "10MB"}.`,
        );
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (mode === "file" && !file) return;
    if (mode === "text" && !textInput.trim()) return;

    setStep("processing");
    setError(null);

    try {
      const formData = new FormData();

      if (mode === "file" && file) {
        formData.append("file", file);
        formData.append(
          "inputType",
          file.type === "application/pdf" ? "pdf" : "image",
        );
      } else {
        formData.append("textInput", textInput);
        formData.append("inputType", "text");
      }

      const response = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        setStep("upload");
        return;
      }

      setStep("done");
      // Redirect to review page
      setTimeout(() => {
        router.push(`/parse/${data.sessionId}`);
      }, 1000);
    } catch {
      setError("Network error. Please try again.");
      setStep("upload");
    }
  };

  const FileIcon =
    file?.type === "application/pdf" ? FileText : file ? Image : FileText;

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/dashboard"
          className="w-8 h-8 flex items-center justify-center rounded-[10px] bg-bg border border-border hover:border-primary cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-text-muted" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text">New Parse</h1>
          <p className="text-sm text-text-muted">
            Upload or paste schedule data to extract events.
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { key: "upload", label: "Upload" },
          { key: "processing", label: "Processing" },
          { key: "done", label: "Done" },
        ].map((s, i) => {
          const isActive = s.key === step;
          const isDone =
            (step === "processing" && i === 0) || (step === "done" && i <= 1);
          return (
            <div key={s.key} className="flex items-center gap-2 flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isDone
                    ? "bg-success text-white"
                    : isActive
                      ? "bg-primary text-white"
                      : "bg-bg border border-border text-text-muted"
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  isActive ? "text-text" : "text-text-muted"
                }`}
              >
                {s.label}
              </span>
              {i < 2 && <div className="flex-1 h-px bg-border" />}
            </div>
          );
        })}
      </div>

      {/* Step: Upload */}
      {step === "upload" && (
        <div className="space-y-6">
          {/* Main Upload Card */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-[24px] p-16 text-center transition-all ${dragActive
              ? "border-primary bg-primary/5"
              : file
                ? "border-success bg-success/5"
                : "border-border hover:border-primary/50 bg-bg-card/50"
              }`}
          >
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.heic"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />

            {!file ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#eef4ff] rounded-full flex items-center justify-center mb-6">
                  <Upload className="w-8 h-8 text-[#4182f9]" />
                </div>
                <h2 className="text-xl font-bold text-text mb-2">
                  Upload or paste schedule data
                </h2>
                <p className="text-sm text-text-muted mb-8 max-w-sm mx-auto">
                  PDF, images (including handwritten notes), or plain text
                </p>
                <div className="inline-flex items-center gap-2 bg-[#ff5c00] hover:bg-[#e65300] text-white font-bold px-8 py-3.5 rounded-[12px] text-base shadow-sm transition-all relative z-20">
                  <Plus className="w-5 h-5" />
                  New Parse
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
                  <FileIcon className="w-8 h-8 text-success" />
                </div>
                <div className="mb-6">
                  <p className="text-base font-bold text-text">
                    {file.name}
                  </p>
                  <p className="text-sm text-text-muted">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • Ready to extract
                  </p>
                </div>
                <div className="flex items-center gap-3 relative z-20">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setFile(null);
                    }}
                    className="px-6 py-2.5 rounded-[12px] bg-bg border border-border text-sm font-semibold text-text-muted hover:text-error hover:bg-error/5 transition-all"
                  >
                    Remove
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmit();
                    }}
                    className="px-8 py-2.5 rounded-[12px] bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary-hover transition-all"
                  >
                    Extract Now
                  </button>
                </div>
              </div>
            )}
          </div>

          {!file && (
            <div className="text-center">
              <button
                onClick={() => setMode(mode === "file" ? "text" : "file")}
                className="text-sm font-medium text-text-muted hover:text-primary transition-colors inline-flex items-center gap-2"
              >
                {mode === "file" ? (
                  <>
                    <Type className="w-4 h-4" />
                    Prefer to paste text?
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Back to file upload
                  </>
                )}
              </button>
            </div>
          )}

          {mode === "text" && !file && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste your schedule text here...&#10;&#10;Example:&#10;Team meeting every Monday at 9am&#10;Sprint review on Friday 3pm..."
                rows={10}
                className="w-full bg-bg-card border border-border rounded-[20px] p-5 text-sm text-text placeholder:text-text-light focus:border-primary/50 focus:ring-2 focus:ring-primary/5 focus:outline-none resize-none transition-all"
              />
              <button
                onClick={handleSubmit}
                disabled={!textInput.trim()}
                className="w-full bg-cta hover:bg-cta-hover text-white font-bold py-4 rounded-[14px] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                Extract from Text
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-error/10 border border-error/20 rounded-[14px] px-5 py-4 text-sm text-error animate-in shake duration-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>
      )}

      {/* Step: Processing */}
      {step === "processing" && (
        <div className="bg-bg-card border border-border rounded-[16px] p-10 text-center">
          <Loader2 className="w-10 h-10 text-primary mx-auto mb-4 animate-spin" />
          <h2 className="text-lg font-semibold text-text mb-2">
            Analyzing your content...
          </h2>
          <p className="text-sm text-text-muted">
            AI is extracting events. This usually takes 5-15 seconds.
          </p>
          <div className="mt-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-16 w-full" />
            ))}
          </div>
        </div>
      )}

      {/* Step: Done */}
      {step === "done" && (
        <div className="bg-bg-card border border-border rounded-[16px] p-10 text-center">
          <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text mb-2">
            Events extracted!
          </h2>
          <p className="text-sm text-text-muted">Redirecting to review...</p>
        </div>
      )}
    </div>
  );
}
