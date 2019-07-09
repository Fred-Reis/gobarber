import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class CancellationMail {
  // metodo que armazena qas chaves
  get key() {
    return 'CancellationMail';
  }

  /**
   * esse metodo executa a tarefa a ser realizada
   * dentro de handle ele recebe dados a serem executados
   */
  async handle({ data }) {
    const { appointment } = data;

    await Mail.sendMail({
      to: `${appointment.provider.name}, <${appointment.provider.email}>`,
      subject: 'Agendamento cancelado',
      template: 'cancellation',
      context: {
        provider: appointment.provider.name,
        user: appointment.user.name,
        date: format(
          parseISO(appointment.date),
          "'dia' dd 'de' MMMM', às' H:mm'hs' ",
          { locale: pt }
        ),
      },
    });
  }
}

export default new CancellationMail();
