# ✅ Checklist de Configuración - Sistema de Emails

## 📋 Estado Actual

### ✅ Completados (por el sistema)
- [x] Instalar paquete `resend`
- [x] Migrar `emailSender.js` a Resend API
- [x] Actualizar `sendVerificationEmail()`
- [x] Actualizar `sendPasswordResetEmail()`
- [x] Actualizar `sendEmployeeWelcomeEmail()`
- [x] Modificar `clienteController.js`
- [x] Actualizar `.env` con instrucciones
- [x] Push de código a GitHub
- [x] Crear documentación completa

### ⏳ Pendientes (requieren acción manual)

#### 1. Crear cuenta en Resend
- [ ] Ir a: https://resend.com/signup
- [ ] Registrarse con email
- [ ] Verificar email de confirmación

#### 2. Obtener API Key
- [ ] Ir a: https://resend.com/api-keys
- [ ] Click "Create API Key"
- [ ] Nombre: "Sellos-G Production"
- [ ] Permisos: "Sending access"
- [ ] **COPIAR la API key** (comienza con `re_`)

#### 3. Configurar en Render
- [ ] Ir a: https://dashboard.render.com
- [ ] Seleccionar servicio: "sellos-g-backend-2"
- [ ] Pestaña: "Environment"
- [ ] Add Environment Variable:
  - Key: `RESEND_API_KEY`
  - Value: `re_tu_api_key_copiada`
- [ ] Click "Save Changes"
- [ ] Esperar redespliegue automático (2-3 minutos)

#### 4. Verificar Funcionamiento
- [ ] Ir a: https://sellos-g-frontend-k62m.vercel.app/registro-cliente
- [ ] Registrar un cliente de prueba
- [ ] Verificar que llegue el email
- [ ] Verificar en: https://resend.com/emails

## 🔍 Verificación de Variables en Render

Asegúrate de tener TODAS estas variables:

```
✅ MONGO_URI = mongodb+srv://...
✅ JWT_SECRET = KN8SarBTKp
✅ FRONTEND_URL = https://sellos-g-frontend-k62m.vercel.app
⚠️  RESEND_API_KEY = <-- AGREGAR ESTA
```

## 🚨 Errores Comunes

### Error: "API key is invalid"
**Solución:** 
- Verifica que empiece con `re_`
- Asegúrate de copiarla completa
- No debe tener espacios al inicio/final

### Email no llega
**Solución:**
- Revisa https://resend.com/emails
- Verifica carpeta de spam
- Revisa logs de Render

### Render no redesplega
**Solución:**
- Ve a pestaña "Manual Deploy"
- Click "Deploy latest commit"

## 📊 Después de Configurar

Podrás ver en Resend:
- ✉️ Todos los emails enviados
- ✅ Tasas de entrega
- 📈 Estadísticas de apertura
- 🔍 Logs detallados

## 🎯 Próximos Pasos Opcionales

### Dominio Personalizado (opcional)
- [ ] Ir a: https://resend.com/domains
- [ ] Agregar tu dominio
- [ ] Configurar registros DNS
- [ ] Cambiar `from` en el código

### Límites del Plan Gratis
- ✅ 3,000 emails/mes
- ✅ 100 emails/día
- ✅ Dashboard completo
- ✅ API sin restricciones

## 📝 Notas Importantes

1. **Seguridad:** NUNCA hagas commit de la API key
2. **Backup:** Guarda la API key en un lugar seguro
3. **Testing:** Usa `onboarding@resend.dev` para pruebas
4. **Producción:** Cambia el email `from` cuando tengas dominio

## 🔗 Links Útiles

- Resend Signup: https://resend.com/signup
- Resend API Keys: https://resend.com/api-keys
- Resend Dashboard: https://resend.com/emails
- Render Dashboard: https://dashboard.render.com
- Frontend: https://sellos-g-frontend-k62m.vercel.app
- Backend: https://sellos-g-backend-2.onrender.com

---

## ✅ Checklist Rápido

1. [ ] Crear cuenta en Resend
2. [ ] Copiar API key
3. [ ] Agregar a Render Environment
4. [ ] Esperar redespliegue
5. [ ] Probar registro de cliente
6. [ ] ✅ ¡Listo!

**Tiempo estimado:** 5-10 minutos

---

**Estado del código:** ✅ Listo en producción
**Estado de configuración:** ⏳ Pendiente API key
