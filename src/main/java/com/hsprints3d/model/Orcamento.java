package com.hsprints3d.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;


@Entity
public class Orcamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomePeca;
    private double pesoPeca;
    private double horasImpressao;
    private double precoFinal;

    private LocalDateTime dataCalculo = LocalDateTime.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomePeca() {
        return nomePeca;
    }

    public void setNomePeca(String nomePeca) {
        this.nomePeca = nomePeca;
    }

    public double getPesoPeca() {
        return pesoPeca;
    }

    public void setPesoPeca(double pesoPeca) {
        this.pesoPeca = pesoPeca;
    }

    public double getHorasImpressao() {
        return horasImpressao;
    }

    public void setHorasImpressao(double horasImpressao) {
        this.horasImpressao = horasImpressao;
    }

    public double getPrecoFinal() {
        return precoFinal;
    }

    public void setPrecoFinal(double precoFinal) {
        this.precoFinal = precoFinal;
    }

    public LocalDateTime getDataCalculo() {
        return dataCalculo;
    }

    public void setDataCalculo(LocalDateTime dataCalculo) {
        this.dataCalculo = dataCalculo;
    }
}
