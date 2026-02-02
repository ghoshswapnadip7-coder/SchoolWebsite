const PDFDocument = require('pdfkit');

/**
 * Generates an admission receipt PDF for a student
 * @param {Object} request - The registration request object
 * @returns {Promise<Buffer>} - The generated PDF buffer
 */
const generateAdmissionReceiptPDF = (request) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            let buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            // --- Header ---
            const schoolName = process.env.SCHOOL_NAME || 'School Name';
            const schoolEstd = process.env.SCHOOL_ESTD || '0000';

            doc.fillColor('#1e40af')
               .fontSize(22)
               .text(schoolName, { align: 'center' });
            
            doc.fontSize(10)
               .fillColor('#64748b')
               .text(`ESTD: ${schoolEstd} | Government Sponsored`, { align: 'center' })
               .moveDown(0.5);
            
            doc.strokeColor('#e2e8f0')
               .lineWidth(1)
               .moveTo(50, doc.y)
               .lineTo(545, doc.y)
               .stroke()
               .moveDown(1.5);

            // --- Title ---
            doc.fillColor('#0f172a')
               .fontSize(18)
               .text('ADMISSION CONFIRMATION RECEIPT', { align: 'center', underline: true })
               .moveDown(2);

            // --- Content ---
            doc.fontSize(12).fillColor('#334155');
            
            const startX = 70;
            const labelX = 70;
            const valueX = 220;

            const drawRow = (label, value) => {
                doc.font('Helvetica-Bold').text(label, labelX, doc.y, { continued: true });
                doc.font('Helvetica').text(`:  ${value || 'N/A'}`, valueX);
                doc.moveDown(0.8);
            };

            drawRow('Application Type', request.applicationType);
            drawRow('Admission Date', new Date().toLocaleDateString('en-IN'));
            drawRow('Application ID', request._id || request.id);
            doc.moveDown(0.5);

            doc.fillColor('#1e40af').fontSize(14).font('Helvetica-Bold').text('STUDENT INFORMATION', labelX).moveDown(1);
            doc.fontSize(12).fillColor('#334155');
            
            drawRow('Full Name', request.name);
            drawRow('Student ID', request.studentId);
            drawRow('Email Address', request.email);
            // Gender and DOB removed as per user request
            drawRow('Class Authorized', request.class);
            drawRow('Roll Number', request.rollNumber || 'TBD (Check Dashboard)');
            
            if (['Class-11', 'Class-12'].includes(request.class)) {
                drawRow('Stream', request.stream);
                drawRow('Elective Subjects', request.subjects ? request.subjects.join(', ') : 'None');
            }

            doc.moveDown(1);

            // --- Security / Credentials ---
            doc.rect(startX - 20, doc.y, 495, 80).fill('#f8fafc').stroke('#e2e8f0');
            doc.fillColor('#475569').fontSize(10).font('Helvetica-Bold').text('LOGIN CREDENTIALS', startX, doc.y + 15);
            
            doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text('Username/ID: ', startX, doc.y + 10, { continued: true });
            doc.font('Helvetica').text(request.studentId);
            
            doc.font('Helvetica-Bold').text('Password: ', startX, doc.y + 5, { continued: true });
            doc.font('Helvetica').text(request.plainPassword || 'The password you chose during registration');
            
            doc.moveDown(3);

            // --- Footer / Next Steps ---
            doc.fillColor('#334155').fontSize(10).font('Helvetica-Bold').text('Next Steps:', 70);
            doc.font('Helvetica').fontSize(9).text('1. Visit http://localhost:5173/login to access your dashboard.', 70);
            doc.text('2. Complete your profile and check for any departmental notices.', 70);
            doc.text('3. You can download your official ID card from the profile section soon.', 70);

            doc.moveDown(3);
            doc.fillColor('#94a3b8').fontSize(8).text('This is a computer-generated document and does not require a physical signature.', { align: 'center' });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = { generateAdmissionReceiptPDF };
