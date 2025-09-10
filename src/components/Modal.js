import React from 'react';

const Modal = ({ 
  detailsOpen, 
  setDetailsOpen, 
  detailsTitle, 
  detailsData 
}) => {
  if (!detailsOpen) return null;

  const getAgingTagClass = (aging) => {
    const days = parseInt(aging) || 0;
    if (days >= 90) return 'modal-tag-aging-high';
    if (days >= 30) return 'modal-tag-aging-medium';
    return 'modal-tag-aging-low';
  };

  const getInsightTags = (record) => {
    const tags = [];
    
    // Aging insight
    const aging = parseInt(record['Aging']) || 0;
    if (aging >= 90) {
      tags.push({ text: 'High Aging', class: 'modal-tag-status-aging' });
    }
    
    // Location constraint insight
    if (record['Location'] && record['Location'].toLowerCase().includes('constraint')) {
      tags.push({ text: 'Location Constraint', class: 'modal-tag-status-constraint' });
    }

    // Relocation insight
    if (record['Relocation'] && record['Relocation'] !== '-' && record['Relocation'] !== '') {
      tags.push({ text: 'Relocatable', class: 'modal-tag-relocation' });
    }

    return tags;
  };

  return (
    <div className="modal-overlay" onClick={() => setDetailsOpen(false)}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {detailsTitle}
            <span className="modal-count-badge">
              {detailsData.length} records
            </span>
          </h2>
          <button 
            className="modal-close-btn" 
            onClick={() => setDetailsOpen(false)}
          >
            ×
          </button>
        </div>
        <div className="modal-content">
          {detailsData.length > 0 ? (
            <div className="modal-table-container">
              <table className="modal-table">
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Grade</th>
                    <th>Skill Set</th>
                    <th>Match 1</th>
                    <th>Match 2</th>
                    <th>Aging</th>
                    <th>Location</th>
                    <th>Relocation</th>
                    <th>Insights</th>
                  </tr>
                </thead>
                <tbody>
                  {detailsData.map((record, index) => {
                    const getStatusTagClass = (status) => {
                      if (status?.toLowerCase().includes('available')) return 'modal-tag-status-available';
                      if (status?.toLowerCase().includes('blocked')) return 'modal-tag-status-blocked';
                      if (status?.toLowerCase().includes('constraint')) return 'modal-tag-status-constraint';
                      if (status?.toLowerCase().includes('aging')) return 'modal-tag-status-aging';
                      return 'modal-tag-status-available';
                    };

                    const getGradeTagClass = (grade) => {
                      return 'modal-tag-grade';
                    };

                    const insightTags = getInsightTags(record);

                    return (
                      <tr key={index}>
                        <td>
                          <div className="modal-resource-name">
                            {record['Name'] || record['Employee Name'] || record['Resource Name'] || record['Employee'] || record['Resource'] || `Resource ${index + 1}`}
                          </div>
                        </td>
                        <td>
                          <span className={`modal-tag ${getGradeTagClass(record['Grade'])}`}>
                            {record['Grade'] || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span className="modal-tag modal-tag-skill">
                            {record['Skill Set'] || record['Skills'] || record['Skill'] || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span className="modal-tag modal-tag-match">
                            {record['Match 1']?.toLowerCase().includes('ml case') ? 'ML Case' : (record['Match 1'] || 'N/A')}
                          </span>
                        </td>
                        <td>
                          <span className="modal-tag modal-tag-match">
                            {record['Match 2']?.toLowerCase().includes('ml case') ? 'ML Case' : (record['Match 2'] || 'N/A')}
                          </span>
                        </td>
                        <td>
                          <span className={`modal-tag ${getAgingTagClass(record['Aging'])}`}>
                            {record['Aging'] || 'N/A'} days
                          </span>
                        </td>
                        <td>
                          <span className="modal-tag modal-tag-location">
                            {record['Location'] || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span className="modal-tag modal-tag-location">
                            {record['Relocation'] || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <div className="modal-tag-container">
                            {insightTags.map((tag, tagIndex) => (
                              <span key={tagIndex} className={`modal-tag ${tag.class}`}>
                                {tag.text}
                              </span>
                            ))}
                            {insightTags.length === 0 && (
                              <span className="modal-tag modal-tag-location">
                                Standard
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="modal-empty-state">
              <div className="modal-empty-icon">📋</div>
              <div className="modal-empty-title">No Records Found</div>
              <div className="modal-empty-description">
                No records found for the selected criteria.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
