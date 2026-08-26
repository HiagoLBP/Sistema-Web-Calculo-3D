package com.hsprints3d.controller;

import com.hsprints3d.model.CalculoRequest;
import com.hsprints3d.service.CalculadoraService;
import jakarta.annotation.Nonnull;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/calculadora")

public class CalculadoraController {

    private final CalculadoraService calculadoraService;

    public CalculadoraController(CalculadoraService calculadoraService) {
        this.calculadoraService = calculadoraService;
    }

    @PostMapping("/calcular")
    public double calcular(@Nonnull @RequestBody CalculoRequest dados){

        double precoFinal;
        precoFinal = calculadoraService.calcularPrecoMarketplace(
                dados.pesoPeca(), dados.precoRolo(), dados.pesoRolo(),
                dados.horasImpressao(), dados.precoKwh(),
                dados.tempoTrabalhoMin(), dados.valorHoraTrabalho(),
                dados.markupDesejado(), dados.taxaMarketplace(), dados.impressoraId()
        );

        return precoFinal;
    }
}
