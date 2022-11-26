<?php

require_once __DIR__ . "/../Commons/main.php";
//@Deletable
$client = isset($client) ? $client : new User();

//@Academic Level registration /edition
if(CheckIf::isRequest($_POST, ['lvl_name'])){
    $result["message"] = STRINGS["deny"];
    CheckIf::granted($client, [281,282], $result);
    $lvl_next = 0;
    $lvl_id = 0;
    extract($_POST);
    /**
     * active academic year is required !
     */
    RuntimeMessage::closeHttpRequestIfNot(!AcademicYear::$current && !$lvl_id, $result, _str["academiclevel.undefined"]);
    $level = $lvl_id ? AcademicLevel::getById($lvl_id) : new AcademicLevel();
    $msg = _str["academiclevel.invalid"];
    if($level) {
        $msg = $level->setNom($lvl_name)
            ->setNextLevel((int) $lvl_next)
            ->save();
    }
    $result["message"] = $msg;
    if(!$msg){
        $result = Ressource::resultSuccess();
    }
}
//@Academic Level deletion
else if(CheckIf::isRequest($_POST, ['lvl_del_id'])){
    $result["message"] = STRINGS["deny"];
    CheckIf::granted($client, [298,283], $result);
    extract($_POST);
    $level = AcademicLevel::getById($lvl_del_id);
    $result["message"] = STRINGS["academiclevel.invalid"];
    if($level){
        $result["message"] = $level->delete();
        if(!$result["message"]){
            $result = Ressource::resultSuccess();
        }
    }
}
//@Room registration / edition
else if(CheckIf::isRequest($_POST, ['rm_code', 'rm_name', 'rm_capacity', 'rm_desc'])){
    $rm_id = 0;
    $result["message"] = STRINGS["deny"];
    extract($_POST);
    CheckIf::granted($client, [291,$rm_id ? 293 : 292], $result);
    $room = $rm_id ? Room::getById((int) $rm_id) : new Room();
    $result["message"] = _str["room.invalid"];
    if($room){
        $msg = $room->setNom($rm_name)
            ->setCode($rm_code)
            ->setCapacity((int) $rm_capacity)
            ->setDescription($rm_desc)
            ->save();
        $result["message"] = $msg;
        if(!$msg){
            $result = Ressource::resultSuccess();
        }
    }
}
//@Room deletion
else if(CheckIf::isRequest($_POST, ['rm_del_id'])){
    extract($_POST);
    $result["message"] = STRINGS["deny"];
    CheckIf::granted($client, [291,294], $result);
    $room = Room::getById((int) $rm_del_id);
    $result["message"] = _str["room.invalid"];
    if($room){
        $msg = $room->delete();
        $result["message"] = $msg;
        if(!$msg){
            $result = Ressource::resultSuccess();
        }
    }
}
//@Room assignation [class | exam] //Deprecated !
else if(CheckIf::isRequest($_POST, ['rm_asg_id'])){
    $rm_asg_cls = 0;
    $rm_asg_exam = 0;
    extract($_POST);
    $result["message"] = _str[$rm_asg_cls && $rm_asg_exam ? "general.invalid" : "deny"];
    CheckIf::granted($client, [291,$rm_asg_cls && $rm_asg_exam ? -1 : ($rm_asg_cls ? 295 : 296)], $result);
    $room = Room::getById((int) $rm_asg_id);
    $result["message"] = _str["room.invalid"];
    if($room){
        $ref = $rm_asg_cls ? ClassRoom::getById($rm_asg_cls) : Exams::getById($rm_asg_cls);
        $msg = $rm_asg_cls ? $room->setForClass($ref) : $room->setForExams($ref);
        $result["message"] = $msg;
        if(!$msg){
            $result = Ressource::resultSuccess();
        }
    }
}
//@Class creation /edition
else if(CheckIf::isRequest($_POST, ['cls_name', 'cls_level'])){
    $cls_id = 0;
    $cls_section = 0;
    extract($_POST);
    $result["message"] = _str["insuffisant.privileges"];
    CheckIf::granted($client, [281,$cls_id ? 287 : 285], $result);
    /**
     * active academic year is required !
     */
    RuntimeMessage::closeHttpRequestIfNot(!AcademicYear::$current && !$cls_id, $result, _str["academiclevel.undefined"]);
    if(!$cls_section && !$cls_id){
        $result["message"] = _str["grade.level.undefined"];
        RuntimeMessage::closeHttpRequest($result);
    }
    $class = !$cls_id ? new Grade() : Grade::getById($cls_id);
    $result["message"] = _str["grade.invalid"];
    if($class){
        $result["message"] = $class->setFiliere((int) $cls_section)
            ->setNotation($cls_name)
            ->setAnnee((int) $cls_level)
            ->save();
        if(!$result["message"]){
            $result = Ressource::resultSuccess();
        }
    }
}
//@Class deletion
else if(CheckIf::isRequest($_POST, ['cls_del_id'])){
    extract($_POST);
    $result["message"] = _str["insuffisant.privileges"];
    CheckIf::granted($client, [281,286], $result);
    $class = Grade::getById((int) $cls_del_id);
    $result["message"] = _str["grade.invalid"];
    if($class){
        $result["message"] = $class->delete();
        if(!$result["message"]){
            $result = Ressource::resultSuccess();
        }
    }
}
//@ClassRoom registration / edition
else if(CheckIf::isRequest($_POST, ['clroom_room', 'clroom_grade'])){
    $clroom_id = 0;
    extract($_POST);
    $result["message"] = _str["deny"];
    CheckIf::granted($client, [301,$clroom_id ? 298 : 297], $result);
    /**
     * active academic year is required !
     */
    RuntimeMessage::closeHttpRequestIfNot(!AcademicYear::$current && !$clroom_id, $result, _str["academiclevel.undefined"]);
    $classroom = $clroom_id ? ClassRoom::getById((int) $clroom_id) : new ClassRoom();
    $result["message"] = _str["classroom.invalid"];
    if($classroom){
        $msg = $classroom->setGradeId((int) $clroom_grade)
                ->setRoomId((int) $clroom_room)
                ->save();
        $result["message"] = $msg;
        if(!$msg){
            $result = Ressource::resultSuccess();
        }
    }
}
//@ClassRoom deletion
else if(CheckIf::isRequest($_POST, ['clroom_del_id'])){
    CheckIf::granted($client, [301,299], $result);
    extract($_POST);
    $classroom = ClassRoom::getById((int) $clroom_del_id);
    $result["message"] = _str["classroom.invalid"];
    if($classroom){
        $result["message"] = $classroom->delete();
        if(!$result["message"]){
            $result = Ressource::resultSuccess();
        }
    }
}
//@ClassRoom assignation
else if(CheckIf::isRequest($_POST, ['prm_id', 'prm_std_list'])){
    $transfer = CheckIf::toBoolean(CheckIf::set($_POST["prm_trf"], false));
    CheckIf::granted($client, [$transfer ? 125 : 124]);
    extract($_POST);

    $classroom = ClassRoom::getById((int) $prm_id);
    RuntimeMessage::closeHttpRequestIfNot($classroom, $result, _str["classroom.invalid"]);

    $list = Student::createListFromId($prm_std_list);
    if($list->getError()){
        $result["message"] = $list->getMessage();
        RuntimeMessage::closeHttpRequest($result);
    }
    /**
     * @var Student[]
     */
    $students = $list->getData();
    $student_classroom = null;
    foreach ($students as $student){
        $student_classroom = $student->getClassRoom(true);
        if($student_classroom && !$transfer){
            $list->setError(true);
            $list->setMessage(_str["student.already.assigned"]. " [ID] " . $student->getID() . " [N] " . $student->getFullName());
        }
    }
    if($list->getError()){
        $result["message"] = $list->getMessage();
        RuntimeMessage::closeHttpRequest($result);
    }

    $msg = $classroom->addStudents($students);

    $msg = strlen($msg) ? $msg : _str["success"];

    $result = Ressource::resultSuccess($msg);
}
//@Exams period planification / edition
else if(CheckIf::isRequest($_POST, ['exam_session', 'exam_begin', 'exam_end', 'exam_grades'])){
    $exam_period_id = 0;
    extract($_POST);
    $result["message"] = _str["deny"];
    CheckIf::granted($client, [302,$exam_period_id ? 304 : 303], $result);
    /**
     * active academic year is required !
     */
    RuntimeMessage::closeHttpRequestIfNot(!AcademicYear::$current && !$exam_period_id, $result, _str["academiclevel.undefined"]);
    $period = $exam_period_id ? ExamPeriod::getById((int) $exam_period_id) : new ExamPeriod();
    $result["message"] = _str["exam.period.invalid"];
    if(!$period){
        RuntimeMessage::closeHttpRequest($result);
    }
    $exam_session = Sessions::getById((int) $exam_session);
    if($exam_session){
        $result["message"] = _str["session.invalid"];
    }
    $error = false;
    foreach ($exam_grades as $gradeId){
        $grade = Grade::getById((int) $gradeId);
        if(!$grade){
            $error = true;
            $result["message"] = _str["grade.invalid"]. " [ID] " . $gradeId;
            break;
        }
        else if($exam_session->getAcademicYearId() != $grade->getFiliereData()->getAcademicYearId()){
            $error = true;
            $result["message"] = _str["grade.anachronism.relation"]. " [ID] " . $gradeId;
            break;
        }
    }
    if($error){
        RuntimeMessage::closeHttpRequest($result);
    }
    $error = false;
    $result["message"] = "";
    foreach($exam_grades as $gradeId){
        $msg = $period->setGradeId($gradeId)
            ->setBegin($exam_begin)
            ->setEnd($exam_end)
            ->setSession((int) $exam_session->getId())
            ->save();
        $result["message"] .= (strlen($result["message"]) ? "\n" : "").($msg ? $msg : "");
    }
    if(!$result["message"]){
        $result = Ressource::resultSuccess();
    }
}
//@Exams period deletion
else if(CheckIf::isRequest($_POST, ["exam_del_id"])){
    extract($_POST);
    $result["message"] = _str["deny"];
    CheckIf::granted($client, [302,305], $result);
    $period = ExamPeriod::getById((int) $exam_del_id);
    $result["message"] = _str["exam.period.invalid"];
    if($period){
        $result["message"] = $period->delete();
        if(!$result["message"]){
            $result = Ressource::resultSuccess();
        }
    }
}
//@Exams creation
else if(CheckIf::isRequest($_POST, ['exam_cours', 'exam_date', 'exam_duration', 'exam_start'])){
    $exam_id = 0;
    $exam_period = 0;
    extract($_POST);
    /**
     * active academic year is required !
     */
    RuntimeMessage::closeHttpRequestIfNot(!AcademicYear::$current && !$exam_id, $result, _str["academiclevel.undefined"]);
    $result["message"] = _str["deny"];
    CheckIf::granted($client, [171,$exam_id ? 173 : 172], $result);
    $exam = $exam_id ? Exams::getById((int) $exam_id) : new Exams();
    $result["message"] = _str["exam.invalid"];
    if($exam){
        $result["message"] = $exam->setBeginDate($exam_date)
                                ->setBeginHour($exam_start)
                                ->setDuration($exam_duration)
                                ->setPeriodId((int) $exam_period)
                                ->setCourseId((int) $exam_cours)
                                ->save();
        if(!$result["message"]){
            $result = Ressource::resultSuccess();
        }
    }
}
//@Exams room assignation
else if(CheckIf::isRequest($_POST, ['exam_id', 'exam_rooms'])){
    /**
     * active academic year is required !
     */
    RuntimeMessage::closeHttpRequestIfNot(!AcademicYear::$current, $result, _str["academiclevel.undefined"]);
    $exam_assignation = 0;
    extract($_POST);
    $result["message"] = _str["deny"];
    CheckIf::granted($client, [291, 296], $result);
    /**
     * The request parameter 'exam_rooms' must be an array of room id
     */
    if(!is_array($exam_rooms)){
        $result["message"] = _str["exams.roomid.invalid"];
        RuntimeMessage::closeHttpRequest($result);
    }
    $exam = Exams::getById((int) $exam_id);
    $result["message"] = _str["exam.invalid"];
    if($exam){
        $msg = $exam->setRooms($exam_rooms, $exam_assignation == 0);
        $result["message"] = $msg->getMessage();
        $result["error"] = $msg->getError();
        if(!$result["message"] && !$result["error"]){
            $result = Ressource::resultSuccess();
        }
    }
}
//@Exams deletion
else if(CheckIf::isRequest($_POST, ['exam_del_id'])){
    extract($_POST);
    $result["message"] = _str["deny"];
    CheckIf::granted($client, [171,174], $result);
    $exam = Exams::getById((int) $exam_del_id);
    $result["message"] = _str["exam.invalid"];
    if($exam){
        $result["message"] = $exam->delete();
        if(!$result["message"]){
            $result = Ressource::resultSuccess();
        }
    }
}
//@Exams autorepartition
else if(CheckIf::isRequest($_POST, ['exam_auto_algo', 'exam_auto_exam', 'exam_auto_room'])){
    /**
     * active academic year is required !
     */
    RuntimeMessage::closeHttpRequestIfNot(!AcademicYear::$current, $result, _str["academiclevel.undefined"]);
    extract($_POST);
    $result["message"] = _str["deny"];
    CheckIf::granted($client, [171,175,176], $result);
    if(!is_array($exam_auto_exam)){
        $result["message"] = _str["exam.examid.invalid"];
        RuntimeMessage::closeHttpRequest($result);
    }
    if(!is_array($exam_auto_room)){
        $result["message"] = _str["exam.roomid.invalid"];
        RuntimeMessage::closeHttpRequest($result);
    }
    if(!CheckIf::isNumber($exam_auto_algo)){
        $result["message"] = _str["logistic.algo.error"];
        RuntimeMessage::closeHttpRequest($result);
    }
    $exam_list = []; $room_list = []; $err = false;
    foreach ($exam_auto_exam as $exam_id){
        $exams = Exams::getById((int)$exam_id);
        if($exams){
            $exam_list[] = $exams;
        }
        else{
            $result["message"] = _str["exam.invalid"]." [ID] " . $exam_id;
            $err = true;
            break;
        }
    }
    if($err) die(json_encode($err));
    foreach($exam_auto_room as $room_id){
        $room = Room::getById((int)$room_id);
        if($room){
            $room_list[] = $room;
        }
        else{
            $result["message"] = _str["room.invalid"] . " [ID] " . $room_id;
            $err = true;
            break;
        }
    }
    if($err) die(json_encode($err));
    $msg = Logistic::examAutoPartition($exam_list, $room_list, (int) $exam_auto_algo);
    $result["message"] = $msg->getMessage();
    $result["error"] = $msg->getError();
    if(!$msg->getError()){
        $result["data"] = Ressource::resultSuccess(!$result["message"] ? "logistic.autorepartition.success" : $result["message"]);
    }
}
//@Exams student repartition
else if(CheckIf::isRequest($_POST, ['exam_room_id', 'exam_students'])){
    /**
     * active academic year is required !
     */
    RuntimeMessage::closeHttpRequestIfNot(!AcademicYear::$current, $result, _str["academiclevel.undefined"]);
    $result["message"] = _str["deny"];
    CheckIf::granted($client, [171,175], $result);
    if(!is_array($exam_students)){
        $result["message"] = _str["exam.studentid.invalid"];
        RuntimeMessage::closeHttpRequest($result);
    }
    $examroom = ExamsRoom::getById((int) $exam_room_id);
    if(!$examroom){
        $result["message"] = _str["exam.invalid"];
        RuntimeMessage::closeHttpRequest($result);
    }
    if($examroom->getExams()->getEtat() != Exams::PENDING && !CheckIf::authenticate($client)){
        $result["message"] = _str["exam.room.locked"];
        RuntimeMessage::closeHttpRequest($result);
    }
    $res = Student::createListFromId($exam_students);
    $students = $res->getData();
    if($res->getError()){
        $result["message"] = $res->getMessage();
        RuntimeMessage::closeHttpRequest($result);
    }
    $result["message"] = "";
    foreach ($students as $student){
        $err = $examroom->addParticipant($student);
        if($err){
            $result["message"] .= $err ."\n";
        }
    }
    if($result["message"] == ""){
        $result["message"] = _str["exam.room.student.assignation"];
    }
    $result = Ressource::resultSuccess( $result["message"]);
}
//@Exams student partition reduction
else if(CheckIf::isRequest($_POST, ['exam_room_id', 'exam_del_students'])){
    /**
     * active academic year is required !
     */
    RuntimeMessage::closeHttpRequestIfNot(!AcademicYear::$current, $result, _str["academiclevel.undefined"]);
    $result["message"] = _str["deny"];
    CheckIf::granted($client, [171,176], $result);
    if(!is_array($exam_del_students)){
        $result["message"] = _str["exam.studentid.invalid"];
        RuntimeMessage::closeHttpRequest($result);
    }
    $examroom = ExamsRoom::getById((int) $exam_room_id);
    if(!$examroom){
        $result["message"] = _str["exam.invalid"];
        RuntimeMessage::closeHttpRequest($result);
    }
    if($examroom->getExams()->getEtat() != Exams::PENDING && !CheckIf::authenticate($client)){
        $result["message"] = _str["exam.room.locked"];
        RuntimeMessage::closeHttpRequest($result);
    }
    $res = Student::createListFromId($exam_del_students);
    $students = $res->getData();
    if($res->getError()){
        $result["message"] = $res->getMessage();
        RuntimeMessage::closeHttpRequest($result);
    }
    $result["message"] = "";
    foreach ($students as $student){
        $err = $examroom->removeParticipant($student);
        if($err){
            $result["message"] .= $err ."\n";
        }
    }
    if($result["message"] == ""){
        $result["message"] = _str["exam.room.student.reduction"];
    }
    $result = Ressource::resultSuccess($result["message"]);
}
//@Exams student marking attendance
else if(CheckIf::isRequest($_POST, ['examroom_att_id', 'examroom_att_part_list', 'examroom_att_note'])){
    /**
     * active academic year is required !
     */
    RuntimeMessage::closeHttpRequestIfNot(!AcademicYear::$current, $result, _str["academiclevel.undefined"]);
    $result["message"] = _str["deny"];
    CheckIf::granted($client, [178], $result);
    extract($_POST);
    $examroom = ExamsRoom::getById((int) $examroom_att_id);
    if(!$examroom){
        $result["message"] = _str["exam.room.invalid"];
        RuntimeMessage::closeHttpRequest($result);
    }
    if(!is_array($examroom_att_part_list)){
        $result["message"] = _str["exam.studentid.invalid"];
        RuntimeMessage::closeHttpRequest($result);
    }
    if($examroom->getExams()->getEtat() != Exams::PENDING && !CheckIf::authenticate($client)){
        $result["message"] = _str["deny"];
        RuntimeMessage::closeHttpRequest($result);
    }
    $res = Student::createListFromId($examroom_att_part_list);
    $students = $res->getData();
    if($res->getError()){
        $result["message"] = $res->getMessage();
        RuntimeMessage::closeHttpRequest($result);
    }
    $result["message"] = "";
    foreach($students as $student) {
        $err = $examroom->setAttendance($student, $exam_att_note);
        if($err){
            $result["message"] .= $err . "\n";
        }
    }
    if($result["message"] == ""){
        $result["message"] = _str["exam.room.student.attendance"];
    }
    $result = Ressource::resultSuccess($result["message"]);
}
//@HomeWork creation
else if(CheckIf::isRequest($_POST, ['work_name','work_cours', 'work_begin_date', 'work_end_date','work_quota', 'work_bareme','work_desc', 'work_type'])){
    $work_final = 0;
    extract($_POST);
    /**
     * active academic year is required !
     */
    RuntimeMessage::closeHttpRequestIfNot(!AcademicYear::$current, $result, _str["academiclevel.undefined"]);
}

