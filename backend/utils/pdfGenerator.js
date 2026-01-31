const PDFDocument = require('pdfkit');

const generateResultPDF = (student, results, semester) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        let buffers = [];
        
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            let pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });

        // --- Helper Functions ---
        const drawHLine = (y) => {
            doc.moveTo(40, y).lineTo(555, y).strokeColor('#000').lineWidth(1).stroke();
        };

        // --- Header ---
        doc.font('Helvetica-Bold').fontSize(16)
           .text('RANAGHAT PAL CHOWDHURY HIGH (H.S.) SCHOOL', { align: 'center' });
        
        doc.moveDown(0.3);
        doc.font('Helvetica').fontSize(9)
           .text(`Estd: 1853 | Annual Report Card | ${new Date().getFullYear()}-${new Date().getFullYear()+1}`, { align: 'center' });
        
        doc.moveDown(0.5);
        drawHLine(doc.y);
        doc.moveDown(1);

        // --- Student Details Box ---
        const startY = doc.y;
        doc.roundedRect(40, startY, 515, 60, 8).strokeColor('#ddd').stroke();
        
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#1e40af');
        
        // Row 1
        doc.text('Name:', 55, startY + 15);
        doc.font('Helvetica').fillColor('#333').text(student.name, 95, startY + 15);
        
        doc.font('Helvetica-Bold').fillColor('#1e40af').text('ID:', 350, startY + 15);
        doc.font('Helvetica').fillColor('#333').text(student.studentId || 'N/A', 400, startY + 15);

        // Row 2
        doc.font('Helvetica-Bold').fillColor('#1e40af').text('Class:', 55, startY + 35);
        doc.font('Helvetica').fillColor('#333').text(student.class, 95, startY + 35);

        doc.font('Helvetica-Bold').fillColor('#1e40af').text('Roll No:', 350, startY + 35);
        doc.font('Helvetica').fillColor('#333').text(student.rollNumber || 'N/A', 400, startY + 35);

        doc.moveDown(3);

        // --- Result Table ---
        const tableTop = doc.y + 10;
        const colSubject = 60;
        const colMarks = 300;
        const colGrade = 380;
        const colExam = 460;
        
        // Table Header
        doc.fillColor('#f1f5f9').rect(40, tableTop, 515, 25).fill(); // Header bg
        doc.fillColor('#334155').font('Helvetica-Bold').fontSize(9);
        
        doc.text('SUBJECT', colSubject, tableTop + 8);
        doc.text('MARKS', colMarks, tableTop + 8);
        doc.text('GRADE', colGrade, tableTop + 8);
        doc.text('EXAM', colExam, tableTop + 8);
        
        let position = tableTop + 25;
        doc.font('Helvetica').fontSize(10).fillColor('#333');

        // Logic for Total Calculation (Best of 5 if > 5 subjects, else Sum)
        // Note: For display, we list all. For Total, we apply simple Best of 5 logic if applicable
        // Sorting results to identify best scores (assuming typical rule implies excluding lowest optional)
        // For simplicity: We will sum everything if <= 5. If > 5, sum top 5.
        // Or strictly follow standard: Total / 500 implies 5 subjects counted.
        
        const numericResults = results.map(r => ({ ...r, numMarks: Number(r.marks) }));
        let totalMarks = 0;
        let totalSubjectsCount = 0;
        let sortedMarks = [...numericResults].sort((a, b) => b.numMarks - a.numMarks);
        
        if (results.length > 5) {
             // Best of 5 rule
             totalMarks = sortedMarks.slice(0, 5).reduce((sum, r) => sum + r.numMarks, 0);
             totalSubjectsCount = 5;
        } else {
             totalMarks = numericResults.reduce((sum, r) => sum + r.numMarks, 0);
             totalSubjectsCount = results.length;
        }
        
        const fullMarks = totalSubjectsCount * 100;
        const percentage = fullMarks > 0 ? ((totalMarks / fullMarks) * 100).toFixed(2) : '0.00';
        
        let overallGrade = 'F';
        if (percentage >= 90) overallGrade = 'AA';
        else if (percentage >= 80) overallGrade = 'A+';
        else if (percentage >= 60) overallGrade = 'A';
        else if (percentage >= 50) overallGrade = 'B+';
        else if (percentage >= 40) overallGrade = 'B';
        else if (percentage >= 30) overallGrade = 'C';
        else overallGrade = 'D';

        // Draw Rows
        results.forEach((result, i) => {
            // Zebra striping
            if (i % 2 !== 0) {
                 doc.fillColor('#f8fafc').rect(40, position - 5, 515, 25).fill();
            } else {
                 // doc.strokeColor('#eee').moveTo(40, position + 20).lineTo(555, position + 20).stroke(); // Row line
            }

            doc.fillColor('#333').text(result.subject, colSubject, position);
            doc.text(result.marks, colMarks, position);
            doc.text(result.grade, colGrade, position);
            doc.text(semester, colExam, position); // Using semester/exam name passed

            // Horizontal line for row
            doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(40, position + 15).lineTo(555, position + 15).stroke();
            
            position += 30;
        });

        doc.moveDown(2);

        // --- Summary Box ---
        const summaryY = position + 20;
        doc.rect(40, summaryY, 515, 70).fillColor('#0f172a').fill();
        doc.fillColor('#fff');

        // Labels
        doc.fontSize(8).font('Helvetica').opacity(0.8);
        doc.text('TOTAL MARKS', 100, summaryY + 15, { align: 'center', width: 100 });
        doc.text('PERCENTAGE', 250, summaryY + 15, { align: 'center', width: 100 });
        doc.text('OVERALL GRADE', 400, summaryY + 15, { align: 'center', width: 100 });

        // Values
        doc.fontSize(16).font('Helvetica-Bold').opacity(1);
        doc.text(`${totalMarks} / ${fullMarks}`, 100, summaryY + 35, { align: 'center', width: 100 });
        doc.text(`${percentage}%`, 250, summaryY + 35, { align: 'center', width: 100 });
        doc.text(overallGrade, 400, summaryY + 35, { align: 'center', width: 100 });

        // --- Signatures ---
        const sigY = summaryY + 120;
        
        doc.strokeColor('#333').lineWidth(1);
        doc.moveTo(60, sigY).lineTo(200, sigY).stroke();
        doc.moveTo(395, sigY).lineTo(535, sigY).stroke();

        doc.fillColor('#333').fontSize(10).font('Helvetica-Bold');
        doc.text('Class Teacher', 60, sigY + 10, { width: 140, align: 'center' });
        doc.text('Principal', 395, sigY + 10, { width: 140, align: 'center' });

        // Footer disclaimer (Removed)
        // doc.fontSize(8).font('Helvetica').fillColor('#94a3b8');
        // doc.text('This is a computer-generated document and does not require a signature.', 40, 750, { align: 'center', width: 515 });

        doc.end();
    });
};

module.exports = { generateResultPDF };
