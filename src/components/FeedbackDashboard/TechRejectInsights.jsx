import React from 'react';
import './TechRejectInsights.css';

function TechRejectInsights({ data, onBack }) {
  const GGID_FIELD = 'Candidate GGID';
  const [openAccordions, setOpenAccordions] = React.useState(() => new Set());
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState('rejects_desc'); // rejects_desc | rejects_asc | name_asc | name_desc

  const groupedByGGID = React.useMemo(() => {
    if (!Array.isArray(data)) return new Map();
    const map = new Map();
    data.forEach(item => {
      const ggid = item[GGID_FIELD];
      if (!ggid) return; // skip if no id
      if (!map.has(ggid)) {
        map.set(ggid, []);
      }
      map.get(ggid).push(item);
    });
    return map;
  }, [data]);

  const counts = React.useMemo(() => {
    const result = { one: [], two: [], three: [], four: [] };
    groupedByGGID.forEach((records, ggid) => {
      const num = records.length;
      if (num >= 4) {
        result.four.push({ ggid, records });
      } else if (num === 3) {
        result.three.push({ ggid, records });
      } else if (num === 2) {
        result.two.push({ ggid, records });
      } else if (num === 1) {
        result.one.push({ ggid, records });
      }
    });
    return result;
  }, [groupedByGGID]);

  const [activeBucket, setActiveBucket] = React.useState(null); // 'four' | 'three' | 'two' | 'one' | null

  const bucketToLabel = {
    four: '4 Technical Rejects',
    three: '3 Technical Rejects',
    two: '2 Technical Rejects',
    one: '1 Technical Reject',
  };

  const totalCandidates = React.useMemo(() => groupedByGGID.size, [groupedByGGID]);
  const cards = [
    { key: 'all', title: 'All Technical Rejects', value: totalCandidates, bg: '#f3f4f6' },
    { key: 'four', title: '4 Technical Rejects', value: counts.four.length, bg: '#fee2e2' },
    { key: 'three', title: '3 Technical Rejects', value: counts.three.length, bg: '#ffe4e6' },
    { key: 'two', title: '2 Technical Rejects', value: counts.two.length, bg: '#ffedd5' },
    { key: 'one', title: '1 Technical Reject', value: counts.one.length, bg: '#fef3c7' },
  ];

  const allCandidates = React.useMemo(() => {
    const list = [];
    groupedByGGID.forEach((records, ggid) => {
      list.push({ ggid, records });
    });
    // Sort by number of rejects desc
    return list.sort((a, b) => b.records.length - a.records.length);
  }, [groupedByGGID]);

  const visibleList = React.useMemo(() => {
    if (!activeBucket) return null;
    if (activeBucket === 'all') return allCandidates;
    return counts[activeBucket] || [];
  }, [counts, activeBucket, allCandidates]);

  const renderCandidateBlock = ({ ggid, records }) => {
    const name = records[0]['Candidate Name'] || records[0]['Name'] || '-';
    const count = records.length;
    const isOpen = openAccordions.has(ggid);
    const toggle = () => {
      setOpenAccordions(prev => {
        const next = new Set(prev);
        if (next.has(ggid)) next.delete(ggid); else next.add(ggid);
        return next;
      });
    };
    return (
      <div key={ggid} className={`tech-insights__candidate ${isOpen ? 'is-open' : ''}`}>
        <button className="tech-insights__candidate-header" onClick={toggle} aria-expanded={isOpen} aria-controls={`panel-${ggid}`}>
          <div className="tech-insights__candidate-meta">
            <span className="tech-insights__chevron">{isOpen ? '▾' : '▸'}</span>
            <div>
              <div className="tech-insights__candidate-name">{name}</div>
              <div className="tech-insights__candidate-ggid">{GGID_FIELD}: {ggid}</div>
            </div>
          </div>
          <div className="tech-insights__candidate-count">{count} rejects</div>
        </button>
        {isOpen && (
          <div id={`panel-${ggid}`} className="tech-insights__candidate-table">
            <table>
              <thead>
                <tr>
                  <th>Account Name</th>
                  <th>Reason</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, idx) => (
                  <tr key={idx}>
                    <td>{r['Account Name'] || r['Opportunity'] || '-'}</td>
                    <td>{r['Reason'] || r['Tech Reject Reason'] || r['Comment'] || '-'}</td>
                    <td>{r['Date'] || r['Start time'] || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const applySearchAndSort = (list) => {
    const q = searchQuery.trim().toLowerCase();
    let filtered = list;
    if (q) {
      filtered = list.filter(({ records }) => {
        const first = records[0] || {};
        const name = (first['Candidate Name'] || first['Name'] || '').toString().toLowerCase();
        const accountAny = records.some(r => (r['Account Name'] || r['Opportunity'] || '').toString().toLowerCase().includes(q));
        return name.includes(q) || accountAny;
      });
    }
    const sorted = [...filtered].sort((a, b) => {
      const nameA = (a.records[0]['Candidate Name'] || a.records[0]['Name'] || '').toString().toLowerCase();
      const nameB = (b.records[0]['Candidate Name'] || b.records[0]['Name'] || '').toString().toLowerCase();
      switch (sortBy) {
        case 'rejects_asc': return a.records.length - b.records.length;
        case 'name_asc': return nameA.localeCompare(nameB);
        case 'name_desc': return nameB.localeCompare(nameA);
        case 'rejects_desc':
        default: return b.records.length - a.records.length;
      }
    });
    return sorted;
  };

  return (
    <div className="tri">
      <div className="tri__header">
        <button className="tri__back" onClick={onBack}>← Back</button>
        <div className="tri__titles">
          <h2 className="tri__title">Technical Rejects</h2>
          <p className="tri__subtitle">Insights by candidate grouped using Candidate GGID</p>
        </div>
        <div className="tri__tools">
          <input
            className="tri__search"
            type="text"
            placeholder="Search by name or account..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select className="tri__sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="rejects_desc">Most rejects</option>
            <option value="rejects_asc">Least rejects</option>
            <option value="name_asc">Name A–Z</option>
            <option value="name_desc">Name Z–A</option>
          </select>
          <button
            className="tri__toggle-all"
            onClick={() => {
              setOpenAccordions(prev => {
                const next = new Set(prev);
                const allOpen = next.size === allCandidates.length;
                if (allOpen) {
                  return new Set();
                }
                const everyone = new Set();
                applySearchAndSort(activeBucket ? (activeBucket === 'all' ? allCandidates : counts[activeBucket] || []) : allCandidates)
                  .forEach(({ ggid }) => everyone.add(ggid));
                return everyone;
              });
            }}
          >
            {openAccordions.size === (activeBucket ? (activeBucket === 'all' ? allCandidates.length : (counts[activeBucket] || []).length) : allCandidates.length) ? 'Collapse all' : 'Expand all'}
          </button>
        </div>
      </div>

      <div className="tri__stats">
        {cards.map(card => (
          <div
            key={card.key}
            className={`tri__stat ${activeBucket === card.key ? 'is-active' : ''}`}
            onClick={() => setActiveBucket(card.key)}
            style={{ backgroundColor: card.bg }}
          >
            <div className="tri__stat-top">
              <span className="tri__stat-label">{card.title}</span>
            </div>
            <div className="tri__stat-value">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="tri__content">
        <div className="tri__section">
          <div className="tri__section-header">
            <h3 className="tri__section-title">
              {activeBucket && activeBucket !== 'all' ? bucketToLabel[activeBucket] : 'All Technical Reject Candidates'}
            </h3>
            {activeBucket && (
              <button className="tri__clear" onClick={() => setActiveBucket(null)}>Clear</button>
            )}
          </div>

          {activeBucket ? (
            visibleList.length === 0 ? (
              <div className="tri__empty">No candidates in this bucket.</div>
            ) : (
              applySearchAndSort(visibleList).map(renderCandidateBlock)
            )
          ) : (
            allCandidates.length === 0 ? (
              <div className="tri__empty">No technical rejects available.</div>
            ) : (
              applySearchAndSort(allCandidates).map(renderCandidateBlock)
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default TechRejectInsights;


