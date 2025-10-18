'use client';

import { useState } from 'react';
import Nav from '@/components/Nav';

export default function Home() {
  const [activeSection, setActiveSection] = useState('models');

  const handleNavigate = (section) => {
    setActiveSection(section);
    console.log('Navigated to:', section);
  };

  return (
    <div className="main">
      {/* Body (2 columns) */}
      <div className="body">
        {/* Navigation */}
        <Nav activeItem={activeSection} onNavigate={handleNavigate} />

        {/* Inner body (2 rows) */}
        <div className="inner_body">
          {/* Page title - 45px height */}
          <div className="page_title">
            <h1 className="section-title">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h1>
          </div>

          {/* Content main - fills remaining height */}
          <div className="content_main">
            <div className="content-columns">
              <div className="column">
                <div className="column-title">installed models</div>
              </div>
              <div className="column">
                <div className="column-title">stashed models</div>
              </div>
              <div className="column">
                <div className="column-title">info & metadata</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - 25px height */}
      <div className="footer">Ready</div>

      <style jsx>{`
        .main {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100vw;
        }

        .body {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .inner_body {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
        }

        .page_title {
          height: 45px;
          min-width: 450px;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          display: flex;
          align-items: center;
          padding: 0 20px;
          padding-top: 10px;
        }

        .section-title {
          font-size: 24px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .content_main {
          flex: 1;
          min-width: 450px;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          background-color: #ffffff;
          display: flex;
          flex-direction: column;
          padding: 20px;
          padding-top: 10px;
          overflow: auto;
        }

        .content-columns {
          display: flex;
          gap: 20px;
          flex: 1;
        }

        .column {
          flex: 1;
          border: 2px dashed #ccc;
          border-radius: 8px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: 400px;
        }

        .column-title {
          font-size: 16px;
          color: #0066cc;
          font-weight: 500;
        }

        .footer {
          width: 100%;
          height: 25px;
          background: linear-gradient(180deg, #5a5a5a 0%, #3a3a3a 100%);
          border-top: 1px solid #2a2a2a;
          display: flex;
          align-items: center;
          padding: 0 12px;
          font-size: 11px;
          color: #ccc;
        }
      `}</style>
    </div>
  );
}
