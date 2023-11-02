const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const PORTA = 8080; // porta para o acesso ao servidor aomnia
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

const sequelize = new Sequelize('loja_gnds', 'root', 'codeclass', {
    host: 'localhost',//onde o banco de dados está sendo executado
    dialect: 'mariadb',
    port: 3307 //porta para o banco de dados
})

const router = express.Router();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());//passar no corpo da requisição

//Model de Fornecedor
const Fornecedores =sequelize.define('Fornecedores', {
    codigo:{
        type: Sequelize.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fornecedor:{
        type: Sequelize.DataTypes.STRING(100),
        allowNull: false,
    },
    email:{
        type: Sequelize.DataTypes.STRING(40),
        allowNull: false,
    },
    telefone:{
        type: Sequelize.DataTypes.STRING(100),
        allowNull: false,
    }
})



//Model de Produtos

const Produtos = sequelize.define('Produtos', {
    codigo:{
        type: Sequelize.DataTypes.INTEGER,
        primaryKey: true,
    },
    produtos:{
        type: Sequelize.DataTypes.STRING(100),
        allowNull: false,
    },
    quantidade:{
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
    },
    preco:{
        type: Sequelize.DataTypes.DECIMAL(10,2),
        allowNull: false,
    },
    codigo_fornecedor: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        References:{
            model: Fornecedores,
            key: 'codigo'
        }
    }
});

// Rota para criar um novo Fornecedor
router.post('/api/novoFornecedor', async (req, res) =>{
    try {
        const novoFornecedor = await Fornecedores.create({
            fornecedor: req.body.fornecedor,
            email: req.body.email,
            telefone: req.body.telefone,
        });

        res.status(201).json(novoFornecedor);
    } catch (error) {
        console.error('Erro ao criar novo Fornecedor:',error);
        res.status(500).json({error: 'Erro ao criar novo Fornecedor'});
        
    }
});

//Rota para listar todos os fornecedores (APIS)
router.get('/api/fornecedores', async (req, res) =>{
    try {
        const fornecedores = await Fornecedores.findAll();
        res.status(200).json(fornecedores);
    } catch (error) {
        console.error('Erro ao listar os fornecedores:', error);
        res.status(500).json({error: 'Erro ao listar fornecedores'});
        
    }
});

// Rota para cosnultar um fornecedor pelo ID
router.get('/api/fornecedores/:id', async (req, res) =>{
    try {
        const fornecedor = await Fornecedores.findByPk(req.params.id);
        if(!fornecedor){
            return res.status(404).json({error:'Fornecedor não encontrado'});
        }
        res.status(200).json(fornecedor);
    } catch (error) {
        console.error('Erro ao consultar o fornecedor:', error);
        res.status(500).json({error: 'Erro ao consultar o fornecedor'});
    }
});

// Rota par deletar um fornecedor pelo ID
router.delete('/api/fornecedores/:id', async (req, res) =>{
    try {
        const fornecedor = await Fornecedores.findByPk(req.params.id);
        if(!fornecedor){ //tratativa
            return res.status(404).json({error: 'Fornecedor não encontrado'})
        }
        await fornecedor.destroy();
        res.status(200).json({mensagem: 'Fornecedor deletado com sucesso'});
    } catch (error) {
        console.error('Erro ao deletar o fornecedor:', error);
        res.status(500).json({error: 'Erro ao deletar o fornecedor'});
    }
});

//Rota para atualização do fornecedor pelo ID
router.put('/api/fornecedores/:id', async (req, res) =>{
    const{fornecedor, email, telefone} = req.body;// desestruturação de objeto    
    try {
        await Fornecedores.update(
            {fornecedor, email, telefone},
            {
                where: {codigo: req.params.id},
                returning: true,
            }
        );
        res.status(200).json({mensagem: 'Fornecedor Atualizado com sucesso'})
    } catch (error) {
        console.error('Erro ao atualizar fornecedor', error);
        res.status(500).json({error: 'Erro ao Atualizar o Fornecedor'})
    }
});

//Rota para criar um novo produto

router.post('/api/novoProduto', async (req, res) =>{
    try {
        const novoProduto = await Produtos.create({
            codigo: req.body.codigo,
            produtos: req.body.produtos,
            quantidade: req.body.quantidade,
            preco: req.body.preco,
            codigo_fornecedor: req.body.codigo_fornecedor
        });
        res.status(201).json(novoProduto);
    } catch (error) {
        console.error('Erro ao criar novo produto',error);
        res.status(500).json({error: 'Erro ao criar novo produto'})
    }
});

//Rota para listar Produtos
router.get('/api/listarProdutos', async (req, res) =>{
    try {
        const listarProdutos = await Produtos.findAll();
        res.status(201).json(listarProdutos);
    } catch (error) {
        console.error('Erro ao consultar produtos');
        res.status(500).json({error: 'Erro ao consultar produtos'});
    }
});

//Rota para cosultar um produto por um ID
router.get('/api/produtos/:id', async (req, res) =>{
    try {
        const produto = await Produtos.findByPk(req.params.id);
        if(!produto){
            return res.status(404).json({mensagem: 'Produto não encontrado'});
        }
        res.status(200).json(produto);
    } catch (error) {
        console.error('Erro ao consultar produtos');
        res.status(500).json({error: 'Erro ao consultar produtos'});
    }
});

//Rota para deletar um produto
router.delete('/api/produtos/:id', async (req, res) =>{
    try {
        const produto = await Produtos.findByPk(req.params.id);

        if(!produto){
            return res.status(404).json({mensagem: 'Produtos não encontrado'});
        }

        await produto.destroy();
        res.status(200).json({mensagem: 'Produto deletado com sucesso'});
    } catch (error) {
        console.error('Erro ao deletar o produtos');
        res.status(500).json({error: 'Erro ao deletar produtos'});
    }
})

//Rota de atualização do produto
router.put('/api/produtos/:id', async(req, res) =>{
    const {produtos, quantidade, preco, codigo_fornecedor} = req.body;//desestruturação do req body no formato jason
    try {
        await Produtos.update(
            {produtos, quantidade, preco, codigo_fornecedor},//to passando os dados para alterar
            {
                where: {codigo: req.params.id},
                returning: true
            }
        );
        res.status(200).json({mensagem: 'Produto Atualizado com sucesso'})
    } catch (error) {
        console.error('Erro ao atualizar o produtos');
        res.status(500).json({error: 'Erro ao atualizar o produtos'});
    }
})




app.use(router);

app.listen(PORTA, () =>{
    console.log('Servidor Rodando na porta', PORTA);
});










