import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInterview, submitAnswers } from '../../services/api';
import toast from 'react-hot-toast';
import { Send, ChevronLeft, ChevronRight, Star, CheckCircle, Mic } from 'lucide-react';

export default function InterviewSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getInterview(id).then(({ data }) => {
      setInterview(data);
      if (data.status === 'completed') setSubmitted(true);
      setLoading(false);
    }).catch(() => { toast.error('Interview not found'); navigate('/interview'); });
  }, [id, navigate]);

  const handleSubmit = async () => {
    const answerArr = Object.entries(answers).map(([questionIndex, answer]) => ({ questionIndex: parseInt(questionIndex), answer }));
    if (answerArr.length === 0) return toast.error('Please answer at least one question');
    setSubmitting(true);
    try {
      const { data } = await submitAnswers(id, { answers: answerArr });
      setInterview(data);
      setSubmitted(true);
      toast.success('Interview evaluation complete.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-overlay"><div className="spinner" /><p>Loading interview...</p></div>;
  if (!interview) return null;

  const scoreColor = (score) => score >= 7 ? 'var(--success)' : score >= 5 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="animate-fade-in" style={{ maxWidth: 800 }}>
      <div className="page-header">
        <div className="page-header-row">
          <div className="header-icon-box">
            <Mic size={18} strokeWidth={2.4} />
          </div>
          <div style={{ flex: 1 }}>
            <h1>{interview.jobRole} Evaluation</h1>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.35rem' }}>
              <span className="badge badge-primary">{interview.difficulty}</span>
              <span className="badge badge-muted">{interview.questions.length} Inquiries</span>
              {submitted && <span className="badge badge-success">Completed</span>}
            </div>
          </div>
        </div>
      </div>

      {!submitted ? (
        <>
          {/* Progress */}
          <div className="card mb-2">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Question {currentQ + 1} of {interview.questions.length}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{Object.keys(answers).length} answered</p>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${((currentQ + 1) / interview.questions.length) * 100}%` }} />
            </div>
          </div>

          {/* Question */}
          <div className="card mb-2">
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ width: 32, height: 32, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-light)', fontWeight: 700, flexShrink: 0, fontSize: '0.85rem' }}>
                {currentQ + 1}
              </div>
              <p style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.6, paddingTop: '0.2rem' }}>
                {interview.questions[currentQ]?.question}
              </p>
            </div>
            <textarea value={answers[currentQ] || ''} onChange={(e) => setAnswers({ ...answers, [currentQ]: e.target.value })}
              className="form-textarea" rows={6} placeholder="Type your answer here... Take your time and be thorough." />
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} className="btn btn-secondary" disabled={currentQ === 0}>
              <ChevronLeft size={16} />Previous
            </button>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {interview.questions.map((_, i) => (
                <button key={i} onClick={() => setCurrentQ(i)}
                  style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${i === currentQ ? 'var(--primary)' : answers[i] ? 'var(--success)' : 'var(--border)'}`, background: answers[i] ? 'rgba(16,185,129,0.15)' : i === currentQ ? 'rgba(99,102,241,0.15)' : 'transparent', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, color: i === currentQ ? 'var(--primary-light)' : answers[i] ? 'var(--success)' : 'var(--text-muted)', transition: 'all 0.2s' }}>
                  {i + 1}
                </button>
              ))}
            </div>
            {currentQ < interview.questions.length - 1 ? (
              <button onClick={() => setCurrentQ(currentQ + 1)} className="btn btn-primary">
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleSubmit} className="btn btn-success" disabled={submitting}>
                {submitting ? <><span className="spinner-sm" />Submitting...</> : <><Send size={16} />Submit Interview</>}
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Results */}
          <div className="card mb-2" style={{ textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
            <CheckCircle size={48} style={{ color: 'var(--success)', margin: '0 auto 1rem', display: 'block' }} />
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Overall Score</p>
            <div style={{ fontSize: '3.5rem', fontWeight: 900, fontFamily: 'Outfit', color: scoreColor(interview.overallScore / 10) }}>{interview.overallScore}/100</div>
            {interview.overallFeedback && (
              <p style={{ maxWidth: 600, margin: '1rem auto 0', fontSize: '0.875rem', lineHeight: 1.7 }}>{interview.overallFeedback}</p>
            )}
          </div>

          {/* Per-question feedback */}
          <h4 style={{ marginBottom: '1rem' }}>Question-by-Question Feedback</h4>
          {interview.questions.map((q, i) => (
            <div key={i} className="card mb-1">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--primary-light)', fontSize: '0.875rem' }}>Q{i + 1}</span>
                <p style={{ fontWeight: 600, flex: 1, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{q.question}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                  <Star size={14} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontWeight: 700, color: scoreColor(q.score), fontSize: '0.9rem' }}>{q.score}/10</span>
                </div>
              </div>
              {q.answer && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.5rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem', fontStyle: 'italic' }}>{q.answer}</p>}
              {q.feedback && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{q.feedback}</p>}
            </div>
          ))}

          <button onClick={() => navigate('/interview')} className="btn btn-primary mt-2">Start New Interview</button>
        </>
      )}
    </div>
  );
}
