package com.hsprints3d.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Orcamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double precoFinal;
    private Double custoMaterial;
    private Double custoEnergia;
    private Double custoManutencao;
    private Double custoDepreciacao;
    private Double custoMaoDeObra;
    private Double valorLucro;
    private Double valorTaxa;

    private LocalDateTime dataCalculo = LocalDateTime.now();
    private boolean vendido = false;
    private String statusPedido = "Pendente";
    private String dataPrevisaoEntrega;

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @OneToMany(mappedBy = "orcamento", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemOrcamento> itens = new ArrayList<>();

    public Orcamento() {}

    public void adicionarItem(ItemOrcamento item) {
        itens.add(item);
        item.setOrcamento(this);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Double getPrecoFinal() { return precoFinal; }
    public void setPrecoFinal(Double precoFinal) { this.precoFinal = precoFinal; }

    public Double getCustoMaterial() { return custoMaterial; }
    public void setCustoMaterial(Double custoMaterial) { this.custoMaterial = custoMaterial; }

    public Double getCustoEnergia() { return custoEnergia; }
    public void setCustoEnergia(Double custoEnergia) { this.custoEnergia = custoEnergia; }

    public Double getCustoManutencao() { return custoManutencao; }
    public void setCustoManutencao(Double custoManutencao) { this.custoManutencao = custoManutencao; }

    public Double getCustoDepreciacao() { return custoDepreciacao; }
    public void setCustoDepreciacao(Double custoDepreciacao) { this.custoDepreciacao = custoDepreciacao; }

    public Double getCustoMaoDeObra() { return custoMaoDeObra; }
    public void setCustoMaoDeObra(Double custoMaoDeObra) { this.custoMaoDeObra = custoMaoDeObra; }

    public Double getValorLucro() { return valorLucro; }
    public void setValorLucro(Double valorLucro) { this.valorLucro = valorLucro; }

    public Double getValorTaxa() { return valorTaxa; }
    public void setValorTaxa(Double valorTaxa) { this.valorTaxa = valorTaxa; }

    public LocalDateTime getDataCalculo() { return dataCalculo; }
    public void setDataCalculo(LocalDateTime dataCalculo) { this.dataCalculo = dataCalculo; }

    public boolean isVendido() { return vendido; }
    public void setVendido(boolean vendido) { this.vendido = vendido; }

    public String getStatusPedido() { return statusPedido; }
    public void setStatusPedido(String statusPedido) { this.statusPedido = statusPedido; }

    public String getDataPrevisaoEntrega() { return dataPrevisaoEntrega; }
    public void setDataPrevisaoEntrega(String dataPrevisaoEntrega) { this.dataPrevisaoEntrega = dataPrevisaoEntrega; }

    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }

    public List<ItemOrcamento> getItens() { return itens; }
    public void setItens(List<ItemOrcamento> itens) {
        this.itens = itens;
        if (this.itens != null) {
            for (ItemOrcamento item : this.itens) {
                item.setOrcamento(this);
            }
        }
    }
}