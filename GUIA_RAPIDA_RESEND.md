# 🎯 Guía Visual: Configuración Resend en 3 Pasos

```
┌─────────────────────────────────────────────────────────────────┐
│                    PASO 1: OBTENER API KEY                      │
└─────────────────────────────────────────────────────────────────┘

1️⃣  Ir a: https://resend.com/signup
    └─> Registrarse con email

2️⃣  Ir a: https://resend.com/api-keys
    └─> Click "Create API Key"
    └─> Nombre: "Sellos-G Production"
    └─> Permisos: "Sending access"
    └─> COPIAR la key (ejemplo: re_123abc456def...)

┌─────────────────────────────────────────────────────────────────┐
│                 PASO 2: CONFIGURAR EN RENDER                    │
└─────────────────────────────────────────────────────────────────┘

1️⃣  Ir a: https://dashboard.render.com
    └─> Seleccionar: "sellos-g-backend-2"

2️⃣  Pestaña: "Environment"
    └─> Click: "Add Environment Variable"
    
3️⃣  Agregar:
    ┌────────────────────────────────────────┐
    │ Key:   RESEND_API_KEY                  │
    │ Value: re_tu_api_key_aqui             │
    └────────────────────────────────────────┘
    └─> Click "Save Changes"

4️⃣  Render redespliegua automáticamente ⏳
    └─> Ver logs en pestaña "Logs"

┌─────────────────────────────────────────────────────────────────┐
│                     PASO 3: PROBAR                              │
└─────────────────────────────────────────────────────────────────┘

1️⃣  Ir a: https://sellos-g-frontend-k62m.vercel.app/registro-cliente

2️⃣  Registrar un cliente de prueba

3️⃣  Verificar email recibido ✉️

4️⃣  Ver estadísticas en: https://resend.com/emails

┌─────────────────────────────────────────────────────────────────┐
│                     ✅ VERIFICACIÓN                              │
└─────────────────────────────────────────────────────────────────┘

✓ Variables de entorno en Render:
  ├─ MONGO_URI ✅
  ├─ JWT_SECRET ✅
  ├─ FRONTEND_URL ✅
  └─ RESEND_API_KEY ⚠️  <-- AGREGAR ESTO

✓ Código actualizado en GitHub ✅

✓ Solo falta: API key en Render
```

## 🚨 Importante

- **No compartas** tu API key en el código
- **No hagas commit** del archivo .env con la key
- La key solo debe estar en **Render Environment Variables**

## 📊 Después de Configurar

Podrás ver en tiempo real:

- Cuántos emails se envían
- Cuáles fueron entregados
- Cuáles rebotaron
- Tasas de apertura

Todo en: https://resend.com/emails

---

**¿Problemas?** Revisa `CONFIGURACION_RESEND.md` para troubleshooting detallado.
