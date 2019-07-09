import Sequelize, { Model } from 'sequelize';
import { isBefore, subHours } from 'date-fns';
// importa o modulo que faz a criptografia do password

// cria classe com extensão model
class Appointments extends Model {
  // cria um metodo estatico chamado init com parametro sequelize chamado automaticamente pelo seq
  static init(sequelize) {
    // super chama o metodo pai, nesse caso Model
    super.init(
      {
        // envia atraves de uma classe as colunas editaveis pelo usuario
        date: Sequelize.DATE,
        canceled_at: Sequelize.DATE,
        past: {
          type: Sequelize.VIRTUAL,
          get() {
            // retorna pro get/ verifica se a data é anterior a data atual
            return isBefore(this.date, new Date());
          },
        },
        cancelable: {
          type: Sequelize.VIRTUAL,
          get() {
            // verifica se minha hora está a no minimo 2 horas do agendamento
            return isBefore(new Date(), subHours(this.date, 2));
          },
        },
      },
      {
        sequelize,
      }
    );

    // colocar um return this dentro de um static init
    return this;
  }

  static associate(models) {
    /*
    belongTo cria a chave estrangeira,
    preciso estudar um pouco sobre esse metodo
    */
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    this.belongsTo(models.User, { foreignKey: 'provider_id', as: 'provider' });
  }
}

export default Appointments;
