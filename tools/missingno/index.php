<?php
$imageinfo = getimagesize("missingno.png");
$width  = $imageinfo[0];
$height = $imageinfo[1];


/*
$image = imagecreatefrompng("missingno.png");
for ($a = 0; $a < $height; $a++) {
  for ($b = 0; $b < $width; $b++) {
    $colorindex = imagecolorsforindex($image, imagecolorat($image, $b, $a));
    $uniq[] = $colorindex;
    $blah = $colorindex;
  }
  //echo "\n";
}

$uniq = array_map("unserialize", array_unique(array_map("serialize", $uniq)));
sort($uniq);

$imageinfo = getimagesize("missingno.png");
$width  = $imageinfo[0];
$height = $imageinfo[1];


$image = imagecreatefrompng("missingno.png");
$output = array();
for ($a = 0; $a < $height; $a++) {
  for ($b = 0; $b < $width; $b++) {
    $colorindex = imagecolorsforindex($image, imagecolorat($image, $b, $a));
    $search = array_search($colorindex, $uniq);
    if ($search != false) {
      $output[$a][$b] = $search;
    } else {
      $output[$a][$b] = 0;
    }
  }
  //echo "\n";
}
//echo json_encode($uniq);
echo json_encode($output);
*/



$missingno = json_decode(file_get_contents("missingno.json"));
$tileset = imagecreatefrompng("all.png");
$img = imagecreatetruecolor($width, $height);
imagealphablending($img, false);
imagesavealpha($img, true);

$random = array(
  array(mt_rand(0,16)*16, mt_rand(0,501)),
  array(mt_rand(0,16)*16, mt_rand(0,501)),
  array(mt_rand(0,16)*16, mt_rand(0,501)),
  array(mt_rand(0,16)*16, mt_rand(0,501))
);

for ($a = 0; $a < count($missingno); $a++) {
  for ($b = 0; $b < count($missingno[0]); $b++) {
    if ($missingno[$a][$b] == 0) {
      $back = ImageColorAllocateAlpha($img, 255, 255, 255, 127);
      $border = ImageColorAllocateAlpha($img, 255, 255, 255, 127);
      ImageFilledRectangle($img, $b, $a, $b+1, $a+1, $back);
      ImageRectangle($img, $b, $a, $b+1, $a+1, $border);
    } else if ($missingno[$a][$b] == 1) {
      $back = ImageColorAllocate($img, 255, 255, 255);
      $border = ImageColorAllocate($img, 255, 255, 255);
      ImageFilledRectangle($img, $b, $a, $b+1, $a+1, $back);
      ImageRectangle($img, $b, $a, $b+1, $a+1, $border);
    } else if ($missingno[$a][$b] == 2) {
      imagecopyresampled($img, $tileset, $b, $a, $random[0][0], $random[0][1], 1, 1, 16, 16);
    } else if ($missingno[$a][$b] == 3) {
      imagecopyresampled($img, $tileset, $b, $a, $random[1][0], $random[1][1], 1, 1, 16, 16);
    } else if ($missingno[$a][$b] == 4) {
      imagecopyresampled($img, $tileset, $b, $a, $random[2][0], $random[2][1], 1, 1, 16, 16);
    } else if ($missingno[$a][$b] == 5) {
      imagecopyresampled($img, $tileset, $b, $a, $random[3][0], $random[3][1], 1, 1, 16, 16);
    }
  }
}


header("Content-Type: image/png");
imagepng($img);
?>
