<?php

use System\Log;

header("Content-Type: text/plain;utf-8;charset=UTF-8");
ThunderSpeed::$baseDir = realpath("../assets/tmp/")."/";
ThunderSpeed::$uploadDir = realpath("../assets/ths_dir/")."/";
$ths = new ThunderSpeed();
$ths->watch(['st_avatar', 'st_excel', 'th_avatar', 'usr_upl_avatar']);

$result = [
    "error"=> true,
    "code"=> 2,
    "message"=> _str["deny"]
];
$reqversion = "0.0.0";
$reqview_version = "0.0.0";
//Si le token et l'uid ne sont pas renseigné, la requête n'est pas autorisée
if(!($post = CheckIf::isRequest($_POST, ['reqtoken', 'requid', 'reqversion','reqview_version']))){
    echo json_encode($result);
    exit(0);
}

extract($post);

$reqtoken = $_POST['reqtoken'];
$client = Storage::getTokenUser($reqtoken);
Version::setUserQuery($reqversion);
Version::setUserViewQuery($reqview_version);

if($client == null || !$client->isActif()){
    if(!$client->isActif()){
        $result["message"] = _str["user.locked"];
    }
    echo  json_encode($result);
    die;
}
Ressource::$currentUser = $client;
/**
 * We assign privileges to simpleRender for ressource allowance
 */

$result["message"] = _str["general.invalid"];


