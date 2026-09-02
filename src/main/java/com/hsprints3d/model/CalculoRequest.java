package com.hsprints3d.model;

import jakarta.validation.constraints.Min;

public record CalculoRequest(
        @Min(value = 0, message = "O peso da peça não pode ser negativo.")
        double pesoPeca,

        @Min(value = 0, message = "O preço do rolo não pode ser negativo.")
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
