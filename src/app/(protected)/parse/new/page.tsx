'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import Link from 'next/link';

type InputMode = 'file' | 'text';
type Step = 'upload' | 'processing' | 'done';

const ACCEPTED_TYPES = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/heic',
];

export default function NewParsePage() {
    const [mode, setMode] = useState<InputMode>('file');
    const [file, setFile] = useState<File | null>(null);
    const [textInput, setTextInput] = useState('');
    const [step, setStep] = useState<Step>('upload');
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const router = useRouter();

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleft') {
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
            setError('Unsupported file type. Use PDF, PNG, JPG, or WebP.');
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
                setError('Unsupported file type. Use PDF, PNG, JPG, or WebP.');
                return;
            }
            const maxSize = selectedFile.type === 'application/pdf' ? 25 * 1024 * 1024 : 10 * 1024 * 1024;
            if (selectedFile.size > maxSize) {
                setError(`File too large. Max ${selectedFile.type === 'application/pdf' ? '25MB' : '10MB'}.`);
                return;
            }
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleSubmit = async () => {
        if (mode === 'file' && !file) return;
        if (mode === 'text' && !textInput.trim()) return;

        setStep('processing');
        setError(null);

        try {
            const formData = new FormData();

            if (mode === 'file' && file) {
                formData.append('file', file);
                formData.append('inputType', file.type === 'application/pdf' ? 'pdf' : 'image');
            } else {
                formData.append('textInput', textInput);
                formData.append('inputType', 'text');
            }

            const response = await fetch('/api/parse', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Something went wrong');
                setStep('upload');
                return;
            }

            setStep('done');
            // Redirect to review page
            setTimeout(() => {
                router.push(`/parse/${data.sessionId}`);
            }, 1000);
        } catch {
            setError('Network error. Please try again.');
            setStep('upload');
        }
    };

    const FileIcon = file?.type === 'application/pdf' ? FileText : (file ? Image : FileText);

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
                    <h1 className="text-xl font-bold text-text">New Parse</h1>
                    <p className="text-sm text-text-muted">Upload content to extract events</p>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-2 mb-8">
                {[
                    { key: 'upload', label: 'Upload' },
                    { key: 'processing', label: 'Processing' },
                    { key: 'done', label: 'Done' },
                ].map((s, i) => {
                    const isActive = s.key === step;
                    const isDone =
                        (step === 'processing' && i === 0) ||
                        (step === 'done' && i <= 1);
                    return (
                        <div key={s.key} className="flex items-center gap-2 flex-1">
                            <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isDone
                                    ? 'bg-success text-white'
                                    : isActive
                                        ? 'bg-primary text-white'
                                        : 'bg-bg border border-border text-text-muted'
                                    }`}
                            >
                                {isDone ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                            </div>
                            <span
                                className={`text-xs font-medium hidden sm:block ${isActive ? 'text-text' : 'text-text-muted'
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
            {step === 'upload' && (
                <>
                    {/* Mode Toggle */}
                    <div className="flex bg-bg border border-border rounded-[10px] p-1 mb-6">
                        <button
                            onClick={() => setMode('file')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-[8px] text-sm font-medium cursor-pointer ${mode === 'file'
                                ? 'bg-bg-card text-text shadow-sm'
                                : 'text-text-muted hover:text-text'
                                }`}
                        >
                            <Upload className="w-4 h-4" />
                            Upload File
                        </button>
                        <button
                            onClick={() => setMode('text')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-[8px] text-sm font-medium cursor-pointer ${mode === 'text'
                                ? 'bg-bg-card text-text shadow-sm'
                                : 'text-text-muted hover:text-text'
                                }`}
                        >
                            <Type className="w-4 h-4" />
                            Paste Text
                        </button>
                    </div>

                    {mode === 'file' ? (
                        <>
                            {/* Drop Zone */}
                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                className={`relative border-2 border-dashed rounded-[16px] p-10 text-center cursor-pointer ${dragActive
                                    ? 'border-primary bg-primary/5'
                                    : file
                                        ? 'border-success bg-success/5'
                                        : 'border-border hover:border-primary'
                                    }`}
                            >
                                <input
                                    type="file"
                                    accept=".pdf,.png,.jpg,.jpeg,.webp,.heic"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {file ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <FileIcon className="w-8 h-8 text-success" />
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-text">{file.name}</p>
                                            <p className="text-xs text-text-muted">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setFile(null);
                                            }}
                                            className="w-6 h-6 rounded-full bg-error/10 flex items-center justify-center cursor-pointer"
                                        >
                                            <X className="w-3 h-3 text-error" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="w-10 h-10 text-text-light mx-auto mb-3" />
                                        <p className="text-sm font-medium text-text mb-1">
                                            Drag & drop or click to browse
                                        </p>
                                        <p className="text-xs text-text-muted">
                                            PDF, PNG, JPG, WebP • Images up to 10MB, PDFs up to 25MB
                                        </p>
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        /* Text Input */
                        <textarea
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder="Paste your schedule text here...&#10;&#10;Example:&#10;Team meeting every Monday at 9am&#10;Sprint review on Friday 3pm, Conference Room B&#10;Lunch with Sarah, March 12 at 12:30pm"
                            rows={10}
                            className="w-full bg-bg-card border border-border rounded-[16px] p-4 text-sm text-text placeholder:text-text-light focus:border-border-focus focus:outline-none resize-none"
                        />
                    )}

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 bg-error/10 border border-error/20 rounded-[10px] px-4 py-2.5 text-sm text-error mt-4">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={
                            (mode === 'file' && !file) || (mode === 'text' && !textInput.trim())
                        }
                        className="w-full mt-6 bg-cta hover:bg-cta-hover text-white font-semibold py-3 rounded-[10px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        Extract Events
                    </button>
                </>
            )}

            {/* Step: Processing */}
            {step === 'processing' && (
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
            {step === 'done' && (
                <div className="bg-bg-card border border-border rounded-[16px] p-10 text-center">
                    <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-text mb-2">Events extracted!</h2>
                    <p className="text-sm text-text-muted">Redirecting to review...</p>
                </div>
            )}
        </div>
    );
}
