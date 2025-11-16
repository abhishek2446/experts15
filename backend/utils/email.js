const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOTPEmail = async (email, name, otp, type = 'Verification') => {
  const isPasswordReset = type === 'Password Reset';
  const mailOptions = {
    from: '"Experts15 Team" <noreply@experts15.com>',
    to: email,
    subject: `🔐 Your Experts15 ${type} Code`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Experts15 ${type} Code</title>
      </head>
      <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">Experts15</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">JEE Mock Test Platform</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #0284c7, #0369a1); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 36px;">${isPasswordReset ? '🔒' : '🚀'}</span>
              </div>
              <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 28px; font-weight: bold;">Hi ${name}! 👋</h2>
              <p style="color: #6b7280; margin: 0; font-size: 16px; line-height: 1.6;">
                ${isPasswordReset 
                  ? 'We received a request to reset your password. Use the code below to create a new password.' 
                  : 'Welcome to Experts15! Use the verification code below to complete your registration and start your JEE preparation journey.'}
              </p>
            </div>
            
            <!-- OTP Code -->
            <div style="background: linear-gradient(135deg, #f3f4f6, #e5e7eb); border-radius: 16px; padding: 30px; text-align: center; margin: 30px 0; border: 2px dashed #0284c7;">
              <p style="color: #374151; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Your ${type} Code:</p>
              <div style="background: white; border-radius: 12px; padding: 20px; display: inline-block; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <span style="font-size: 36px; font-weight: bold; color: #0284c7; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</span>
              </div>
              <p style="color: #6b7280; margin: 15px 0 0 0; font-size: 14px;">⏰ This code expires in <strong>10 minutes</strong></p>
            </div>
            
            <!-- Instructions -->
            <div style="background: #fef3c7; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">📋 Instructions:</h3>
              <ul style="color: #92400e; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
                <li>Enter this code in the verification form</li>
                <li>Don't share this code with anyone</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}${isPasswordReset ? '/forgot-password' : '/signup'}" 
                 style="background: linear-gradient(135deg, #0284c7, #0369a1); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3); transition: all 0.3s ease;">
                ${isPasswordReset ? '🔐 Reset Password' : '🚀 Complete Registration'}
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px;">Need help? Contact our support team</p>
            <div style="margin: 15px 0;">
              <a href="mailto:support@experts15.com" style="color: #0284c7; text-decoration: none; margin: 0 15px; font-size: 14px;">📧 Email Support</a>
              <a href="tel:+919876543210" style="color: #0284c7; text-decoration: none; margin: 0 15px; font-size: 14px;">📞 Call Us</a>
            </div>
            <p style="color: #9ca3af; margin: 15px 0 0 0; font-size: 12px;">
              © 2024 Experts15. All rights reserved.<br>
              Made with ❤️ for JEE aspirants
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
};

const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: '"Experts15 Team" <noreply@experts15.com>',
    to: email,
    subject: '🎉 Welcome to Experts15 - Your JEE Journey Starts Now!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Experts15</title>
      </head>
      <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 40px 30px; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -50px; right: -50px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -30px; left: -30px; width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; position: relative; z-index: 1;">🎉 Welcome to Experts15!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px; position: relative; z-index: 1;">India's Premier JEE Mock Test Platform</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 100px; height: 100px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);">
                <span style="color: white; font-size: 48px;">🚀</span>
              </div>
              <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 32px; font-weight: bold;">Hi ${name}! 👋</h2>
              <p style="color: #6b7280; margin: 0; font-size: 18px; line-height: 1.6;">
                Congratulations! Your account has been successfully created. You're now part of the <strong>Experts15 family</strong> - join over <strong>50,000+ students</strong> who trust us for their JEE preparation!
              </p>
            </div>
            
            <!-- Features -->
            <div style="margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; font-weight: bold; text-align: center;">🎯 What's Next?</h3>
              <div style="display: grid; gap: 15px;">
                <div style="background: #f0f9ff; border-radius: 12px; padding: 20px; border-left: 4px solid #0284c7;">
                  <h4 style="color: #0369a1; margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">📚 Take Your First Mock Test</h4>
                  <p style="color: #0369a1; margin: 0; font-size: 14px;">Start with our free JEE Mains mock test and get instant results with detailed analysis.</p>
                </div>
                <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; border-left: 4px solid #10b981;">
                  <h4 style="color: #059669; margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">📊 Track Your Progress</h4>
                  <p style="color: #059669; margin: 0; font-size: 14px;">Monitor your performance across subjects and get personalized recommendations.</p>
                </div>
                <div style="background: #fef3c7; border-radius: 12px; padding: 20px; border-left: 4px solid #f59e0b;">
                  <h4 style="color: #d97706; margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">🎯 Get Rank Predictions</h4>
                  <p style="color: #d97706; margin: 0; font-size: 14px;">Our AI-powered system predicts your JEE rank based on your performance.</p>
                </div>
              </div>
            </div>
            
            <!-- Stats -->
            <div style="background: linear-gradient(135deg, #f3f4f6, #e5e7eb); border-radius: 16px; padding: 30px; margin: 30px 0; text-align: center;">
              <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px; font-weight: bold;">🏆 Join Our Success Story</h3>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 20px;">
                <div>
                  <div style="color: #0284c7; font-size: 24px; font-weight: bold; margin-bottom: 5px;">50,000+</div>
                  <div style="color: #6b7280; font-size: 12px;">Students</div>
                </div>
                <div>
                  <div style="color: #10b981; font-size: 24px; font-weight: bold; margin-bottom: 5px;">98.5%</div>
                  <div style="color: #6b7280; font-size: 12px;">Success Rate</div>
                </div>
                <div>
                  <div style="color: #f59e0b; font-size: 24px; font-weight: bold; margin-bottom: 5px;">15,000+</div>
                  <div style="color: #6b7280; font-size: 12px;">Questions</div>
                </div>
                <div>
                  <div style="color: #8b5cf6; font-size: 24px; font-weight: bold; margin-bottom: 5px;">500+</div>
                  <div style="color: #6b7280; font-size: 12px;">IIT Selections</div>
                </div>
              </div>
            </div>
            
            <!-- CTA Buttons -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/dashboard" 
                 style="background: linear-gradient(135deg, #0284c7, #0369a1); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; margin: 10px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);">
                🚀 Go to Dashboard
              </a>
              <a href="${process.env.FRONTEND_URL}/tests" 
                 style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; margin: 10px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                📚 Browse Tests
              </a>
            </div>
            
            <!-- Tips -->
            <div style="background: #ede9fe; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
              <h3 style="color: #7c3aed; margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">💡 Pro Tips for Success:</h3>
              <ul style="color: #7c3aed; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
                <li>Take regular mock tests to build exam temperament</li>
                <li>Analyze your mistakes and work on weak areas</li>
                <li>Follow the study plan recommended by our AI system</li>
                <li>Join our community for doubt resolution and motivation</li>
              </ul>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px; font-weight: bold;">🤝 We're Here to Help!</p>
            <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px;">Have questions? Our expert team is ready to assist you 24/7</p>
            <div style="margin: 15px 0;">
              <a href="mailto:support@experts15.com" style="color: #0284c7; text-decoration: none; margin: 0 15px; font-size: 14px; font-weight: 600;">📧 support@experts15.com</a>
              <a href="tel:+919876543210" style="color: #0284c7; text-decoration: none; margin: 0 15px; font-size: 14px; font-weight: 600;">📞 +91 98765 43210</a>
            </div>
            <div style="margin: 20px 0;">
              <a href="#" style="color: #6b7280; text-decoration: none; margin: 0 10px; font-size: 12px;">Privacy Policy</a>
              <a href="#" style="color: #6b7280; text-decoration: none; margin: 0 10px; font-size: 12px;">Terms of Service</a>
              <a href="#" style="color: #6b7280; text-decoration: none; margin: 0 10px; font-size: 12px;">Help Center</a>
            </div>
            <p style="color: #9ca3af; margin: 15px 0 0 0; font-size: 12px;">
              © 2024 Experts15. All rights reserved.<br>
              Made with ❤️ for JEE aspirants across India
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
};

