// src/utils/emailSender.js

import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Helper: create a transporter. Intenta Gmail (credenciales) y si falla hace fallback a Ethereal
const createTransporter = async () => {
    const hasCreds = process.env.EMAIL_USER && process.env.EMAIL_PASS;

    // 1) Intentar con Gmail/SMTP real si hay credenciales
    if (hasCreds) {
        const useHost = process.env.EMAIL_HOST && process.env.EMAIL_PORT;
        const transportConfig = useHost
            ? {
                host: process.env.EMAIL_HOST,
                port: Number(process.env.EMAIL_PORT) || 465,
                secure: true,
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
                connectionTimeout: 15000,
                greetingTimeout: 15000,
            }
            : {
                service: "gmail",
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
                connectionTimeout: 15000,
                greetingTimeout: 15000,
            };

        const t = nodemailer.createTransport(transportConfig);
        try {
            await t.verify();
            console.log('[EMAIL] SMTP conectado correctamente.');
            return { transporter: t, isTest: false };
        } catch (err) {
            console.error('[EMAIL] Error verificando SMTP, se usará fallback a Ethereal:', err.message || err);
            // continua al fallback
        }
    }

    // 2) Fallback: cuenta de prueba (Ethereal) para al menos obtener URL de vista previa
    try {
        const testAccount = await nodemailer.createTestAccount();
        const t = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: { user: testAccount.user, pass: testAccount.pass },
        });
        console.log('[EMAIL] Usando cuenta de prueba (Ethereal). Las URLs de vista previa se devolverán en las respuestas.');
        return { transporter: t, isTest: true, testAccount };
    } catch (err) {
        console.error('[EMAIL] No se pudo crear cuenta de prueba para nodemailer:', err.message || err);
        throw err;
    }
};

export const sendVerificationEmail = async (correo, token, nombre = 'Usuario') => { // ✅ Mejorado: nombre por defecto
    // console.log("DEBUG USER:", process.env.EMAIL_USER);
    // console.log("DEBUG PASS:", process.env.EMAIL_PASS);

    const verificationLink = `${process.env.FRONTEND_URL}/verificar-email?token=${token}`;

    // Usamos el mismo estilo HTML (simplificado para incluir el CSS en línea)
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
        const { transporter, isTest } = await createTransporter();
        const info = await transporter.sendMail({
            from: '"Sellos G (No Responder)" <no-reply@sellos-g.com>',
            to: correo,
            subject: "¡Verifica tu cuenta de Sellos-G!",
            html: htmlContent,
        });

        console.log("Correo de verificación enviado:", info.messageId);
        if (isTest) {
            const preview = nodemailer.getTestMessageUrl(info);
            console.log('[EMAIL] Preview URL:', preview);
            return { info, preview };
        }
        return { info };
    } catch (error) {
        console.error("Error enviando correo de verificación:", error);
        throw new Error("Fallo al enviar el correo de verificación.");
    }
};

/**
 * Envía el correo para restablecer la contraseña.
 * @param {string} correo - Correo del destinatario.
 * @param {string} token - Token de recuperación generado.
 * @param {string} nombre - Nombre del usuario.
 */
export const sendPasswordResetEmail = async (correo, token, nombre = 'Usuario') => { // ✅ Mejorado: nombre por defecto
    // El enlace debe apuntar a la página de restablecimiento del frontend
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    // ✅ Mejorado: Usamos el mismo diseño HTML para consistencia
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
        const { transporter, isTest } = await createTransporter();
        const info = await transporter.sendMail({
            from: '"Sellos G (No Responder)" <no-reply@sellos-g.com>',
            to: correo,
            subject: "Restablecimiento de Contraseña - Sellos-G",
            html: htmlContent,
        });
        console.log(`[EMAIL] Correo de restablecimiento enviado a ${correo}. ID: ${info.messageId}`);
        if (isTest) {
            const preview = nodemailer.getTestMessageUrl(info);
            console.log('[EMAIL] Preview URL:', preview);
            return { info, preview };
        }
        return { info };
    } catch (error) {
        console.error("Error enviando correo de restablecimiento:", error);
        throw new Error("Fallo al enviar el correo de restablecimiento.");
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
        const { transporter, isTest } = await createTransporter();
        const info = await transporter.sendMail({
            from: '"Sellos G (No Responder)" <no-reply@sellos-g.com>',
            to: correo,
            subject: 'Bienvenido a Sellos-G — Verifica tu cuenta',
            html: htmlContent,
        });

        console.log('Correo de bienvenida enviado:', info.messageId);
        if (isTest) {
            const preview = nodemailer.getTestMessageUrl(info);
            console.log('[EMAIL] Preview URL:', preview);
            return { info, preview };
        }
        return { info };
    } catch (error) {
        console.error('Error enviando correo de bienvenida:', error);
        throw new Error('Fallo al enviar el correo de bienvenida.');
    }
};