/**
 * OLD structures
 */
//@Student record / edition
else if(CheckIf::isRequest($_POST, ['st_address','st_birthdate','st_birthplace','st_grade','st_nom','st_prenom','st_person_ref','st_phone_ref','st_sexe'])){
    $memo = CheckIf::set($_POST["st_memo"]);
    $avatar = CheckIf::set($_POST["st_upl_avatar"]);
    $avatar = $ths->isUploaded($avatar) ? $avatar : null;
    $id = CheckIf::set($_POST["st_id"]);
    extract($_POST);
    /**
     * active academic year is required !
     */
    RuntimeMessage::closeHttpRequestIfNot(!AcademicYear::$current && !$id, $result, _str["academiclevel.undefined"]);
    $result["message"] = _str["insuffisant.privileges"];
    CheckIf::granted($client, [!$id ? 120 : 121], $result);
    $student = $id ? Student::getById((int) $id) : new Student();
    $result["message"] = _str["student.invalid"];
    if(!$student) RuntimeMessage::closeHttpRequest($result);
    $result["message"] = $student
        ->setProfil($avatar)
        ->setNom($st_nom)
        ->setPrenom($st_prenom)
        ->setSexe($st_sexe)
        ->setAdresse($st_address)
        ->setLieu_naissance($st_birthplace)
        ->setDate_naissance($st_birthdate)
        ->setNiveau($st_grade)
        ->setPersonneRef($st_person_ref)
        ->setTelephoneRef($st_phone_ref)
        ->save();
    if($result["message"]) RuntimeMessage::closeHttpRequest($result);
    $ths->move($avatar, realpath("../assets/avatars/"));
    $result = Ressource::resultSuccess();
}
//@Student deletion
else if(CheckIf::isRequest($_POST, ['st_del_id'])){
    $result["message"] = _str["insuffisant.privileges"];
    CheckIf::granted($client, [122], $result);
    extract($_POST);
    $student = Student::getById((int) $st_del_id);
    $result["message"] = _str["student.invalid"];
    if(!$student) RuntimeMessage::closeHttpRequest($result);
    $result["message"] = $student->delete();
    if($result["message"]) RuntimeMessage::closeHttpRequest($result);
    $result = Ressource::resultSuccess();
}
//@Teacher record /edition
else if($reqVar = CheckIf::isRequest($_POST, ["th_nom", "th_birthdate","th_birthplace",
    "th_email","th_nif","th_ninu", "th_address","th_phone","th_prenom","th_sexe",
    "th_skill","th_status"])
){
    $memo = CheckIf::set($_POST["th_memo"]);
    $id = CheckIf::set($_POST["th_id"],0);
    /**
     * active academic year is required !
     */
    RuntimeMessage::closeHttpRequestIfNot(!AcademicYear::$current && !$id, $result, _str["academiclevel.undefined"]);
    $avatar = CheckIf::set($_POST["th_upl_avatar"]);
    $result["message"] = _str["insuffisant.privileges"];
    CheckIf::granted($client, [$id ? 231 : 230], $result);
    $avatar = $ths->isUploaded($avatar) ? $avatar : null;
    $teacher = $id ? Teacher::getById((int) $id) : new Teacher();
    $result["message"] = _str["teacher.invalid"];
    if(!$teacher) RuntimeMessage::closeHttpRequest($result);
    extract($_POST);
    $result["message"] = $teacher
    ->setProfil($avatar)
    ->setNom($th_nom)
    ->setPrenom($th_prenom)
    ->setAdresse($th_address)
    ->setDate_naissance($th_birthdate)
    ->setLieu_naissance($th_birthplace)
    ->setEmail($th_email)
    ->setNiveauEtude($th_skill)
    ->setNif($th_nif)
    ->setNinu($th_ninu)
    ->setTelephone($th_phone)
    ->setSexe($th_sexe)
    ->setStatus_matrimonial($th_status)
    ->setMemo($memo)
    ->save();
    
    if($result["message"]){
        $ths->flush($avatar);
        RuntimeMessage::closeHttpRequest($result);
    }
    $ths->move($avatar, realpath("../assets/avatars/"));
    $result = Ressource::resultSuccess();
}
//@Teacher deletion
else if(CheckIf::isRequest($_POST, ['th_del_id'])){
    CheckIf::granted($client, [232]);
    extract($_POST);
    $teacher = Teacher::getById((int) $th_del_id);
    $result["message"] = _str["teacher.invalid"];
    if(!$teacher) RuntimeMessage::closetHttpRequest($result);
    $result["message"] = $teacher->delete();
    if($result["message"]) RuntimeMessage::closeHttpRequest($result);
    $result = Ressource::resultSuccess();
}
//@Course
else if(CheckIf::isRequest($_POST, ['cr_code', 'cr_name', 'cr_grade','cr_principale','cr_rate','cr_session'])){
    $cr_id = 0;
    extract($_POST);
    /**
     * active academic year is required !
     */
    RuntimeMessage::closeHttpRequestIfNot(!AcademicYear::$current && !$cr_id, $result, _str["academiclevel.undefined"]);
    CheckIf::granted($client, [$cr_id ? 181 : 180]);
    $course = $cr_id ? Course::getById((int) $cr_id) : new Course();
    RuntimeMessage::closeHttpRequestIfNot($course, $result,_str["course.invalid"]);
    $grade = Grade::getById((int) $cr_grade);
    RuntimeMessage::closeHttpRequestIfNot($grade, $result,_str["grade.invalid"]);
    $teacher = Teacher::getById((int) $cr_principale);
    RuntimeMessage::closeHttpRequestIfNot($teacher,$result, _str["teacher.invalid"]);
    $session = Sessions::getById((int) $cr_session);
    RuntimeMessage::closeHttpRequestIfNot($session, $result, _str["session.invalid"]);
    $result["message"] = $course
    ->setNiveau($grade->getId())
    ->setNom($cr_name)
    ->setSession($session->getId())
    ->setTitulaireObject($teacher)
    ->setCoefficient($cr_rate)
    ->setCode($cr_code)
    ->save();
    if($result["message"]) RuntimeMessage::closeHttpRequest($result);
    $result = Ressource::resultSuccess();
}
//@Course scheduling
else if(CheckIf::isRequest($_POST, ['cr_schedule_id', 'cr_seances'])){
    /**
     * active academic year is required !
     */
    RuntimeMessage::closeHttpRequestIfNot(!AcademicYear::$current, $result, _str["academiclevel.undefined"]);
    CheckIf::granted($client, [183]);
    extract($_POST);
    RuntimeMessage::closeHttpRequestIfNot(!is_array($cr_seances), $result, _str["course.scheduling.list.required"]);

    $course = Course::getById((int) $cr_schedule_id);
    RuntimeMessage::closeHttpRequestIfNot($course, $result, _str["course.invalid"]);

    \System\Log::println(json_encode($cr_seances));
    $result["message"] = $course->schedule($cr_seances);
    if($result["message"]) RuntimeMessage::closeHttpRequest($result);

    $result = Ressource::resultSuccess();
}