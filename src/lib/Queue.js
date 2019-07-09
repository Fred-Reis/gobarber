import Bee from 'bee-queue';
import CancellationMail from '../app/jobs/CancellationMail';
import redisConfig from '../config/redis';

const jobs = [CancellationMail];

class Queue {
  constructor() {
    // essa variavel começa como um objeto vazio e vai armazenar todos os jobs da aplicação
    this.queues = {};

    // aqui eu chamo o metodo init
    this.init();
  }

  // configuro o metodo init
  init() {
    // aqui percorro todo o array recebendo os jobs de forma desestruturada como parametro
    jobs.forEach(({ key, handle }) => {
      // pego as keys e conecto com o banco redis criando a fila por elas
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        // e o metodo handle que vai processar, executar uma ação, tb sera armazenado em queues
        handle,
      };
    });
  }

  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  processQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];

      bee.on('failed', this.handleFailure).process(handle);
    });
  }

  handleFailure(job, err) {
    console.log(`Queue ${job.queue.name}: FAILED`, err);
  }
}

export default new Queue();
