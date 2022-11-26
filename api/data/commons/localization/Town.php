<?php


class Town extends Local implements ContentMod
{
    private int $id, $department;
    private string $nom;
    private bool $granted = false;
    private static $list = [];
    private $schools = [];
    private static int $contentMod = 0;

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
    public function getDepartment(): int
    {
        return $this->department;
    }

    /**
     * @param int $department
     */
    public function setDepartment(int $department): void
    {
        $this->department = $department;
    }

    /**
     * @return string
     */
    public function getNom(): string
    {
        return $this->nom;
    }

    /**
     * @param string $nom
     */
    public function setNom(string $nom): void
    {
        $this->nom = $nom;
    }

    /**
     * @return array
     */
    public function getSchool(): array
    {
        return $this->school;
    }

    /**
     * @param array $school
     */
    public function setSchool(array $school): void
    {
        $this->school = $school;
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
    public function getSchools(): array
    {
        return $this->schools;
    }


    public static function nameExists(Town $ville)
    {
        $r = false;
        foreach (self::fetchAll() as $town){
            if(strtolower($ville->getNom()) == strtolower($town->getNom()) && $ville->getPays() == $town->getPays()){
                $r = true;
            }
        }
        return $r;
    }

    function save()
    {
        $r = "Invalid name given";
        if(CheckIf::isFormalName($r)) return $r;
        $r = "Town name already exist";
        if(self::nameExists($this)) return $r;
        $r = "Department id does not exist";
        if(Department::getById($this->pays) == null) return $r;
        $r = null;
        $db = Storage::Connect();
        $chk = $db->prepare("insert into villes(nom,dep) values (:p1,:p2)");
        $chk->execute(['p1'=>$this->nom,'p2'=>$this->department]);
        $chk->closeCursor();
        return $r;
    }

    function delete()
    {}

    function hydrate(array $data)
    {
        $this->id = (int) $data['id'];
        $this->nom = $data['nom'];
        $this->department = $data['dep'];
        $this->granted = $data['validation'] == 1;
    }

    static function fetchAll($override=false)
    {
        if(!$override && count(self::$list) > 0) return self::$list;
        self::$list = [];
        $chk = Storage::Connect()->prepare("select * from villes");
        $chk->execute();
        while($data = $chk->fetch()){
            $c = new Town();
            $c->hydrate($data);
            self::$list[] = $c;
        }
        $chk->closeCursor();
        return self::$list;
    }

    function data(){
        return [
          "name"=>$this->nom,
          "id"=>$this->id,
          "schools"=>$this->schools
        ];
    }

    static function getById(int $id) : ?Town{
        $r = null;
        $chk = Storage::Connect()->prepare("select * from villes where id=:p1");
        $chk->execute(['p1'=>$id]);
        if($chk->rowCount() > 0){
            $r = new Town();
            $r->hydrate($chk->fetch());
        }
        $chk->closeCursor();
        return $r;
    }

    static function getDefault() : ?Town{
        $r = null;

        return $r;
    }

    static function setContentMod(int $mod)
    {
        self::$contentMod = $mod;
        return Town::class;
    }

    static function getContentMod(): int
    {
        return self::$contentMod;
    }
}