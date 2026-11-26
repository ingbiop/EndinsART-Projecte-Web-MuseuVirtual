<?php
// Activa l'accés al llibre de visites des de la Sala 3 — EndinsART

session_start();
$_SESSION['visites_access'] = true;
header('Location: ../llibre-visites.php');
exit;
