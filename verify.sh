#!/bin/bash
# Script de prueba del servidor Node.js

echo "=========================================="
echo "🔍 VERIFICACIÓN COMPLETA DEL PROYECTO"
echo "=========================================="

cd "c:\Users\BEETLEKUSH\OneDrive\Documentos\DESARROLLO\node" || exit 1

# 1. Verificar Node.js y npm
echo ""
echo "1️⃣  Verificando Node.js y npm..."
node -v
npm -v

# 2. Verificar archivos clave
echo ""
echo "2️⃣  Verificando archivos clave..."
ls -lh app.js package.json .env .gitignore 2>/dev/null | grep -E "app.js|package.json|.env|.gitignore"

# 3. Verificar carpetas
echo ""
echo "3️⃣  Verificando carpetas..."
echo "Modelos: $(ls models/ | wc -l) archivos"
echo "Rutas: $(ls routes/ | wc -l) archivos"
echo "Vistas: $(ls views/ | wc -l) archivos"
echo "Public: $([ -d public ] && ls public 2>/dev/null | wc -l || echo '0') archivos"

# 4. Verificar dependencias instaladas
echo ""
echo "4️⃣  Verificando dependencias..."
npm list --depth=0 2>/dev/null | tail -6

# 5. Verificar sintaxis JavaScript
echo ""
echo "5️⃣  Verificando sintaxis..."
node -c app.js && echo "✅ app.js OK"
node -c routes/products.js && echo "✅ routes/products.js OK"
node -c routes/carts.js && echo "✅ routes/carts.js OK"
node -c routes/views.js && echo "✅ routes/views.js OK"

echo ""
echo "=========================================="
echo "✅ VERIFICACIÓN COMPLETADA"
echo "=========================================="
echo ""
echo "Para iniciar el servidor:"
echo "  npm start"
echo ""
echo "Luego accede a:"
echo "  http://localhost:8080"
echo "  http://localhost:8080/products"
echo "=========================================="
