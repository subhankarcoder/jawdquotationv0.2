/* eslint-disable @next/next/no-img-element */
import { QuotationData } from '@/types';

interface QuotationPreviewProps {
    data: QuotationData;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }).format(amount);
};

// Convert numbers to text for Amount in Words
const amountToWords = (num: number): string => {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const g = ['', 'Thousand', 'Lakh', 'Crore'];

  if (num === 0) return 'Zero';

  let n = Math.floor(num).toString();
  let raw = parseInt(n);
  let words = '';

  const formatTens = (subNum: number): string => {
    if (subNum < 20) return a[subNum];
    return b[Math.floor(subNum / 10)] + (subNum % 10 !== 0 ? ' ' + a[subNum % 10] : '');
  };

  const parseBlock = (val: number): string => {
    let str = '';
    if (val >= 100) {
      str += a[Math.floor(val / 100)] + 'Hundred ';
      val %= 100;
    }
    if (val > 0) {
      str += formatTens(val) + ' ';
    }
    return str;
  };

  let blocks: number[] = [];
  blocks.push(raw % 1000);
  raw = Math.floor(raw / 1000);

  while (raw > 0) {
    blocks.push(raw % 100);
    raw = Math.floor(raw / 100);
  }

  for (let i = blocks.length - 1; i >= 0; i--) {
    let val = blocks[i];
    if (val > 0) {
      words += parseBlock(val) + (g[i] ? g[i] + ' ' : '');
    }
  }

  return `INR ${words.trim()} Only`;
};

// Theme configurations
export interface ThemeConfig {
  name: string;
  description: string;
  fontFamily: string;
  fontImport?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  tableHeaderBg: string;
  tableHeaderTextColor: string;
  tableHeaderBorder: string;
  rowBorderColor: string;
  borderRadius: string;
  headerAlign: 'left' | 'center';
  underlineStyle?: string;
}

export const THEMES: Record<string, ThemeConfig> = {
  modern: {
    name: 'Modern Minimalist',
    description: 'Clean tech look with monospaced accents. Ideal for startups, SaaS, and digital consultants.',
    fontFamily: '"Inter", -apple-system, sans-serif',
    fontImport: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
    primaryColor: '#000000',
    secondaryColor: '#666666',
    accentColor: '#000000',
    tableHeaderBg: 'transparent',
    tableHeaderTextColor: '#000000',
    tableHeaderBorder: '2px solid #000000',
    rowBorderColor: '#e5e5e5',
    borderRadius: '0px',
    headerAlign: 'left',
  },
  emerald: {
    name: 'Creative Emerald',
    description: 'Elegant deep green tone with soft pastel tints. Best for designers, creative agencies, and copywriters.',
    fontFamily: '"Outfit", "Inter", sans-serif',
    fontImport: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;650;700;900&display=swap',
    primaryColor: '#064e3b',
    secondaryColor: '#4b5563',
    accentColor: '#059669',
    tableHeaderBg: '#f0fdf4',
    tableHeaderTextColor: '#064e3b',
    tableHeaderBorder: '1px solid #a7f3d0',
    rowBorderColor: '#e6f4ea',
    borderRadius: '6px',
    headerAlign: 'left',
  },
  royal: {
    name: 'Royal Corporate',
    description: 'Navy blue banner and sharp boundaries. Best for formal enterprises, financial firms, and advisors.',
    fontFamily: '"Roboto", "Inter", sans-serif',
    fontImport: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap',
    primaryColor: '#1e3a8a',
    secondaryColor: '#475569',
    accentColor: '#2563eb',
    tableHeaderBg: '#1e3a8a',
    tableHeaderTextColor: '#ffffff',
    tableHeaderBorder: 'none',
    rowBorderColor: '#e2e8f0',
    borderRadius: '4px',
    headerAlign: 'left',
  },
  warm: {
    name: 'Warm Sunset',
    description: 'Sleek terracotta tones and soft tinted tables. Ideal for event managers, boutique stores, and photography.',
    fontFamily: '"Lora", Georgia, serif',
    fontImport: 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,650;0,700;1,400&display=swap',
    primaryColor: '#854d0e',
    secondaryColor: '#57534e',
    accentColor: '#c2410c',
    tableHeaderBg: '#fffbeb',
    tableHeaderTextColor: '#854d0e',
    tableHeaderBorder: '1px solid #fef3c7',
    rowBorderColor: '#fffbeb',
    borderRadius: '8px',
    headerAlign: 'left',
  },
  steel: {
    name: 'Steel Technical',
    description: 'Rigid gray slate colors and dense layouts. Ideal for construction, logistics, and engineers.',
    fontFamily: 'monospace',
    primaryColor: '#334155',
    secondaryColor: '#64748b',
    accentColor: '#475569',
    tableHeaderBg: '#f1f5f9',
    tableHeaderTextColor: '#1e293b',
    tableHeaderBorder: '1px solid #cbd5e1',
    rowBorderColor: '#cbd5e1',
    borderRadius: '0px',
    headerAlign: 'left',
  },
  classic: {
    name: 'Classic Elegant',
    description: 'Centered layouts and classic serif fonts. Best for accounting, legal counsel, and traditional practices.',
    fontFamily: '"Cormorant Garamond", serif',
    fontImport: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap',
    primaryColor: '#111827',
    secondaryColor: '#4b5563',
    accentColor: '#374151',
    tableHeaderBg: 'transparent',
    tableHeaderTextColor: '#111827',
    tableHeaderBorder: '1px solid #e5e7eb',
    rowBorderColor: '#f3f4f6',
    borderRadius: '0px',
    headerAlign: 'center',
  }
};

