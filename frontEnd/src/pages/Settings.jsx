import { useState, useEffect } from 'react';
import axios from 'axios';

const RULES_URL = 'http://localhost:3000/api/rules';
const BATCH_URL = 'http://localhost:3000/api/events/batch';

function Settings() {
    const [rules, setRules] = useState([]);
    const [jsonInput, setJsonInput] = useState('');

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            const res = await axios.get(RULES_URL);
            setRules(res.data);
        } catch (error) {
            console.error('Error fetching rules:', error);
        }
    };

    const handleRuleUpdate = async (rule, field, value) => {
        try {
            await axios.post(RULES_URL, {
                ...rule,
                [field]: value
            });
            fetchRules();
        } catch (error) {
            alert('Error updating rule');
        }
    };

    const handleBatchUpload = async () => {
        try {
            const events = JSON.parse(jsonInput);
            await axios.post(BATCH_URL, { events });
            alert('Batch uploaded successfully!');
            setJsonInput('');
        } catch (error) {
            alert('Invalid JSON or Upload Error');
        }
    };

    return (
        <div>
            <h2>Settings</h2>

            <div className="card">
                <h3>Scoring Rules</h3>
                <table className="leads-table">
                    <thead>
                        <tr>
                            <th>Event Type</th>
                            <th>Points</th>
                            <th>Active</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rules.map(rule => (
                            <tr key={rule._id}>
                                <td>{rule.eventType}</td>
                                <td>
                                    <input
                                        type="number"
                                        value={rule.points}
                                        onChange={(e) => handleRuleUpdate(rule, 'points', Number(e.target.value))}
                                        className="input-small"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={rule.isActive}
                                        onChange={(e) => handleRuleUpdate(rule, 'isActive', e.target.checked)}
                                    />
                                </td>
                                <td>Saved (Auto)</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
                <h3>Batch Event Upload</h3>
                <p>Paste a JSON array of event objects below.</p>
                <textarea
                    rows="10"
                    style={{ width: '100%', fontFamily: 'monospace' }}
                    placeholder='[{"leadId": "...", "eventData": {"eventType": "page_view", ...}}]'
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                />
                <button className="sim-btn start" style={{ marginTop: '1rem' }} onClick={handleBatchUpload}>
                    Upload Batch
                </button>
            </div>
        </div>
    );
}

export default Settings;
