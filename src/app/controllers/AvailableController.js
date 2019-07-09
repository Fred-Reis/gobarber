import {
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  format,
  isAfter,
} from 'date-fns';
import { Op } from 'sequelize';
import Appointments from '../models/Appointments';

class AvailableController {
  async index(req, res) {
    // pega data que vem do req.query
    const { date } = req.query;

    // verifica se data existe
    if (!date) {
      return res.status(400).json({ error: 'Data não encontrada!' });
    }

    // converte data em Number
    const searchDate = Number(date);

    // busca pelos agendamentos do provider informado na data informada
    const appointments = await Appointments.findAll({
      where: {
        provider_id: req.params.providerId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
        },
      },
    });

    const schedule = [
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
      '19:00',
    ];

    // percorre o array schedule e retorna uma varaivel time para cada valor
    const available = schedule.map(time => {
      // aqui divide a variavel pelo : e nomeia cada posição
      const [hour, minute] = time.split(':');
      // variavel recebe os valores e formata
      const value = setSeconds(
        setMinutes(setHours(searchDate, hour), minute),
        0
      );
      // formata a hora
      return {
        time,
        value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        // verifica se o horario esta depois do horario atual
        available:
          isAfter(value, new Date()) &&
          // verifica se já tem agendamento para esse horario
          !appointments.find(a => format(a.date, 'HH:mm') === time),
      };
    });

    return res.json(available);
  }
}

export default new AvailableController();
