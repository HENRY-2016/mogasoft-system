// utilities/invoiceFunctions.js
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const formatInvoiceDate = (dateString) => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    // Handle different date formats
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
};
/**
 * Generate PDF for an invoice
 * @param {Object} invoice - The invoice object
 * @param {Object} customer - The customer object
 * @param {Function} showToast - Toast notification function
 * @returns {Promise} Promise that resolves when PDF is generated
 */
export const generatePDF = async (invoice, customer, showToast) => {
    console.log("invoice"+JSON.stringify(invoice));
    console.log("customer"+JSON.stringify(customer))
    try {
        showToast('Generate PDF', 'Starting To Generated PDF File!', 'warning');
        // Create a temporary container for PDF generation
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.width = '210mm';
        tempContainer.style.backgroundColor = 'white';
        tempContainer.style.padding = '20mm';
        document.body.appendChild(tempContainer);

        // Get the invoice template element
        const invoiceElement = document.getElementById(`invoice-${invoice.id}`);
        let elementToCapture;

        if (invoiceElement) {
            // Clone the existing invoice element
            elementToCapture = invoiceElement.cloneNode(true);
            tempContainer.appendChild(elementToCapture);
        } else {
            // Create a new invoice template for PDF
            const invoiceTemplate = document.createElement('div');
            invoiceTemplate.innerHTML = `
                <div style="font-family: Arial, sans-serif; color: #333; width: 100%; min-height: 297mm;">
                    ${document.getElementById('invoice-template-container')?.innerHTML || ''}
                </div>
            `;
            elementToCapture = invoiceTemplate;
            tempContainer.appendChild(elementToCapture);
        }

        // Wait for images to load
        const images = elementToCapture.getElementsByTagName('img');
        const imagePromises = [];
        
        for (let img of images) {
            if (!img.complete) {
                const promise = new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve; // Continue even if image fails to load
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
            onclone: (clonedDoc, element) => {
                // Ensure proper styling in the clone
                element.style.width = '100%';
                element.style.height = 'auto';
                element.style.boxSizing = 'border-box';
                // Force all text to be visible and properly styled
                const allElements = element.getElementsByTagName('*');
                for (let el of allElements) {
                    el.style.color = '#000000';
                    el.style.backgroundColor = 'transparent';
                    el.style.boxShadow = 'none';
                    el.style.borderColor = '#000000';
                }
            }
        });

        // Clean up temporary container
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
        // Generate filename
        const invoiceNumber = invoice.invoice_number || `invoice-${invoice.id}`;
        const customerName = customer?.name ? customer.name.replace(/\s+/g, '_') : 'customer';
        const filename = `invoice_${invoiceNumber}_${customerName}.pdf`;
        pdf.save(filename);
        showToast('PDF Generated', 'PDF downloaded successfully!', 'success');
    } catch (error) {
        showToast('Error', 'Error generating PDF. Please try again.'+error, 'error');
    } finally {
        showToast('Response', 'PDF downloaded successfully!', 'warning');
    }
};


/**
 * Format date to readable string
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
if (!dateString) return 'N/A';
const options = { year: 'numeric', month: 'short', day: 'numeric' };
return new Date(dateString).toLocaleDateString(undefined, options);
};

/**
 * Calculate due date from invoice date
 * @param {string} invoiceDate - Invoice date string
 * @param {number} days - Number of days until due
 * @returns {string} Due date string
 */
export const calculateDueDate = (invoiceDate, days = 30) => {
const date = new Date(invoiceDate);
date.setDate(date.getDate() + days);
return date.toISOString().split('T')[0];
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
export const validateEmail = (email) => {
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
return emailRegex.test(email);
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone is valid
 */
export const validatePhone = (phone) => {
const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// Company info (you might want to move this to a config file)
export const companyInfo = {
name: 'Your Company Name',
address: '123 Business St, City, State 12345',
phone: '+1 (555) 123-4567',
email: 'info@company.com',
website: 'www.company.com',
receiptFooter: 'Thank you for your business!'
};

export default {
generatePDF,
formatDate,
calculateDueDate,
validateEmail,
validatePhone,
companyInfo
};