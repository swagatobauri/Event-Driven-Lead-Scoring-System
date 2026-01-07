import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/leads';

function LeadList({ onLeadSelect }) {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchLeads(searchTerm);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const fetchLeads = async (search = '') => {
        try {
            const res = await axios.get(`${API_URL}?search=${search}`);
            setLeads(res.data.leads || res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching leads:', error);
            setLoading(false);
        }
    };

    if (loading) return <div>Loading Leads...</div>;

    return (
        <div>
            <div className="section-header">
                <h2>Active Leads</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="text"
                        placeholder="Search leads..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '4px' }}
                    />
                    <button onClick={() => fetchLeads(searchTerm)} className="refresh-btn">Refresh</button>
                </div>
            </div>

            <div className="card">
                <table className="leads-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Company</th>
                            <th>Status</th>
                            <th>Score</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.map(lead => (
                            <tr key={lead._id} onClick={() => onLeadSelect(lead._id)} style={{ cursor: 'pointer' }}>
                                <td>{lead.name}</td>
                                <td>{lead.email}</td>
                                <td>{lead.company || '-'}</td>
                                <td>{lead.status || 'New'}</td>
                                <td className="score">{lead.score}</td>
                                <td>
                                    <button className="view-btn" onClick={(e) => {
                                        e.stopPropagation();
                                        onLeadSelect(lead._id);
                                    }}>
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default LeadList;
