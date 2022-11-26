<?php
require_once __DIR__ . "/../Commons/main.php";

//@Faculty registration/edition
if($reqVar = CheckIf::isRequest($_POST, ["facname"])){
    $fac = new Faculty();
    $facid = htmlentities($_POST["facid"]);
    $fac->setNom($reqVar["facname"]);
    if($facid != null && CheckIf::isNumber($facid)){
        if(!$client->hasPrivilege(320)){
            $result["message"] = "Access denied !";
            echo json_encode($result);
            die;
        }
        $fac->setId((int) $facid);
    }
    else if(!$client->hasPrivilege(310)){
        $result["message"] = "Access denied !";
        echo json_encode($result);
        die;
    }
    $msg = $fac->save();
    $result["message"] = $msg;
    if($msg == null){
        $result["error"] = false;
        $result["message"] = "Access granted !";
        try {
            $result["data"] = Ressource::data("/admin");
        } catch (Exception $e) {
            Log::printStackTrace($e);
        }
    }
}
//@Faculty wiping
else if($reqVar = CheckIf::isRequest($_POST, ["facdelid"])){
    if(!$client->hasPrivilege(330)){
        $result["message"] = "Access denied !";
        echo json_encode($result);
        die;
    }
    $fac = Faculty::getById((int) $reqVar["facdelid"]);
    if($fac == null){
        $result["message"] = "Invalid faculty identifiant given !";
    }
    else{
        if($fac->delete()){
            $result["error"] = false;
            $result["message"] = "Access granted !";
            try {
                $result["data"] = Ressource::data("/admin");
            } catch (Exception $e) {
                Log::printStackTrace($e);}
        }
        else{
            $result["message"] = "Execution error !";
        }
    }
}
//@Hierarchy registration/edition
else if($reqVar = CheckIf::isRequest($_POST, ["poste_name", "poste_capacity", "poste_value"])){
    $linked = htmlentities($_POST["poste_linked"]);
    $id = htmlentities($_POST["poste_id"]);
    $hr = new Hierarchy();
    $hr->setCapacity((int) $reqVar["poste_capacity"]);
    $hr->setNotation($reqVar["poste_name"]);
    $hr->setValue((int) $reqVar["poste_value"]);
    if($linked != null && CheckIf::isNumber($linked)) {
        $hr->setAffectation((int) $linked);
    }
    if($id != null && CheckIf::isNumber($id)) {
        if(!$client->hasPrivilege(290)){
            $result["message"] = "Access denied !";
            echo json_encode($result);
            die;
        }
        $hr->setId((int) $id);
    }
    else if(!$client->hasPrivilege(280)){
        $result["message"] = "Access denied !";
        echo json_encode($result);
        die;
    }
    $msg = $hr->save();
    $result["message"] = $msg;
    if($msg == null){
        $result["message"] = "Success !";
        $result["code"] = 1;
        $result["error"] = false;
        try {
            $result["data"] = Ressource::data("/admin");
        } catch (Exception $e) {
            Log::printStackTrace($e);
        }
    }
}
//@Hierarchy wiping
else if($reqVar = CheckIf::isRequest($_POST, ["postedelid"])){
    if(!$client->hasPrivilege(300)){
        $result["message"] = "Access denied !";
        echo json_encode($result);
        die;
    }
    $hr = Hierarchy::getById((int) $reqVar["postedelid"]);
    if($hr == null){
        $result["message"] = "Invalid faculty identifiant given !";
    }
    else{
        if($hr->delete()){
            $result["error"] = false;
            $result["message"] = "Access granted !";
            try {
                $result["data"] = Ressource::data("/admin");
            } catch (Exception $e) {
                Log::printStackTrace($e);
            }
        }
        else{
            $result["message"] = "Execution error !";
        }
    }
}
//@Grade registration/edition
else if($reqVar = CheckIf::isRequest($_POST, ["fac-grade-notation", "fac-grade-value", "fac-id"])){
    $g = new Grade();
    $g->setFiliere((int) $reqVar["fac-id"]);
    $g->setAnnee((int) $reqVar["fac-grade-value"]);
    $g->setNotation($reqVar["fac-grade-notation"]);
    $gradeId = CheckIf::set($_POST["fac-grade-id"]);
    if($gradeId != null && strlen($gradeId) > 0){
        if(!$client->hasPrivilege(350)){
            $result["message"] = "Access denied !";
            echo json_encode($result);
            die;
        }
        $g->setId((int) $gradeId);
    }
    else if(!$client->hasPrivilege(340)){
        $result["message"] = "Access denied !";
        echo json_encode($result);
        die;
    }
    $msg = $g->save();
    $result["message"] = $msg;
    if($msg == null){
        try {
            $result["data"] = Ressource::data("/admin");
            $result["error"] = false;
            $result["code"] = 1;
        } catch (Exception $e) {
            Log::printStackTrace($e);
            $result["code"] = 2;
        }
    }
}
//@Grade wiping
else if($reqVar = CheckIf::isRequest($_POST, ["fac-grade-delid"])){
    if(!$client->hasPrivilege(360)){
        $result["message"] = "Access denied !";
        echo json_encode($result);
        die;
    }
    $g = Grade::getById((int) $reqVar["fac-grade-delid"]);
    if($g == null){
        $result["message"] = "Invalid grade id given !";
    }
    else{
        if($g->delete()){
            $result["message"] = "Success !";
            $result["error"] = false;
            try {
                $result["data"] = Ressource::data("/admin");
            } catch (Exception $e) {
                Log::printStackTrace($e);
            }
        }
        else{
            $result["message"] = "Execution error !";
        }
    }
}
//@Teacher registration/edition
else if($reqVar = CheckIf::isRequest($_POST, ["th_nom", "th_birthdate","th_birthplace",
    "th_email","th_nif","th_ninu", "th_address","th_phone","th_prenom","th_sexe",
    "th_skill","th_status","th_code", "th_sales"])
){
    $memo = CheckIf::set($_POST["th_memo"]);
    $id = CheckIf::set($_POST["th_id"]);
    $avatar = CheckIf::set($_POST["th_avatar"]);
    $avatar = $ths->isUploaded($avatar) ? $avatar : null;
    $hierarchy = CheckIf::set($_POST["th_hierarchy"]);
    $t = $id != null && CheckIf::isNumber($id) ? Teacher::getById((int) $id) : new Teacher();
    if($id != null && CheckIf::isNumber($id)) {
        if (!$client->hasPrivilege(240)) {
            $result["message"] = "Access denied !";
            echo json_encode($result);
            die;
        }
    }
    else if(!$client->hasPrivilege(230)){
        $result["message"] = "Access denied !";
        echo json_encode($result);
        die;
    }
    if($t == null){
        $result["message"] = "User doesn't exist in the system !";
    }
    else {
        $t->uploadPhoto($avatar);
        $t->setNom($reqVar["th_nom"]);
        $t->setPrenom($reqVar["th_prenom"]);
        $t->setAdresse($reqVar["th_address"]);
        $t->setCode($reqVar["th_code"]);
        $t->setDate_naissance($reqVar["th_birthdate"]);
        $t->setLieu_naissance($reqVar["th_birthplace"]);
        $t->setEmail($reqVar["th_email"]);
        $t->setNiveauEtude($reqVar["th_skill"]);
        $t->setNif($reqVar["th_nif"]);
        $t->setNinu($reqVar["th_ninu"]);
        $t->setTelephone($reqVar["th_phone"]);
        $t->setSexe($reqVar["th_sexe"]);
        $t->setSalaire( (double) $reqVar["th_sales"]);
        $t->setStatus_matrimonial($reqVar["th_status"]);
        if ($hierarchy != null && strlen($hierarchy) > 0) {
            $t->setPoste((int) $hierarchy);
        }
        if ($id != null && CheckIf::isNumber($id)) {
            $t->setId((int) $id);
        }
        if ($memo != null) {
            $t->setMemo($memo);
        }

        $msg = $t->save();
        $result["message"] = $msg;
        if ($msg == null) {
            $result["error"] = false;
            $result["message"] = "Success !";
            $result["data"] = Ressource::data("/teacher");
            $ths->move($avatar, realpath("../assets/avatars/"));
        }
        else{
            $ths->flush($avatar);
        }
    }
}
//@Teacher wiping
else if($reqVar = CheckIf::isRequest($_POST, ["th_del_id"])){
    if(!$client->hasPrivilege(250)){
        $result["message"] = "Access denied !";
        echo json_encode($result);
        die;
    }
    $t = Teacher::getById((int) $reqVar["th_del_id"]);
    if($t == null){
        $result["message"] = "The teacher doesn't exist in the system";
    }
    else{
        if($t->delete()){
            $result["error"] = false;
            $result["code"] = 1;
            $result["message"] = "Success !";
            try{
                $result["data"] = Ressource::data("/teacher");
            }catch(Exception $e){
                Log::printStackTrace($e);
            }
        }
        else{
            $result["message"] = "An error occured during operation";
        }
    }
}
//@Teacher state
else if($reqVar = CheckIf::isRequest($_POST, ["th_state", "th_id"])){
    if(!$client->hasPrivilege(260)){
        $result["message"] = "Access denied !";
        echo json_encode($result);
        die;
    }
    $t = Teacher::getById((int) $reqVar["th_id"]);
    if($t == null){
        $result["message"] = "The teacher doesn't exist in the system";
    }
    else{
        $msg = $t->setEtat($reqVar["th_state"]);
        $result["message"] = $msg;
        if($msg == null){
            $result["message"] = "Success !";
            $result["error"] = false;
            $result["code"] = 1;
            try{
                $result["data"] = Ressource::data("/teacher");
            }catch(Exception $e){
                Log::printStackTrace($e);
            }
        }
    }
}
//@Student registration/edition
else if($reqVar = CheckIf::isRequest($_POST, ["st_nom", "st_birthdate","st_birthplace",
    "st_email","st_nif","st_ninu", "st_address","st_phone","st_prenom","st_sexe",
    "st_skill","st_code", "st_person_ref", "st_phone_ref"])
){
    $memo = CheckIf::set($_POST["st_memo"]);
    $avatar = CheckIf::set($_POST["st_upl_avatar"]);
    $avatar = $ths->isUploaded($avatar) ? $avatar : null;
    $id = CheckIf::set($_POST["st_id"]);
    if($id != null && CheckIf::isNumber($id)){
        if(!$client->hasPrivilege(130)){
            $result["message"] = "Access denied !";
            echo json_encode($result);
            die;
        }
    }
    else if(!$client->hasPrivilege(120)){
        $result["message"] = "Access denied !";
        echo json_encode($result);
        die;
    }
    $t = $id != null && CheckIf::isNumber($id) ? Student::getById((int) $id) : new Student();
    if($t == null){
        $result["message"] = "User doesn't exist in the system !";
    }
    else {
        $t->setNom($reqVar["st_nom"]);
        $t->setPrenom($reqVar["st_prenom"]);
        $t->setAdresse($reqVar["st_address"]);
        $t->setCode($reqVar["st_code"]);
        $t->setDate_naissance($reqVar["st_birthdate"]);
        $t->setLieu_naissance($reqVar["st_birthplace"]);
        $t->setEmail($reqVar["st_email"]);
        $t->setNiveau((int) $reqVar["st_skill"]);
        $t->setNif($reqVar["st_nif"]);
        $t->setNinu($reqVar["st_ninu"]);
        $t->setTelephone($reqVar["st_phone"]);
        $t->setSexe($reqVar["st_sexe"]);
        $t->setPersonneRef($reqVar["st_person_ref"]);
        $t->setTelephoneRef($reqVar["st_phone_ref"]);
        $t->uploadPhoto($avatar);
        if ($id != null && CheckIf::isNumber($id)) {
            $t->setId((int) $id);
        }
        if ($memo != null) {
            $t->setMemo($memo);
        }

        $msg = $t->save();
        $result["message"] = $msg;
        if ($msg == null) {
            $result["error"] = false;
            $result["message"] = "Success !";
            $result["data"] = Ressource::data("/student");
            $ths->move($avatar, realpath("../assets/avatars/"));
        }
        else{
            $ths->flush($avatar);
        }
    }
}
//@Student registration from file
else if($reqVar = CheckIf::isRequest($_POST, ["st_list"])){
    if(!$client->hasPrivilege(120)){
        $result["message"] = "Access denied !";
        echo json_encode($result);
        die;
    }
    $msg = Student::registerFromXcel(ThunderSpeed::$uploadDir . $reqVar["st_list"]);
    $result["message"] = $msg;
    $ths->flush($reqVar["st_list"]);
    if($msg == null){
        $result["message"] = "Success !";
        $result["code"] = 1;
        $result["error"] = false;
        $result["data"] = Ressource::data("/student");
    }
}
//@Student wiping
else if($reqVar = CheckIf::isRequest($_POST, ["st_del_id"])){
    if(!$client->hasPrivilege(140)){
        $result["message"] = "Access denied !";
        echo json_encode($result);
        die;
    }
    $t = Student::getById((int) $reqVar["st_del_id"]);
    if($t == null){
        $result["message"] = "The teacher doesn't exist in the system";
    }
    else{
        if($t->delete()){
            $result["error"] = false;
            $result["code"] = 1;
            $result["message"] = "Success !";
            try{
                $result["data"] = Ressource::data("/student");
            }catch(Exception $e){
                Log::printStackTrace($e);
            }
        }
        else{
            $result["message"] = "An error occured during operation";
        }
    }
}
//@Student state
else if($reqVar = CheckIf::isRequest($_POST, ["st_state", "st_id"])){
    if(!$client->hasPrivilege(150)){
        $result["message"] = "Access denied !";
        echo json_encode($result);
        die;
    }
    $t = Student::getById((int) $reqVar["st_id"]);
    if($t == null){
        $result["message"] = "The teacher doesn't exist in the system";
    }
    else{
        $msg = $t->setEtat($reqVar["st_state"]);
        $result["message"] = $msg;
        if($msg == null){
            $result["message"] = "Success !";
            $result["error"] = false;
            $result["code"] = 1;
            try{
                $result["data"] = Ressource::data("/teacher");
            }catch(Exception $e){
                Log::printStackTrace($e);
            }
        }
    }
}
//@Course registration/edition
else if($reqVar = CheckIf::isRequest($_POST, ["cr_grade", "cr_name", "cr_principale", "cr_hours", "cr_session", "cr_rate", "cr_code"])){
    $ok = true;
    $hours = $reqVar["cr_hours"];
    if(!is_array($hours)){
        $result["message"] = "Error from parsing data !";
        $ok = false;
    }
    if($ok){
        $id = CheckIf::set($_POST["cr_id"]);
        $suppleant = CheckIf::set($_POST["cr_suppleant"]);
        $edit = $id != null && CheckIf::isNumber($id);
        if($edit){
            if(!$client->hasPrivilege(180)){
                $result["message"] = "Access denied !";
                echo json_encode($result);
                die;
            }
        }else if(!$client->hasPrivilege(170)){
            $result["message"] = "Access denied !";
            echo json_encode($result);
            die;
        }
        $c = $edit ? Course::getById((int) $id) : new Course();
        if($c == null){
            $result["message"] = "This course doesn't exist in the system !";
        }
        else {
            $c->setTitulaire((int) $reqVar["cr_principale"]);
            if ($suppleant != null && CheckIf::isNumber($suppleant)) {
                $c->setSuppleant((int) $suppleant);
            }
            $c->setNom($reqVar["cr_name"]);
            $c->setHoraire($hours);
            $c->setCode($reqVar["cr_code"]);
            $c->setCoefficient((int) $reqVar["cr_rate"]);
            $c->setNiveau((int) $reqVar["cr_grade"]);
            $c->setSession((int) $reqVar["cr_session"]);

            $msg = $c->save();
            $result["message"] = $msg;
            if ($msg == null) {
                $result["error"] = false;
                $result["message"] = "Success !";
                $result["code"] = 1;
                try {
                    $result["data"] = Ressource::data("/course");
                } catch (Exception $e) {
                    Log::printStackTrace($e);
                }
            }
        }
    }
}
//@Course wiping
else if($reqVar = CheckIf::isRequest($_POST, ["cr_del_id"])){
    if(!$client->hasPrivilege(190)){
        $result["message"] = "Access denied !";
        echo json_encode($result);
        die;
    }
    $c = Course::getById((int) $reqVar["cr_del_id"]);
    if($c == null){
        $result["message"] = "The course doesn't exist in the system";
    }
    else{
        if($c->delete()){
            $result["error"] = false;
            $result["code"] = 1;
            $result["message"] = "Success !";
            try{
                $result["data"] = Ressource::data("/course");
            }catch(Exception $e){
                Log::printStackTrace($e);
            }
        }
        else{
            $result["message"] = "An error occured during operation";
        }
    }
}
//@Course state
else if(($reqVar = CheckIf::isRequest($_POST, ["cr_state", "cr_id"])) != null){
    if(!$client->hasPrivilege(200)){
        $result["message"] = "Access denied !";
        echo json_encode($result);
        die;
    }
    $c = Course::getById((int) $reqVar["cr_id"]);
    if($c == null){
        $result["message"] = "The course doesn't exist in the system";
    }
    else{
        $msg = $c->setEtat($reqVar["cr_state"]);
        $result["message"] = $msg;
        if($msg == null){
            $result["message"] = "Success !";
            $result["error"] = false;
            $result["code"] = 1;
            try{
                $result["data"] = Ressource::data("/course");
            }catch(Exception $e){
                Log::printStackTrace($e);
            }
        }
    }
}
//@Note evaluation
else if(($reqVar = CheckIf::isRequest($_POST, ["nt_course", "nt_studnote", "nt_session"])) != null){
    if(!$client->hasPrivilege(410)){
        $result["message"] = "Access denied !";
        echo json_encode($result);
        die;
    }
    $ok = true;
    $notes = $reqVar["nt_studnote"];
    if(!is_array($notes)) {
        $result["message"] = "Error from parsing data !";
        $ok = false;
    }
    if($ok){
        $msg = Notes::evaluate((int) $reqVar["nt_course"],(int) $reqVar["nt_session"],$notes);
        $result["message"] = $msg;
        if($msg == null){
            $result["error"] = false;
            $result["message"] = "Success !";
            $result["code"] = 1;
            try{
                $result["data"] = Ressource::data("/notes");
            }catch(Exception $e){
                Log::printStackTrace($e);
            }
        }
    }
}
