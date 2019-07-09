import 'dotenv/config';

// dessa forma cria a estrutra do app separada
import express from 'express';
import path from 'path';
import * as Sentry from '@sentry/node';
import Youch from 'youch';
import 'express-async-errors';

import routes from './routes'; // chamar as rotas em outra pasta
import sentryConfig from './config/sentry';

import './database';

class App {
  constructor() {
    // criando o servidor
    this.server = express(); // sintaxe que declara uma variavel dentro da classe

    // iniciando o Sentry
    Sentry.init(sentryConfig);

    // se não colocar dentro do constructor ela nunca sera chamada
    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  middlewares() {
    // essa linha deve estar antes das requisições, segundo a documentação do Sentry
    this.server.use(Sentry.Handlers.requestHandler());
    // metodo para os middleares retornarem em forma de json
    this.server.use(express.json());
    // para retornar a url dos files
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
    // essa linha deve ser executada apos todas as rotas
    this.server.use(Sentry.Handlers.errorHandler());
  }

  exceptionHandler() {
    this.server.use(async (err, req, res, next) => {
      // verificação se está em processo de desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        const errors = await new Youch(err, req).toJSON();

        next();

        return res.status(500).json(errors);
      }

      return res.status(500).json({ error: 'Internal Server error!' });
    });
  }
}

export default new App().server;
// instancia a classe e exporta a mesma, e a unica coisa que pode ser acessada é o App
