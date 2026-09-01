const routes = [
  '/',
  '/documento',
  '/bitacora',
  '/equipo',
  '/anexos',
  '/descargar',
  '/api/word',
];

async function checkAllRoutes() {
  console.log('--- Verificando rutas de la aplicación en http://localhost:8080 ---');
  let allOk = true;

  for (const route of routes) {
    try {
      const res = await fetch(`http://127.0.0.1:8080${route}`);
      const isOk = res.status === 200;
      console.log(`${isOk ? '✓' : '✗'} [${res.status}] ${route} (${res.headers.get('content-type')?.split(';')[0]})`);
      if (!isOk) allOk = false;
    } catch (err) {
      console.error(`✗ Error al conectar con ${route}:`, err.message);
      allOk = false;
    }
  }

  console.log('\nResultado general:', allOk ? 'TODAS LAS RUTAS OPERATIVAS (200 OK)' : 'HAY ERRORES EN ALGUNAS RUTAS');
}

checkAllRoutes().catch(console.error);
