// src/utils/emailSender.js

import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

// Configurar transporte de Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Validar que las credenciales estén configuradas
if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
  console.error('⚠️ WARNING: GMAIL_USER o GMAIL_APP_PASSWORD no están configurados. Verifica tus variables de entorno.');
}

export const sendVerificationEmail = async (correo, token, nombre = 'Usuario') => {
    const verificationLink = `${process.env.FRONTEND_URL}/verificar-email?token=${token}`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verificación de Cuenta</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f5f7fa; padding: 0; margin: 0; }
        .container { max-width: 480px; background: white; margin: 40px auto; border-radius: 12px; padding: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
        h1 { color: #001f3f; text-align: center; }
        p { font-size: 15px; color: #333; line-height: 1.6; }
        .btn { display: block; text-align: center; background: #001f3f; color: white !important; padding: 12px; border-radius: 10px; text-decoration: none; font-weight: bold; margin: 25px 0; }
        .footer { text-align: center; margin-top: 25px; color: #777; font-size: 13px; }
    </style>
</head>

<body>
    <div class="container">
        <h1>Bienvenido, ${nombre || 'Usuario'}</h1>

        <p>Tu cuenta ha sido creada con éxito. Solo falta verificar tu correo.</p>

        <p>Haz clic en el siguiente botón para verificar tu cuenta:</p>

        <a class="btn" href="${verificationLink}">Verificar mi cuenta</a>

        <p class="footer">
            © 2025 Sellos G — Sistema de Gestión
        </p>
    </div>
</body>
</html>
`;

    try {
        const info = await transporter.sendMail({
            from: `"Sellos-G" <${process.env.GMAIL_USER}>`,
            to: correo,
            subject: '¡Verifica tu cuenta de Sellos-G!',
            html: htmlContent,
        });

        console.log('[EMAIL] Correo de verificación enviado exitosamente:', info.messageId);
        return { success: true, id: info.messageId };
    } catch (error) {
        console.error('[EMAIL] Error enviando correo de verificación:', error.message);
        throw new Error('Fallo al enviar el correo de verificación.');
    }
};

/**
 * Envía el correo para restablecer la contraseña.
 * @param {string} correo - Correo del destinatario.
 * @param {string} token - Token de recuperación generado.
 * @param {string} nombre - Nombre del usuario.
 */
export const sendPasswordResetEmail = async (correo, token, nombre = 'Usuario') => {
    // El enlace debe apuntar a la página de restablecimiento del frontend
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Restablecer Contraseña</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f5f7fa; padding: 0; margin: 0; }
        .container { max-width: 480px; background: white; margin: 40px auto; border-radius: 12px; padding: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
        h1 { color: #001f3f; text-align: center; }
        p { font-size: 15px; color: #333; line-height: 1.6; }
        .btn { display: block; text-align: center; background: #001f3f; color: white !important; padding: 12px; border-radius: 10px; text-decoration: none; font-weight: bold; margin: 25px 0; }
        .footer { text-align: center; margin-top: 25px; color: #777; font-size: 13px; }
    </style>
</head>

<body>
    <div class="container">
        <h1>Hola, ${nombre || 'Usuario'}</h1>

        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta Sellos-G.</p>
        <p>Haz clic en el siguiente botón para continuar:</p>

        <a class="btn" href="${resetLink}">Restablecer Contraseña</a>

        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>

        <p class="footer">
            © 2025 Sellos G — Sistema de Gestión
        </p>
    </div>
</body>
</html>
    `;

    try {
        const info = await transporter.sendMail({
            from: `"Sellos-G" <${process.env.GMAIL_USER}>`,
            to: correo,
            subject: 'Restablecimiento de Contraseña - Sellos-G',
            html: htmlContent,
        });

        console.log(`[EMAIL] Correo de restablecimiento enviado a ${correo}. ID: ${info.messageId}`);
        return { success: true, id: info.messageId };
    } catch (error) {
        console.error('[EMAIL] Error enviando correo de restablecimiento:', error.message);
        throw error;
    }
};

/**
 * Envía un correo de bienvenida para empleados creados por un administrador.
 * Incluye la contraseña temporal y el enlace de verificación.
 */
export const sendEmployeeWelcomeEmail = async (correo, token, nombre = 'Empleado', passwordTemporal = '') => {
    const verificationLink = `${process.env.FRONTEND_URL}/verificar-email?token=${token}`;

    const credBlock = passwordTemporal
        ? `<p>Tus credenciales temporales:</p>
        <div class="cred">Correo: ${correo}<br/>Contraseña temporal: ${passwordTemporal}</div>`
        : '';

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bienvenido a Sellos-G</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f5f7fa; padding: 0; margin: 0; }
        .container { max-width: 480px; background: white; margin: 40px auto; border-radius: 12px; padding: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
        h1 { color: #001f3f; text-align: center; }
        p { font-size: 15px; color: #333; line-height: 1.6; }
        .btn { display: block; text-align: center; background: #001f3f; color: white !important; padding: 12px; border-radius: 10px; text-decoration: none; font-weight: bold; margin: 25px 0; }
        .footer { text-align: center; margin-top: 25px; color: #777; font-size: 13px; }
        .cred { background: #f0f4f8; padding: 12px; border-radius: 8px; font-weight: bold; }
    </style>
</head>

<body>
    <div class="container">
        <h1>Bienvenido, ${nombre || 'Empleado'}</h1>

        <p>Se ha creado una cuenta para ti en Sellos-G. Para poder acceder necesitas verificar tu correo.</p>

        ${credBlock}

        <p>Haz clic en el siguiente botón para verificar tu cuenta y activar el acceso:</p>

        <a class="btn" href="${verificationLink}">Verificar mi cuenta</a>

        <p class="footer">
            © 2025 Sellos G — Sistema de Gestión
        </p>
    </div>
</body>
</html>
`;

    try {
        const info = await transporter.sendMail({
            from: `"Sellos-G" <${process.env.GMAIL_USER}>`,
            to: correo,
            subject: 'Bienvenido a Sellos-G — Verifica tu cuenta',
            html: htmlContent,
        });

        console.log(`[EMAIL] Correo de bienvenida enviado a ${correo}. ID: ${info.messageId}`);
        return { success: true, id: info.messageId };
    } catch (error) {
        console.error('[EMAIL] Error enviando correo de bienvenida:', error.message);
        throw error;
    }
};