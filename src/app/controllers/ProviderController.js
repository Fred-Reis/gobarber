import User from '../models/User';
import File from '../models/File';

class ProviderController {
  // o index faz listagem
  async index(req, res) {
    // aqui a variavel recebe todos que form encontrados seguindo os requisitos
    const providers = await User.findAll({
      // onde os usuario forem providers
      where: { provider: true },
      // aqui os atributos que ru quero
      attributes: ['id', 'name', 'email', 'avatar_id'],
      // aqui estou selecionando os dados do avatar
      include: [
        {
          /*
          aqui seleciona o model
          o nome que vai receber
          e os atributos [nome de entrada,
             nome no db,
             e a url para acessar ]
          */
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(providers);
  }
}

export default new ProviderController();
