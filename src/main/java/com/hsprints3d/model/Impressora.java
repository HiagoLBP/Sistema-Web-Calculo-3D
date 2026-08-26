package com.hsprints3d.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Impressora {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    private double potenciaWatts;
    private double precoImpressora;
    private double vidaUtilHoras;
    private double manutencaoAno;
    private double horasUsoAno;


    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public double getPotenciaWatts() {
        return potenciaWatts;
    }

    public void setPotenciaWatts(double potenciaWatts) {
        this.potenciaWatts = potenciaWatts;
    }

    public double getPrecoImpressora() {
        return precoImpressora;
    }

    public void setPrecoImpressora(double precoImpressora) {
        this.precoImpressora = precoImpressora;
    }

    public double getVidaUtilHoras() {
        return vidaUtilHoras;
    }

    public void setVidaUtilHoras(double vidaUtilHoras) {
        this.vidaUtilHoras = vidaUtilHoras;
    }

    public double getManutencaoAno() {
        return manutencaoAno;
    }

    public void setManutencaoAno(double manutencaoAno) {
        this.manutencaoAno = manutencaoAno;
    }

    public double getHorasUsoAno() {
        return horasUsoAno;
    }

    public void setHorasUsoAno(double horasUsoAno) {
        this.horasUsoAno = horasUsoAno;
    }
}
