<?php

use PhpOffice\PhpSpreadsheet\Calculation\MathTrig\Exp;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx;
use System\Log;

abstract class _Student_ extends Civil implements _StudentState {
    protected $personne_ref, $telephone_ref, $etat;
    protected $_niveau = 0, $_annee_academique = 0, $id = 0;
    protected ?Grade $niveau;
    protected array $promotionTraces = [];
    public static $list = [];

    public function getNiveauData(){
        return $this->niveau;
    }

    public function getPersonneRef(){
        return $this->personne_ref;
    }

    public function setPersonneRef(string $personne_ref) {
        $this->personne_ref = $personne_ref;
        return $this;
    }

    public function getTelephoneRef(){
        return $this->telephone_ref;
    }

    public function setTelephoneRef(string $telephone_ref) {
        $this->telephone_ref = $telephone_ref;
        return $this;
    }

    public function getEtat() {
        return $this->etat;
    }

    public function setEtat(string $etat) {
        $etat = strtoupper($etat);
        $this->etat = $etat;
        $r = "Invalid state given !";
        if(!CheckIf::inArray($etat, ["A","T","D","E"])) return $r;
        $r = "This operation was rejected because the student is not in the last grade !";
        if($etat == "T" && !Grade::getById($this->_niveau)->isTerminal()) return $r;
        $r = null;
        $db = Storage::Connect();
        $db = $db->prepare("update etudiants set etat=:p1 where id=:p2");
        try {
            $db->execute([
                "p1" => $etat,
                "p2" => $this->id
            ]);
            Storage::update($this);
        }catch(Exception $e) {
            \System\Log::printStackTrace($e);
            $r = "An error occured during operation !";
        }
        $db->closeCursor();
        return $r;
    }

    public function getNiveau() {
        return $this->_niveau;
    }

    public function setNiveau(int $_niveau) {
        $this->_niveau = $_niveau;
        return $this;
    }

    public function getAnneeAcademique() {
        return $this->_annee_academique;
    }

    public function getId() {
        return $this->id;
    }

    public function setId(int $id) {
        $this->id = $id;
        return $this;
    }

    public function getCode() {
        return parent::getCode();
    }

    public function setCode(string $code) {
        parent::setCode($code);
        return $this;
    }
    
    public function getNom() {
        return parent::getNom();
    }

    public function setNom(string $nom) {
        parent::setNom($nom);
        return $this;
    }

    public function setProfil($photo){
        parent::uploadPhoto($photo);
        return $this;
    }

    public function getPrenom() {
        return parent::getPrenom();
    }

    public function setPrenom(string $prenom) {
        parent::setPrenom($prenom);
        return $this;
    }

    public function getFullName(){
        return $this->nom . " " . $this->prenom;
    }

    public function getSexe() {
        return parent::getSexe();
    }

    public function setSexe(string $sexe) {
        parent::setSexe($sexe);
        return $this;
    }

    public function getAdresse() {
        return parent::getAdresse();
    }

    public function setAdresse(string $adresse) {
        parent::setAdresse($adresse);
        return $this;
    }

    public function getEmail(){
        return parent::getEmail();
    }

    public function setEmail(string $email) {
        parent::setEmail($email);
        return $this;
    }

    public function getLieu_naissance() {
        return parent::getLieu_naissance();
    }

    public function setLieu_naissance(string $lieu_naissance) {
        parent::setLieu_naissance($lieu_naissance);
        return $this;
    }

    public function getDate_naissance() {
        return parent::getDate_naissance();
    }

    public function setDate_naissance(string $date_naissance) {
        parent::setDate_naissance($date_naissance);
        return $this;
    }

    public function getNif() {
        return parent::getNif();
    }

    public function setNif(string $nif) {
        parent::setNif($nif);
        return $this;
    }

    public function getNinu() {
        return parent::getNinu();
    }

    public function setNinu(string $ninu) {
        parent::setNinu($ninu);
        return $this;
    }

    public function getTelephone() {
        return parent::getTelephone();
    }

    public function setTelephone($telephone) {
        parent::setTelephone($telephone);
        return $this;
    }

    public function getPhoto() {
        return parent::getPhoto();
    }

    public function setPhoto($photo) {
        parent::setPhoto($photo);
        return $this;
    }

    public function getMemo() {
        return parent::getMemo();
    }

    public function setMemo($memo) {
        parent::setMemo($memo);
        return $this;
    }

