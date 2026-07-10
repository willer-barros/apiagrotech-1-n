import express from "express"
import cors from "cors"
import { PrismaClient } from "./lib/prisma.ts"

const app = express();
const PORT = 3000;


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

app.listen(PORT, () => {
  console.log(`🚜🟢Agrotech rodante com sucesso`);
});

