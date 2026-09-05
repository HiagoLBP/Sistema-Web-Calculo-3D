package com.hsprints3d.service;

import com.hsprints3d.dto.CalculoResponse;
import com.hsprints3d.model.Impressora;
import com.hsprints3d.repository.ImpressoraRepository;
import org.springframework.stereotype.Service;

@Service
public class CalculadoraService {

    private final ImpressoraRepository impressoraRepository;

    public CalculadoraService(ImpressoraRepository impressoraRepository) {
        this.impressoraRepository = impressoraRepository;
    }

    public CalculoResponse calcularPrecoMarketplace(
            double pesoPeca, double precoRolo, double pesoRolo,
            double horasImpressao, double precoKwh,
            double tempoTrabalhoMin, double valorHoraTrabalho,
            double markupDesejado, double taxaMarketplace, Long impressoraId) {

        Impressora impressora = impressoraRepository.findById(impressoraId)
                .orElseThrow(() -> new RuntimeException("Impressora não encontrada!"));

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
        double valorLucro = custoTotal * markupDesejado;
        double subtotalComLucro = custoTotal + valorLucro;

        double divisorTaxa = 1.0 - taxaMarketplace;
        double precoDeVenda = subtotalComLucro / divisorTaxa;
        double valorTaxa = precoDeVenda - subtotalComLucro;

        return new CalculoResponse(
                Math.round(custoFilamento * 100.0) / 100.0,
                Math.round(custoEnergia * 100.0) / 100.0,
                Math.round(custoManutencao * 100.0) / 100.0,
                Math.round(custoDepreciacao * 100.0) / 100.0,
                Math.round(custoMaoDeObra * 100.0) / 100.0,
                Math.round(valorLucro * 100.0) / 100.0,
                Math.round(valorTaxa * 100.0) / 100.0,
                Math.round(precoDeVenda * 100.0) / 100.0
        );
    }
}