const sendPaymentSuccessEmail = async (email, name, testTitle) => {
  const mailOptions = {
    from: '"Experts15 Team" <noreply@experts15.com>',
    to: email,
    subject: '🎉 Payment Successful - You\'re All Set!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Successful</title>
      </head>
      <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
            <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 36px;">✅</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Payment Successful!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">You're now enrolled and ready to excel</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 24px; font-weight: bold;">Hi ${name}! 🎯</h2>
              <p style="color: #6b7280; margin: 0; font-size: 16px; line-height: 1.6;">
                Great news! We've successfully received your payment for <strong style="color: #10b981;">${testTitle}</strong>. 
                You're now enrolled and can start your test immediately.
              </p>
            </div>
            
            <!-- Test Details -->
            <div style="background: #f0fdf4; border-radius: 16px; padding: 25px; margin: 25px 0; border: 2px solid #10b981;">
              <h3 style="color: #059669; margin: 0 0 15px 0; font-size: 18px; font-weight: bold; text-align: center;">📚 Test Enrolled:</h3>
              <div style="background: white; border-radius: 12px; padding: 20px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h4 style="color: #1f2937; margin: 0; font-size: 20px; font-weight: bold;">${testTitle}</h4>
                <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 14px;">✅ Payment Confirmed • ✅ Access Granted</p>
              </div>
            </div>
            
            <!-- Next Steps -->
            <div style="margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px; font-weight: bold; text-align: center;">🚀 What's Next?</h3>
              <div style="display: grid; gap: 15px;">
                <div style="background: #fef3c7; border-radius: 12px; padding: 15px; border-left: 4px solid #f59e0b;">
                  <p style="color: #92400e; margin: 0; font-size: 14px; font-weight: 600;">1. Go to your dashboard and find the enrolled test</p>
                </div>
                <div style="background: #dbeafe; border-radius: 12px; padding: 15px; border-left: 4px solid #3b82f6;">
                  <p style="color: #1e40af; margin: 0; font-size: 14px; font-weight: 600;">2. Read the instructions carefully before starting</p>
                </div>
                <div style="background: #f3e8ff; border-radius: 12px; padding: 15px; border-left: 4px solid #8b5cf6;">
                  <p style="color: #7c3aed; margin: 0; font-size: 14px; font-weight: 600;">3. Take the test in a distraction-free environment</p>
                </div>
                <div style="background: #ecfdf5; border-radius: 12px; padding: 15px; border-left: 4px solid #10b981;">
                  <p style="color: #059669; margin: 0; font-size: 14px; font-weight: 600;">4. Review your results and performance analysis</p>
                </div>
              </div>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/dashboard" 
                 style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 18px 36px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 18px; display: inline-block; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); transition: all 0.3s ease;">
                🎯 Start Your Test Now
              </a>
            </div>
            
            <!-- Support -->
            <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
              <h4 style="color: #475569; margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">💬 Need Help?</h4>
              <p style="color: #64748b; margin: 0 0 15px 0; font-size: 14px;">Our support team is here to help you succeed!</p>
              <div>
                <a href="mailto:support@experts15.com" style="color: #0284c7; text-decoration: none; margin: 0 10px; font-size: 14px; font-weight: 600;">📧 Email Support</a>
                <a href="tel:+919876543210" style="color: #0284c7; text-decoration: none; margin: 0 10px; font-size: 14px; font-weight: 600;">📞 Call Us</a>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">Thank you for choosing Experts15 for your JEE preparation!</p>
            <p style="color: #9ca3af; margin: 10px 0 0 0; font-size: 12px;">
              © 2024 Experts15. All rights reserved.<br>
              Made with ❤️ for JEE aspirants
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
  sendPaymentSuccessEmail
};