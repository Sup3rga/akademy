<?php

use PhpOffice\PhpSpreadsheet\Calculation\MathTrig\Exp;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx;
use System\Log;

class Student extends _Student_ {
    public function hydrate(array $data)
    {
        return parent::hydrate($data);
    }

    function save($a = null, $b = null){
        $this->setCriterias([
           "adresse"=>"civil.address.required",
            "sexe"=>"civil.gender.required",
            "lieu_naissance"=>"civil.birthplace.required",
            "date_naissance"=>"civil.birthdate.required",
            "personne_ref"=>"civil.person.ref.required",
            "telephone_ref"=>"civil.phone.ref.required",
            "_niveau"=>"civil.grade.required"
        ]);
        $msg = parent::save($this);

        if($msg) return $msg; 

        $db = null;
        $data = [
            "p1"=>$this->id,
            "p2"=>$this->_niveau,
            "p3"=>$this->personne_ref,
            "p4"=>$this->telephone_ref,
            "p99"=>Version::get()
        ];
        if(!$this->id){
           $db = Storage::Connect()->prepare("insert into 
                                                etudiants(identite,niveau,personne_reference,telephone_reference,etat,version)
                                                values(:p1,:p2,:p3,:p4,'A',:p99)");
            $data["p1"] = $this->identite;
        }
        else{
           $db = Storage::Connect()->prepare("update etudiants set niveau=:p2,personne_reference=:p3,telephone_reference=:p4,version=:p99 where id=:p1");
        }
        $db->execute($data);

        return $msg;
    }
}