    public function save($target = null, $e = null)
    {
        $target = $target ? $target : $this;
        $r = _str["civil.person.ref.fullname.incorrect"];
        if($this->personne_ref && !CheckIf::isFormalName($this->personne_ref)) return $r;
        $r = _str["civil.person.ref.phone.format.incorrect"];
        if($this->telephone_ref && !CheckIf::isPhoneNumber($this->telephone_ref)) return $r;
        $r = _str["grade.invalid"];
        if($this->_niveau && !Grade::getById($this->_niveau)) return $r;
        return parent::save($target);
    }
    
    public function save_student(){
        $r = "Execution error";
        if(
            $this->code == null || $this->nom == null || $this->prenom == null || $this->sexe == null ||
            $this->adresse == null || $this->lieu_naissance == null || $this->date_naissance == null ||
            $this->_niveau == 0 || $this->email == null || $this->nif == null || $this->ninu == null ||
            ($this->id != 0 && $this->identite == 0) || ($this->identite != 0 && $this->id == 0) ||
            $this->personne_ref == null || $this->telephone_ref == null || $this->telephone == null
        ){
            return "Invalid data given for this operation";
        }

        $r = "incorrect reference person name !";
        if(!CheckIf::isFormalName($this->personne_ref)) return $r;
        $r = "incorrect reference person phone !";
        if(!CheckIf::isPhoneNumber($this->telephone_ref)) return $r;

        $r = parent::save();
        if($r != null) return $r;
        $db = Storage::Connect();
        $data = [];
        if($this->id == 0){
            $db = $db->prepare("insert into etudiants (identite,niveau,personne_reference,telephone_reference etat) values(:p1,:p2,:p3,:p4,:p5,:p6)");
        }
        else{
            $db = $db->prepare("update etudiants set niveau=:p2,personne_reference=:p3,
                telephone_reference=:p4, etat=:p6 
                where id=:p7");
            $data["p7"] = $this->id;
        }
        $data["p1"] = $this->identite;
        $data["p2"] = $this->_niveau;
        $data["p3"] = $this->personne_ref;
        $data["p4"] = $this->telephone_ref;
        $data["p5"] = $this->id == 0 ? Storage::$currentYear->getId() : $this->_annee_academique;
        $data["p6"] = $this->id == 0 ? "A" : $this->etat;
        try {
            $db->execute($data);
            $r = null;
            Storage::update($this);
        }catch(Exception $e){
            \System\Log::printStackTrace($e);
            if($this->id == 0) {
                $this->rollback();
            }
        }
        $db->closeCursor();
        return $r;
    }

    public function delete() {
        $r = _str["general.error"];
        $db = Storage::Connect();
        $db = $db->prepare("delete from individu where id=:p1");
        try{
            $db->execute(["p1"=> $this->identite]);
            Storage::update($this);
            $r = null;
        }catch(Exception $e){
            \System\Log::printStackTrace($e);
        }
        $db->closeCursor();
        return $r;
    }

    /**
     * @param array $data
     * @return _Student_|Student
     */
    public function hydrate(array $data) {
        $this->identite = (int) $data["identite"];
        parent::init();
        $this->personne_ref = $data["personne_reference"];
        $this->telephone_ref = $data["telephone_reference"];
        $this->etat = $data["etat"];
        $this->_niveau = $data["niveau"];
        $this->id = $data["id"];
        $this->niveau = Grade::getById((int) $this->_niveau);
        $this->_annee_academique = $this->niveau->getFiliereData()->getAcademicYearId();
        $this->fetchPromotionTraces();
        return $this;
    }

    private function fetchPromotionTraces(){
        $db = Storage::Connect()->prepare("
                                select distinct s.niveau, s.annee_academique, s.salle
                                from promotion p, salle_classe s, annee_academique a
                                where 
                                    p.etudiant=:p1 and 
                                    s.id = p.salle_classe and
                                    a.id = s.annee_academique
                                order by a.academie");
        $db->execute(['p1'=>$this->id]);
        while($data = $db->fetch()){
            $this->promotionTraces[$data["annee_academique"]] = [
                "grade"=>$data["niveau"],
                "room"=>$data["salle"]
            ];
        }
        $db->closeCursor();
        return $this;
    }

    public static function fetchAll($override = false){
        if(!$override && count(self::$list) > 0){
            return self::$list;
        }
        self::$list = [];
        $db = Storage::Connect();
        $db = $db->prepare("select e.* from etudiants e, individu i where i.id = e.identite and e.version > :p98 order by i.nom, i.prenom");
        $db->execute(["p98"=>Version::getUserQuery()]);
        while($data = $db->fetch()){
            $e = new Student();
            $e->hydrate($data);
            self::$list[] = $e;
        }
        $db->closeCursor();
        return self::$list;
    }

    public function getAverage($session, $ya = 0){
        $total = 0; $somme = 0; $k = 0;
        if($ya == 0){
            $db = Storage::Connect();
            foreach(Course::getAllFromNow($this->niveau->getFiliere(), $this->niveau->getId(), $session) as $c){
                $total += $c->getCoefficient() * 100;
                $chk = $db->prepare("select note from notes where session=:p1 and id_etu=:p2 and id_cours=:p3 and annee_academique=:p4");
                $chk->execute([
                    "p1"=> $session,
                    "p2"=> $this->id,
                    "p3"=> $c->getId(),
                    "p4"=> Storage::$currentYear->getId()
                ]);
                $somme += $c->getCoefficient() * (double) $chk->fetch()["note"];
                $k++;
                $chk->closeCursor();
            }
        }
        else {
            foreach (Notes::$list as $note) {
                if ($note->getAnneeAcademique() == $ya && $note->getEtudiant() == $this->id) {
                    $c = Course::getById($note->getCours());
                    $total += $c->getCoefficient() * 100;
                    $somme += $note->getNote() * $c->getCoefficient();
                }
            }
        }
        return round((double) $somme / (double) ($total > 0 ? $total : 1) * 100, 2);
    }

    public function hasAllNotes($session, $ya = null){
        $ya = $ya == null ? Storage::$currentYear->getId() : $ya;
        $r = false;
        $db = Storage::Connect();

        foreach(Course::getAllFromNow($this->niveau->getFiliere(), $this->niveau->getId(), $session) as $c){
            $chk = $db->prepare("select id from notes where session=:p1 and id_etu=:p2 and id_cours=:p3 and annee_academique=:p4");
            $chk->execute([
                "p1" => $session,
                "p2" => $this->id,
                "p3" => $c->getId(),
                "p4" => $ya
            ]);
            $r = $chk->rowCount() > 0;
            $chk->closeCursor();
        }
        return $r;
    }

    public function getAverageByAcademic($ya = null){
        $ya = $ya == null ? Storage::$currentYear->getId() : $ya;
        return ($this->getAverage(1,$ya) + $this->getAverage(2, $ya)) / 2;
    }

    public static function getById($id){
        $r = null;
        if(count(self::$list)){
            foreach(self::$list as $e){
                if($e->getId() == $id){
                    $r = $e;
                    break;
                }
            }
            if($r != null) return $r;
        }
        $db = Storage::Connect()->prepare("select * from etudiants where id=:p1");
        try {
            $db->execute(['p1' => $id]);
            if ($db->rowCount()) {
                $r = new Student();
                $r->hydrate($db->fetch());
            }
        }catch(Exception $e){\System\Log::printStackTrace($e);}
        $db->closeCursor();
        return $r;
    }

    protected static function extractData($name){

        $acceptedRow = [
            "code", "nom", "prenom", "sexe", "adresse", "lieu naissance", "date naissance", "telephone",
            "email", "nif", "ninu", "personne reference", "telephone personne reference", "memo",
            "filiere", "niveau"
        ];

        $found = 0;

        
        $reader = new Xlsx();
        $reader->setReadDataOnly(true);
        $reader->setLoadAllSheets();
        $filter = new CellsFilter();
        $reader->setReadFilter($filter);
        $spreadsheet = $reader->load($name);

        $students = [];

        $activeSheet =  $spreadsheet->getActiveSheet();
        for($i = 1, $j = $filter->getRowCount(); $i < $j; $i++){
            $data = [];
            foreach($filter->getAvailableCells() as $column => $rows){
                $index = strtolower(CheckIf::setPonctuationLess($activeSheet->getCell($column.$rows[0])->getValue()));
                if(in_array($index, $acceptedRow)){
                    $data[$index] = !isset($rows[$i]) ? null : $activeSheet->getCell($column.$rows[$i])->getValue();
                    $found++;   
                }
            }
            if($found < count($acceptedRow)) break;
            $students[] = $data;
        }

        if($found < count($acceptedRow)){
            throw new Exception("Invalid file formatting !");
        }

        return $students;
    }

    public static function registerFromXcel($excelFilename){
        $r = null;
        $data = null;
        try{
            $data = self::extractData($excelFilename);
        }catch(Exception $e){
            $r = $e->getMessage();
        }
        if($data == null){
            $r = $r != null ? $r : "An error occured during file extraction !";
        }
        else{
            $k = 1;
            foreach($data as $row){
                $f = Faculty::getBySoundLike($row["filiere"]);
                if($f == null){
                    $r = "Unrecognized faculty name given at entry ".$k;
                    break;
                }
                else {
                    $grade = $f->getGradeSoundLike($row["niveau"]);
                    if($grade == 0){
                        $r = "Unrecognized grade name given at entry ".$k;
                        break;
                    }
                    else{
                        $s = new Student();
                        $s->setCode($row["code"]);
                        $s->setNom($row["nom"]);
                        $s->setPrenom($row["prenom"]);
                        $s->setSexe($row["sexe"]);
                        $s->setAdresse($row["adresse"]);
                        $s->setLieu_naissance($row["lieu naissance"]);
                        $s->setDate_naissance($row["date naissance"]);
                        $s->setTelephone($row["telephone"]);
                        $s->setEmail($row["email"]);
                        $s->setNiveau($grade);
                        $s->setNif($row["nif"]);
                        $s->setNinu($row["ninu"]);
                        $s->setPersonneRef($row["personne reference"]);
                        $s->setTelephoneRef($row["telephone personne reference"]);
                        $s->setMemo($row["memo"]);

                        $r = $s->save();
                        if($r != null){
                            $r = "[ Entry " . $k . " ] " . $r;
                            break;
                        }
                    }
                }
                $k++;
            }
        }
        return $r;
    }

    public function data(){
        return CheckIf::merge(parent::data(), [
            "personne_ref" => $this->personne_ref,
            "telephone_ref" => $this->telephone_ref,
            "etat" => $this->etat,
            "annee_academique" => $this->_annee_academique,
            "id" => $this->id,
            "niveau" => $this->_niveau,
            "promotion_covered"=>$this->promotionTraces
        ]);
    }

    public function is(_Student_ $other){
        return $this->id == $other->id;
    }

    public function contribute(Work $work){
        if($work->getId() <= 0){
            return _str["work.invalid"];
        }
        if($this->alreadyContribute($work)){
            return _str["work.student.contribute.error"];
        }
        $db = Storage::Connect()->prepare("update affectation_devoir set return_date=NOW() where etudiant=:p1 and devoir=:p2");
        $db->execute(['p1'=>$this->id, 'p2'=>$work->getId()]);
        $db->closeCursor();
        return null;
    }

    public function alreadyContribute(Work $work){
        $db = Storage::Connect()->prepare("select * from affectation_devoir where etudiant=:p1 and devoir=:p2");
        $db->execute(['p1'=>$this->id, 'p2'=>$work->getId()]);
        $r = $db->rowCount() > 0;
        $db->closeCursor();
        return $r;
    }

    /**
     * @param int $academicYearId
     * @return ClassRoom|int|null
     */
    function getClassRoom(bool $idOnly = false, int $academicYearId = 0){
        if($academicYearId <= 0 && AcademicYear::$current){
            $academicYearId = AcademicYear::$current->getId();
        }
        $r = null;
        $db = Storage::Connect()->prepare("select p.salle_classe from promotion p, salle_classe s where p.salle_classe = s.id and s.annee_academique = :p1 and p.etudiant=:p2");
        try {
            $db->execute([
                'p1' => $academicYearId,
                'p2'=>$this->id
            ]);
            if($db->rowCount()){
                $r = $db->fetch()["salle_classe"];
                $r = $idOnly ? $r : ClassRoom::getById((int) $r);
            }
        }catch (Exception $e){Log::printStackTrace($e);}
        $db->closeCursor();
        return $r;
    }

    static function isState(mixed &$state){
        $state = strtoupper($state);
        return
            $state == self::TOO_LATE ||
            $state == self::ONTIME ||
            $state == self::ABSCENT;
    }

    /**
     * @param array $list
     * @return RuntimeMessage
     */
    static function createListFromId(array $list){
        $students = [];
        $err = new RuntimeMessage();
        $err->setError(false);
        foreach ($list as $student_id){
            $student = Student::getById((int) $student_id);
            if($student){
                $students[] = $student;
            }
            else{
                $err->setError(true)->setMessage(_str["student.invalid"] . " [ID] " . $student_id);
                break;
            }
        }
        if(!$err->getError()){
            $err->setData($students);
        }
        return $err;
    }
}