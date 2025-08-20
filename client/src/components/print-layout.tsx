import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";

interface PrintLayoutProps {
  title: string;
  children: ReactNode;
  reportType?: string;
  candidateName?: string;
}

export function PrintLayout({ title, children, reportType = "Assessment Report", candidateName }: PrintLayoutProps) {
  const { user } = useAuth();
  const currentDate = new Date();
  
  return (
    <div className="print-container">
      {/* Print-only styles */}
      <style jsx>{`
        @media print {
          .print-container {
            font-family: 'Arial', sans-serif;
            color: #000;
            background: #fff;
            padding: 20px;
            margin: 0;
          }
          
          .print-header {
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .print-logo {
            display: flex;
            align-items: center;
            gap: 15px;
          }
          
          .print-logo-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 24px;
          }
          
          .print-company-info h1 {
            font-size: 28px;
            font-weight: bold;
            color: #1e40af;
            margin: 0;
            line-height: 1.2;
          }
          
          .print-company-info p {
            color: #6b7280;
            margin: 5px 0 0 0;
            font-size: 14px;
          }
          
          .print-meta {
            text-align: right;
            font-size: 12px;
            color: #6b7280;
          }
          
          .print-title {
            text-align: center;
            margin-bottom: 30px;
          }
          
          .print-title h2 {
            font-size: 24px;
            color: #1e40af;
            margin: 0 0 10px 0;
          }
          
          .print-title .subtitle {
            font-size: 16px;
            color: #6b7280;
          }
          
          .print-content {
            line-height: 1.6;
          }
          
          .print-footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #6b7280;
          }
          
          .print-attribution {
            display: flex;
            flex-direction: column;
          }
          
          .no-print {
            display: none !important;
          }
          
          /* Override any existing styles for print */
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
        
        @media screen {
          .print-container {
            max-width: 8.5in;
            margin: 0 auto;
            padding: 1in;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
        }
      `}</style>

      {/* Print Header */}
      <div className="print-header">
        <div className="print-logo">
          <div className="print-logo-icon">
            LIQ
          </div>
          <div className="print-company-info">
            <h1>LinxIQ</h1>
            <p>Engineer-Grade Assessment Platform</p>
          </div>
        </div>
        <div className="print-meta">
          <div><strong>Generated:</strong> {currentDate.toLocaleDateString()} at {currentDate.toLocaleTimeString()}</div>
          <div><strong>Printed by:</strong> {user?.username || 'System'}</div>
          <div><strong>Role:</strong> {user?.role?.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) || 'User'}</div>
        </div>
      </div>

      {/* Print Title */}
      <div className="print-title">
        <h2>{title}</h2>
        {candidateName && <div className="subtitle">Candidate: {candidateName}</div>}
        <div className="subtitle">{reportType}</div>
      </div>

      {/* Print Content */}
      <div className="print-content">
        {children}
      </div>

      {/* Print Footer */}
      <div className="print-footer">
        <div className="print-attribution">
          <div><strong>LinxIQ Platform</strong> - Confidential Assessment Report</div>
          <div>This report was generated automatically and contains sensitive candidate evaluation data.</div>
        </div>
        <div>
          Page 1 of 1
        </div>
      </div>
    </div>
  );
}