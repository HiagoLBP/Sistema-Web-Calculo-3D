package com.hsprints3d.dto;

public record CalculoResponse(
        double custoMaterial,
        double custoEnergia,
        double custoManutencao,
        double custoDepreciacao,
        double custoMaoDeObra,
        double valorLucro,
        double valorTaxa,
        double valorFinal
) {}
