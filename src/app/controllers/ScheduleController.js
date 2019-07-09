import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';
import User from '../models/User';
import Appointments from '../models/Appointments';

class ScheduleController {
  async index(req, res) {
    const checkUserProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!checkUserProvider) {
      return res.status(400).json({ error: 'O usuario não é um prestador!' });
    }

    // aqui recebe data do req e transforma com o pasreISO
    const { date } = req.query;
    const parseDate = parseISO(date);

    const appointments = await Appointments.findAll({
      where: {
        provider_id: req.userId,
        canceled_at: null,
        /**
         * aqui a data recebe um tratamento para buscar
         * os valores entgre o inicio e o fim do dia
         * usa-se o operador between e as funções
         * startOfDay e endOfDay
         */
        date: {
          [Op.between]: [startOfDay(parseDate), endOfDay(parseDate)],
        },
      },
      order: ['date'],
    });

    return res.json(appointments);
  }
}

export default new ScheduleController();
