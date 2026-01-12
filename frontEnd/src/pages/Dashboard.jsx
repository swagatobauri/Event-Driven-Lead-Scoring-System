import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_URL = `${API_BASE_URL}/api/dashboard`;
const SIM_URL = `${API_BASE_URL}/api/simulation`;
const SOCKET_URL = API_BASE_URL || window.location.origin;

function Dashboard() {
    const [stats, setStats] = useState({ totalLeads: 0, totalEvents: 0, topLeads: [] });
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const [simulating, setSimulating] = useState(false);

    const fetchStats = async () => {
        try {
            const response = await axios.get(API_URL);
            setStats(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setLoading(false);
        }
    };

    const fetchSimStatus = async () => {
        try {
            const response = await axios.get(`${SIM_URL}/status`);
            setSimulating(response.data.status === 'running');
        } catch (error) {
            console.warn('Error fetching sim status:', error.message);
        }
    };

    const toggleSimulation = async () => {
        try {
            if (simulating) {
                await axios.post(`${SIM_URL}/stop`);
                setSimulating(false);
            } else {
                await axios.post(`${SIM_URL}/start`);
                setSimulating(true);
            }
        } catch (error) {
            alert('Failed to toggle simulation (Check backend/Redis)');
        }
    };

    useEffect(() => {
        fetchStats();
        fetchSimStatus();

        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            withCredentials: true
        });

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            setConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
            setConnected(false);
        });

        socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
        });

        socket.on('score_update', (data) => {
            console.log('Received score_update:', data);
            fetchStats();
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    if (loading) return <div>Loading Dashboard...</div>;

    const chartData = stats.topLeads.map(lead => ({
        name: lead.name,
        score: lead.score
    }));

    return (
        <div>
            <header>
                <h2>Dashboard</h2>
                <div className="controls">
                    <button
                        className={`sim-btn ${simulating ? 'stop' : 'start'}`}
                        onClick={toggleSimulation}
                    >
                        {simulating ? 'Stop Simulation' : 'Start Simulation'}
                    </button>
                    <div className={`status ${connected ? 'online' : 'offline'}`}>
                        {connected ? '● Live' : '○ Disconnected'}
                    </div>
                </div>
            </header>

            <div className="stats-grid">
                <div className="card">
                    <h3>Total Leads</h3>
                    <p className="stat-number">{stats.totalLeads}</p>
                </div>
                <div className="card">
                    <h3>Total Events</h3>
                    <p className="stat-number">{stats.totalEvents}</p>
                </div>
            </div>

            <div className="content-grid">
                <div className="card">
                    <h3>Top Leads</h3>
                    <table className="leads-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Name</th>
                                <th>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.topLeads.map((lead, index) => (
                                <tr key={lead._id}>
                                    <td>#{index + 1}</td>
                                    <td>{lead.name}</td>
                                    <td className="score-cell">{lead.score}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="card">
                    <h3>Score Trends</h3>
                    <div style={{ height: '300px', marginTop: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none' }}
                                    cursor={{ fill: '#f1f5f9' }}
                                />
                                <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
