import React from 'react';

function Footer() {
  return (
    <footer className="app-footer" style={{ padding: '12px 16px', textAlign: 'center', color: '#6b7280' }}>
      <span>© {new Date().getFullYear()} Bench/RD Dashboard</span>
    </footer>
  );
}

export default Footer;


