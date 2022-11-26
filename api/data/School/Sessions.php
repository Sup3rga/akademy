<?php


class Sessions extends Data implements _State
{
    protected int $id = 0, $next = 0, $number = 1, $ay = 0;
    protected ?string $begin = null, $end = null;
    protected string $etat = _State::PENDING;
    protected ?AcademicYear $academic = null;
    protected ?Sessions $nextSession = null;
    protected $stats = [
        "courses"=>0,
        "exams"=>0,
        "works"=>0
    ];
    public static ?Sessions $current = null;
    public static $list = [];

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
    public function getNext()
    {
        return $this->next;
    }

    /**
     * @param int $next
     */
    public function setNext(int $next)
    {
        $this->next = $next;
        $this->nextSession = self::getById($this->next);
        return $this;
    }

    /**
     * @return int
     */
    public function getNumber()
    {
        return $this->number;
    }

    /**
     * @param int $number
     */
    public function setNumber(int $number)
    {
        $this->number = $number;
        return $this;
    }

    /**
     * @return int
     */
    public function getAcademicYearId()
    {
        return $this->ay;
    }

    /**
     * @return string|null
     */
    public function getBegin(): ?string
    {
        return $this->begin;
    }

    /**
     * @param string|null $begin
     */
    public function setBegin(string $begin)
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
    public function setEnd(string $end)
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
    private function setEtat(string $etat)
    {
        return $this;
    }

    /**
     * @return AcademicYear|null
     */
    public function getAcademic()
    {
        return $this->academic;
    }

    /**
     * @return Sessions|null
     */
    public function getNextSession()
    {
        return $this->nextSession;
    }

    function save()
    {
        \System\Log::println("[Fake ID]" . $this->id);
        /**
         * We must have an active academic year
         */
        if(!AcademicYear::$current){
            return _str["academic.year.error"];
        }
        $begin = (new AkaDateTime($this->begin))->clearTime();
        $end = (new AkaDateTime($this->end))->clearTime();
        /**
         * The begin date must be lower than the end date
         */
        if($begin->isMoreThan($end)){
            return _str["session.date.incoherent"];
        }
        /**
         * The session must begin a workable day
         */
        if($begin->isWeekEnd()){
           return _str["session.begin.date.error"];
        }
        /**
         * If it's new, we avoid unreferenced academic year id
         */
        if(!$this->id){
            $this->ay = AcademicYear::$current->getId();
        }
        /**
         * Each session must have a unique number
         */
        if(self::numberAlreadyTaken($this)){
            return _str["session.number.exist"];
        }
        /**
         * The current session must have a precedent one if number is greater than 1
         */
        $previous = $this->getPrevious();
        if($this->number > 1 && !$previous){
            return _str["session.previousless"];
        }
        /**
         * The current session must not be in conflict with others
         */
        if($session = self::periodCreateConflict($this)){
            return _str["session.period.conflict"] . " :: " . $session->number . " => " . $session->begin . " ~ " . $session->end;
        }
        $data = [
            'p1'=>$this->number <= 0 ? null : $this->number,
            'p2'=>$this->next > 0 ? $this->next : null,
            'p3'=>$begin->getDate(),
            'p4'=>$end->getDate(),
            "p99"=>Version::get()
        ];
        if($this->id > 0) {
            $db = Storage::Connect()->prepare("update sessions set numero=:p1, suivant=:p2, date_debut=:p3, date_fin=:p4,version=:p99 where id=:p5");
            $data["p5"] = $this->id;
            try{
                $db->execute($data);
            }catch (Exception $e){\System\Log::printStackTrace($e);}
            $db->closeCursor();
        }
        else{
            $db = Storage::Connect()->prepare("insert into sessions(numero, suivant, date_debut, date_fin, annee_academique,version) values(:p1,:p2,:p3,:p4,:p6,:p99)");
            $data["p6"] = $this->ay;
            try {
                $db->execute($data);
                $current = self::getByNumber($this->number);
                if ($previous) {
                    $previous->setNext($current->getId())->save();
                }
            }catch (Exception $e){\System\Log::printStackTrace($e);}
            $db->closeCursor();
        }
        AcademicYear::getById($this->ay)->save();
        return null;
    }

    function getPrevious(){
        $db = Storage::Connect()->prepare("select * from sessions where numero = :p1 and annee_academique=:p2");
        $db->execute(['p1'=>$this->number - 1, 'p2'=>$this->ay]);
        $prev = null;
        if($db->rowCount()){
            $prev = (new Sessions())->hydrate($db->fetch());
        }
        $db->closeCursor();
        return $prev;
    }

    function delete()
    {
        if(!$this->id){
            return _str["session.invalid"];
        }
        if($this->etat != self::PENDING){
            return _str["session.locked"];
        }
        $prev = $this->getPrevious();
        /**
         * We unlink first its previous if exist
         */
        if($prev){
            $prev->setNext(0)->save();
        }
        $db = Storage::Connect()->prepare("delete from sessions where id=:p1");
        $db->execute(['p1'=>$this->id]);
        $db->closeCursor();
        AcademicYear::getById($this->ay)->save();
        return null;
    }

