import mongoose from 'mongoose';
import express from 'express';
import myBankRouter from './routes/myBankRoutes.js';
import dotenv from 'dotenv';
// P/ em ambiente de teste, não usar arquivo env e definir variáveis de ambiente
// via linha de comando na chamada do programa:
// if (process.env.PRD !== 'true') require('dotenv').config();
// A chamada seria
// PRD=false node app.js ou
// PRD=true USERDB=nomedousuario node app.js
dotenv.config();

const app = express();

app.use(express.json());
app.use(myBankRouter);
app.listen(process.env.PORT, () => console.log('API iniciada!'));

// Conectar API ao MongoDB pelo Mongoose
(async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.USERDB}:${process.env.PWDDB}@cluster0.p4cph.mongodb.net/mybank?retryWrites=true&w=majority`,
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
