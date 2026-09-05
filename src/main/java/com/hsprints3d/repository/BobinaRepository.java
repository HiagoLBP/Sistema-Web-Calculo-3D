package com.hsprints3d.repository;


import com.hsprints3d.model.Bobina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BobinaRepository extends JpaRepository<Bobina, Long> {
}
