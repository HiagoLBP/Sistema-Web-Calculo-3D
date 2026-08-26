package com.hsprints3d.service;

import org.springframework.stereotype.Service;

@Service
public class CalculadoraService {

    public double calcularPrecoMarketplace(
            double pesoPeca, double precoRolo, double pesoRolo,
            double potenciaWatts, double horasImpressao, double precoKwh,
            double precoImpressora, double vidaUtilHoras,
            double manutencaoAno, double horasUsoAno,
            double tempoTrabalhoMin, double valorHoraTrabalho,
            double markupDesejado, double taxaMarketplace) {

        // 1. Custo do Filamento
        double precoPorGrama = precoRolo / pesoRolo;
        double custoFilamento = pesoPeca * precoPorGrama;

        // 2. Custo de Energia
        double consumoKw = potenciaWatts / 1000.0;
        double custoEnergia = consumoKw * horasImpressao * precoKwh;

        // 3. Depreciação da Máquina
        double depreciacaoPorHora = precoImpressora / vidaUtilHoras;
        double custoDepreciacao = depreciacaoPorHora * horasImpressao;

        // 4. Manutenção
        double manutencaoPorHora = manutencaoAno / horasUsoAno;
        double custoManutencao = manutencaoPorHora * horasImpressao;

        // 5. Mão de Obra
        double horasTrabalhadas = tempoTrabalhoMin / 60.0;
        double custoMaoDeObra = horasTrabalhadas * valorHoraTrabalho;

        // Custo total real
        double custoTotal = custoFilamento + custoEnergia + custoDepreciacao + custoManutencao + custoMaoDeObra;

        // 6. Aplicando o MARKUP (1.00 = 100% de lucro sobre o custo)
        // Se o custo foi 8,30 e o markup é 1.00, o subtotal vira 16,60.
        double subtotalComLucro = custoTotal + (custoTotal * markupDesejado);

        // 7. Cobrindo a taxa do Marketplace
        // O marketplace sempre desconta do preço final, então dividimos o subtotal pelo que "sobra" da taxa.
        double divisorTaxa = 1.0 - taxaMarketplace;
        double precoDeVenda = subtotalComLucro / divisorTaxa;

        // Arredondando para 2 casas decimais (R$)
        return Math.round(precoDeVenda * 100.0) / 100.0;
    }
}