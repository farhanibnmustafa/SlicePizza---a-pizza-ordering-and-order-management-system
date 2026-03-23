import nodemailer from 'nodemailer';
import { Order } from '@/types';

export async function sendOrderConfirmationEmail(order: Order, baseUrl: string) {
    let transporter;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        // Use real SMTP (e.g., Gmail)
        transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    } else {
        // Use Ethereal Test Account (Automatically generates a real inbox URL in the terminal)
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });
    }

    const trackingUrl = `${baseUrl}/checkout/success/${order.id}`;

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="text-align: center; padding: 20px; background-color: #1a1a1a; border-radius: 8px 8px 0 0;">
                <h1 style="color: #f26622; margin: 0;">SlicePizza</h1>
            </div>
            
            <div style="padding: 30px; border: 1px solid #eaeaea; border-top: none; border-radius: 0 0 8px 8px;">
                <h2 style="margin-top: 0; color: #1a1a1a;">Order Confirmed!</h2>
                <p>Hi ${order.customerDetails.name.split(' ')[0]},</p>
                <p>Thank you for your order! Your pizza is currently being prepared and will be out for delivery shortly.</p>
                
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <h3 style="margin-top: 0; margin-bottom: 15px; color: #1a1a1a; border-bottom: 2px solid #eaeaea; padding-bottom: 10px;">Order Summary</h3>
                    <p style="margin: 5px 0;"><strong>Order ID:</strong> ${order.id}</p>
                    <p style="margin: 5px 0;"><strong>Total Amount:</strong> $${order.total.toFixed(2)}</p>
                    <p style="margin: 5px 0;"><strong>Delivery To:</strong> ${order.customerDetails.address}</p>
                </div>
                
                <div style="text-align: center; margin: 35px 0;">
                    <a href="${trackingUrl}" style="background-color: #f26622; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                        Track Your Order Live
                    </a>
                </div>
                
                <p style="font-size: 0.85em; color: #888; text-align: center; margin-top: 40px;">
                    If the button above doesn't work, copy and paste this link into your browser:<br>
                    <a href="${trackingUrl}" style="color: #f26622;">${trackingUrl}</a>
                </p>
            </div>
        </div>
    `;

    const info = await transporter.sendMail({
        from: '"SlicePizza Delivery" <orders@slicepizza.com>',
        to: order.customerDetails.email,
        subject: `Your SlicePizza Order ${order.id} is confirmed!`,
        html: htmlContent,
    });

    if (!process.env.EMAIL_USER) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log('\n======================================================');
        console.log('📬 REAL MOCK EMAIL SENT!');
        console.log('No SMTP credentials found in Next.js .env.local.');
        console.log('Nodemailer generated a live, clickable web-inbox URL:');
        console.log(`-> ${previewUrl}`);
        console.log('======================================================\n');
        return previewUrl;
    }
    
    return null;
}
