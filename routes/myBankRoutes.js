// Obs: a existência de variáveis em diferentes línguas
// se deve à nomeção de campos dos documentos
// (i.e., propriedades dos objetos contas) definidos inicialmente no projeto

import express from 'express';
import { Account } from '../models/accountModel.js';

const router = express.Router();

export default router;

// Mostrar todas as contas (não é parte do trabalho)
router.get('/accounts', async (req, res, next) => {
  try {
    // find() retorna um array de objetos
    const allAccounts = await Account.find({});

    res.send(allAccounts);
  } catch (err) {
    next(err);
  }
});

// Realizar depósito e exibir saldo da conta que recebe
// Recomenda-se usar find + save ao invés de updateS sempre que possível
router.patch('/accounts/:agencia/:conta/:deposit', async (req, res, next) => {
  try {
    const { agencia, conta, deposit } = req.params;
    // findOne() retorna um objeto (documento)
    const account = await Account.findOne({
      agencia, //agencia: agencia, conta: conta
      conta,
    });

    // Poderia fazer sem else, como na rota de saque
    if (!account) {
      res.status(404).send('Conta não existente!');
    } else {
      const newBalance = account.balance + parseFloat(deposit);
      account.balance = newBalance;
      account.save();

      res.status(200).send(`Saldo atual: R$ ${account.balance}`);
    }
  } catch (err) {
    next(err);
  }
});

// Realizar saque e exibir saldo
router.patch(
  '/accounts/:agencia/:conta/withdraw/:value',
  async (req, res, next) => {
    try {
      const { agencia, conta, value } = req.params;
      const account = await Account.findOne({
        agencia, //agencia: agencia, conta: conta
        conta,
      });

      if (!account) res.status(404).send('Conta não existente!');

      if (value > account.balance) res.status(400).send('Saldo insuficiente!');

      const withdrawTax = 1;
      const newBalance = account.balance - (parseFloat(value) + withdrawTax);
      account.balance = newBalance;
      account.save();

      res.status(200).send(`Saldo atual: R$ ${account.balance}`);
    } catch (err) {
      next(err);
    }
  }
);

// Exibir saldo
router.get('/accounts/:agencia/:conta', async (req, res, next) => {
  try {
    const { agencia, conta } = req.params;
    // agencia: agencia, conta: conta
    const account = await Account.findOne({ agencia, conta });

    if (!account) res.status(404).send('Conta não existente!');

    res.status(200).send(`Saldo: R$ ${account.balance}`);
  } catch (err) {
    next(err);
  }
});

// Excluir conta e informar número de contas ativas na agência
router.delete('/accounts/:agencia/:conta', async (req, res, next) => {
  try {
    const { agencia, conta } = req.params;
    const account = await Account.findOneAndDelete({ agencia, conta });

    if (!account) res.status(404).send('Conta não existente!');
    // {agencia: agencia}
    const activeAccounts = await Account.count({ agencia });

    res
      .status(200)
      .send(`Existem ${activeAccounts} contas ativas na agência ${agencia}.`);
  } catch (err) {
    next(err);
  }
});

// Realizar trasnferência entre contas e exibir saldo da conta de origem
// Se as agências forem diferentes, cobrar taxa
// Dados da conta destino e valor da transferência passados pelo body
router.patch(
  '/accounts/:agenciaorigem/:contaorigem',
  async (req, res, next) => {
    try {
      // parseInt para permitir comparação
      const agenciaOrigem = parseInt(req.params.agenciaorigem);
      const contaOrigem = req.params.contaorigem;
      const agenciaDestino = req.body.agencia;
      const contaDestino = req.body.conta;

      const sourceAccount = await Account.findOne({
        agencia: agenciaOrigem,
        conta: contaOrigem,
      });
      const destinationAccount = await Account.findOne({
        conta: contaDestino,
        agencia: agenciaDestino,
      });

      const transferAmount = parseFloat(req.body.balance);
      let transferTax = 0;

      // Validações
      if (!sourceAccount || !destinationAccount)
        res.status(404).send('Conta não existente!');

      if (transferAmount > sourceAccount.balance)
        res.status(400).send('Saldo insuficiente!');

      agenciaDestino === agenciaOrigem ? (transferTax = 0) : (transferTax = 8);

      // Atualização dos saldos das contas
      const sourceAccountNewBalance =
        sourceAccount.balance - (transferAmount + transferTax);
      const destinationAccountNewBalance =
        destinationAccount.balance + transferAmount;

      sourceAccount.balance = sourceAccountNewBalance;
      destinationAccount.balance = destinationAccountNewBalance;

      // Salvar atualizações no banco de dados
      sourceAccount.save();
      destinationAccount.save();

      // Exibir saldo da conta de origem após a transferência
      res.status(200).send(`Saldo: R$ ${sourceAccountNewBalance}`);
    } catch (err) {
      next(err);
    }
  }
);

// Consultar/retornar a média dos saldos dos clientes de uma agência
// Opção mais simples: usar aggregate
router.get('/accounts/:agencia', async (req, res, next) => {
  try {
    const { agencia } = req.params;
    // find() retorna um array de objetos
    const branchAccounts = await Account.find({ agencia });

    const balanceByBranch = branchAccounts.reduce((acumulator, current) => {
      return acumulator + current.balance;
    }, 0);

    const averageBranchBalance = balanceByBranch / branchAccounts.length;

    res
      .status(200)
      .send(
        `O saldo médio da agência ${agencia} é R$ ${averageBranchBalance.toFixed(
          2
        )}`
      );
  } catch (err) {
    next(err);
  }
});

// Consultar/retornar os n clientes com menor saldo em conta em ordem crescente
router.get('/lists/lowestbalances/:number', async (req, res, next) => {
  try {
    const limitNumber = parseInt(req.params.number);
    // find() retorna um array de objetos
    const sortedAccounts = await Account.find({})
      .limit(limitNumber)
      .sort({ balance: 1 });

    res.status(200).send(sortedAccounts);
  } catch (err) {
    next(err);
  }
});

// Consultar/retornar os n clientes com maior saldo em conta
// em ordem decrescente pelo saldo e crescente pelo nome
router.get('/lists/highestbalances/:number', async (req, res, next) => {
  try {
    const limitNumber = parseInt(req.params.number);
    // find() retorna um array de objetos
    const sortedAccounts = await Account.find({})
      .limit(limitNumber)
      .sort({ balance: -1 })
      .sort({ name: 1 });

    res.status(200).send(sortedAccounts);
  } catch (err) {
    next(err);
  }
});

// Transferir o cliente de maior saldo de cada agência p/ a agência private(99)
// Retornar a lista dos clientes da agência private
router.put('/private', async (_req, res, next) => {
  try {
    const topClientByBranch = await Account.aggregate([
      {
        $group: {
          _id: '$agencia',

          balance: { $max: '$balance' },
        },
      },
    ]);

    for (let i = 0; i < topClientByBranch.length; i++) {
      let privateAccount = await Account.findOne({
        agencia: topClientByBranch[i]._id,
        balance: topClientByBranch[i].balance,
      });
      privateAccount.agencia = 99;
      await privateAccount.save();
    }

    const privateClients = await Account.find({ agencia: 99 });

    console.log(privateClients);
    res.status(200).send(privateClients);
  } catch (err) {
    next(err);
  }
});

// Tratamento geral de erros para todos os endpoints
router.use((err, req, res, next) => {
  res.status(500).send('Something went wrong!');
});
