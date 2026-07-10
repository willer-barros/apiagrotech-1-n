import express from "express"
import cors from "cors"
import { prisma } from "./lib/prisma.ts"

const app = express();
const PORT = 3000;
app.use (cors())

app.use(express.json());

app.post('/farms', async (req, res) => {
  const { name, location } = req.body;

  if (!name || !location) {
    return res.status(400).json({ error: "Campos 'name' e 'location' são obrigatórios." });
  }

  try {
    const newFarm = await prisma.farm.create({
      data: { name, location }
    });
    res.status(201).json(newFarm);
  } catch (error) {
    res.status(500).json({ error: "Erro interno ao cadastrar fazenda." });
  }
});

app.post('/plots', async (req, res) => {
  const { cropType, areaInHectares, farmId } = req.body;

  if (!cropType || !areaInHectares || !farmId) {
    return res.status(400).json({ error: "Campos 'cropType', 'areaInHectares' e 'farmId' são obrigatórios." });
  }

  try {
    const farmExists = await prisma.farm.findUnique({ where: { id: Number(farmId) } });
    if (!farmExists) {
      return res.status(404).json({ error: "Fazenda não encontrada para o farmId fornecido." });
    }

    const newPlot = await prisma.plot.create({
      data: {
        cropType,
        areaInHectares: Number(areaInHectares),
        farmId: Number(farmId)
      }
    });
    res.status(201).json(newPlot);
  } catch (error) {
    res.status(500).json({ error: "Erro interno ao cadastrar talhão." });
  }
});

app.get('/farms', async (req, res) => {
  try {
    const farms = await prisma.farm.findMany({
      include: {
        plots: true
      }
    });
    res.json(farms);
  } catch (error) {
    res.status(500).json({ error: "Erro interno ao listar fazendas." });
  }
});

app.put('/farms/:id', async (req, res) =>{

    try{
    const {id} = req.params;
    const {name, location } = req.body

    if (name != undefined && name.trim() === ""){
        return res.status(400).json({erro: "o nome da fazendo nao pode ser vazia"})
    }
    const farmExists = await prisma.farm.findUnique({
        where: {id: Number(id)}

    })

    if(!farmExists){
        return res.status(404).json({erro: "fazenda nao encontrada para atualizar"})
    }

    const farmUpdate = await prisma.farm.update({
        where: {id: Number(id)},
        data: {
            name,
            location
        }
    })

    return res.json(farmUpdate)
} catch(error){
    return res.status(500).json({erro: "Erro ao atualizar a fazenda"})
}
})

app.delete('/api/farms/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const farmExistente = await prisma.farm.findUnique({
      where: { id: Number(id) }
    });

    if (!farmExistente) {
      return res.status(404).json({ erro: "Fazenda não encontrada para exclusão." });
    }

    await prisma.farm.delete({
      where: { id: Number(id) }
    });

    return res.json({ mensagem: "Fazenda e todos os seus talhões associados foram excluídos com sucesso." });
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao excluir a fazenda." });
  }
});

app.put('/api/plots/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { cropTtype, areaInHecares, farmId } = req.body; // Nota: mantive o erro de digitação do seu schema (cropTtype)

    const plotExistente = await prisma.plot.findUnique({
      where: { id: Number(id) }
    });

    if (!plotExistente) {
      return res.status(404).json({ erro: "Talhão não encontrado para atualização." });
    }

    if (areaInHecares !== undefined && Number(areaInHecares) <= 0) {
      return res.status(400).json({ erro: "A área em hectares deve ser maior que zero." });
    }

    if (farmId !== undefined) {
      const farmExiste = await prisma.farm.findUnique({
        where: { id: Number(farmId) }
      });
      if (!farmExiste) {
        return res.status(400).json({ erro: "A fazenda informada (farmId) não existe." });
      }
    }

    const plotAtualizado = await prisma.plot.update({
      where: { id: Number(id) },
      data: {
        cropTtype,
        areaInHecares: areaInHecares !== undefined ? Number(areaInHecares) : undefined,
        farmId: farmId !== undefined ? Number(farmId) : undefined
      }
    });

    return res.json(plotAtualizado);
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao atualizar o talhão." });
  }
});

app.delete('/api/plots/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const plotExistente = await prisma.plot.findUnique({
      where: { id: Number(id) }
    });

    if (!plotExistente) {
      return res.status(404).json({ erro: "Talhão não encontrado para exclusão." });
    }

    await prisma.plot.delete({
      where: { id: Number(id) }
    });

    return res.json({ mensagem: "Talhão excluído com sucesso." });
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao excluir o talhão." });
  }
});

app.listen(PORT, () => {
  console.log(`🚜🟢Agrotech rodante com sucesso`);
});

