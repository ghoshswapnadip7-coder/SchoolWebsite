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

const sendApprovalEmail = async (to, name, studentId, stream, subjects) => {
    try {
        const subjectList = subjects && subjects.length > 0 ? subjects.join(', ') : 'Standard Curriculum';
        
        const mailOptions = {
            from: `"School Admin" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: 'Admission Approved - Welcome to RPHS',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #1e40af;">Welcome to Ranaghat Pal Chowdhury High (H.S.) School!</h2>
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

                    <div style="background-color: #fffbeb; padding: 15px; border-radius: 8px; border: 1px solid #fcd34d; margin-bottom: 20px;">
                        <strong style="color: #92400e;">Marks Calculation Policy (Class 11/12):</strong>
                        <p style="margin: 5px 0; font-size: 0.9em;">
                            For Higher Secondary students, the final result is calculated based on the <strong>Best of 5 Subjects</strong> rule:
                            <br>
                            1. <strong>Bengali (Compulsory)</strong> + <strong>English (Compulsory)</strong> are always counted.
                            <br>
                            2. The <strong>Top 3 highest scoring Elective Subjects</strong> are added to the total.
                            <br>
                            3. The 4th Elective (lowest score) becomes optional and is excluded from the grand total (Out of 500).
                        </p>
                    </div>

                    <p>You can now login to your student dashboard to view routines, results, and pay fees.</p>
                    
                    <a href="http://localhost:5173/login" style="display: inline-block; background-color: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Dashboard</a>
                    
                    <p style="margin-top: 30px; font-size: 0.8em; color: #666;">
                        If you have any questions, please reply to this email or visit the school office.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL SENT] To: ${to} | ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('[EMAIL ERROR] Failed to send approval email:', error);
        return false;
    }
};

module.exports = { sendApprovalEmail };
