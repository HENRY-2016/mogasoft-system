import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateReceiptPDF = async (receipt, customer, showToast) => {
    console.log("receipt"+JSON.stringify(receipt))
    console.log("customer"+JSON.stringify(customer))

    try {
        showToast('Generate PDF', 'Starting to generate receipt PDF file!', 'warning');

        // Create a temporary container for PDF generation
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.width = '210mm';
        tempContainer.style.backgroundColor = 'white';
        tempContainer.style.padding = '20mm';
        document.body.appendChild(tempContainer);

        // Get the receipt template element
        // const receiptElement = document.getElementById(`receipt-${receipt.id}`);
        const receiptElement = document.getElementById(`receipt-print`);
        // const receiptElement = document.getElementById(`receipt-template-container`);

        let elementToCapture;

        if (receiptElement) {
            elementToCapture = receiptElement.cloneNode(true);
            tempContainer.appendChild(elementToCapture);
        } else {
            const receiptTemplate = document.createElement('div');
            receiptTemplate.innerHTML = `
                <div style="font-family: Arial, sans-serif; color: #333; width: 100%; min-height: 297mm;">
                    ${document.getElementById('receipt-template-container')?.innerHTML || ''}
                </div>
            `;
            elementToCapture = receiptTemplate;
            tempContainer.appendChild(elementToCapture);
        }

        // Wait for images to load
        const images = elementToCapture.getElementsByTagName('img');
        const imagePromises = [];
        
        for (let img of images) {
            if (!img.complete) {
                const promise = new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve;
                });
                imagePromises.push(promise);
            }
        }

        await Promise.all(imagePromises);

        const canvas = await html2canvas(elementToCapture, {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
            logging: false,
            width: elementToCapture.scrollWidth,
            height: elementToCapture.scrollHeight,
            scrollX: 0,
            scrollY: 0,
            windowWidth: elementToCapture.scrollWidth,
            windowHeight: elementToCapture.scrollHeight,
        });

        document.body.removeChild(tempContainer);

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 0;

        pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        
        const receiptNumber = receipt.receipt_number || `receipt-${receipt.id}`;
        const customerName = customer?.name ? customer.name.replace(/\s+/g, '_') : 'customer';
        const filename = `receipt_${receiptNumber}_${customerName}.pdf`;
        
        pdf.save(filename);
        showToast('PDF Generated', 'Receipt PDF downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating receipt PDF:', error);
        showToast('Error', 'Error generating receipt PDF. Please try again.', 'error');
    }
};