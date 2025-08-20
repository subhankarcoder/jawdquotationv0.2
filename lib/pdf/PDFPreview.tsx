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
            // Wait for content to render
            await new Promise((resolve) => setTimeout(resolve, 300));           
            console.log('Element dimensions:', element.offsetWidth, element.offsetHeight);          
            
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                allowTaint: true,
                backgroundColor: '#ffffff',
                height: element.scrollHeight,
                width: element.scrollWidth
            });           
            
            console.log('Canvas dimensions:', canvas.width, canvas.height);         
            
            // Validate canvas
            if (!canvas || canvas.width === 0 || canvas.height === 0) {
                console.error('html2canvas failed - canvas has zero dimensions');
                return;
            }

            const imgData = canvas.toDataURL('image/jpeg', 1);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            // A4 dimensions in mm
            const pageWidth = 210;
            const pageHeight = 297;
            const margin = 10; // 10mm margin on all sides
            const contentWidth = pageWidth - (margin * 2);
            const contentHeight = pageHeight - (margin * 2);      
            
            // Calculate scaling
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
                pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
            } else {
                // Multi-page handling
                let currentY = 0;
                let pageNumber = 1;              
                
                while (currentY < imgHeight) {
                    if (pageNumber > 1) {
                        pdf.addPage();
                    }                 
                    
                    // Calculate how much of the image fits on this page
                    const remainingHeight = imgHeight - currentY;
                    const pageContentHeight = Math.min(contentHeight, remainingHeight);                  
                    
                    // Create a temporary canvas for this page's content
                    const pageCanvas = document.createElement('canvas');
                    const pageCtx = pageCanvas.getContext('2d');                 
                    
                    if (pageCtx) {
                        // Set canvas size
                        pageCanvas.width = canvas.width;
                        pageCanvas.height = (pageContentHeight / imgHeight) * canvas.height;                    

                        // Fill with white background
                        pageCtx.fillStyle = '#ffffff';
                        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);                      
                        
                        // Draw the portion of the original canvas for this page
                        pageCtx.drawImage(
                            canvas,
                            0, (currentY / imgHeight) * canvas.height, // Source x, y
                            canvas.width, (pageContentHeight / imgHeight) * canvas.height, // Source width, height
                            0, 0, // Destination x, y
                            pageCanvas.width, pageCanvas.height // Destination width, height
                        );                      
                        
                        const pageImgData = pageCanvas.toDataURL('image/jpeg', 1);
                        pdf.addImage(pageImgData, 'JPEG', margin, margin, imgWidth, pageContentHeight);
                    }                  
                    
                    currentY += contentHeight;
                    pageNumber++;
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