    function hydrate(array $data)
    {
        $this->id = (int) $data["id"];
        $this->number = (int) $data["numero"];
        $this->setNext((int) $data["suivant"]);
        $this->ay = (int) $data["annee_academique"];
        $this->academic = AcademicYear::getById($this->ay);
        $this->begin = $data["date_debut"];
        $this->end = $data["date_fin"];
        $this->etat = $data["etat"];
        $this->fetchStats();
        return $this;
    }

    private function fetchStats(){
        /**
         * Fetching courses count
         */
        $db = Storage::Connect()->prepare("select * from cours where session=:p1");
        $db->execute(['p1'=>$this->id]);
        $this->stats["courses"] = $db->rowCount();
        /**
         * Fetching exams count
         */
        $db = Storage::Connect()->prepare("select distinct e.* 
                                                    from examens e, exam_period p 
                                                    where e.period = p.id and p.session=:p1");
        $db->execute(['p1'=>$this->id]);
        $this->stats["exams"] = $db->rowCount();
        /**
         * Fetching homework
         */
        $db = Storage::Connect()->prepare("select distinct w.* from work w, cours c
                                                 where w.cours = c.id and c.session=:p1");
        $db->execute(['p1'=>$this->id]);
        $this->stats["works"] = $db->rowCount();
        $db->closeCursor();
        return $this;
    }

    function data(){
        return [
            "id"=>$this->id,
            "number"=>$this->number,
            "next"=>$this->next,
            "begin"=>$this->begin,
            "end"=>$this->end,
            "state"=>$this->etat,
            "stats"=>$this->stats,
            "year"=>$this->ay
        ];
    }

    static function fetchAll(?AcademicYear $year = null, bool $override = false){
        if(count(self::$list) > 0 && !$override && !$year){
            return self::$list;
        }
        $sql = "select * from sessions ".($year ? "where annee_academique=:p1 order by numero asc" : "");
        $db = Storage::Connect()->prepare($sql);
        $db->execute($year ? ['p1'=>$year->getId()] : []);
        self::$list = [];
        while($data = $db->fetch()){
            self::$list[] = (new Sessions())->hydrate($data);
        }
        $db->closeCursor();
        return self::$list;
    }

    static function getById(int $id)
    {
        $db = Storage::Connect()->prepare("select * from sessions where id=:p1");
        $db->execute(['p1'=>$id]);
        $session =  null;
        if($db->rowCount()){
            $session = (new Sessions())->hydrate($db->fetch());
        }
        $db->closeCursor();
        return $session;
    }

    /**
     * @param Sessions $session
     * @return Sessions|null
     */
    static function periodCreateConflict(Sessions $session){
        $begin = (new AkaDateTime($session->begin))->getDate();
        $end = (new AkaDateTime($session->end))->getDate();
        $db = Storage::Connect()->prepare("select * from sessions where id != :p1 and 
                                            (
                                                (:p2 between date_debut and date_fin) or
                                                (:p3 between date_debut and date_fin)
                                            )
                                        ");
        $db->execute([
            'p1'=>$session->id,
            'p2'=>$begin,
            'p3'=>$end
        ]);
        $r = null;
        if($db->rowCount()){
            $r = new Sessions();
            $r->hydrate($db->fetch());
        }
        $db->closeCursor();
        return $r;
    }

    function isDateIncluded(string $date){
        $date = new AkaDateTime($date);
        $begin =  new AkaDateTime($this->begin);
        $end = new AkaDateTime($this->end);
        return $begin->compareTo($date) <= AkaDateTime::EQUALS &&
               $end->compareTo($date) >= AkaDateTime::EQUALS;
    }

    static function getByDate(string $date){
        $date = (new AkaDateTime())->getDate();
        $db = Storage::Connect()->prepare("select * from sessions where :p1 between date_debut and date_fin");
        $db->execute(['p1'=>$date]);
        $session =  null;
        if($db->rowCount()){
            $session = (new Sessions())->hydrate($db->fetch());
        }
        $db->closeCursor();
        return $session;
    }

    static function getByNumber(int $number, int $academic = 0){
        $academic = $academic <= 0 ? AcademicYear::$current->getId() : $academic;
        $db = Storage::Connect()->prepare("select * from sessions where numero=:p1 and annee_academique=:p2");
        $db->execute(['p1'=>$number, 'p2'=>$academic]);
        $session =  null;
        if($db->rowCount()){
            $session = (new Sessions())->hydrate($db->fetch());
        }
        $db->closeCursor();
        return $session;
    }

    static function numberAlreadyTaken(Sessions $sessions){
        $db =  Storage::Connect()->prepare("select * from sessions where id != :p1 and numero=:p2");
        $db->execute(['p1'=>$sessions->id, 'p2'=>$sessions->number]);
        $r = $db->rowCount() > 0;
        $db->closeCursor();
        return $r;
    }

    static function getLast(){
        $r = null;

        return $r;
    }
}