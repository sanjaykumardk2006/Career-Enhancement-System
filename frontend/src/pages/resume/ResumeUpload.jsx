import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadResume, analyzeResume, getResume } from '../../services/api';
import toast from 'react-hot-toast';
import { Upload, Brain, CheckCircle, AlertCircle, Lightbulb, Tag, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ResumeUpload() {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploaded, setUploaded] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    getResume()
      .then(({ data }) => {
        if (!ignore && data) {
          if (data.uploadedFile) setUploaded(data.uploadedFile);
          if (data.aiAnalysis?.score) setAnalysis(data.aiAnalysis);
        }
      })
      .catch((err) => console.debug('Initial resume fetch error:', err?.message))
      .finally(() => {
        if (!ignore) setInitialLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles[0]) return;
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('resume', file);
    setUploading(true);
    try {
      const res = await uploadResume(formData);
      setUploaded(file.name);
      toast.success('Resume uploaded successfully! Click "Analyze with AI" below.');
      if (res.data?.resume?.aiAnalysis) {
        setAnalysis(res.data.resume.aiAnalysis);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  });

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const { data } = await analyzeResume();
      setAnalysis(data);
      toast.success('AI analysis complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed. Build your resume first.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
        <p>Loading resume intelligence...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: 900 }}>
      <div className="page-header">
        <div className="page-header-row">
          <div className="header-icon-box">
            <Upload size={18} strokeWidth={2.4} />
          </div>
          <div>
            <h1>Resume Intelligence & Audit</h1>
            <p>Upload your CV for structural parsing, ATS keyword benchmarking, and executive scoring</p>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="card mb-2">
        <h4 style={{ marginBottom: '1.25rem' }}>Upload Resume</h4>
        <div {...getRootProps()} style={{
          border: `2px dashed ${isDragActive ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: 'clamp(1.5rem, 5vw, 3rem) 1rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragActive ? 'rgba(99,102,241,0.06)' : 'var(--bg-input)',
          transition: 'all 0.2s',
        }}>
          <input {...getInputProps()} />
          <Upload size={40} style={{ color: isDragActive ? 'var(--primary)' : 'var(--text-muted)', margin: '0 auto 1rem', display: 'block' }} />
          {uploading ? (
            <p style={{ color: 'var(--primary-light)' }}>Uploading...</p>
          ) : uploaded ? (
            <div>
              <CheckCircle size={24} style={{ color: 'var(--success)', margin: '0 auto 0.5rem', display: 'block' }} />
              <p style={{ color: 'var(--success)', fontWeight: 600 }}>{uploaded} uploaded!</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Drop another file to replace</p>
            </div>
          ) : (
            <div>
              <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>
                {isDragActive ? 'Drop your resume here...' : 'Drag & drop your resume here'}
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>or click to browse • PDF, DOC, DOCX • Max 5MB</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Analysis Button */}
      <div className="card mb-2">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h4>AI Resume Analysis</h4>
            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Get Gemini AI to analyze your resume and provide actionable feedback</p>
          </div>
          <button onClick={handleAnalyze} className="btn btn-primary" disabled={analyzing}>
            {analyzing ? <><span className="spinner-sm" />Analyzing...</> : <><Brain size={16} />Analyze with AI</>}
          </button>
        </div>
      </div>

      {analyzing && (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>Gemini AI is reviewing your resume...</p>
        </div>
      )}

      {analysis && !analyzing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Score */}
          <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(6,182,212,0.1))' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Resume Score</p>
            <div style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', fontWeight: 900, fontFamily: 'Outfit', background: 'linear-gradient(135deg, var(--primary-light), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {analysis.score}/100
            </div>
            <div className="progress-bar" style={{ maxWidth: 300, margin: '1rem auto 0' }}>
              <div className="progress-fill" style={{ width: `${analysis.score}%` }} />
            </div>
          </div>

          <div className="grid-2">
            {/* Strengths */}
            <div className="card">
              <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
                <CheckCircle size={16} />Strengths
              </h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', listStyle: 'none' }}>
                {analysis.strengths?.map((s, i) => (
                  <li key={i} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', paddingLeft: '0.5rem', borderLeft: '2px solid var(--success)' }}>{s}</li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="card">
              <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
                <AlertCircle size={16} />Areas to Improve
              </h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', listStyle: 'none' }}>
                {analysis.weaknesses?.map((w, i) => (
                  <li key={i} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', paddingLeft: '0.5rem', borderLeft: '2px solid var(--danger)' }}>{w}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Suggestions */}
          <div className="card">
            <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lightbulb size={16} style={{ color: 'var(--accent)' }} />AI Suggestions
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {analysis.suggestions?.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{s}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div className="card">
            <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Tag size={16} style={{ color: 'var(--secondary)' }} />Keywords Detected
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {analysis.keywords?.map((k) => <span key={k} className="badge badge-secondary">{k}</span>)}
            </div>
          </div>
        </div>
      )}
      {/* Quick link to Builder */}
      <div className="card mt-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: 'rgba(99,102,241,0.06)', borderColor: 'rgba(99,102,241,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FileText size={22} style={{ color: 'var(--primary-light)' }} />
          <div>
            <h4 style={{ fontSize: '0.95rem' }}>Want to edit your structured resume?</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fine-tune education, experience, skills, and preview your ATS-ready CV.</p>
          </div>
        </div>
        <Link to="/resume/builder" className="btn btn-secondary btn-sm">
          Open Resume Builder <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
