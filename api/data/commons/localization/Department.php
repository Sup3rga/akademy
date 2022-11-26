<?php
class Department extends Cachable implements ContentMod
{
    private $id, $nom, $pays;
    private bool $granted = false;
    private static $list = [];
    private $towns = [], $schools = [];
    private static int $contentMod = 0;

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }


    /**
     * @return mixed
     */
    public function getNom()
    {
        return $this->nom;
    }

    /**
     * @param mixed $nom
     */
    public function setNom(int $nom): void
    {
        $this->nom = $nom;
    }

    /**
     * @return mixed
     */
    public function getPays()
    {
        return $this->pays;
    }

    /**
     * @param mixed $pays
     */
    public function setPays($pays): void
    {
        $this->pays = $pays;
    }

    /**
     * @return bool
     */
    public function isGranted(): bool
    {
        return $this->granted;
    }

    /**
     * @return array
     */
    public function getTowns(): array
    {
        return $this->towns;
    }

    /**
     * @return array
     */
    public function getSchools(): array
    {
        return $this->schools;
    }

    public static function nameExists(Department $dep){
        $r = false;
        foreach (self::fetchAll() as $department){
            if(strtolower($dep->getNom()) == strtolower($department->getNom()) &&
                $dep->getPays() == $department->getPays()){
                $r = true;
            }
        }
        return $r;
    }

    function save()
    {
        $r = "Invalid name given";
        if(CheckIf::isFormalName($r)) return $r;
        $r = "Department name already exist";
        if(self::nameExists($this)) return $r;
        $r = "Country id does not exist";
        if(Country::getById($this->pays) == null) return $r;
        $r = null;
        $db = Storage::Connect();
        $chk = $db->prepare("insert into departement(nom,pays) values (:p1,:p2)");
        $chk->execute(['p1'=>$this->nom,'p2'=>$this->pays]);
        $chk->closeCursor();
        return $r;
    }

    function delete()
    {}

    function hydrate(array $data)
    {
        $this->id = $data['id'];
        $this->nom = $data['nom'];
        $this->pays = $data['pays'];
        if(self::$contentMod <= self::WITH_TOWN_DATA) {
            //towns
            foreach (Town::fetchAll() as $town) {
                if ($this->id == $town->getDepartment()) {
                    $this->towns[$town->getNom()] = $town;
                }
            }
            if(self::$contentMod <= self::WITH_SCHOOL_DATA) {
                //schools
                foreach (Establishment::fetchAll() as $school) {
                    if ($this->id == $school->getDepartement()) {
                        $this->schools[$school->getNom()] = $school;
                    }
                }
            }
        }
    }

    static function fetchAll($override=false)
    {
        if(!$override && count(self::$list) > 0) return self::$list;
        self::$list = [];
        $chk = Storage::Connect()->prepare("select * from departement");
        $chk->execute();
        while($data = $chk->fetch()){
            $c = new Department();
            $c->hydrate($data);
            self::$list[] = $c;
        }
        $chk->closeCursor();
        return self::$list;
    }

    public static function getById(int $id) : ?Department{
        $r = null;
        $chk = Storage::Connect()->prepare("select * from departement where id=:p1");
        $chk->execute(['p1'=>$id]);
        if($chk->rowCount()){
            $r = new Department();
            $r->hydrate($chk->fetch());
        }
        $chk->closeCursor();
        return $r;
    }

    public function data(){
        return [
            "name"=>$this->nom,
            "id"=>$this->id,
            "towns"=>$this->towns,
            "schools"=>$this->schools
        ];
    }

    use _Cache_;

    static function setContentMod(int $mod)
    {
        self::$contentMod = $mod;
        return Department::class;
    }

    static function getContentMod(): int
    {
        return self::$contentMod;
    }
}