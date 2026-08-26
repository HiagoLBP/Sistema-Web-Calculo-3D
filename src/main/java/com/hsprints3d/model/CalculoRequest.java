package com.hsprints3d.model;


public record CalculoRequest(
        double pesoPeca,
        double precoRolo,
        double pesoRolo,
        double horasImpressao,
        double precoKwh,
        double tempoTrabalhoMin,
        double valorHoraTrabalho,
        double markupDesejado,
        double taxaMarketplace,
        Long impressoraId
) {}
