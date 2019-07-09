import Notification from '../schemas/Notification';
import User from '../models/User';

class NotificationController {
  async index(req, res) {
    const isProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!isProvider) {
      return res.status(400).json({ error: 'Usuario não é um provider!' });
    }

    const notifications = await Notification.find({
      user: req.userId,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);

    return res.json(notifications);
  }

  async update(req, res) {
    /**
     * usar o metodo findByIdAndUpdate do mongoose
     * ele busca pelo id e atualiza
     * no primeiro parametro ele busca e no segundo a gente fala oq quer atualizar
     * e o terceiro parametro como new diz que alem de atualizar
     * deve criar um novo parametro, nesse caso caso a notification
     */
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    return res.json(notification);
  }
}

export default new NotificationController();
