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
              <div style={{ flex: 1 }}>
                <span className="badge badge-primary" style={{ marginBottom: '0.35rem', fontSize: '0.7rem' }}>
                  Multiple Choice Question
                </span>
                <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                  {interview.questions[currentQ]?.question}
                </p>
              </div>
            </div>

            {/* MCQ Options */}
            {interview.questions[currentQ]?.options && interview.questions[currentQ].options.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                {interview.questions[currentQ].options.map((option, optIdx) => {
                  const isSelected = answers[currentQ] === option;
                  const letter = option.trim().match(/^([A-D])[\s.):-]/i)?.[1]?.toUpperCase() || String.fromCharCode(65 + optIdx);
                  const optionCleanText = option.replace(/^[A-D][\s.):-]+/i, '').trim() || option;

                  return (
                    <div
                      key={optIdx}
                      onClick={() => setAnswers({ ...answers, [currentQ]: option })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem 1.15rem',
                        background: isSelected ? 'rgba(79, 70, 229, 0.12)' : 'var(--bg-input)',
                        border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 0 0 1px var(--primary)' : 'none',
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 'var(--radius-full)',
                          background: isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                          color: isSelected ? '#fff' : 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          flexShrink: 0,
                          border: isSelected ? 'none' : '1px solid var(--border)',
                        }}
                      >
                        {letter}
                      </div>
                      <span
                        style={{
                          fontSize: '0.925rem',
                          color: isSelected ? '#fff' : 'var(--text-primary)',
                          fontWeight: isSelected ? 600 : 400,
                          lineHeight: 1.45,
                        }}
                      >
                        {optionCleanText}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <textarea
                value={answers[currentQ] || ''}
                onChange={(e) => setAnswers({ ...answers, [currentQ]: e.target.value })}
                className="form-textarea"
                rows={5}
                placeholder="Type your response here..."
              />
            )}
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
                {submitting ? <><span className="spinner-sm" />Evaluating...</> : <><Send size={16} />Submit & Grade Interview</>}
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Results */}
          <div className="card mb-2" style={{ textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
            <CheckCircle size={48} style={{ color: interview.overallScore >= 70 ? 'var(--success)' : interview.overallScore >= 50 ? 'var(--warning)' : 'var(--danger)', margin: '0 auto 1rem', display: 'block' }} />
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Overall Verified Score</p>
            <div style={{ fontSize: '3.5rem', fontWeight: 900, fontFamily: 'Outfit', color: scoreColor(interview.overallScore / 10) }}>
              {interview.overallScore}%
            </div>
            <div style={{ display: 'inline-flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className={`badge ${interview.overallScore >= 70 ? 'badge-success' : interview.overallScore >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                {interview.overallScore >= 80 ? 'Interview Ready' : interview.overallScore >= 50 ? 'Developing Competency' : 'Needs In-depth Preparation'}
              </span>
            </div>
            {interview.overallFeedback && (
              <p style={{ maxWidth: 650, margin: '0.5rem auto 0', fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                {interview.overallFeedback}
              </p>
            )}
          </div>

          {/* Per-question feedback */}
          <h4 style={{ marginBottom: '1rem' }}>Question-by-Question Evaluation</h4>
          {interview.questions.map((q, i) => (
            <div key={i} className="card mb-1">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', flex: 1 }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary-light)', fontSize: '0.875rem', paddingTop: '0.1rem' }}>Q{i + 1}</span>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.925rem', margin: 0 }}>{q.question}</p>
                </div>
                <span
                  className={`badge ${q.isCorrect ? 'badge-success' : q.score > 0 ? 'badge-warning' : 'badge-danger'}`}
                  style={{ flexShrink: 0 }}
                >
                  {q.isCorrect ? 'Correct (+10 pts)' : q.score > 0 ? `Partial (+${q.score} pts)` : 'Incorrect (0 pts)'}
                </span>
              </div>

              {/* Candidate Selection */}
              <div style={{ padding: '0.65rem 0.85rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Your Chosen Option: </span>
                <strong style={{ color: q.isCorrect ? 'var(--success)' : q.score > 0 ? 'var(--warning)' : 'var(--danger)' }}>
                  {q.selectedOption || q.answer || 'None selected'}
                </strong>
              </div>

              {/* Correct Option if missed */}
              {!q.isCorrect && q.correctOption && (
                <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>Correct Answer: </span>
                  <span style={{ color: 'var(--text-primary)' }}>{q.correctOption}</span>
                </div>
              )}

              {/* Technical Explanation */}
              {q.feedback && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.4rem 0 0', lineHeight: 1.5 }}>
                  {q.feedback}
                </p>
              )}
            </div>
          ))}

          <button onClick={() => navigate('/interview')} className="btn btn-primary mt-2">
            Start New Interview Session
          </button>
        </>
      )}
    </div>
  );
}
