package com.hsprints3d.service;

import com.hsprints3d.model.Impressora;
import com.hsprints3d.repository.ImpressoraRepository;
import org.springframework.stereotype.Service;

@Service
public class CalculadoraService {

    private final ImpressoraRepository impressoraRepository;

    // Injetamos o repositório para o Service conseguir buscar no banco
    public CalculadoraService(ImpressoraRepository impressoraRepository) {
        this.impressoraRepository = impressoraRepository;
    }

    public double calcularPrecoMarketplace(
            double pesoPeca, double precoRolo, double pesoRolo,
            double horasImpressao, double precoKwh,
            double tempoTrabalhoMin, double valorHoraTrabalho,
            double markupDesejado, double taxaMarketplace, Long impressoraId) {

        // busca a impressora pelo ID
        // Se o usuário mandar um ID que não existe, ele devolve um erro
        Impressora impressora = impressoraRepository.findById(impressoraId)
                .orElseThrow(() -> new RuntimeException("Impressora não encontrada no banco!"));

        double precoPorGrama = precoRolo / pesoRolo;
        double custoFilamento = pesoPeca * precoPorGrama;


        double consumoKw = impressora.getPotenciaWatts() / 1000.0;
        double custoEnergia = consumoKw * horasImpressao * precoKwh;

        double depreciacaoPorHora = impressora.getPrecoImpressora() / impressora.getVidaUtilHoras();
        double custoDepreciacao = depreciacaoPorHora * horasImpressao;

        double manutencaoPorHora = impressora.getManutencaoAno() / impressora.getHorasUsoAno();
        double custoManutencao = manutencaoPorHora * horasImpressao;

        double horasTrabalhadas = tempoTrabalhoMin / 60.0;
        double custoMaoDeObra = horasTrabalhadas * valorHoraTrabalho;

        double custoTotal = custoFilamento + custoEnergia + custoDepreciacao + custoManutencao + custoMaoDeObra;
        double subtotalComLucro = custoTotal + (custoTotal * markupDesejado);
        double divisorTaxa = 1.0 - taxaMarketplace;
        double precoDeVenda = subtotalComLucro / divisorTaxa;

        return Math.round(precoDeVenda * 100.0) / 100.0;
    }
}