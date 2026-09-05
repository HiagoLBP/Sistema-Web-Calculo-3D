package com.hsprints3d.dto;

import com.hsprints3d.model.Cliente;
import com.hsprints3d.model.Impressora;
import com.hsprints3d.model.Orcamento;

import java.util.List;

public record BackupDTO(
        List<Impressora> impressoras,
        List<Cliente> clientes,
        List<Orcamento> orcamentos
) {}
