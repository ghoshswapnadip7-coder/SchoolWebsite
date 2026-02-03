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

const generateResultPDF = (student, results, semester) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            let buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            // --- Header ---
            const schoolName = process.env.SCHOOL_NAME || 'School Name';

            doc.fillColor('#1e40af')
               .fontSize(22)
               .text(schoolName, { align: 'center' });
            
            doc.fontSize(10)
               .fillColor('#64748b')
               .text(`ACADEMIC REPORT CARD | ${semester}`, { align: 'center' })
               .moveDown(1.5);
            
            doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke().moveDown(1.5);

            // --- Student Details ---
            const startX = 50;
            doc.fontSize(12).fillColor('#0f172a').font('Helvetica-Bold').text('STUDENT PROFILE', startX).moveDown(0.5);
            
            doc.fontSize(10).fillColor('#334155').font('Helvetica');
            doc.text(`Name: ${student.name}`, startX, doc.y);
            doc.text(`Student ID: ${student.studentId}`, startX + 250, doc.y - 12); // Right align ish
            doc.text(`Class: ${student.class}`, startX, doc.y + 5);
            doc.text(`Roll Number: ${student.rollNumber || 'N/A'}`, startX + 250, doc.y - 12);
            doc.moveDown(2);

            // --- Marks Table Header ---
            const tableTop = doc.y;
            const col1 = 50;  // Subject
            const col2 = 250; // Marks Obtained
            const col3 = 350; // Total Projects
            const col4 = 450; // Grade

            doc.rect(col1, tableTop, 500, 25).fill('#f1f5f9');
            doc.fillColor('#0f172a').font('Helvetica-Bold');
            doc.text('SUBJECT', col1 + 10, tableTop + 8);
            doc.text('MARKS', col2 + 10, tableTop + 8);
            doc.text('GRADE', col3 + 10, tableTop + 8);
            doc.text('STATUS', col4 + 10, tableTop + 8);

            let y = tableTop + 35;

            let totalMarks = 0;
            let totalMax = results.length * 100;
            let hasFailed = false;

            results.forEach((r, i) => {
                const marks = Number(r.marks) || 0;
                const project = Number(r.projectMarks) || 0;
                const total = marks + project; // Assuming marks is theory? Or total? 
                // Let's assume r.marks is the main thing.
                
                totalMarks += total;
                const isFail = total < 30; // 30 pass mark
                if(isFail) hasFailed = true;

                if (i % 2 === 0) doc.rect(col1, y - 5, 500, 25).fill('#f8fafc'); // Striped rows

                doc.fillColor('#334155').font('Helvetica').fontSize(10);
                doc.text(r.subject, col1 + 10, y);
                doc.text(total.toString(), col2 + 10, y);
                doc.text(r.grade || '-', col3 + 10, y);
                
                doc.font('Helvetica-Bold').fillColor(isFail ? '#ef4444' : '#22c55e');
                doc.text(isFail ? 'FAIL' : 'PASS', col4 + 10, y);

                y += 25;
            });

            // --- Summary ---
            doc.moveDown(2);
            y += 20;

            const percentage = ((totalMarks / totalMax) * 100).toFixed(2);

            doc.rect(50, y, 495, 80).stroke('#e2e8f0');
            doc.font('Helvetica-Bold').fontSize(14).fillColor('#0f172a').text('PERFORMANCE SUMMARY', 70, y + 15);
            
            doc.fontSize(12).font('Helvetica').text(`Total Marks Obtained: ${totalMarks} / ${totalMax}`, 70, y + 40);
            doc.text(`Percentage: ${percentage}%`, 300, y + 40);

            doc.fontSize(14).font('Helvetica-Bold')
               .fillColor(hasFailed ? '#ef4444' : '#22c55e')
               .text(hasFailed ? 'RESULT: FAILED' : 'RESULT: PROMOTED', 70, y + 60);

            // --- Footer ---
            doc.fontSize(8).fillColor('#94a3b8').text('This is a computer-generated report card.', 50, 750, { align: 'center' });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

const generateNoticePDF = (notice) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            let buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            doc.fillColor('#1e40af').fontSize(24).text('OFFICIAL NOTICE', { align: 'center', underline: true }).moveDown();
            
            doc.fontSize(10).fillColor('#64748b').text(`Date: ${new Date(notice.date).toLocaleDateString()}`, { align: 'right' }).moveDown(2);

            doc.fontSize(16).fillColor('#0f172a').font('Helvetica-Bold').text(notice.title, { align: 'center' }).moveDown(1.5);
            
            doc.fontSize(12).fillColor('#334155').font('Helvetica').text(notice.content, { align: 'justify', lineGap: 5 });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = { generateAdmissionReceiptPDF, generateResultPDF, generateNoticePDF };
