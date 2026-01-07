import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import LeadList from './pages/LeadList';
import LeadDetail from './pages/LeadDetail';
import Settings from './pages/Settings';
import './App.css';

function App() {
  const [selectedLeadId, setSelectedLeadId] = useState(null);

  return (
    <div className="app-layout">
      <header className="navbar">
        <div className="navbar-brand">Event-Driven Lead Scorer</div>
      </header>

      <main className="app-content">
        <section className="section-block">
          <Dashboard />
        </section>

        <section className="section-block">
          <LeadList onLeadSelect={setSelectedLeadId} />
        </section>

        <section className="section-block">
          <Settings />
        </section>
      </main>

      {selectedLeadId && (
        <LeadDetail
          id={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
        />
      )}
    </div>
  );
}

export default App;
