import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { useRef, ReactNode, useState } from "react";

interface PDFPreviewProps {
    children: ReactNode;
    filename?: string;
    buttonText?: string;
    buttonClassName?: string;
    onDownload?: () => void;
}

export default function PDFPreview({
    children,
    filename = "document.pdf",
    buttonText = "Download PDF",
    buttonClassName = "bg-green-500 text-white px-4 py-2 mt-4 rounded hover:bg-green-600",
    onDownload
}: PDFPreviewProps) {
    const pdfRef = useRef<HTMLDivElement | null>(null);  
    const [isGenerating, setIsGenerating] = useState(false);
    
    const generatePDF = async () => {
        if (isGenerating) return;

        const element = pdfRef.current;
        if (!element) {
            console.error('PDF element not found');
            return;
        }   

        setIsGenerating(true);

        // Keep the element completely hidden but positioned for rendering
        element.style.position = 'fixed';
        element.style.left = '-9999px';
        element.style.top = '0';
        element.style.width = '800px';
        element.style.height = 'auto';
        element.style.backgroundColor = '#ffffff';
        element.style.padding = '10px';
        element.style.boxSizing = 'border-box';
        element.style.zIndex = '-1000';
        element.style.opacity = '1';
        element.style.visibility = 'visible';
        
        try {
            // Wait for custom fonts to load if available
            if (typeof document !== 'undefined' && 'fonts' in document && document.fonts?.ready) {
                try {
                    await document.fonts.ready;
                } catch {
                    // font loading fallback
                }
            }

            // Wait for content to render and images to load
            await new Promise((resolve) => setTimeout(resolve, 400));
            
            // Ensure all images are loaded
            const images = element.querySelectorAll('img');
            await Promise.all(Array.from(images).map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(resolve => {
                    img.onload = resolve;
                    img.onerror = resolve;
                });
            }));
            
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                allowTaint: false,
                backgroundColor: '#ffffff',
                height: element.scrollHeight,
                width: element.scrollWidth,
                scrollX: 0,
                scrollY: 0
            });           
            
            // Validate canvas
            if (!canvas || canvas.width === 0 || canvas.height === 0) {
                console.error('html2canvas failed - canvas has zero dimensions');
                return;
            }

            // Use JPEG at 0.92 quality for sharp text and dramatic size compression (90%+ reduction vs uncompressed PNG)
            const imgData = canvas.toDataURL('image/jpeg', 0.92);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true, // Enable stream compression in jsPDF
            });

            // A4 dimensions in mm
            const pageWidth = 210;
            const pageHeight = 297;
            const margin = 2; // Margin on all sides
            const contentWidth = pageWidth - (margin * 2);
            const contentHeight = pageHeight - (margin * 2);
            
            // Calculate scaling to fit content width
            const imgWidth = contentWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Validate calculated dimensions
            if (isNaN(imgHeight) || imgHeight <= 0) {
                console.error('Invalid image height calculated');
                return;
            }
            
            // If content fits on one page
            if (imgHeight <= contentHeight) {
                pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight, undefined, 'FAST');
            } else {
                // Multi-page handling with compressed JPEG per page
                const totalPages = Math.ceil(imgHeight / contentHeight);
                const scaleY = canvas.height / imgHeight;
                
                for (let page = 0; page < totalPages; page++) {
                    if (page > 0) {
                        pdf.addPage();
                    }
                    
                    const startY = page * contentHeight;
                    const endY = Math.min((page + 1) * contentHeight, imgHeight);
                    const pageContentHeight = endY - startY;
                    
                    const canvasStartY = Math.floor(startY * scaleY);
                    const canvasEndY = Math.floor(endY * scaleY);
                    const canvasPageHeight = canvasEndY - canvasStartY;
                    
                    // Create a temporary canvas for this page's content
                    const pageCanvas = document.createElement('canvas');
                    const pageCtx = pageCanvas.getContext('2d');
                    
                    if (pageCtx) {
                        pageCanvas.width = canvas.width;
                        pageCanvas.height = Math.max(canvasPageHeight, 1);
                        
                        // Fill with clean white background
                        pageCtx.fillStyle = '#ffffff';
                        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
                        
                        try {
                            pageCtx.drawImage(
                                canvas,
                                0, canvasStartY,
                                canvas.width, canvasPageHeight,
                                0, 0,
                                pageCanvas.width, pageCanvas.height
                            );
                            
                            const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.92);
                            pdf.addImage(pageImgData, 'JPEG', margin, margin, imgWidth, pageContentHeight, undefined, 'FAST');
                        } catch (drawError) {
                            console.error('Error drawing page content:', drawError);
                            const safeHeight = Math.min(canvasPageHeight, canvas.height - canvasStartY);
                            if (safeHeight > 0) {
                                pageCtx.drawImage(
                                    canvas,
                                    0, canvasStartY,
                                    canvas.width, safeHeight,
                                    0, 0,
                                    pageCanvas.width, safeHeight
                                );
                                const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.92);
                                pdf.addImage(pageImgData, 'JPEG', margin, margin, imgWidth, (safeHeight / scaleY), undefined, 'FAST');
                            }
                        }
                    }
                }
            }
            
            pdf.save(filename);
            onDownload?.();
            
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            // Keep element completely hidden
            element.style.position = 'fixed';
            element.style.left = '-9999px';
            element.style.top = '0';
            element.style.width = '800px';
            element.style.height = 'auto';
            element.style.zIndex = '-1000';
            element.style.opacity = '0';
            element.style.visibility = 'hidden';
            setIsGenerating(false);
        }
    };
    
    return (
        <>
            {/* Completely hidden div for PDF generation */}
            <div 
                ref={pdfRef}
                style={{
                    position: 'fixed',
                    left: '-9999px',
                    top: '0',
                    width: '800px',
                    height: 'auto',
                    zIndex: -1000,
                    opacity: 0,
                    visibility: 'hidden',
                    backgroundColor: '#ffffff',
                    padding: '10px',
                    boxSizing: 'border-box'
                }}
            >
                {children}
            </div>
            <button 
                onClick={generatePDF} 
                disabled={isGenerating}
                className={`${buttonClassName} ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {isGenerating ? 'Generating...' : buttonText}
            </button>
        </>
    );
}