<?php


class ExamPeriod extends Data implements _State
{
    protected int $id = 0, $gradeId = 0, $sessionId = 0, $ay = 0;
    protected ?string $begin = null, $end = null;
    protected string $etat = ExamPeriod::PENDING;
    protected ?Grade $grade = null;
    protected ?AcademicYear $academic = null;
    protected ?Sessions $session = null;

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return int
     */
    public function getGradeId()
    {
        return $this->gradeId;
    }

    /**
     * @param int $gradeId
     */
    public function setGradeId(int $gradeId)
    {
        $this->gradeId = $gradeId;
        $this->grade = Grade::getById($this->gradeId);
        return $this;
    }

    /**
     * @return int
     */
    public function getSession()
    {
        return $this->session;
    }

    /**
     * @param int $session
     */
    public function setSession(int $session)
    {
        $this->sessionId = $session;
        $this->session = Sessions::getById($session);
        return $this;
    }

    /**
     * @return string|null
     */
    public function getBegin()
    {
        return $this->begin;
    }

    /**
     * @param string|null $begin
     */
    public function setBegin(?string $begin)
    {
        $this->begin = $begin;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getEnd()
    {
        return $this->end;
    }

    /**
     * @param string|null $end
     */
    public function setEnd(?string $end)
    {
        $this->end = $end;
        return $this;
    }

    /**
     * @return string
     */
    public function getEtat()
    {
        return $this->etat;
    }

    /**
     * @param string $etat
     */
    protected function setEtat(string $etat)
    {
        $etat = strtoupper($etat);
        $allowed = [self::PENDING, self::OPEN, self::TERMINATED];
        if(!in_array($etat,$allowed)) {
            $etat = self::PENDING;
        }
        $this->etat = $etat;
        return $this;
    }

    /**
     * @return int
     */
    public function getAcademicYearId(): int
    {
        return $this->ay;
    }

    /**
     * @return Grade|null
     */
    public function getGrade()
    {
        return $this->grade;
    }

    /**
     * @return AcademicYear|null
     */
    public function getAcademic()
    {
        return $this->academic;
    }

    function save()
    {
        if(!$this->session->isDateIncluded($this->begin)){
            return _str["general.date.invalid"]. " [ ".$this->begin." ]";
        }
        if(!$this->session->isDateIncluded($this->end)){
            return _str["general.date.invalid"]. " [ ".$this->end." ]";
        }
        if($this->id && $this->etat != self::PENDING){
            return _str["exam.period.locked"];
        }
        $data = [
            'p1'=>$this->sessionId,
            'p2'=>$this->begin,
            'p3'=>$this->end,
            'p4'=>$this->gradeId,
            'p5'=>$this->etat,
            'p6'=>$this->id ? $this->ay : Storage::$currentYear->getId()
        ];
        $db = null;
        if(!$this->id) {
            $db = Storage::Connect()->prepare("insert into exam_period(session, date_debut, date_fin, niveau, etat, annee_academique) values(:p1,:p2,:p3,:p4,:p5,:p6)");
            $db->execute($data);
        }
        else{
            $db = Storage::Connect()->prepare("update exam_period set session=:p1, date_debut=:p2, date_fin=:p3, niveau=:p4, etat=:p5 where id=:p7");
            $data["p7"]= $this->id;
            $db->execute($data);
        }
        $db->closeCursor();
        return null;
    }

    function delete()
    {
        if(!$this->id){
            return _str["exam.period.invalid"];
        }
        else if($this->etat != self::PENDING){
            return _str["exam.period.locked"];
        }
        $msg = null;
        $db = Storage::Connect()->prepare("delete from exam_period where id=:p1");
        $db->execute(['p1'=>$this->id]);
        $db->closeCursor();

        return null;
    }

    function hydrate(array $data)
    {
        $this->id = (int) $data['id'];
        $this->begin = $data['date_debut'];
        $this->end = $data["date_fin"];
        $this->setSession((int) $data["session"]);
        $this->setGradeId((int) $data["niveau"]);
        $this->etat = $data["etat"];
        $this->ay = (int) $data["annee_academique"];
        return $this;
    }

    function data(){
        return [
          "id"=>$this->id,
          "begin"=>$this->begin,
          "end"=>$this->end,
          "session"=>$this->sessionId,
          "academic"=>$this->ay,
          "etat"=>$this->etat,
          "grade"=>$this->gradeId
        ];
    }

    function isDateSupported(string $date){
        $db = Storage::Connect()->prepare("select * from exam_period where id=:p1 and :p2 between date_debut and date_fin");
        $db->execute([
            'p1'=>$this->id,
            'p2'=>$date
        ]);
        $r = $db->rowCount() > 0;
        $db->closeCursor();
        return $r;
    }

    static function fetchAll()
    {
        $list = [];
        $group = [];
        $db = Storage::Connect()->prepare("select * from exam_period where version > :p98");
        $db->execute([
            "p98"=>Version::getUserQuery()
        ]);
        while($data = $db->fetch()){
            $index = $data["date_debut"]."::".$data["date_fin"];
            if(!isset($group[$index])) {
                $group[$index] = [
                    "begin"=>$data["date_debut"],
                    "end"=>$data["date_fin"],
                    "session"=>$data["session"],
                    "academic"=>$data["annee_academique"],
                    "group"=>[]
                ];
            }
            $group[$index]["group"][] = (new ExamPeriod())->hydrate($data);
        }
        foreach($group as $item){
            $list[] = $item;
        }
        $db->closeCursor();
        return $list;
    }

    public static function periodAlreadyTaken(ExamPeriod $period)
    {
        $db = Storage::Connect()->prepare("select * from exam_period where 
                                    id != :p3 and 
                                    (
                                        (:p1 between date_debut and date_fin)
                                        or
                                        (:p2 between  date_debut and date_fin)
                                    )
                                ");
        $db->execute([
            'p1' => $period->begin,
            'p2'=> $period->end,
            'p3'=>$period->id
        ]);
        $r = $db->rowCount() > 0;
        $db->closeCursor();
        return $r;
    }

    public static function getById(int $id){
        $r = null;
        $db = Storage::Connect()->prepare("select * from exam_period where id=:p1");
        $db->execute([
            'p1'=>$id
        ]);
        if($db->rowCount()){
            $r = (new ExamPeriod())->hydrate($db->fetch());
        }
    }

    public static function getByDate(string $date){
        $date = (new AkaDateTime($date))->getDate();
        $db = Storage::Connect()->prepare("select * from exam_period where :p1 between date_debut and date_fin");
        $db->execute(['p1'=>$date]);
        $period = null;
        if($db->rowCount()){
            $period = (new ExamPeriod())->hydrate($db->fetch());
        }
        $db->closeCursor();
        return $period;
    }
}