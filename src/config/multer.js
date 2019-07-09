import multer from 'multer';
import crypto from 'crypto';
import { extname, resolve } from 'path';

export default {
  // função para armazenar o arquivo
  storage: multer.diskStorage({
    // local onde vai ser armazenado o arquivo
    destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'),
    // nome do arquivo
    filename: (req, file, cb) => {
      // essa função serve para converte o nem do arquivo para um nome unico e com caracteres padronizados
      // transforma o nome e um numero de 16 bytes
      crypto.randomBytes(16, (err, res) => {
        if (err) return cb(err);

        // aqui retorna aquele numero e o converte para hexadecimal e retira a extensão do arquivo original
        return cb(null, res.toString('hex') + extname(file.originalname));
      });
    },
  }),
};