export default function QuotationPreview({ data }: QuotationPreviewProps) {
  const themeKey = data.theme || 'modern';
  const theme = THEMES[themeKey] || THEMES.modern;

  // Format dates for display
  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const year = parts[0];
        const month = months[parseInt(parts[1]) - 1];
        const day = parseInt(parts[2]).toString();
        return `${day} ${month} ${year}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const isCenter = theme.headerAlign === 'center';

  return (
    <div style={{ 
      fontFamily: theme.fontFamily, 
      padding: '48px', 
      backgroundColor: '#ffffff', 
      color: '#000000', 
      fontSize: '13px', 
      lineHeight: '1.5',
      letterSpacing: '-0.01em',
      boxSizing: 'border-box',
      width: '100%',
      minWidth: '580px'
    }}>
      {theme.fontImport && (
        <style>{`
          @import url('${theme.fontImport}');
        `}</style>
      )}
      
      {/* 1. Header Grid */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
        <tbody>
          <tr>
            {isCenter ? (
              // Centered layout for Classic theme
              <td style={{ verticalAlign: 'top', width: '100%', textAlign: 'center' }}>
                {data.companyDetails.logo && (
                  <img 
                    src={data.companyDetails.logo} 
                    alt="Logo" 
                    style={{ maxHeight: '55px', maxWidth: '200px', objectFit: 'contain', marginBottom: '16px', marginLeft: 'auto', marginRight: 'auto', display: 'block' }} 
                  />
                )}
                <h2 style={{ 
                  margin: '0 0 6px 0', 
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  letterSpacing: '0.02em',
                  color: theme.primaryColor,
                  textTransform: 'uppercase'
                }}>
                  {data.companyDetails.name || 'ACME DIGITAL PVT. LTD.'}
                </h2>
                <p style={{ margin: '0 0 4px 0', color: theme.secondaryColor, fontSize: '12px' }}>
                  {data.companyDetails.address || '123, Business Park, Andheri East, Mumbai - 400093'}
                </p>
                {data.companyDetails.gstin && (
                  <p style={{ margin: '0 0 16px 0', color: theme.secondaryColor, fontSize: '12px' }}>
                    GSTIN: <span style={{ color: '#000000', fontWeight: 'bold' }}>{data.companyDetails.gstin}</span>
                  </p>
                )}

                <div style={{ borderTop: `1px solid ${theme.rowBorderColor}`, borderBottom: `1px solid ${theme.rowBorderColor}`, padding: '12px 0', margin: '16px 0' }}>
                  <h1 style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: '26px', 
                    fontWeight: 'bold', 
                    color: theme.primaryColor,
                    letterSpacing: '0.05em'
                  }}>
                    QUOTATION
                  </h1>
                  <table style={{ margin: '0 auto', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <tbody>
                      <tr>
                        <td style={{ color: theme.secondaryColor, padding: '1px 8px' }}>Reference: <span style={{ fontWeight: 'bold', color: '#000000' }}>{data.quotationId}</span></td>
                        <td style={{ color: theme.secondaryColor, padding: '1px 8px' }}>Date: <span style={{ color: '#000000', fontWeight: 'semibold' }}>{formatDate(data.quotationDate)}</span></td>
                        <td style={{ color: theme.secondaryColor, padding: '1px 8px' }}>Valid Until: <span style={{ color: '#000000', fontWeight: 'semibold' }}>{formatDate(data.dueDate)}</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            ) : (
              // Default side-by-side layout
              <>
                <td style={{ verticalAlign: 'top', width: '60%' }}>
                  {data.companyDetails.logo && (
                    <img 
                      src={data.companyDetails.logo} 
                      alt="Logo" 
                      style={{ maxHeight: '48px', maxWidth: '180px', objectFit: 'contain', marginBottom: '12px', display: 'block' }} 
                    />
                  )}
                  <h2 style={{ 
                    margin: '0 0 4px 0', 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: theme.primaryColor,
                    letterSpacing: '-0.02em',
                    textTransform: 'uppercase'
                  }}>
                    {data.companyDetails.name || 'ACME DIGITAL PVT. LTD.'}
                  </h2>
                  <p style={{ margin: '0 0 2px 0', color: theme.secondaryColor, fontSize: '11px' }}>
                    {data.companyDetails.address || '123, Business Park, Andheri East, Mumbai - 400093'}
                  </p>
                  {data.companyDetails.gstin && (
                    <p style={{ margin: '0', color: theme.secondaryColor, fontSize: '11px' }}>
                      GSTIN: <span style={{ color: '#000000', fontWeight: 'bold' }}>{data.companyDetails.gstin}</span>
                    </p>
                  )}
                </td>
                
                <td style={{ verticalAlign: 'top', width: '40%', textAlign: 'right' }}>
                  <h1 style={{ 
                    margin: '0 0 16px 0', 
                    fontSize: '24px', 
                    fontWeight: '900', 
                    color: theme.primaryColor,
                    letterSpacing: '-0.03em'
                  }}>
                    QUOTATION
                  </h1>
                  <table style={{ marginLeft: 'auto', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <tbody>
                      <tr>
                        <td style={{ color: theme.secondaryColor, padding: '1px 8px 1px 0', textAlign: 'left' }}>Reference ID</td>
                        <td style={{ fontWeight: 'bold', color: '#000000', textAlign: 'right' }}>: {data.quotationId}</td>
                      </tr>
                      <tr>
                        <td style={{ color: theme.secondaryColor, padding: '1px 8px 1px 0', textAlign: 'left' }}>Date</td>
                        <td style={{ color: '#000000', textAlign: 'right' }}>: {formatDate(data.quotationDate)}</td>
                      </tr>
                      <tr>
                        <td style={{ color: theme.secondaryColor, padding: '1px 8px 1px 0', textAlign: 'left' }}>Valid Until</td>
                        <td style={{ color: '#000000', textAlign: 'right' }}>: {formatDate(data.dueDate)}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </>
            )}
          </tr>
        </tbody>
      </table>

      {/* 2. Billing Grid (Side by side) */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px', borderTop: `1px solid ${theme.rowBorderColor}`, borderBottom: `1px solid ${theme.rowBorderColor}` }}>
        <tbody>
          <tr>
            {/* Billed By */}
            <td style={{ width: '50%', padding: '16px 16px 16px 0', verticalAlign: 'top', borderRight: `1px solid ${theme.rowBorderColor}` }}>
              <div style={{ color: theme.accentColor, fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Billed By</div>
              <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#000000', marginBottom: '4px' }}>
                {data.companyDetails.name || 'Acme Digital Pvt. Ltd.'}
              </div>
              <div style={{ color: '#444444', fontSize: '11px', lineHeight: '1.4', marginBottom: '6px' }}>
                {data.companyDetails.address || '123, Business Park, Andheri East, Mumbai'}
              </div>
              {data.companyDetails.gstin && (
                <div style={{ fontSize: '11px', color: theme.secondaryColor, marginBottom: '2px' }}>
                  GSTIN: <span style={{ color: '#000000', fontWeight: 'bold' }}>{data.companyDetails.gstin}</span>
                </div>
              )}
              {data.companyDetails.pan && (
                <div style={{ fontSize: '11px', color: theme.secondaryColor, marginBottom: '2px' }}>
                  PAN: <span style={{ color: '#000000', fontWeight: 'bold' }}>{data.companyDetails.pan}</span>
                </div>
              )}
              {data.companyDetails.email && (
                <div style={{ fontSize: '11px', color: theme.secondaryColor, marginBottom: '2px' }}>
                  Email: <span style={{ color: '#000000' }}>{data.companyDetails.email}</span>
                </div>
              )}
              {data.companyDetails.phone && (
                <div style={{ fontSize: '11px', color: theme.secondaryColor }}>
                  Phone: <span style={{ color: '#000000' }}>{data.companyDetails.phone}</span>
                </div>
              )}
            </td>

            {/* Billed To */}
            <td style={{ width: '50%', padding: '16px 0 16px 16px', verticalAlign: 'top' }}>
              <div style={{ color: theme.accentColor, fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Billed To</div>
              <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#000000', marginBottom: '4px' }}>
                {data.clientDetails.name || 'Globex Corporation Pvt. Ltd.'}
              </div>
              <div style={{ color: '#444444', fontSize: '11px', lineHeight: '1.4', marginBottom: '6px' }}>
                {data.clientDetails.address || '45, Residency Road, Bengaluru'}
              </div>
              {data.clientDetails.gstin && (
                <div style={{ fontSize: '11px', color: theme.secondaryColor, marginBottom: '2px' }}>
                  GSTIN: <span style={{ color: '#000000', fontWeight: 'bold' }}>{data.clientDetails.gstin}</span>
                </div>
              )}
              {data.clientDetails.pan && (
                <div style={{ fontSize: '11px', color: theme.secondaryColor, marginBottom: '2px' }}>
                  PAN: <span style={{ color: '#000000', fontWeight: 'bold' }}>{data.clientDetails.pan}</span>
                </div>
              )}
              {data.clientDetails.email && (
                <div style={{ fontSize: '11px', color: theme.secondaryColor, marginBottom: '2px' }}>
                  Email: <span style={{ color: '#000000' }}>{data.clientDetails.email}</span>
                </div>
              )}
              {data.clientDetails.phone && (
                <div style={{ fontSize: '11px', color: theme.secondaryColor }}>
                  Phone: <span style={{ color: '#000000' }}>{data.clientDetails.phone}</span>
                </div>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 3. Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
        <thead>
          <tr style={{ 
            backgroundColor: theme.tableHeaderBg,
            borderBottom: theme.tableHeaderBorder, 
            fontSize: '11px', 
            fontWeight: 'bold', 
            color: theme.tableHeaderTextColor 
          }}>
            <th style={{ padding: '8px 4px', textAlign: 'center', width: '5%', borderRadius: theme.borderRadius !== '0px' ? `${theme.borderRadius} 0 0 ${theme.borderRadius}` : '0' }}>#</th>
            <th style={{ padding: '8px 8px', textAlign: 'left', width: '38%' }}>Item / Service</th>
            <th style={{ padding: '8px 6px', textAlign: 'center', width: '10%' }}>HSN/SAC</th>
            <th style={{ padding: '8px 6px', textAlign: 'center', width: '6%' }}>Qty</th>
            <th style={{ padding: '8px 6px', textAlign: 'center', width: '8%' }}>Type</th>
            <th style={{ padding: '8px 8px', textAlign: 'right', width: '12%' }}>Rate (₹)</th>
            <th style={{ padding: '8px 4px', textAlign: 'center', width: '5%' }}>CGST</th>
            <th style={{ padding: '8px 4px', textAlign: 'center', width: '5%' }}>SGST</th>
            <th style={{ padding: '8px 8px', textAlign: 'right', width: '12%', borderRadius: theme.borderRadius !== '0px' ? `0 ${theme.borderRadius} ${theme.borderRadius} 0` : '0' }}>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => {
            const lineTotal = item.quantity * item.rate;
            const taxTotal = (lineTotal * (item.cgstRate + item.sgstRate)) / 100;
            const total = lineTotal + taxTotal;

            return (
              <tr key={item.id} style={{ borderBottom: `1px solid ${theme.rowBorderColor}` }}>
                <td style={{ padding: '10px 4px', textAlign: 'center', color: theme.secondaryColor }}>{index + 1}</td>
                <td style={{ padding: '10px 8px', textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', color: theme.primaryColor, marginBottom: '3px' }}>{item.name || 'Web Design'}</div>
                  {item.description && (
                    <div style={{ color: theme.secondaryColor, fontSize: '11px', lineHeight: '1.3', whiteSpace: 'pre-line' }}>{item.description}</div>
                  )}
                </td>
                <td style={{ padding: '10px 6px', textAlign: 'center', color: '#444444' }}>{item.hsn || '998313'}</td>
                <td style={{ padding: '10px 6px', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</td>
                <td style={{ padding: '10px 6px', textAlign: 'center', color: theme.secondaryColor }}>{'Fixed'}</td>
                <td style={{ padding: '10px 8px', textAlign: 'right', color: '#444444' }}>{formatCurrency(item.rate)}</td>
                <td style={{ padding: '10px 4px', textAlign: 'center', color: theme.secondaryColor }}>{item.cgstRate}%</td>
                <td style={{ padding: '10px 4px', textAlign: 'center', color: theme.secondaryColor }}>{item.sgstRate}%</td>
                <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 'bold', color: '#000000' }}>
                  {formatCurrency(total)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 4. Bottom Grid (Totals, Signatory & Notes) */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
        <tbody>
          <tr>
            
            {/* Left side: Notes & Terms */}
            <td style={{ verticalAlign: 'top', width: '55%', paddingRight: '32px' }}>
              
              {/* Amount in words */}
              <div style={{ marginBottom: '20px' }}>
                <span style={{ color: theme.secondaryColor, fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '4px', letterSpacing: '0.02em' }}>Amount in Words</span>
                <span style={{ fontWeight: 'bold', color: theme.primaryColor, fontSize: '12px' }}>
                  {amountToWords(data.totals.grandTotal)}
                </span>
              </div>

              {/* Bank Details */}
              {data.bankDetails && data.bankDetails.bankName && data.bankDetails.accountNumber && (
                <div style={{ marginBottom: '20px', borderTop: `1px solid ${theme.rowBorderColor}`, paddingTop: '12px' }}>
                  <span style={{ color: theme.accentColor, fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>Bank Account Details</span>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', color: '#444444' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '2.5px 0', width: '35%', color: theme.secondaryColor }}>Bank Name</td>
                        <td style={{ padding: '2.5px 0', fontWeight: 'bold', color: '#000000' }}>: {data.bankDetails.bankName}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2.5px 0', color: theme.secondaryColor }}>Account Holder</td>
                        <td style={{ padding: '2.5px 0', color: '#000000' }}>: {data.bankDetails.accountHolder}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2.5px 0', color: theme.secondaryColor }}>Account Number</td>
                        <td style={{ padding: '2.5px 0', fontWeight: 'bold', color: '#000000', letterSpacing: '0.03em' }}>: {data.bankDetails.accountNumber}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2.5px 0', color: theme.secondaryColor }}>IFSC Code</td>
                        <td style={{ padding: '2.5px 0', fontWeight: 'bold', color: '#000000', letterSpacing: '0.03em' }}>: {data.bankDetails.ifsc}</td>
                      </tr>
                      {data.bankDetails.accountType && (
                        <tr>
                          <td style={{ padding: '2.5px 0', color: theme.secondaryColor }}>Account Type</td>
                          <td style={{ padding: '2.5px 0', color: '#000000' }}>: {data.bankDetails.accountType}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Terms and conditions */}
              {data.terms && (
                <div style={{ borderTop: `1px solid ${theme.rowBorderColor}`, paddingTop: '12px' }}>
                  <span style={{ color: theme.secondaryColor, fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '6px', letterSpacing: '0.02em' }}>Terms & Conditions</span>
                  <div style={{ 
                    fontSize: '11px', 
                    color: '#555555', 
                    lineHeight: '1.4', 
                    whiteSpace: 'pre-line'
                  }}>
                    {data.terms}
                  </div>
                </div>
              )}

            </td>
            
            {/* Right side: Totals summary and Signature */}
            <td style={{ verticalAlign: 'top', width: '45%' }}>
              
              {/* Totals box */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '12px' }}>
                <tbody>
                  <tr style={{ borderBottom: `1px solid ${theme.rowBorderColor}` }}>
                    <td style={{ padding: '6px 0', color: theme.secondaryColor }}>Sub Total</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(data.totals.subTotal)}</td>
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${theme.rowBorderColor}` }}>
                    <td style={{ padding: '6px 0', color: theme.secondaryColor }}>Total Tax (CGST)</td>
                    <td style={{ padding: '6px 0', textAlign: 'right' }}>{formatCurrency(data.totals.totalCgst)}</td>
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${theme.rowBorderColor}` }}>
                    <td style={{ padding: '6px 0', color: theme.secondaryColor }}>Total Tax (SGST)</td>
                    <td style={{ padding: '6px 0', textAlign: 'right' }}>{formatCurrency(data.totals.totalSgst)}</td>
                  </tr>
                  {data.advancePaid > 0 && (
                    <tr style={{ borderBottom: `1px solid ${theme.rowBorderColor}`, color: '#16a34a' }}>
                      <td style={{ padding: '6px 0' }}>{data.advanceFieldLabel || 'Advance Paid'}</td>
                      <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 'bold' }}>-{formatCurrency(data.advancePaid)}</td>
                    </tr>
                  )}
                  <tr style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    <td style={{ padding: '12px 0 0 0', color: theme.primaryColor }}>Grand Total (₹)</td>
                    <td style={{ padding: '12px 0 0 0', textAlign: 'right', color: theme.primaryColor, fontSize: '16px', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                      {formatCurrency(data.totals.grandTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Signatory line */}
              {data.signature && (
                <div style={{ textAlign: isCenter ? 'center' : 'right', marginTop: '36px' }}>
                  <span style={{ fontSize: '11px', color: theme.secondaryColor, display: 'block', marginBottom: '8px' }}>
                    For {data.companyDetails.name || 'Acme Digital Pvt. Ltd.'}
                  </span>
                  
                  <div style={{ height: '55px', display: 'flex', justifyContent: isCenter ? 'center' : 'flex-end', alignItems: 'center', marginBottom: '6px' }}>
                    <img 
                      src={data.signature} 
                      alt="Authorized Signature" 
                      style={{ maxHeight: '48px', objectFit: 'contain', display: 'block' }} 
                    />
                  </div>
                  
                  <span style={{ 
                    display: 'block', 
                    borderTop: `1px solid ${theme.primaryColor}`, 
                    paddingTop: '6px', 
                    fontSize: '11px', 
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    color: theme.primaryColor
                  }}>
                    Authorized Signatory
                  </span>
                </div>
              )}

            </td>

          </tr>
        </tbody>
      </table>

    </div>
  );
}