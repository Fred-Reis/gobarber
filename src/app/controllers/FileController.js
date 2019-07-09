import File from '../models/File';

class FileController {
  async store(req, res) {
    /*
    Aqui a variavel originalname que vem no body
    recebe o nome de name e a filename recebe  o nome de path
    e recebe do req.file do insomnia
    */
    const { originalname: name, filename: path } = req.file;

    // Aqui a variavel file é criada com os dados que vem de File
    const file = await File.create({
      name,
      path,
    });

    return res.json(file);
  }
}

export default new FileController();
