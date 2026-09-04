package com.hsprints3d.model;

import java.util.List;

public record BackupDTO(
        List<Impressora> impressoras,
        List<Cliente> clientes,
        List<Orcamento> orcamentos
) {}
