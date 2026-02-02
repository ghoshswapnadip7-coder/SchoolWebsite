const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_APP_PASSWORD 
    }
});

const sendApprovalEmail = async (to, name, studentId, stream, subjects, pdfBuffer) => {
    try {
        const subjectList = subjects && subjects.length > 0 ? subjects.join(', ') : 'Standard Curriculum';
        
        const mailOptions = {
            from: `"School Admin" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: 'Admission Approved - Welcome',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #1e40af;">Welcome to ${process.env.SCHOOL_NAME || 'Our School'}!</h2>
                    <p>Dear <strong>${name}</strong>,</p>
                    <p>We are pleased to inform you that your admission application has been <strong>APPROVED</strong>.</p>
                    
                    <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border: 1px solid #bae6fd; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #0369a1;">Your Student Credentials</h3>
                        <p><strong>Student ID:</strong> <span style="font-size: 1.2em; font-weight: bold; color: #1e40af;">${studentId}</span></p>
                        <p><strong>Password:</strong> The password you set during registration.</p>
                        <hr style="border: 0; border-top: 1px solid #bae6fd; margin: 15px 0;">
                        <p><strong>Stream:</strong> ${stream || 'General'}</p>
                        <p><strong>Approved Elective Subjects:</strong> ${subjectList}</p>
                    </div>

                    <p>Please find your <strong>Official Admission Receipt</strong> attached to this email.</p>

                    <p>You can now login to your student dashboard to view routines, results, and pay fees.</p>
                    
                    <a href="http://localhost:5173/login" style="display: inline-block; background-color: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Dashboard</a>
                    
                    <p style="margin-top: 30px; font-size: 0.8em; color: #666;">
                        If you have any questions, please reply to this email or visit the school office.
                    </p>
                </div>
            `,
            attachments: pdfBuffer ? [
                {
                    filename: `Admission_Receipt_${studentId}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ] : []
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL SENT] To: ${to} | ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('[EMAIL ERROR] Failed to send approval email:', error);
        return false;
    }
};


const sendResultPDFEmail = async (to, name, semester, pdfBuffer) => {
    try {
        const mailOptions = {
            from: `"School Admin" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: `Official Result Published: ${semester}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #1e40af;">Result Declaration</h2>
                    <p>Dear <strong>${name}</strong>,</p>
                    <p>Your result for <strong>${semester}</strong> has been officially published.</p>
                    <p>Please find the attached PDF containing your detailed marksheet.</p>
                    
                    <p>You can also view this online on your dashboard.</p>
                    
                    <a href="http://localhost:5173/profile" style="display: inline-block; background-color: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Dashboard</a>
                </div>
            `,
            attachments: [
                {
                    filename: `Result_${semester}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[PDF EMAIL SENT] To: ${to} | ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('[EMAIL ERROR] Failed to send result PDF:', error);
        return false;
    }
};

const sendRejectionEmail = async (to, name, reason) => {
    try {
        const mailOptions = {
            from: `"School Admin" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: 'Update Regarding Your Admission/Promotion Application',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #ef4444;">Application Update</h2>
                    <p>Dear <strong>${name}</strong>,</p>
                    <p>We are writing to inform you that after careful review, we are unable to approve your recent admission/promotion application at this time.</p>
                    
                    <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; border: 1px solid #fecaca; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #991b1b;">Current Status: Declined</h3>
                        <p><strong>Reason:</strong> ${reason || 'Does not meet current administrative criteria or seat unavailability.'}</p>
                    </div>

                    <p>For more information or to discuss your application, please visit the school administrative office between 11:00 AM and 3:00 PM on working days.</p>
                    
                    <p style="margin-top: 30px; font-size: 0.8em; color: #666;">
                        This is an automated notification. Please do not reply directly to this email.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[REJECTION EMAIL SENT] To: ${to} | ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('[EMAIL ERROR] Failed to send rejection email:', error);
        return false;
    }
};

module.exports = { sendApprovalEmail, sendResultPDFEmail, sendRejectionEmail };
