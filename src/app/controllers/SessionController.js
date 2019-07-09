// arquivo referenta a sessão

// importa o JWT
import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import authConfig from '../../config/auth';
import User from '../models/User';
// criação de uma sessão
class SessionController {
  // metodo para cadastrar usuario
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    // validar se os dados do body estõa no formato solicitado
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails!' });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    // verificação para ver se email existe
    if (!user) {
      return res.status(401).json({ error: 'User not found!' });
    }
    // verificação de senha
    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    const { id, name } = user;

    return res.json({
      user: {
        id,
        name,
        email,
      },
      // gerar token no md5online(fredevaquietrabalho)
      token: jwt.sign({ id }, authConfig.secret, {
        // tempo de expiração
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
