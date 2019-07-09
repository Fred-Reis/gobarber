// importa o sequelize que é o responsavel por fazer a conexão com o DB
import Sequelize from 'sequelize';
import mongoose from 'mongoose';

import User from '../app/models/User';
import File from '../app/models/File';
import Appointments from '../app/models/Appointments';

// aqui importa as configurações da conexão do arquivo database
import dataBaseConfig from '../config/database';

const models = [User, File, Appointments];

class Database {
  constructor() {
    this.init();
    this.mongo();
  }

  // esse metodo vai fazer a conexão com o DB e carregar os models
  init() {
    // nessa variavel temos a conexão com a base de dados usando o metodo sequelize e as configurações importadas
    this.connection = new Sequelize(dataBaseConfig);

    /*
     depois que fizer a conexão com o DB vou percorrer o array
     e fazer um segundo map para fazer a associação das tabelas
    */
    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }

  mongo() {
    /**
     * crio a conexão do mongoose
     */
    this.mongoConnection = mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useFindAndModify: true,
    });
  }
}

export default new Database();
