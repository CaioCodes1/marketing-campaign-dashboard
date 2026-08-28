const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const required = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${key}`);
  }
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  /**
   * CORS com padrao RESTRITIVO, nao permissivo.
   *
   * Antes o padrao era '*': subir sem definir a variavel deixava a API
   * aceitando requisicao de qualquer site. Ou seja, o erro de configuracao mais
   * provavel - esquecer de definir - era justamente o mais perigoso.
   *
   * Agora, esquecer a variavel quebra o frontend de forma visivel, o que e
   * muito melhor que abrir a API em silencio. Falhar fechado, nunca aberto.
   */
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5500',
};
