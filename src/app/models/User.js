/* os campos do model não precisa refletir os campos do DB
é apenas os campos que são passados ao usuario */

// importa o sequelize e o model de sequelize
import Sequelize, { Model } from 'sequelize';
// importa o modulo que faz a criptografia do password
import bcrypt from 'bcryptjs';

// cria classe com extensão model
class User extends Model {
  // cria um metodo estatico chamado init com parametro sequelize chamado automaticamente pelo seq
  static init(sequelize) {
    // super chama o metodo pai, nesse caso Model
    super.init(
      {
        // envia atraves de uma classe as colunas editaveis pelo usuario
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
        provider: Sequelize.BOOLEAN,
      },
      {
        sequelize,
      }
    );

    // addHook faz com que um trecho de código seja executado antes da atualização
    this.addHook('beforeSave', async user => {
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });
    // colocar um return this dentro de um static init
    return this;
  }

  static associate(models) {
    /*
    belongTo diz que o model selecionado
     pertence a esse model ,ou seja,
     o model de file pertence ao model de user
     criando a foreign key
    */
    this.belongsTo(models.File, { foreignKey: 'avatar_id', as: 'avatar' });
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }
}

export default User;
