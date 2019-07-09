import * as Yup from 'yup';
import { parseISO, startOfHour, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Appointments from '../models/Appointments';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/Notification';

import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';

class AppointmentsController {
  async index(req, res) {
    const { page = 1 } = req.query;

    // aqui é o agendamento do usuario
    const appointments = await Appointments.findAll({
      // aqui passa os parametros para ser encontrado
      where: { user_id: req.userId, canceled_at: null },
      // ordenação
      order: ['date'],
      attributes: ['id', 'date', 'past', 'cancelable'],
      // aqui seleciono a quantidade por pagina
      limit: 20,
      /*
      aqui diz quantos registros eu quero pular
      faço uma formulazinha pra calcular isso (só fazer a conta)
      */
      offset: (page - 1) * 20,
      /*
       e aqui incluimos os dados do prestador
      aqui selecionamos o model de onde vem e seu relacionamento
      */
      include: [
        {
          model: User,
          as: 'provider',
          // aqui seleciona quais os dados do provider queremos
          attributes: ['id', 'name'],
          // incluindo o avatar já com os dados solicitaddos
          include: [
            {
              model: File,
              as: 'avatar',
              // aqui tem q setar opath pq senão vai dar undeffined a url
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });
    return res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação' });
    }

    const { provider_id, date } = req.body;

    /**
     * checar se o provider solicitado é um provider de fato
     */

    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      return res
        .status(401)
        .json({ error: 'Só é possivel criar agendamentos com provedores' });
    }

    // aqui a gente começa a fazer a validação de horario

    const hourStart = startOfHour(parseISO(date));

    /* aqui com o isBefore a gente verifica se nossa variavel está
    antes da data atual */
    if (isBefore(hourStart, new Date())) {
      return res
        .status(400)
        .json({ error: 'Horário informado não é mais valido!' });
    }

    /**
     * Agora vamos fazer a verificação se o prestador
     * ja não tem um horario agendado
     */

    const checkAvailability = await Appointments.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    /*
       aqui se foi encontrado o provider id com a date setada
      entao o horario nao esta mais disponivel
    */

    if (checkAvailability) {
      return res.status(400).json({ error: 'Agendamento indisponivel!' });
    }

    // aqui cria-se o "appointment na tabela"
    // embaixo seta os dados que recebe
    const appointment = await Appointments.create({
      user_id: req.userId,
      provider_id,
      date,
    });

    // nessa variavel eu pego o nome do usuario logado pelo PK
    const user = await User.findByPk(req.userId);
    // aqui formata a hora
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' H:mm'hs' ",
      { locale: pt }
    );

    // cria o conteudo associando ao id do provider
    await Notification.create({
      content: `Novo agendamento de ${user.name} para o ${formattedDate}`,
      user: provider_id,
    });

    if (provider_id === user.id) {
      return res
        .status(401)
        .json({ error: 'Você não pode criar um agendamento com você mesmo!' });
    }

    return res.json(appointment);
  }

  async delete(req, res) {
    // variavel recebe o appointment por id
    // depois a gente busca o Queue e nome
    const appointment = await Appointments.findByPk(req.params.id, {
      // informa oque é para incluir na variavel
      include: [
        {
          // de qual model vem e como é chamado
          model: User,
          as: 'provider',
          // e as informações que buscamos
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    // aqui verifica-se se o usuario logado é o mesmo que criou
    if (appointment.user_id !== req.userId) {
      return res.status(401).json({ error: 'Sem permissão para cancelar' });
    }

    /*
    agora verifica se o horario do cancelamento
    está com no minimo 2 horas de antecedencia
    */
    const dateWithSub = subHours(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).json({
        error:
          'Só é permitido o cancelamento com no mínimo duas horas de antecedência!',
      });
    }
    // aqui o campo cancelado em: recebe a data e hora
    appointment.canceled_at = new Date();

    await appointment.save();

    await Queue.add(CancellationMail.key, {
      appointment,
    });

    return res.json(appointment);
  }
}

export default new AppointmentsController();
