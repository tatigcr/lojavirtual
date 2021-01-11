const mongoose = require('mongoose'),
    Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const secret = require('../config').secret;


const UsuarioSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, "Não pode ficar vazio."]
    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: [true, "Não pode ficar vazio."],
        index: true,
        match: [/\S+@\S+\.\S+/, 'é inválido.'] 
    },
    loja: {
        type: Schema.Types.ObjectId,
        ref: "Loja",
        required: [true, "Não pode ficar vazia."]
    },
    permissao: {
        type: Array,
        default: ["cliente"]
    },
    hash: String,
    salt: String,
    recovery: {
        type: {
            token: String,
            date: Date
        },
        dafault: {}
    }
}, {
    timestamps: true
});

UsuarioSchema.plugin(uniqueValidator, { message: "já está sendo utilizado" });

UsuarioSchema.methods.setSenha = function (password){
    this.salt = crypto.randomBytes(16).toString("hex"); 
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex");
};

UsuarioSchema.methods.validarSenha = function (password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex");
    return hash === this.hash;
};

UsuarioSchema.methods.gerarToken = function(){
    const hoje = new Date();
    const expira = new Date(today);
    expira.setDate(today.getDate() + 15); //expira em 15 dias

    return jwt.sign({
        id: this._id, 
        email: this.email,
        nome: this.nome,
        expira: parseFloat(expira.getTime() / 1000, 10)
    }, secret);
};

//O id com underline antes é o que vem direto do banco de dados, como o MongoDB salva.

UsuarioSchema.methods.enviarAuthJSON = function(){
    return {
        _id: this._id, 
        nome: this.nome,
        email: this.email,
        loja: this.loja,
        role: this.permissao,
        token: this.gerarToken()
    };
};

//RECUPERAÇÃO
UsuarioSchema.methods.criarTokenRecuperacaoSenha = function(){
    this.recovery = {};
    this.recovery.token = crypto.randomBytes(16).toString("hex");
    this.recovery.date = new Date( new Date().getTime() + 24*60*60*1000 );
    return this.recovery;
};

UsuarioSchema.methods.finalizarTokenRecuperacaoSenha = function(){
    this.recovery = { token: null, date: null };
    return this.recovery;
};


module.exports = mongoose.model("Usuario", UsuarioSchema);
