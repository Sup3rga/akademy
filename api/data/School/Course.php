<?php

class Course extends _Course_
{
    protected $_filiere = 0;

    public function getFiliere(){
        return $this->_filiere;
    }

    public function hydrate(array $data) {
        $this->nom = $data["nom"];
        $this->_niveau = (int) $data["niveau"];
        $this->setTitulaire((int) $data["titulaire"]);
        $this->setSuppleant((int) $data["suppleant"]);
        $this->_annee_academique = (int) $data["annee_academique"];
        $this->etat = $data["etat"];
        $this->code = $data["code"];
        $this->session = (int) $data["session"];
        $this->coefficient = (int) $data["coefficient"];
        $this->id = (int) $data["id"];
        $this->annee_academique = AcademicYear::getById($this->_annee_academique)->getAcademie();
        $this->niveau = Grade::getById((int) $this->_niveau);
        $fac = $this->niveau->getFiliereData();
        $this->_filiere = $fac != null ? $fac->getId() : 0;
        $this->fetchHoraire();
        return $this;
    }

    public static function getAllFrom(int $filiere, int $niveau, int $session, int $ya = 0){
        $r = [];
        foreach(self::fetchAll() as $c){
            if($c->getEtat() == "E" && $c->getSession() == $session && $c->getAnneeAcademique() == $ya &&
                (
                    $filiere < 1 || ($filiere == $c->getFiliere() && ($niveau < 1 || $niveau == $c->getNiveau()))
                )
            ){
                $r[] = $c;
            }
        }
        return $r;
    }

    public static function getAllFromNow(int $filiere, int $niveau, int $session){
        return self::getAllFrom($filiere, $niveau, $session,Storage::$currentYear->getId());
    }

    public function data(){
//        \System\Log::println("[Name] " . $this->nom);
        return [
            "nom" => $this->nom,
            "etat" => $this->etat,
            "code" => $this->code,
            "session" => $this->session,
            "niveau" => $this->_niveau,
            "titulaire" => $this->_titulaire,
            "filiere" => $this->_filiere,
            "suppleant" => $this->_suppleant,
            "annee_academique" => $this->_annee_academique,
            "coefficient" => $this->coefficient,
            "id" => $this->id,
            "horaire" => $this->horaire,
        ];
    }

    //@Deletable
    protected static function __compareHours(
        array $h1,
        array $h2,
        string $course,
        bool $sameFac,
        bool $sameGrade,
        bool $samePrincipal,
        bool $sameSuppleant,
        bool $interPrincipal,
        bool $interSuppleant
    ){
        $r = null;
        $stop = false;
        foreach($h1 as $k => $d1){
            foreach($h2 as $j => $d2){
                $sameYear = $d1["annee_academique"] == $d2["annee_academique"];
                $s = [
                    self::sigma($d1["begin"]),
                    self::sigma($d1["end"]),
                    self::sigma($d2["begin"]),
                    self::sigma($d2["end"])
                ];
                $sameDay = (int) $d1["day"] == (int) $d2["day"];
                if(($s[0] < $s[3] && $s[1] >= $s[3] && $sameDay && $sameYear) || ($s[0] <= $s[2] && $s[1] > $s[2] && $sameDay && $sameYear)){
                    if($sameFac && $sameGrade){
                        $r = "session interval ".$d1["begin"]." - ".$d1["end"]." creates conflict with session interval ".
                            $d2["begin"]." - ".$d2["end"]." reserved for course ".$course." !";
                    }
                    if(((bool) $d1["tp"]) && ((bool) $d2["tp"]) && ($sameSuppleant || $interSuppleant) ){
                        $r = "session interval ".$d1["begin"]." - ".$d1["end"]." creates conflict with suppleant teacher availability !";
                    }
                    if(!((bool) $d1["tp"]) && !((bool) $d2["tp"]) && ($samePrincipal || $interPrincipal) ){
                        $r = "session interval ".$d1["begin"]." - ".$d1["end"]." creates conflict with principal teacher availability !";
                    }
                    if($r != null){
                        $stop = true;
                        break;
                    }
                }
            }
            if($stop) break;
        }
        return $r;
    }
}