package com.hsprints3d.controller;

import com.hsprints3d.model.BackupDTO;
import com.hsprints3d.model.Impressora;
import com.hsprints3d.model.Orcamento;
import com.hsprints3d.repository.ImpressoraRepository;
import com.hsprints3d.repository.OrcamentoRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/backup")
public class BackupController {

    private final ImpressoraRepository impressoraRepo;
    private final OrcamentoRepository orcamentoRepo;

    public BackupController(ImpressoraRepository impressoraRepo, OrcamentoRepository orcamentoRepo) {
        this.impressoraRepo = impressoraRepo;
        this.orcamentoRepo = orcamentoRepo;
    }

    @GetMapping("/exportar")
    public ResponseEntity<BackupDTO> exportarBackup(){
        List<Impressora> impressoras = impressoraRepo.findAll();
        List<Orcamento> orcamentos = orcamentoRepo.findAll();

        BackupDTO backup = new BackupDTO(impressoras, orcamentos);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=backup_3d.json");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_JSON)
                .body(backup);
    }

    @PostMapping("/importar")
    public ResponseEntity<String> importarBackup(@RequestBody BackupDTO backup){

        // Se quiser que o backup substitua tudo apagando o banco atual, basta descomentar as duas linhas abaixo:
        // impressoraRepo.deleteAll();
        // orcamentoRepo.deleteAll();

        if(backup.impressoras() != null){
            impressoraRepo.saveAll(backup.impressoras());
        }
        if(backup.orcamentos() != null){
            orcamentoRepo.saveAll(backup.orcamentos());
        }

        return ResponseEntity.ok("Backup restaurado com sucesso!");
    }


}
