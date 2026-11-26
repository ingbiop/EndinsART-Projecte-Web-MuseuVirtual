<?php
$pageType   = 'expo';
$pageTitle  = 'Sala 3 — Exposició Temporal — EndinsART';
$expoTitle  = 'Sala 3 · Exposició Temporal';
$dataSource = 'api/get-artic-api.php';
$roomId     = 'expo3';
$exitUrl    = 'api/auth-visites.php';
$hideDescription = true;

include 'includes/header.php';
include 'includes/expo-template.php';
include 'includes/footer.php';
