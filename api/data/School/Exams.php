<?php


class Exams extends Data implements _State
{
    protected int $id, $courseId, $periodId;
    protected ?string $beginDate = null, $beginHour = null, $duration = null, $etat = 'A';
    protected array $rooms = [];
    protected ?ExamPeriod $period = null;
    protected ?Course $course = null;

    /**
     * @return int
     */
    public function getId(): int
    {
        return $this->id;
    }

    /**
     * @return int
     */
    public function getCourseId()
    {
        return $this->courseId;
    }

    /**
     * @param int $courseId
     */
    public function setCourseId(int $courseId)
    {
        $this->courseId = $courseId;
        return $this;
    }

    /**
     * @param int $roomId
     * @return RuntimeMessage
     */
    public function setRooms(array $roomsId, bool $reassign = false)
    {
        $msg = new RuntimeMessage();
        $this->rooms = $reassign ? [] : [];
        $examRooms = [];
        $room = null;
        $err = false;
        foreach($roomsId as $id){
            $room = Room::getById((int) $id);
            if($room){
                $rooms[] = $room;
                $examRooms[] = (new ExamsRoom())->setRoomId($room->getId())->setExamId($this->id);
            }
            else{
                $msg->setMessage(_str["exam.roomid.invalid"]);
                $msg->setError(true);
                $err = true;
                break;
            }
        }
        if($err){
            return $msg;
        }
        $msg->setError(false);
        foreach($examRooms as $examsRoom){
            $txt = $examsRoom->save();
            if($txt){
                $msg->setMessage($txt, true);
            }
        }
        return $msg;
    }

    /**
     * @return int
     */
    public function getPeriodId(): int
    {
        return $this->periodId;
    }

    /**
     * @param int $periodId
     */
    public function setPeriodId(int $periodId)
    {
        $this->periodId = $periodId;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getBeginDate()
    {
        return $this->beginDate;
    }

    /**
     * @param string|null $beginDate
     */
    public function setBeginDate(string $beginDate)
    {
        $this->beginDate = (new AkaDateTime($beginDate))->getDate();
        return $this;
    }

    /**
     * @return string|null
     */
    public function getBeginHour()
    {
        return $this->beginHour;
    }

    /**
     * @param string|null $beginHour
     */
    public function setBeginHour(string $beginHour)
    {
        $this->beginHour = (new AkaDateTime($beginHour))->getTime();
        return $this;
    }

    /**
     * @return string|null
     */
    public function getDuration()
    {
        return $this->duration;
    }

    /**
     * @param string|null $duration
     */
    public function setDuration(string $duration)
    {
        $this->duration = (new AkaDateTime($duration))->getTime();
        return $this;
    }

    /**
     * @return Room<Array>|null
     */
    public function getRooms()
    {
        return $this->rooms;
    }

    /**
     * @return ExamPeriod|null
     */
    public function getPeriod()
    {
        return $this->period;
    }

    /**
     * @return Course|null
     */
    public function getCourse()
    {
        return $this->course;
    }

    /**
     * @return string|null
     */
    public function getEtat()
    {
        return $this->etat;
    }

    /**
     * @param string|null $etat
     */
    private function setEtat(string $etat)
    {
        $this->etat = $etat;
        return $this;
    }

    function save()
    {
        if(!$this->id){
            if($this->etat != self::PENDING) {
                return _str["exam.state.violation"];
            }
            if(self::courseAlreadyPlanned($this)){
                return _str["exam.duplicated"];
            }
        }
        if($this->etat != self::PENDING){
            return _str["exam.locked"];
        }
        $this->period = ExamPeriod::getById($this->periodId);
        if(!$this->period){
            return _str["exam.period.invalid"];
        }
        if(!$this->period->isDateSupported($this->beginDate)){
            return _str["exam.date.incompatible"];
        }
        if($this->period->getEtat() != ExamPeriod::PENDING){
            return _str["exam.period.locked.error"];
        }
        $db = null;
        $data = [
            'p1' => $this->courseId,
            'p2' => $this->beginDate + " " + $this->beginHour,
            'p3' => $this->periodId,
            'p5'=>$this->duration
        ];
        if(!$this->id) {
            $db = Storage::Connect()->prepare("insert into examens(cours, date, period, duration) values(:p1,:p2,:p3,:p5)");
            $db->execute($data);
        }
        else{
            $db = Storage::Connect()->prepare("update examens set cours =:p1, date = :p2, period=:p3,duration=:p5 where id=:p6");
            $data["p6"] = $this->id;
            $db->execute($data);
        }
        $db->closeCursor();
        return null;
    }

    function delete()
    {
        if(!$this->id){
            return _str["exam.invalid"];
        }
        if($this->etat != self::PENDING){
            return _str["exam.locked"];
        }
        $db = Storage::Connect()->prepare("delete from examens where id=:p1");
        $db->execute(['p1'=>$this->id]);
        $db->closeCursor();
        return null;
    }

    function hydrate(array $data)
    {
        $this->id = (int) $data["id"];
        $this->courseId = (int) $data["cours"];
        $this->beginDate = explode(" ",$data["date"])[0];
        $this->beginHour = explode(" ",$data["date"])[1];
        $this->duration = $data["duration"];
        $this->periodId = (int) $data["period"];
        $this->course = Course::getById($this->courseId);
        $this->period = ExamPeriod::getById($this->periodId);
        $this->etat = $data["etat"];

        return $this;
    }

    static function fetchAll()
    {
        // TODO: Implement fetchAll() method.
    }

    static function getById(int $id){
        $r = null;
        $db = Storage::Connect()->prepare("select * from examens where id=:p1");
        $db->execute(['p1'=>$id]);
        if($db->rowCount()){
            $r = (new Exams())->hydrate($db->fetch());
        }
        return $r;
    }

    static function courseAlreadyPlanned(Exams $exam){
        $db = Storage::Connect()->prepare("select * from examens where id != :p3 cours=:p1 and period=:p2");
        $db->execute([
            'p1'=>$exam->courseId,
            'p2'=>$exam->periodId,
            'p3'=>$exam->id
        ]);
        $r = $db->rowCount() > 0;
        $db->closeCursor();
        return $r;
    }
}