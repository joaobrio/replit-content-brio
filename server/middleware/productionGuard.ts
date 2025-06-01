/**
 * Middleware de Proteção para Produção
 * Previne execução de código de teste e arquivos de desenvolvimento
 */

export function productionGuard() {
  // Sobrescrever console.error temporariamente para filtrar mensagens de teste
  if (process.env.NODE_ENV === 'production') {
    const originalError = console.error;
    
    console.error = (...args: any[]) => {
      const errorString = args.join(' ');
      
      // Filtrar erros relacionados a arquivos de teste
      const testPatterns = [
        'test/data',
        'test-.*\\.pdf',
        '05-versions-space.pdf',
        'test-.*\\.js',
        'test-.*\\.ts',
        '__tests__',
        '\\.test\\.',
        '\\.spec\\.'
      ];
      
      const isTestError = testPatterns.some(pattern => 
        errorString.includes(pattern) || new RegExp(pattern).test(errorString)
      );
      
      if (!isTestError) {
        originalError.apply(console, args);
      } else {
        console.log('[Production Guard] Blocked test-related error:', errorString.substring(0, 100));
      }
    };
  }
}

// Proteção contra imports de teste
export function validateImports() {
  if (process.env.NODE_ENV === 'production') {
    // Limpar cache de módulos que possam conter referências a teste
    const testModules = Object.keys(require.cache).filter(key => 
      key.includes('test/') || 
      key.includes('.test.') || 
      key.includes('.spec.') ||
      key.includes('05-versions-space')
    );
    
    testModules.forEach(module => {
      delete require.cache[module];
    });
  }
}

// Proteção contra leitura de arquivos de teste
const originalReadFile = require('fs').readFile;
const originalReadFileSync = require('fs').readFileSync;

if (process.env.NODE_ENV === 'production') {
  require('fs').readFile = (path: string, ...args: any[]) => {
    if (path.includes('test/') || path.includes('05-versions-space')) {
      const callback = args[args.length - 1];
      if (typeof callback === 'function') {
        callback(new Error('Test files are not available in production'));
      }
      return;
    }
    return originalReadFile(path, ...args);
  };
  
  require('fs').readFileSync = (path: string, ...args: any[]) => {
    if (path.includes('test/') || path.includes('05-versions-space')) {
      throw new Error('Test files are not available in production');
    }
    return originalReadFileSync(path, ...args);
  };
}
