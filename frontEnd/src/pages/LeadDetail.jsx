import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function LeadDetail({ id, onClose }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        const fetchData = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/api/leads/${id}`);
                setData(res.data);
                setLoading(false);
            } catch (error) {
                console.error('Error:', error);
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (!id) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>&times;</button>

                {loading ? (
                    <div>Loading Details...</div>
                ) : !data ? (
                    <div>Lead not found</div>
                ) : (
                    <>
                        <header className="modal-header">
                            <div>
                                <h2>{data.lead.name}</h2>
                                <p style={{ color: '#6b7280', margin: 0 }}>{data.lead.email}</p>
                            </div>
                            <div className="score-badge">
                                {data.lead.score} pts
                            </div>
                        </header>

                        <div className="stats-grid">
                            <div className="card">
                                <h3>Company</h3>
                                <p>{data.lead.company || 'Unknown'}</p>
                            </div>
                            <div className="card">
                                <h3>Status</h3>
                                <p>{data.lead.status}</p>
                            </div>
                        </div>

                        <div className="content-grid">
                            <div className="card">
                                <h3>Score History</h3>
                                <div style={{ height: '300px', marginTop: '1rem' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={[...data.history].reverse().map(h => ({
                                            time: new Date(h.timestamp).toLocaleTimeString(),
                                            score: h.newScore
                                        }))}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="card">
                                <h3>Event Timeline</h3>
                                <ul className="timeline">
                                    {data.events.map(event => (
                                        <li key={event._id} className="timeline-item">
                                            <span className="timestamp">{new Date(event.timestamp).toLocaleString()}</span>
                                            <strong>{event.eventType}</strong>
                                            <div className="metadata">{JSON.stringify(event.metadata)}</div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default LeadDetail;
