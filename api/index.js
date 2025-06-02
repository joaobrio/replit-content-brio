// API super simples sem dependências externas
module.exports = (req, res) => {
  // Configurar CORS manualmente
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Lidar com preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Roteamento simples
  const { url, method } = req;
  
  if (url === '/api/health' || url === '/api/health/') {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      message: 'API funcionando sem Express!' 
    });
  } else if (url === '/api' || url === '/api/') {
    res.status(200).json({ 
      message: 'API Vercel funcionando!',
      version: '1.0.0',
      endpoints: ['/api', '/api/health']
    });
  } else {
    res.status(404).json({ 
      error: 'Route not found',
      path: url,
      method: method
    });
  }
};