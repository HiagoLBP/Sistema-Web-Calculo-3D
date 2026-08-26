package com.hsprints3d.model;

public record CalculoRequest(
        double pesoPeca,
        double precoRolo,
        double pesoRolo,
        double potenciaWatts,
        double horasImpressao,
        double precoKwh,
        double precoImpressora,
        double vidaUtilHoras,
        double manutencaoAno,
        double horasUsoAno,
        double tempoTrabalhoMin,
        double valorHoraTrabalho,
        double markupDesejado,
        double taxaMarketplace
) {}
