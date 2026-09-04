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
    private boolean vendido = false;

    private double custoMaterial;
    private double custoEnergia;
    private double custoManutencao;
    private double custoDepreciacao;
    private double custoMaoDeObra;
    private double valorLucro;
    private double valorTaxa;

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    private String statusPedido = "Pendente";
    private String dataPrevisaoEntrega;

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

    public boolean isVendido() {
        return vendido;
    }

    public void setVendido(boolean vendido) {
        this.vendido = vendido;
    }

    public double getCustoMaterial() {
        return custoMaterial;
    }

    public void setCustoMaterial(double custoMaterial) {
        this.custoMaterial = custoMaterial;
    }

    public double getCustoEnergia() {
        return custoEnergia;
    }

    public void setCustoEnergia(double custoEnergia) {
        this.custoEnergia = custoEnergia;
    }

    public double getCustoManutencao() {
        return custoManutencao;
    }

    public void setCustoManutencao(double custoManutencao) {
        this.custoManutencao = custoManutencao;
    }

    public double getCustoDepreciacao() {
        return custoDepreciacao;
    }

    public void setCustoDepreciacao(double custoDepreciacao) {
        this.custoDepreciacao = custoDepreciacao;
    }

    public double getCustoMaoDeObra() {
        return custoMaoDeObra;
    }

    public void setCustoMaoDeObra(double custoMaoDeObra) {
        this.custoMaoDeObra = custoMaoDeObra;
    }

    public double getValorLucro() {
        return valorLucro;
    }

    public void setValorLucro(double valorLucro) {
        this.valorLucro = valorLucro;
    }

    public double getValorTaxa() {
        return valorTaxa;
    }

    public void setValorTaxa(double valorTaxa) {
        this.valorTaxa = valorTaxa;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public String getStatusPedido() {
        return statusPedido;
    }

    public void setStatusPedido(String statusPedido) {
        this.statusPedido = statusPedido;
    }

    public String getDataPrevisaoEntrega() {
        return dataPrevisaoEntrega;
    }

    public void setDataPrevisaoEntrega(String dataPrevisaoEntrega) {
        this.dataPrevisaoEntrega = dataPrevisaoEntrega;
    }
}
