const getOTPEmailTemplate = (otp, name, expiryMinutes) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px; }
        .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; text-align: center; }
        .otp { font-size: 36px; font-weight: bold; color: #1e40af; letter-spacing: 5px; margin: 20px 0; padding: 10px; background-color: #f3f4f6; border-radius: 8px; }
        .footer { font-size: 12px; color: #6b7280; text-align: center; margin-top: 20px; }
        .btn { background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>EntitySYS</h1>
            <p>University ERP System</p>
        </div>
        <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello ${name},</p>
            <p>We received a request to reset your password. Use the following 6-digit OTP to proceed:</p>
            <div class="otp">${otp}</div>
            <p>This OTP is valid for <strong>${expiryMinutes} minutes</strong>.</p>
            <p>If you didn't request this, please ignore this email or contact support if you have concerns.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 EntitySYS University ERP. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
        </div>
    </div>
</body>
</html>
`;

module.exports = {
    getOTPEmailTemplate
};
