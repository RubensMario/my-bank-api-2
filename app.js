// API bancária simples com persistência de dados usando MongoDB-Atlas
// Dependências: Express (para tratar rotas)
// e mongoose (conectar ao MongoDB e definir esquema dos dados)

// Obs: poderia criar handlers para as funções middlewares e funções separadas
// para lidar com os erros específicos de cada rota

import mongoose from 'mongoose';
import express from 'express';
import myBankRouter from './routes/myBankRoutes.js';

const app = express();

app.use(express.json());
app.use(myBankRouter);
app.listen(3000, () => console.log('API iniciada!'));

// Conectar API ao MongoDB pelo Mongoose

(async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://Rubens:252719@cluster0.p4cph.mongodb.net/mybank?retryWrites=true&w=majority',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        //usar findOndAndUpdate(ou Delete) do driver do MongoDB s/ msg de erro
        // ao invés de useFindAndModify do mongoose
        useFindAndModify: false,
      }
    );
  } catch (err) {
    console.log('Erro ao conectar ao MongoDB' + err);
  }
})();
