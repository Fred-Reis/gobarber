import Sequelize, { Model } from 'sequelize';

class File extends Model {
  // cria um metodo estatico chamado init com parametro sequelize chamado automaticamente pelo seq
  static init(sequelize) {
    // super chama o metodo pai, nesse caso Model
    super.init(
      {
        // envia atraves de uma classe as colunas editaveis pelo usuario
        name: Sequelize.STRING,
        path: Sequelize.STRING,
        url: {
          type: Sequelize.VIRTUAL,
          // aqui retorna a url com o path
          get() {
            // variavel vindo de dot env
            return `${process.env.APP_URL}/files/${this.path}`;
          },
        },
      },
      {
        sequelize,
      }
    );

    return this;
  }
}

export default File;
