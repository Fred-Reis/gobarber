import { resolve } from 'path';
import nodemailer from 'nodemailer';
import exphbs from 'express-handlebars';
import nodemailerhbs from 'nodemailer-express-handlebars';
import mailConfig from '../config/mail';

class Mail {
  constructor() {
    // aqui agente pega os dados de forma desestruturada
    const { host, port, auth } = mailConfig;

    // cria-se uma variavel com a conexão do nodemailer com um serviço externo
    this.transporter = nodemailer.createTransport({
      // host e port pega-se do jeito que vem
      host,
      port,
      // no auth faz-se uma verificação se dentro do auth existe um usuario
      // senão passa-se como nulo
      auth: auth.user ? auth : null,
    });
    this.configureTemplates();
  }

  configureTemplates() {
    // aqui usando o resolve a gente chega até a pasta de emails
    const viewPath = resolve(__dirname, '..', 'app', 'views', 'emails');

    // chama a variavel que faz a conexão e com o use faz algumas modificações
    this.transporter.use(
      // aqui é como a mensagem é formatada
      'compile',
      // configurando o nedemailerhbs
      nodemailerhbs({
        viewEngine: exphbs.create({
          // aqui pega a pasta de layouts
          layoutsDir: resolve(viewPath, 'layouts'),
          partialsDir: resolve(viewPath, 'partials'),
          // layout padrão
          defaultLayout: 'default',
          // qual extensão estou usando nos arquivos do handlebars
          extname: '.hbs',
        }),
        viewPath,
        extName: '.hbs',
      })
    );
  }

  // aqui o metodo responsavel por enviar o email
  // vai receber uma message como parametro
  sendMail(message) {
    // cria-se um metodo dentro do outro para pegar oq foi configurado como padrão
    return this.transporter.sendMail({
      // pega tudo que foi configurado como padrão em mailConfig
      ...mailConfig.default,
      // pega tudo que estiver na message
      ...message,
    });
  }
}

export default new Mail();
