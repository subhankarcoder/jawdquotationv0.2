import { QuotationData } from '@/types';
import Image from 'next/image';

interface QuotationPreviewProps {
    data: QuotationData;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const DetailRow = ({ label, value }: { label: string, value?: string }) => {
    if (!value) return null;
    return <div style={{ fontSize: '12px' }}><span style={{ color: '#666', minWidth: '80px', display: 'inline-block' }}>{label}:</span><span style={{ fontWeight: '500' }}>{value}</span></div>
};

export default function QuotationPreview({ data }: QuotationPreviewProps) {
    return (
        <div style={{ fontFamily: 'Helvetica, sans-serif', padding: '25px', backgroundColor: '#fff', color: '#333', fontSize: '13px', lineHeight: '1.4' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>
                <div>
                    {data.companyDetails.logo && <img src={data.companyDetails.logo} alt="Company Logo" style={{ maxHeight: '100px', marginBottom: '20px' }} />}
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0', color: '#111' }}>{data.quotationName}</h1>
                    <p style={{ color: '#666', fontSize: '14px', margin: '5px 0 0 0' }}>#{data.quotationId}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{data.companyDetails.name}</div>
                    <p style={{ color: '#666' }}>{data.companyDetails.address}</p>
                    <DetailRow label="Date" value={data.quotationDate} />
                    <DetailRow label="Due Date" value={data.dueDate} />
                </div>
            </div>

            {/* Billing Information */}
            <div style={{ display: 'flex', gap: '30px', marginBottom: '40px' }}>
                <div style={{ width: '50%' }}>
                    <div style={{ color: '#8b5cf6', fontWeight: 'bold', marginBottom: '10px' }}>BILLED BY</div>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '16px' }}>{data.companyDetails.name}</div>
                    <div style={{ color: '#666', fontSize: '12px', marginBottom: '10px' }}>{data.companyDetails.address}</div>
                    <DetailRow label="GSTIN" value={data.companyDetails.gstin} />
                    <DetailRow label="PAN" value={data.companyDetails.pan} />
                    <DetailRow label="Email" value={data.companyDetails.email} />
                    <DetailRow label="Phone" value={data.companyDetails.phone} />
                </div>
                <div style={{ width: '50%' }}>
                    <div style={{ color: '#8b5cf6', fontWeight: 'bold', marginBottom: '10px' }}>BILLED TO</div>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '16px' }}>{data.clientDetails.name}</div>
                    <div style={{ color: '#666', fontSize: '12px', marginBottom: '10px' }}>{data.clientDetails.address}</div>
                    <DetailRow label="GSTIN" value={data.clientDetails.gstin} />
                    <DetailRow label="PAN" value={data.clientDetails.pan} />
                    <DetailRow label="Email" value={data.clientDetails.email} />
                    <DetailRow label="Phone" value={data.clientDetails.phone} />
                </div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#8b5cf6', color: 'white' }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>ITEM & DESCRIPTION</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>HSN</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>QTY</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>RATE</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>AMOUNT</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>CGST</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>SGST</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    {data.items.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '12px', verticalAlign: 'top' }}>
                                <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>{item.name}</p>
                                <p style={{ color: '#666', fontSize: '12px', whiteSpace: 'pre-line' }}>{item.description}</p>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center', verticalAlign: 'top' }}>{item.hsn}</td>
                            <td style={{ padding: '12px', textAlign: 'center', verticalAlign: 'top' }}>{item.quantity}</td>
                            <td style={{ padding: '12px', textAlign: 'center', verticalAlign: 'top' }}>{formatCurrency(item.rate)}</td>
                            <td style={{ padding: '12px', textAlign: 'right', verticalAlign: 'top' }}>{formatCurrency(item.quantity * item.rate)}</td>
                            <td style={{ padding: '12px', textAlign: 'center', verticalAlign: 'top' }}>{item.cgstRate} %</td>
                            <td style={{ padding: '12px', textAlign: 'center', verticalAlign: 'top' }}>{item.sgstRate} %</td>
                            <td style={{ padding: '12px', textAlign: 'center', verticalAlign: 'top' }}>{formatCurrency(
                                (item.quantity * item.rate) +
                                ((item.quantity * item.rate) * item.cgstRate / 100) +
                                ((item.quantity * item.rate) * item.sgstRate / 100)
                            )}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Footer Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', gap: '30px' }}>
                {/* Left Side: Bank, Terms, Notes */}
                <div style={{ width: '60%' }}>
                    {data.bankDetails?.bankName && (
                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ color: '#8b5cf6', fontWeight: 'bold', marginBottom: '5px' }}>Bank Details</p>
                            <DetailRow label="Bank" value={data.bankDetails.bankName} />
                            <DetailRow label="Account #" value={data.bankDetails.accountNumber} />
                            <DetailRow label="Holder" value={data.bankDetails.accountHolder} />
                            <DetailRow label="IFSC" value={data.bankDetails.ifsc} />
                        </div>
                    )}
                    {data.terms && (
                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ color: '#8b5cf6', fontWeight: 'bold', marginBottom: '5px' }}>Terms & Conditions</p>
                            <p style={{ color: '#666', fontSize: '12px', whiteSpace: 'pre-line' }}>{data.terms}</p>
                        </div>
                    )}
                    {data.additionalNotes && (
                        <div>
                            <p style={{ color: '#8b5cf6', fontWeight: 'bold', marginBottom: '5px' }}>Additional Notes</p>
                            <p style={{ color: '#666', fontSize: '12px', whiteSpace: 'pre-line' }}>{data.additionalNotes}</p>
                        </div>
                    )}
                </div>

                {/* Right Side: Totals & Signature */}
                <div style={{ width: '40%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span style={{ color: '#666' }}>Sub Total</span><span>{formatCurrency(data.totals.subTotal)}</span></div>
                        {/* <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ color: '#666' }}>Discount ({data.discountPercentage}%)</span><span>-{formatCurrency(data.totals.discountAmount)}</span></div> */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span style={{ color: '#666' }}>CGST</span><span>{formatCurrency(data.totals.totalCgst)}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span style={{ color: '#666' }}>SGST</span><span>{formatCurrency(data.totals.totalSgst)}</span></div>
                        {data.advancePaid > 0 && 
                            (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span style={{ color: '#666' }}>{data.advanceFieldLabel}</span><span>{formatCurrency(data.advancePaid)}</span></div>
                            )
                        }
                        <div style={{ borderTop: '2px solid #333', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold' }}>
                            <span>Total (INR)</span>
                            <span>{formatCurrency(data.totals.grandTotal)}</span>
                        </div>
                    </div>

                    {data.signature && (
                        <div style={{ textAlign: 'right', marginTop: '40px' }}>
                            <img src={data.signature} alt="Signature" style={{ maxHeight: '80px', display: 'inline-block' }} />
                            <p style={{ borderTop: '1px solid #ccc', paddingTop: '5px', marginTop: '5px' }}>Authorised Signatory</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}