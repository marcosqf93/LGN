const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    tipo: { type: String, required: true, trim: true },
    finalidade: { type: String, required: true, enum: ["venda", "aluguel", "ambos"] },
    cidade: { type: String, required: true, trim: true },
    bairro: { type: String, default: "", trim: true },
    endereco: { type: String, default: "", trim: true },
    mapaUrl: { type: String, default: "", trim: true },
    referencia: { type: String, default: "", trim: true },
    dormitorios: { type: Number, default: 0 },
    suites: { type: Number, default: 0 },
    salas: { type: Number, default: 0 },
    cozinhas: { type: Number, default: 0 },
    banheiros: { type: Number, default: 0 },
    varandas: { type: Number, default: 0 },
    garagens: { type: Number, default: 0 },
    areaGourmet: { type: Number, default: 0 },
    areaServico: { type: Number, default: 0 },
    copa: { type: Number, default: 0 },
    areaTotal: { type: Number, default: 0 },
    areaConstruida: { type: Number, default: 0 },
    temAreaGourmet: { type: Boolean, default: false },
    financiavel: { type: Boolean, default: false },
    aceitaProposta: { type: Boolean, default: false },
    aceitaVeiculo: { type: Boolean, default: false },
    imovelNovo: { type: Boolean, default: false },
    piscina: { type: Boolean, default: false },
    murado: { type: Boolean, default: false },
    documentacaoRegular: { type: Boolean, default: false },
    valorVenda: { type: Number, default: 0 },
    valorLocacao: { type: Number, default: 0 },
    descricao: { type: String, default: "", trim: true },
    imagens: [{ type: String }],
    destaque: { type: Boolean, default: false },
    ativo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

propertySchema.index({ tipo: 1, finalidade: 1, cidade: 1 });
propertySchema.index({ referencia: "text", bairro: "text", endereco: "text" });

module.exports = mongoose.model("Property", propertySchema);
