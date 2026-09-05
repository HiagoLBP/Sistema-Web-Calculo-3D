package com.hsprints3d.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;


@Entity
public class ItemOrcamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomePeca;
    private Double pesoPeca;
    private Double horasImpressao;
    private Integer quantidade;
    private Double precoUnitario;

    @ManyToOne
    @JoinColumn(name = "orcamento_id")
    @JsonIgnore
    private Orcamento orcamento;

    public ItemOrcamento(){}

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

    public Double getPesoPeca() {
        return pesoPeca;
    }

    public void setPesoPeca(Double pesoPeca) {
        this.pesoPeca = pesoPeca;
    }

    public Double getHorasImpressao() {
        return horasImpressao;
    }

    public void setHorasImpressao(Double horasImpressao) {
        this.horasImpressao = horasImpressao;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
    }

    public Double getPrecoUnitario() {
        return precoUnitario;
    }

    public void setPrecoUnitario(Double precoUnitario) {
        this.precoUnitario = precoUnitario;
    }

    public Orcamento getOrcamento() {
        return orcamento;
    }

    public void setOrcamento(Orcamento orcamento) {
        this.orcamento = orcamento;
    }
}
