<?php

class AcademicYear extends _AcademicYear_
{
    protected $nb_filiere = 0;

    public function getNbBranch()
    {
        return $this->nb_filiere;
    }

    protected function fetchStat(){
        $db = Storage::Connect();
        //cours
        $chk = $db->prepare("select count(*) as cours from 
            (select DISTINCT c.id from cours c, dispensation h where h.cours = c.id and c.annee_academique = :p1) as fl_cours");
        $chk->execute(["p1"=> $this->id]);
        if($chk->rowCount() > 0){
            $this->nb_cours = (int) $chk->fetch()["cours"];
        }
        //Prof
        $chk = $db->prepare("select count(*) as prof from 
            (select DISTINCT p.id from professeurs p, cours c, dispensation h where 
            (c.titulaire = p.id or c.suppleant = p.id) and h.cours = c.id and c.annee_academique in 
            (select y.id from annee_academique a, annee_academique y where a.annee_debut <= YEAR(NOW()) and a.annee_debut >= y.annee_debut and a.id = :p1)) as fl_prof");
        $chk->execute(["p1"=> $this->id]);
        if($chk->rowCount() > 0){
            $this->nb_prof = (int) $chk->fetch()["prof"];
        }
        //Etudiant
        $chk = $db->prepare("select distinct count(e.id) as etu from etudiants e, niveau n, filieres f 
        where e.niveau=n.id and n.filiere=f.id and f.annee_academique in 
         (select DISTINCT y.id from annee_academique a, annee_academique y where a.annee_debut <= YEAR(NOW()) and a.id = :p1 and a.annee_debut >= y.annee_debut)");
        $chk->execute(["p1"=> $this->id]);
        if($chk->rowCount() > 0){
            $this->nb_etu = (int) $chk->fetch()["etu"];
        }
        //Filières
        $chk = $db->prepare("select count(id) as fil from filieres where annee_academique in 
        (select y.id from annee_academique a, annee_academique y where a.annee_debut <= YEAR(NOW()) and a.id = :p1 and a.annee_debut >= y.annee_debut)");
        $chk->execute(["p1"=> $this->id]);
        if($chk->rowCount() > 0){
            $this->nb_filiere = (int) $chk->fetch()["fil"];
        }
        $chk->closeCursor();
        return $this;
    }

    protected function promoteStudents(){
        $db = Storage::Connect();
        foreach(Student::$list as $s){
            if($s->getEtat() == "A") {
                $average = $s->getAverageByAcademic();
                $pass = $average >= 65;
                if($pass){
                    $data = [];
                    if ($s->getNiveauData()->isTerminal()) {
                        $db = $db->prepare("update etudiants set etat='T' where id=:p1");
                    } else {
                        $db = $db->prepare("update etudiants set niveau=:p2 where id=:p1");
                        $data["p2"] = $s->getNiveauData()->next();
                    }
                    $data["p1"] = $s->getId();
                    $db->execute();
                    $db->closeCursor();
                }
            }
        }
        return $this;
    }

    public function passToNextYear(){
        $r = "";
        $list = Student::$list;
        $all = count($list);
        $session = 2;
        $total = [];
        foreach($list as $s){
            if($s->getEtat() ==  "A"){
                for($i = 1; $i <= $session; $i++) {
                    if(!isset($total[$i - 1])){
                        $total[$i - 1] = 0;
                    }
                    if ($s->hasAllNotes($i)) {
                        $total[$i - 1]++;
                    }
                }
            }
            else{
                for($i = 1; $i <= $session; $i++) {
                    if (!isset($total[$i - 1])) {
                        $total[$i - 1] = 0;
                    }
                    $total[$i - 1]++;
                }
            }
        }

        if(count($total)) {
            for ($i = 1; $i <= $session; $i++) {
                if ($all - $total[$i - 1] > 0) {
                    $r .= ($r == null ? "" : " and ") . ($all - $total[$i - 1]) . " student" . ($all - $total[$i - 1] > 1 ? "s don't have all their grades yet" : " doesn't have all his grades yet") . " for session " . $i;
                }
            }
        }
        else{
            $r = "Empty session !";
        }
        $r = strlen($r) == 0 ? null : $r;
        if($r == null){
            $this->promoteStudents();
            $this->goToNextYear();
            Storage::update($this);
        }
        return $r;
    }

    protected function goToNextYear(){
        if($this->isLastKnownYear()){
            $db = Storage::Connect();
            $db = $db->prepare("insert into annee_academique (academie, debut, fin, annee_debut, annee_fin, etat)
                values(CONCAT(YEAR(:p1 + INTERVAL 1 YEAR),'-',YEAR(:p2 + INTERVAL 1 YEAR)), 
                :p1 + INTERVAL 1 YEAR, :p2 + INTERVAL 1 YEAR, YEAR(:p1 + INTERVAL 1 YEAR), YEAR(:p2 + INTERVAL 1 YEAR), 'O')");
            try {
                $db->execute([
                    "p1" => $this->debut,
                    "p2" => $this->fin
                ]);
            }catch (Exception $e){
                \System\Log::printStackTrace($e);
                \System\Log::print("[Dates]".$this->fin." / ".$this->debut);
            }
            $db->closeCursor();
        }
        else{
            self::setState($this->next()->getId(), true);
            self::setState($this->id, false);
        }
    }

    public function data(){
        return [
            "academie" => $this->academie,
            "debut" => $this->debut,
            "fin" => $this->fin,
            "etat" => $this->etat,
            "annee_debut" => $this->annee_debut,
            "annee_fin" => $this->annee_fin,
            "id" => $this->id,
            "nb_cours" => $this->nb_cours,
            "nb_prof" => $this->nb_prof,
            "nb_etu" => $this->nb_etu,
            "nb_filiere" => $this->nb_filiere,
            "sessions"=> Sessions::fetchAll($this)
        ];
    }
}