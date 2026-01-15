# 📧 Configuración de Resend para Emails

## ⚠️ Problema Identificado

Render bloquea las conexiones SMTP salientes (puertos 25, 465, 587), por lo que Gmail SMTP no funciona. La solución es usar **Resend**, un servicio de email que usa API HTTP en lugar de SMTP.

## ✅ Cambios Realizados

1. ✅ Instalado el paquete `resend`
2. ✅ Migrado `emailSender.js` de nodemailer a Resend API
3. ✅ Actualizado `clienteController.js` para manejar errores correctamente
4. ✅ Push a GitHub completado

## 🔧 Pasos de Configuración

### 1. Crear Cuenta en Resend

1. Ve a: https://resend.com/signup
2. Regístrate con tu email (gratis hasta 3,000 emails/mes)
3. Verifica tu email

### 2. Obtener API Key

1. Inicia sesión en: https://resend.com/api-keys
2. Haz clic en **"Create API Key"**
3. Dale un nombre (ejemplo: "Sellos-G Production")
4. Selecciona permisos: **"Sending access"**
5. Copia la API key (empieza con `re_...`)

### 3. Configurar en Render

1. Ve a tu dashboard de Render: https://dashboard.render.com
2. Selecciona tu servicio **"sellos-g-backend-2"**
3. Ve a la pestaña **"Environment"**
4. Haz clic en **"Add Environment Variable"**
5. Agrega:
   - **Key:** `RESEND_API_KEY`
   - **Value:** `re_tu_api_key_aqui` (pega la key que copiaste)
6. Haz clic en **"Save Changes"**

### 4. Verificar Despliegue

Render debería redesplegar automáticamente al guardar las variables de entorno. Si no:

1. Ve a la pestaña **"Manual Deploy"**
2. Haz clic en **"Deploy latest commit"**

### 5. Probar el Sistema

Una vez desplegado:

1. Ve a tu frontend: https://sellos-g-frontend-k62m.vercel.app/registro-cliente
2. Intenta registrar un nuevo cliente
3. Deberías recibir un email de verificación

## 📧 Verificar Emails en Resend

Puedes ver todos los emails enviados en:
https://resend.com/emails

Aquí verás:
- ✅ Emails entregados
- ❌ Emails fallidos
- 📊 Estadísticas de apertura/clicks

## ⚙️ Configuración del Remitente

**Por defecto** usamos: `Sellos-G <onboarding@resend.dev>`

Para usar tu propio dominio (ejemplo: `noreply@sellos-g.com`):

1. Ve a: https://resend.com/domains
2. Haz clic en **"Add Domain"**
3. Sigue las instrucciones para configurar DNS
4. Una vez verificado, edita `src/utils/emailSender.js`:

```javascript
// Cambiar todas las líneas:
from: 'Sellos-G <onboarding@resend.dev>',

// Por:
from: 'Sellos-G <noreply@tudominio.com>',
```

## 🐛 Troubleshooting

### Error: "API key is invalid"

- Verifica que la API key comience con `re_`
- Asegúrate de haberla pegado completa en Render
- Revisa que no tenga espacios al inicio/final

### Email no llega

1. Revisa en https://resend.com/emails que el email se haya enviado
2. Verifica la carpeta de spam
3. Si usas dominio personalizado, verifica que DNS esté configurado

### Logs de Render

Para ver si hay errores:

1. Ve a tu servicio en Render
2. Pestaña **"Logs"**
3. Busca mensajes con `[EMAIL]`

## 📝 Límites del Plan Gratis

- ✅ 3,000 emails/mes
- ✅ 100 emails/día
- ✅ API completa
- ✅ Dashboard de analytics

Para más: https://resend.com/pricing

## 🔄 Revertir a SMTP (si es necesario)

Si necesitas revertir:

```bash
git revert HEAD
git push origin main
```

## 📚 Documentación

- Resend Docs: https://resend.com/docs/introduction
- Resend Node.js: https://resend.com/docs/send-with-nodejs

---

**Estado Actual:** ✅ Código listo, esperando API key en Render
