import React from 'react';

function DetailsModal({
  open,
  title,
  data,
  onClose,
  getAgingTagClass
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">
            {title}
            <span className="modal-count-badge">
              {data.length} records
            </span>
          </h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="modal-content">
          {data.length > 0 ? (
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
                  {data.map((record, index) => {
                    const getGradeTagClass = () => 'modal-tag-grade';

                    const getInsightTags = (record) => {
                      const tags = [];
                      const aging = parseInt(record['Aging']) || 0;
                      const status = record['Deployment Status'] || '';
                      const type = record['Bench/RD'] || '';
                      const relocation = record['Relocation'] || '';

                      if (aging >= 90) {
                        tags.push({ text: 'High Aging', class: 'modal-tag-aging-high' });
                      } else if (aging > 30) {
                        tags.push({ text: 'Medium Aging', class: 'modal-tag-aging-medium' });
                      }

                      if (type.toLowerCase().includes('ml return')) {
                        tags.push({ text: 'ML Return', class: 'modal-tag-ml-return' });
                      }

                      if (status.toLowerCase().includes('constraint')) {
                        tags.push({ text: 'Location Constraint', class: 'modal-tag-status-constraint' });
                      }

                      if (relocation && relocation !== '-' && relocation !== '') {
                        tags.push({ text: 'Relocatable', class: 'modal-tag-relocation' });
                      }

                      return tags;
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
}

export default DetailsModal;


