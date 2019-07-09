import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from '../../config/auth';

export default async (req, res, next) => {
  // pega o token na parte de autorização no body(header)
  const autHeader = req.headers.authorization;

  if (!autHeader) {
    return res.status(401).json({ error: 'Token not provider' });
  }

  const [, token] = autHeader.split(' ');

  try {
    // verify é uma função de verificar do jwt, que vai autenticar o token
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);
    // pega o id de usuario que vem no decoded
    // req.userId = decoded.id;

    req.userId = decoded.id;

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid!' });
  }
};
