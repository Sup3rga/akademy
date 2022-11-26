<?php

abstract class _Summary_
{
    protected $filiereTimeLine = [];
    protected $etudiantTimeLine = [];
    protected $profTimeLine = [];
    protected $courseTimeLine = [];
    protected $lastYearPromotedStudents = 0;
    protected $lastYearStackStudents = 0;
    protected $effectifAugmentation = 0.0;
    protected $currentYear = null;

    public function __construct(?AcademicYear $ya){
        $this->currentYear = $ya;
        if($ya != null) {
            $list = $ya->getPrecedentsAndNow();
            $ids = [];
            for ($i = 0, $j = count($list); $i < $j; $i++) {
                $ids[] = $list[$i]->getId();
            }
            $this->setLastYearPromotion($ids);
            $this->setEtudiantTimeLine($list);
            $this->setFiliereTimeLine($list);
            $this->setProfTimeLine($list);
            $this->setCourseTimeLine($list);
        }
    }

    protected function setLastYearPromotion(array $academicIds){
        $lastYear = $this->currentYear->previous();
        if($lastYear == null) return;
        foreach(Student::$list as $e){
            if(CheckIf::inArray($e->getAnneeAcademique(), $academicIds)){
                $average = $e->getAverageByAcademic($lastYear->getId());
                if($average >= 65){
                    $this->lastYearPromotedStudents++;
                }else{
                    $this->lastYearStackStudents++;
                }
            }
        }
    }

    protected function setFiliereTimeLine(array $list){
        foreach($list as $ya){
            $this->filiereTimeLine[$ya->getAcademie()] = $ya->getNbBranch();
        }
    }

    protected function setEtudiantTimeLine(array $list){
        $last_year_nb = 0; $current_nb = 0;
        $saved = false;
        foreach($list as $ya){
            if($ya->getId() == $this->currentYear->getId()){
                $current_nb = $ya->getNbStudent();
                $saved = true;
            }
            $this->etudiantTimeLine[$ya->getAcademie()] = $ya->getNbStudent();
            if(!$saved){
                $last_year_nb = $ya->getNbStudent();
            }
        }
        $this->effectifAugmentation = $last_year_nb == 0 ? 100 : round(($current_nb - $last_year_nb) / $last_year_nb , 2);
    }

    protected function setProfTimeLine(array $list){
        foreach($list as  $ya){
            $this->profTimeLine[$ya->getAcademie()] = $ya->getNbTeacher();
        }
    }

    protected function setCourseTimeLine(array $list){
        foreach($list as $ya){
            $this->courseTimeLine[$ya->getAcademie()] = $ya->getNbCourse();
        }
    }

    public function data(){
        return [
            "filiereTimeLine" => $this->filiereTimeLine,
            "etudiantTimeLine" => $this->etudiantTimeLine,
            "profTimeLine" => $this->profTimeLine,
            "courseTimeLine" => $this->courseTimeLine,
            "lastYearPromotedStudents" => $this->lastYearPromotedStudents,
            "lastYearStackStudents" => $this->lastYearStackStudents,
            "effectifAugmentation" => $this->effectifAugmentation,
            "currentYear" => $this->currentYear != null ? $this->currentYear->getId() : null
        ];
    }

    public function __toString(){return json_encode($this->data());}
}