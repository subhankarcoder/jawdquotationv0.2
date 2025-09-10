import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { useRef, ReactNode } from "react";

interface PDFPreviewProps {
    children: ReactNode;
    filename?: string;
    buttonText?: string;
    buttonClassName?: string;
}

export default function PDFPreview({
    children,
    filename = "document.pdf",
    buttonText = "Download PDF",
    buttonClassName = "bg-green-500 text-white px-4 py-2 mt-4 rounded hover:bg-green-600"
}: PDFPreviewProps) {
    const pdfRef = useRef<HTMLDivElement | null>(null);  
    
    const generatePDF = async () => {
        const element = pdfRef.current;
        if (!element) {
            console.error('PDF element not found');
            return;
        }   

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
            // Wait for content to render and images to load
            await new Promise((resolve) => setTimeout(resolve, 500));
            
            // Ensure all images are loaded
            const images = element.querySelectorAll('img');
            await Promise.all(Array.from(images).map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(resolve => {
                    img.onload = resolve;
                    img.onerror = resolve;
                });
            }));
            
            console.log('Element dimensions:', element.offsetWidth, element.offsetHeight);
            
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                allowTaint: true,
                backgroundColor: '#ffffff',
                height: element.scrollHeight,
                width: element.scrollWidth,
                scrollX: 0,
                scrollY: 0
            });           
            
            console.log('Canvas dimensions:', canvas.width, canvas.height);         
            
            // Validate canvas
            if (!canvas || canvas.width === 0 || canvas.height === 0) {
                console.error('html2canvas failed - canvas has zero dimensions');
                return;
            }

            const imgData = canvas.toDataURL('image/png', 1.0); // Use PNG for better quality
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            // A4 dimensions in mm
            const pageWidth = 210;
            const pageHeight = 297;
            const margin = 2; // 10mm margin on all sides
            const contentWidth = pageWidth - (margin * 2);
            const contentHeight = pageHeight - (margin * 2);
            
            // Calculate scaling to fit content width
            const imgWidth = contentWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            console.log('PDF dimensions - Width:', imgWidth, 'Height:', imgHeight);
            console.log('Content area:', contentWidth, 'x', contentHeight);
            
            // Validate calculated dimensions
            if (isNaN(imgHeight) || imgHeight <= 0) {
                console.error('Invalid image height calculated');
                return;
            }
            
            // If content fits on one page
            if (imgHeight <= contentHeight) {
                pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
            } else {
                // Improved multi-page handling
                const totalPages = Math.ceil(imgHeight / contentHeight);
                const currentPage = 1;
                
                // Calculate the scale factor between canvas pixels and PDF mm
                const scaleY = canvas.height / imgHeight;
                
                for (let page = 0; page < totalPages; page++) {
                    if (page > 0) {
                        pdf.addPage();
                    }
                    
                    // Calculate the Y position in the original canvas for this page
                    const startY = page * contentHeight;
                    const endY = Math.min((page + 1) * contentHeight, imgHeight);
                    const pageContentHeight = endY - startY;
                    
                    // Convert to canvas coordinates
                    const canvasStartY = Math.floor(startY * scaleY);
                    const canvasEndY = Math.floor(endY * scaleY);
                    const canvasPageHeight = canvasEndY - canvasStartY;
                    
                    console.log(`Page ${page + 1}: Y ${startY}mm to ${endY}mm (canvas: ${canvasStartY}px to ${canvasEndY}px)`);
                    
                    // Create a temporary canvas for this page's content
                    const pageCanvas = document.createElement('canvas');
                    const pageCtx = pageCanvas.getContext('2d');
                    
                    if (pageCtx) {
                        // Set canvas size
                        pageCanvas.width = canvas.width;
                        pageCanvas.height = Math.max(canvasPageHeight, 1); // Ensure minimum height
                        
                        // Fill with white background
                        pageCtx.fillStyle = '#ffffff';
                        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
                        
                        // Draw the portion of the original canvas for this page
                        try {
                            pageCtx.drawImage(
                                canvas,
                                0, canvasStartY, // Source x, y
                                canvas.width, canvasPageHeight, // Source width, height
                                0, 0, // Destination x, y
                                pageCanvas.width, pageCanvas.height // Destination width, height
                            );
                            
                            const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
                            pdf.addImage(pageImgData, 'PNG', margin, margin, imgWidth, pageContentHeight);
                        } catch (drawError) {
                            console.error('Error drawing page content:', drawError);
                            // Fallback: just draw what we can
                            const safeHeight = Math.min(canvasPageHeight, canvas.height - canvasStartY);
                            if (safeHeight > 0) {
                                pageCtx.drawImage(
                                    canvas,
                                    0, canvasStartY,
                                    canvas.width, safeHeight,
                                    0, 0,
                                    pageCanvas.width, safeHeight
                                );
                                const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
                                pdf.addImage(pageImgData, 'PNG', margin, margin, imgWidth, (safeHeight / scaleY));
                            }
                        }
                    }
                }
            }
            
            pdf.save(filename);
            
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
        }
    }
    
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
            <button onClick={generatePDF} className={buttonClassName}>
                {buttonText}
            </button>
        </>
    )
}