//@Academic year registration
if($reqVar = CheckIf::isRequest($_POST, ["anneeAka_begin", "anneeAka_end"])){
    if(!$client->hasPrivilege(10)){
        $result["message"] = _str["deny"];
        RuntimeMessage::closeHttpRequest($result);
    }
    $editId = CheckIf::isRequest($_POST, ["reqeditid"]);
    $edit = $editId != false;
    if($edit) $editId = $editId["reqeditid"];
    $ya = $edit ? AcademicYear::getById((int) $editId) : new AcademicYear();
    if(!$ya){
        $result["message"] = _str["academic.invalid"];
        RuntimeMessage::closeHttpRequest($result);
    }
    $ya->setDebut($reqVar["anneeAka_begin"])->setFin($reqVar["anneeAka_end"]);
    $exec = $ya->save();
    $result["message"] = $exec;
    if($exec == null){
        $result["code"] = 1;
        $result["error"] = false;
        try {
            $result["data"] = Ressource::data();
        } catch (Exception $e) {
            Log::printStackTrace($e);
        }
        $result["message"] = _str["success"];
    }
}
//@AcademicYear passation
else if($reqVar = CheckIf::isRequest($_POST, ["akid", "akpass"])){
    if(!$client->hasPrivilege(11)){
        $result["message"] = "Access denied !";
        echo json_encode($result);
        die;
    }
    $ya = AcademicYear::getById((int) $reqVar["akid"]);
    if($ya != null){
        $result["message"] = "Can't pass an academic year already closed !";
        if(strtoupper($ya->getEtat()) == "O"){
            $last = $ya->isLastKnownYear();
            $msg = $ya->passToNextYear();
            $result["message"] = $msg;
            if($msg == null){
                $result["error"] = false;
                $result["code"] = 1;
                if($last){
                    $result["message"] = "There's a new academic year created ! Please remember to edit his deadlines.";
                }
                else{
                    $nya = Storage::$currentYear;
                    $result["message"] = "Welcome to new academic year of ".$nya->getAcademie()." ! ";
                }
                try{
                    $result["data"] = Ressource::data();
                }catch(Exception $e){
                    Log::printStackTrace($e);}
            }
        }
    }
}
//@User registration /edition
else if(($reqVar = CheckIf::isRequest($_POST, ["usr_nom", "usr_prenom", "usr_pseudo","usr_access"])) != null){
    $id = CheckIf::set($_POST["usr_id"]);
    $poste = CheckIf::set($_POST["usr_hierarchy"]);
    $avatar = CheckIf::set($_POST["usr_avatar"]);
    $avatar = $ths->isUploaded($avatar) ? $avatar : null;
    $password = CheckIf::set($_POST["usr_passcode"]);
    $new_passcode = CheckIf::set($_POST["usr_new_passcode"]);
    $new_passcode = $new_passcode == null ? "" : $new_passcode;
    $password = $password == null ? "" : $password;
    $myself = $client->getId() == (int) $id;
    if(($id == null && strlen($password) == 0) ||
        ($id != null && !CheckIf::isNumber($id)) ||
        ($poste != null && strlen($poste) > 0 && !CheckIf::isNumber($poste))
    ){
        $result["message"] = "Invalid data submitted !";
    }
    else{
        if($id != null){
            if($client->getId() != (int) $id && !$client->hasPrivilege(38)){
                $result["message"] = "Access denied !";
                echo json_encode($result);
                die;
            }
            if((strlen($new_passcode) > 0 && strlen($password) == 0) || (strlen($new_passcode) == 0 && strlen($password) > 0)){
                $result["message"] = "passcode or new passcode empty !";
                echo json_encode($result);
                die;
            }
            if(strlen($password) > 0){
                try{
                    if(User::isMatch($client->getPseudo(), $password, true) == null){
                        $result["message"] = "invalid passcode authentification given !";
                        echo json_encode($result);
                        die;
                    }
                }catch(Exception $e){
                    Log::printStackTrace($e);
                }
                $password = $new_passcode;
            }
        }else if(!$client->hasPrivilege(37)){
            $result["message"] = "Access denied !";
            echo json_encode($result);
            die;
        }
        $usr = $id != null ? User::getById((int) $id) : new User();
        if($usr == null){
            $result["message"] = "User doesn't exist in the system !";
        }
        else{
            $privilegies = null;
            $ok = true;
            try{
                $privilegies = json_decode($_POST["usr_access"], true);
            }catch(Exception $e){Log::printStackTrace($e);}
            if(!$myself && !is_array($privilegies)){
                $ok = false;
                $result["message"] = "Invalid privilegies data submitted !";
            }
            if($ok) {
                $msg = $myself ? null : $usr->setPrivileges($privilegies);
                $result["message"] = $msg;
                if($msg == null) {
                    $usr->setPseudo($reqVar["usr_pseudo"]);
                    $usr->setPrenom($reqVar["usr_prenom"]);
                    $usr->uploadPhoto($avatar);
                    $usr->setNom($reqVar["usr_nom"]);
                    if ($poste != null && strlen($poste) > 0) {
                        $usr->setPoste((int) $poste);
                    }
                    $password = $password == null || strlen($password) == 0 ? null : $password;
                    $msg = $usr->save($password);
                    $result["message"] = $msg;
                    if ($msg == null) {
                        $result["error"] = false;
                        $result["code"] = 1;
                        $ths->move($avatar, realpath("../assets/avatars/"));
                        $result["message"] = "Success !";
                        if($usr->getId() != $client->getId() && $id != null){
                            Storage::disconnectUser($usr);
                        }
                        $result["data"] = Ressource::data();
                    }
                    else{
                        $ths->flush($avatar);
                    }
                }
            }
        }
    }
}
//@User wiping
else if(($reqVar = CheckIf::isRequest($_POST, ["usr_del_id"])) != null){
    if(!$client->hasPrivilege(39)){
        $result["message"] = "Access denied !";
        echo json_encode($result);
        die;
    }
    if(!CheckIf::isNumber($reqVar["usr_del_id"])){
        $result["message"] = "Invalid data given";
    }
    else{
        $t = User::getById((int) $reqVar["usr_del_id"]);
        if($t == null){
            $result["message"] = "Unrecognized id given !";
        }
        else{
            $result["message"] = "Unable to execute operation required";
            if($t->delete()){
                $result["message"] = "Success !";
                $result["error"] = false;
                $result["code"] = 1;
                try{
                    $result["data"] = Ressource::data();
                }catch(Exception $e){
                    Log::printStackTrace($e);
                }
            }
        }
    }
}
//@User status
else if(($reqVar = CheckIf::isRequest($_POST, ["usr_id", "usr_state"])) != null){
    if(!$client->hasPrivilege(40)){
        $result["message"] = "Access denied !";
        echo json_encode($result);
        die;
    }
    $state = CheckIf::set($reqVar["usr_state"]);
    if(!CheckIf::isNumber($reqVar["usr_id"]) && CheckIf::inArray($state->toLowerCase(), ["actif","inactif"])){
        $result["message"] = "Invalid data given";
    }
    else{
        $t = User::getById((int) $reqVar["usr_id"]);
        if($t == null){
            $result["message"] = "Unrecognized id given !";
        }else{
            $result["message"] = "Unable to execute operation required";
            $msg = $t->setActif($state->equalsIgnoreCase("actif"));
            $result["message"] = $msg;
            if($msg == null){
                $result["message"] = "Success";
                $result["code"] = 1;
                $result["error"] = false;
                try{
                    $result["data"] = Ressource::data();
                }catch(Exception $e){
                    Log::printStackTrace($e);
                }
            }
        }
    }
}
//@User teacher linking
else if(($reqVar = CheckIf::isRequest($_POST, ["th_id", "th_pseudo", "th_passcode"])) != null){
    if(!$client->hasPrivilege(37)){
        $result["message"] = "Access denied !";
        echo json_encode($result);
        die;
    }
    if(!CheckIf::isNumber($reqVar["th_id"])){
        $result["message"] = "Invalid id submitted !";
        echo json_encode($result);
        die;
    }

    $teacher = Teacher::getById((int) $reqVar["th_id"]);

    if($teacher == null){
        $result["message"] = "Unrecognized teacher id !";
        echo json_encode($result);
        die;
    }
    $teacherAccount = new User();
    $access = [0,2,3,6,7,16,21,22,41,42];
    $teacherAccount->setPseudo($reqVar["th_pseudo"]);
    $teacherAccount->setPrivileges($access);
    $msg = $teacherAccount->save($reqVar["th_passcode"], $teacher);
    $result["message"] = $msg;
    if($msg == null){
        $result["error"] = false;
        $result["code"] = 1;
        $result["message"] = "Success";
        try{
            $result["data"] = Ressource::data();
        }catch(Exception $e){
            Log::printStackTrace($e);
        }
    }
}
//@Session creation / edition
else if(CheckIf::isRequest($_POST, ['sess_number', 'sess_begin', 'sess_end'])){
    /**
     * active academic year is required !
     */
    RuntimeMessage::closeHttpRequestIfNot(AcademicYear::$current, $result, _str["academiclevel.undefined"]);
    $sess_next = 0;
    $sess_id = 0;
    extract($_POST);
    $result["message"] = _str["insuffisant.privileges"];
    CheckIf::granted($client, [101,$sess_id ? 103 : 102], $result);
    $session = $sess_id ? Sessions::getById((int)$sess_id) : new Sessions();
    $result["message"] = _str["session.invalid"];
    if($session){
        if($session->getEtat() != Sessions::PENDING && !CheckIf::authenticate($client)){
            $result["message"] = _str["session.locked"];
        }
        else{
            $result["message"] = $session->setNext((int)$sess_next)
                ->setNumber((int) $sess_number)
                ->setBegin($sess_begin)
                ->setEnd($sess_end)
                ->save();
            if(!$result["message"]){
                $result["message"] = _str["success"];
                $result = Ressource::resultSuccess($result["message"]);
            }
        }
    }
}
//@Session deletion
else if(CheckIf::isRequest($_POST, ['sess_del_id'])){
    /**
     * active academic year is required !
     */
    RuntimeMessage::closeHttpRequestIfNot(AcademicYear::$current, $result, _str["academiclevel.undefined"]);
    extract($_POST);
    $result["message"] = _str["deny"];
    CheckIf::granted($client, [101,104], $result);
    $session = Sessions::getById((int) $sess_del_id);
    $result["message"] = _str["session.invalid"];
    if($session){
        $result["message"] = $session->delete();
        if(!$result["message"]){
            $result = Ressource::resultSuccess("success");
        }
    }
}
//@WorkDays setting
else if(CheckIf::isRequest($_POST, ['wrk_day'])){
    CheckIf::granted($client, [500]);
    extract($_POST);
    $result["message"] = _str["ui.admin.work.management.days.list.required"];
    if(!is_array($wrk_day)){
        RuntimeMessage::closeHttpRequest($result);
    }
    $weekDays = _str["ui.view.weekDays"];
    $found = true;
    foreach($wrk_day as $day){
        if(!isset($weekDays[$day])){
            $found = false;
            break;
        }
    }
    RuntimeMessage::closeHttpRequestIfNot(!$found, $result);
    $result["message"] = System::setPreferences("workdays", implode(",",$wrk_day),AcademicYear::$current->getId());
    RuntimeMessage::closeHttpRequestIfNot($result["message"] != null, $result, $result["message"]);

    $result = Ressource::resultSuccess();
}
//@Workable hours
else if(CheckIf::isRequest($_POST, ['wrk_hour_beg', 'wrk_hour_end'])){
    CheckIf::granted($client, [501]);
    extract($_POST);
    RuntimeMessage::closeHttpRequestIfNot(!AkaDateTime::isTime($wrk_hour_beg) || !AkaDateTime::isTime($wrk_hour_end), $result, _str["ui.admin.work.management.hour.invalid"]);
    $msg = System::setPreferences("workhour_begin", $wrk_hour_beg, AcademicYear::$current->getId());
    RuntimeMessage::closeHttpRequestIfNot($msg != null, $result, $msg);
    $msg = System::setPreferences("workhour_end", $wrk_hour_end, AcademicYear::$current->getId());
    RuntimeMessage::closeHttpRequestIfNot($msg != null, $result, $msg);
    $teachers = Teacher::fetchAll();
    foreach ($teachers as $teacher){
        $teacher->save();
    }
    $result = Ressource::resultSuccess();
}