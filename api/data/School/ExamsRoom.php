<?php

class ExamsRoom extends Data
{
    protected int $id = 0;
    protected int $examId = 0;
    protected int $roomId = 0;
    protected ?Exams $exams = null;
    protected ?Room $room = null;
    protected array $participants = [];
    protected array $surveillants = [];

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
    public function getExamId()
    {
        return $this->examId;
    }

    /**
     * @param int $examId
     */
    public function setExamId(int $examId)
    {
        $this->examId = $examId;
        $this->exams = Exams::getById($this->examId);
        return $this;
    }

    /**
     * @return Exams|null
     */
    public function getExams()
    {
        return $this->exams;
    }

    /**
     * @return array
     */
    public function getParticipants()
    {
        return $this->participants;
    }

    /**
     * @return array
     */
    public function getSurveillants()
    {
        return $this->surveillants;
    }

    /**
     * @return int
     */
    public function getRoomId()
    {
        return $this->roomId;
    }

    /**
     * @param int $roomId
     */
    public function setRoomId(int $roomId)
    {
        $this->roomId = $roomId;
        $this->room = Room::getById($this->roomId);
        return $this;
    }

    /**
     * @return Room|null
     */
    public function getRoom()
    {
        return $this->room;
    }

    function equals(ExamsRoom $examsRoom){
        return $this->id == $examsRoom->id;
    }

    function save()
    {
        if(!$this->room){
            return _str["room.invalid"];
        }
        if(!$this->exams){
            return _str["exam.period.invalid"];
        }
        if($this->room->isBusyOnDate($this->exams->getBeginDate())){
            return _str["exam.room.saturated"];
        }
        if($this->id > 0){
            return _str["exam.room.locked"];
        }
        $db = Storage::Connect()->prepare("insert into salle_examen (examen, salle) VALUES (:p1,:p2)");
        $db->execute(['p1'=>$this->examId, 'p2'=>$this->roomId]);
        $db->closeCursor();
        return null;
    }

    function addParticipant(Student $participant, bool $logisticAccess = false){
        if(!$this->id){
            return _str["exam.room.invalid"];
        }
        $partition = ["quota"=>0,"extend"=>0];
        if($logisticAccess) {
            $partition = Logistic::getRoomPartitionForExamRoom($this, $this->getExams()->getBeginDate());
            $ttl_participant = count($this->participants);
        }
        if($this->contains($participant)){
            return _str["exam.room.student.exist"]." ".$participant->getFullName();
        }
        if($logisticAccess ||  $ttl_participant < $partition["quota"] + $partition["extend"]){
            $db = Storage::Connect()->prepare("insert into composition(salle_exam, etudiant) VALUES (:p1,:p2)");
            $db->execute(['p1'=>$this->id, 'p2'=>$participant->getId()]);
            $db->closeCursor();
            return null;
        }
        else{
            return _str["exam.room.saturated"];
        }
    }

    function removeParticipant(Student $participant){
        if(!$this->id){
            return _str["exam.room.invalid"];
        }
        $partition = ["quota"=>0,"extend"=>0];
        if(!$this->contains($participant)){
            return _str["exam.room.student.exist.error"]." ".$participant->getFullName();
        }
        $db = Storage::Connect()->prepare("insert into composition(salle_exam, etudiant) VALUES (:p1,:p2)");
        $db->execute(['p1'=>$this->id, 'p2'=>$participant->getId()]);
        $db->closeCursor();
        return null;
    }

    function setAttendance(Student $participant, string $present = Student::ONTIME){
        if(!$this->contains($participant)){
            return _str["exam.room.student.exist.error"] . " [ ". $participant->getFullName() . " ]";
        }
        $present = _Student::isState($present) ? $present : Student::ONTIME;
        $db = Storage::Connect()->prepare("update composition set statut=:p2 where salle_exam=:p1 and etudiant=:p3");
        $db->execute([
            'p1'=>$this->id,
            'p2'=>$present,
            'p3'=>$participant->getId()
        ]);
        $db->closeCursor();
        return null;
    }

    function contains(Student $participant){
        $db = Storage::Connect()->prepare("select * from composition where etudiant=:p1");
        $db->execute(['p1'=>$participant->getId()]);
        $r = $db->rowCount() > 0;
        $db->closeCursor();
        return $r;
    }

    function delete()
    {
        if(!$this->id){
            return _str["exam.room.invalid"];
        }
        if(!$this->room){
            return _str["room.invalid"];
        }
        if(!$this->exams){
            return _str["exam.period.invalid"];
        }
        if($this->exams->getEtat() != Exams::PENDING){
            return _str["exam.room.locked"];
        }
        if(count($this->participants)){
            $db = Storage::Connect()->prepare("delete from composition where salle_exam=:p1");
            $db->execute(['p1'=>$this->id]);
            $db->closeCursor();
        }
        $db = Storage::Connect()->prepare("delete from salle_examen where id=:p1");
        $db->execute(['p1'=>$this->id]);
        $db->closeCursor();
        $this->id = 0;
        return null;
    }

    function hydrate(array $data)
    {
        $this->id = (int) $data["id"];
        $this->examId = (int) $data["examen"];
        $this->roomId = (int) $data["salle"];
        $this->exams = Exams::getById($this->examId);
        $this->roomId = Room::getById($this->roomId);
        $db = Storage::Connect()->prepare("select etudiant from composition where salle_exam=:p1");
        $db->execute(['p1'=>$this->id]);
        if($db->rowCount()){
            while($data = $db->fetch()){
                $this->participants[] = Student::getById((int) $data["etudiant"]);
            }
        }
        $db = Storage::Connect()->prepare("select id_surveillant from surveillant where salle_examen=:p1");
        $db->execute(['p1'=>$this->id]);
        if($db->rowCount()){
            while($data = $db->fetch()){
                $this->surveillants[] = Civil::getById((int) $data["id_surveillant"]);
            }
        }
        $db->closeCursor();
        return $this;
    }

    static function fetchAll()
    {
        // TODO: Implement fetchAll() method.
    }

    /**
     * @param int $id
     * @return ExamsRoom|null
     */
    static function getById(int $id)
    {
        $examroom = null;
        $db = Storage::Connect()->prepare("select * from salle_examen where id=:p1");
        $db->execute(['p1'=>$id]);
        if($db->rowCount()){
            $examroom = (new ExamsRoom())->hydrate($db->fetch());
        }
        $db->closeCursor();
        return $examroom;
    }

    static function createListFromId(array $list){
        $examrooms = [];
        $err = new RuntimeMessage();
        $err->setError(true);
        foreach ($list as $id){
            $examroom = self::getById((int) $id);
            if($student){
                $examrooms[] = $examroom;
            }
            else{
                $err->setError(true)->setMessage(_str["student.invalid"] . " [ID] " . $id);
                break;
            }
        }
        if(!$err->getError()){
            $err->setData($examrooms);
        }
        return $err;
    }
}