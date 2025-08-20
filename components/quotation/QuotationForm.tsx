"use client";

import { useQuotation } from '@/context/QuotationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, ArrowRight } from 'lucide-react';
import { BankDetails, RoundingType } from '@/types';

export default function QuotationForm() {
    const { state, dispatch } = useQuotation();

    // Handlers are unchanged...
    const handleDetailChange = (type: 'SET_COMPANY_DETAILS' | 'SET_CLIENT_DETAILS' | 'SET_BANK_DETAILS', e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        dispatch({ type, field: e.target.name as keyof BankDetails, value: e.target.value });
    };

    const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumeric = ['quantity', 'rate', 'cgstRate', 'sgstRate'].includes(name);
        dispatch({ type: 'UPDATE_ITEM', index, field: name as any, value: isNumeric ? parseFloat(value) || 0 : value });
    };

    // New handler for rounding type
    const handleRoundingChange = (roundingType: RoundingType) => {
        dispatch({ type: 'SET_FIELD', field: 'roundingType', value: roundingType });
    };
    
    return (
        <div className="space-y-6">
            {/* General Details */}
            <Card>
                <CardHeader><CardTitle>Quotation Details</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField id="quotationName" label="Quotation Name" value={state.quotationName} onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'quotationName', value: e.target.value })} />
                    <InputField id="quotationId" label="Quotation ID" value={state.quotationId} onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'quotationId', value: e.target.value })} />
                    <InputField id="quotationDate" label="Date" type="date" value={state.quotationDate} onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'quotationDate', value: e.target.value })} />
                    <InputField id="dueDate" label="Due Date" type="date" value={state.dueDate} onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'dueDate', value: e.target.value })} />
                </CardContent>
            </Card>

            {/* Billed By & To */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Billed By</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <InputField id="companyName" name="name" label="Company Name" value={state.companyDetails.name} onChange={(e) => handleDetailChange('SET_COMPANY_DETAILS', e)} />
                        <InputField id="companyLogo" name="logo" label="Company Logo URL" value={state.companyDetails.logo} onChange={(e) => handleDetailChange('SET_COMPANY_DETAILS', e)} placeholder="https://example.com/logo.png" />
                        <InputField id="companyAddress" name="address" label="Address" value={state.companyDetails.address} onChange={(e) => handleDetailChange('SET_COMPANY_DETAILS', e)} />
                        <InputField id="companyGstin" name="gstin" label="GSTIN" value={state.companyDetails.gstin} onChange={(e) => handleDetailChange('SET_COMPANY_DETAILS', e)} />
                        <InputField id="companyPan" name="pan" label="PAN (Optional)" value={state.companyDetails.pan} onChange={(e) => handleDetailChange('SET_COMPANY_DETAILS', e)} />
                        <InputField id="companyEmail" name="email" label="Email (Optional)" value={state.companyDetails.email} onChange={(e) => handleDetailChange('SET_COMPANY_DETAILS', e)} placeholder="example@example.com"/>
                        <InputField id="companyPhone" name="phone" label="Phone (Optional)" value={state.companyDetails.phone} onChange={(e) => handleDetailChange('SET_COMPANY_DETAILS', e)} placeholder="example@example.com"/>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Billed To</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <InputField id="clientName" name="name" label="Client Name" value={state.clientDetails.name} onChange={(e) => handleDetailChange('SET_CLIENT_DETAILS', e)} />
                        <InputField id="clientAddress" name="address" label="Address" value={state.clientDetails.address} onChange={(e) => handleDetailChange('SET_CLIENT_DETAILS', e)} />
                        <InputField id="clientGstin" name="gstin" label="GSTIN" value={state.clientDetails.gstin} onChange={(e) => handleDetailChange('SET_CLIENT_DETAILS', e)} />
                        <InputField id="clientPan" name="pan" label="PAN (Optional)" value={state.clientDetails.pan} onChange={(e) => handleDetailChange('SET_CLIENT_DETAILS', e)} />
                        <InputField id="clientEmail" name="email" label="Email (Optional)" value={state.clientDetails.email} onChange={(e) => handleDetailChange('SET_CLIENT_DETAILS', e)} />
                        <InputField id="clientPhone" name="phone" label="Phone (Optional)" value={state.clientDetails.phone} onChange={(e) => handleDetailChange('SET_CLIENT_DETAILS', e)} />
                    </CardContent>
                </Card>
            </div>

            {/* Items */}
            <Card>
                <CardHeader><CardTitle>Items</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {state.items.map((item, index) => (
                        <div key={item.id} className="p-4 border rounded-lg space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">Item #{index + 1}</span>
                                <Button variant="destructive" size="icon" onClick={() => dispatch({ type: 'REMOVE_ITEM', index })}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                            <InputField name="name" label="Name" value={item.name} onChange={(e) => handleItemChange(index, e)} />
                            <TextareaField name="description" label="Description" value={item.description} onChange={(e) => handleItemChange(index, e)} />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <InputField name="quantity" label="QTY" type="number" value={item.quantity} onChange={(e) => handleItemChange(index, e)} />
                                <InputField name="rate" label="Rate" type="number" value={item.rate} onChange={(e) => handleItemChange(index, e)} />
                                <InputField name="cgstRate" label="CGST (%)" type="number" value={item.cgstRate} onChange={(e) => handleItemChange(index, e)} />
                                <InputField name="sgstRate" label="SGST (%)" type="number" value={item.sgstRate} onChange={(e) => handleItemChange(index, e)} />
                            </div>
                        </div>
                    ))}
                    <Button onClick={() => dispatch({ type: 'ADD_ITEM' })}>Add Item</Button>
                </CardContent>
            </Card>

            {/* Bank & Terms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Payment Details (Optional)</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <InputField name="bankName" label="Bank Name" value={state.bankDetails?.bankName} onChange={(e) => handleDetailChange('SET_BANK_DETAILS', e)} />
                        <InputField name="accountHolder" label="Account Holder" value={state.bankDetails?.accountHolder} onChange={(e) => handleDetailChange('SET_BANK_DETAILS', e)} />
                        <InputField name="accountNumber" label="Account Number" value={state.bankDetails?.accountNumber} onChange={(e) => handleDetailChange('SET_BANK_DETAILS', e)} />
                        <InputField name="ifsc" label="IFSC Code" value={state.bankDetails?.ifsc} onChange={(e) => handleDetailChange('SET_BANK_DETAILS', e)} />
                    </CardContent>
                </Card>
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Terms & Notes (Optional)</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <TextareaField id="terms" label="Terms & Conditions" value={state.terms} onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'terms', value: e.target.value })} />
                            <TextareaField id="additionalNotes" label="Additional Notes" value={state.additionalNotes} onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'additionalNotes', value: e.target.value })} />
                            <InputField id="signature" label="Signature Image URL" value={state.signature} onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'signature', value: e.target.value })} placeholder="https://example.com/signature.png" />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* NEW SECTION: Calculation Settings */}
            <Card>
                <CardHeader><CardTitle>Calculation Settings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Advance Payment */}
                        <div className="space-y-4">
                            <InputField 
                                id="advanceFieldLabel" 
                                label="Advance Payment Field Label" 
                                value={state.advanceFieldLabel} 
                                onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'advanceFieldLabel', value: e.target.value })} 
                                placeholder="e.g., Advance Paid, Down Payment, etc." 
                            />
                            <InputField 
                                id="advancePaid" 
                                label={state.advanceFieldLabel + " Amount"} 
                                type="number" 
                                value={state.advancePaid} 
                                onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'advancePaid', value: parseFloat(e.target.value) || 0 })} 
                                placeholder="0" 
                            />
                        </div>

                        {/* Rounding Options */}
                        <div className="space-y-4">
                            <Label>Final Amount Rounding</Label>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="roundNone"
                                        name="rounding"
                                        checked={state.roundingType === 'none'}
                                        onChange={() => handleRoundingChange('none')}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                                    />
                                    <Label htmlFor="roundNone" className="text-sm">No Rounding</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="roundUp"
                                        name="rounding"
                                        checked={state.roundingType === 'up'}
                                        onChange={() => handleRoundingChange('up')}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                                    />
                                    <Label htmlFor="roundUp" className="text-sm">Round Up Final Amount</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="roundDown"
                                        name="rounding"
                                        checked={state.roundingType === 'down'}
                                        onChange={() => handleRoundingChange('down')}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                                    />
                                    <Label htmlFor="roundDown" className="text-sm">Round Down Final Amount</Label>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Display current totals for reference */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex justify-between"><span>Sub Total:</span><span>₹{state.totals.subTotal.toLocaleString()}</span></div>
                            <div className="flex justify-between"><span>CGST:</span><span>₹{state.totals.totalCgst.toLocaleString()}</span></div>
                            <div className="flex justify-between"><span>SGST:</span><span>₹{state.totals.totalSgst.toLocaleString()}</span></div>
                            {state.advancePaid > 0 && (
                                <div className="flex justify-between"><span>{state.advanceFieldLabel}:</span><span>-₹{state.advancePaid.toLocaleString()}</span></div>
                            )}
                            <hr className="my-2" />
                            <div className="flex justify-between font-semibold"><span>Grand Total:</span><span>₹{state.totals.grandTotal.toLocaleString()}</span></div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Continue Button */}
            <div className="flex justify-end pt-6">
                <Button size="lg" onClick={() => dispatch({ type: 'SET_STEP', payload: 2 })}>
                    Preview Quotation
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}

// Reusable Shadcn Input Field Components are unchanged...
const InputField = ({ label, id, ...props }: { label: string, id?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="grid w-full items-center gap-1.5">
        <Label htmlFor={id || props.name}>{label}</Label>
        <Input id={id || props.name} {...props} />
    </div>
);
const TextareaField = ({ label, id, ...props }: { label: string, id?: string } & React.InputHTMLAttributes<HTMLTextAreaElement>) => (
    <div className="grid w-full items-center gap-1.5">
        <Label htmlFor={id || props.name}>{label}</Label>
        <Textarea id={id || props.name} {...props} />
    </div>
);