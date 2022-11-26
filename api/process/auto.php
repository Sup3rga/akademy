<?php
require_once "./self_autoload.php";
$target = "./datasets/schools.txt";
$output = ["./datasets/town_by_department.json","./datasets/schools_by_department.json"];
$index = "Grand-Anse";
$schools_dep = json_decode(file_get_contents($output[1]), true);
$towns_dep = json_decode(file_get_contents($output[0]), true);
//$source = json_decode(file_get_contents($target),true);
//$schools[$index] = [];
//foreach($source as $school){
//    $schools[$index][preg_replace("#^([\s]+)?([\s\S]+?)([\s]+)?$#","$2",$school["town_name"])] = [
//        "id"=>$school["town_id"],
//        "schools"=>[]
//    ];
//}
echo "<pre>";
//print_r($schools);
echo "</pre>";
//$db = Storage::Connect();
//foreach($towns_dep as $department => $towns) {
//    $schools = $schools_dep[$department];
//    $chk = $db->prepare("insert into departement(nom, pays, validation) values(:p1,1,1)");
//    try {
//        $chk->execute(['p1' => $department]);
//    }catch (Exception $e){
//        echo("<br> [ERROR] " . $e->getMessage());
//    }
//    $chk = $db->prepare("select id from departement where nom=:p1 and pays=1");
//    $chk->execute(['p1'=>$department]);
//    $id = $chk->fetch()['id'];
//    var_dump($id);
//    foreach($towns as $town => $data) {
//        $chk = $db->prepare("insert into villes(id,nom,dep,validation) values (:p1,:p2,:p3,1)");
//        try {
//            $chk->execute(['p1' => $data['id'], 'p2' => $town, 'p3' => $id]);
//        }catch(Exception $e){
//            echo("<br>[ERROR] " . $e->getMessage());
//        }
//    }
//    foreach ($schools as $school => $data){
//        $chk = $db->prepare("insert into institutions(id,nom, departement, validation) values (:p1,:p2,:p3,1)");
//        try {
//            $chk->execute(['p1' => $data['id'], 'p2' => $school, 'p3' => $id]);
//        }catch(Exception $e){
//            echo("<br> [ERROR]" . $e->getMessage());
//        }
//    }
//}

//$list = Country::cache(__DIR__ . "/../datasets/test.json");

$departments = Department::fetchAll();
$countries = Country::setContentMod(Country::WITHOUT_DATA)::fetchAll();
$db = Storage::Connect();
$chk = $db->prepare("select id, adresse, adresse_temp, lieu_naissance from individu");
$chk->execute();
echo"<pre>";
$adresse = [];
while($e = $chk->fetch()){
    if(strlen($e["adresse"]) > 0) {
        $tab = explode(",", $e["adresse"]);
        for ($i = 0; $i < count($tab); $i++) {
            $tab[$i] = preg_replace("/^[\\s]+|[\\s]+$/", "", $tab[$i]);
        }
        $ville = $tab[count($tab) - 1];
        $found = false;
        foreach ($departments as $department) {
            foreach ($department->getTowns() as $town) {
                if (CheckIf::soundsLike($ville, $town->getNom())) {
                    print_r([$town->getNom(), $e['adresse']]);
                    $found = true;
                }
            }
        }
        if(!$found){
            print_r(["Not found"=>$ville, "addr"=>$e['adresse']]);
        }
    }
}
echo "</pre>";