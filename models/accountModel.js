import mongoose from 'mongoose';

// Definir esquema para os dados da collection
const Schema = mongoose.Schema;

// Esquema para os dados inseridos na colection student
const accountSchema = new Schema({
  agencia: {
    type: Number,
    require: true,
  },
  conta: {
    type: Number,
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
  balance: {
    type: Number,
    require: true,
    min: 0,
  },
});

// Aplicar esquema da collection informado acima definindo modelo Account
// Definir classe Account
//(toda nova conta inserida no bd é uma instância dessa classe)
const Account = mongoose.model('Account', accountSchema, 'accounts');

export { Account };
