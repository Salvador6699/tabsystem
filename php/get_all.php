<?php
/**
 * get_all.php
 * Descarga el estado COMPLETO de la aplicación desde MySQL.
 */

require_once 'config.php';

$pdo = getConnection();

try {
    // 1. Tipos de ladrillo
    $stmt = $pdo->query("SELECT * FROM brick_types");
    $brickTypes = $stmt->fetchAll();
    foreach ($brickTypes as &$bt) {
        $bt['pricePerSquareMeter'] = (float)$bt['price_per_square_meter'];
        unset($bt['price_per_square_meter']);
    }

    // 2. Períodos
    $stmt = $pdo->query("SELECT * FROM periods");
    $periods = $stmt->fetchAll();
    foreach ($periods as &$p) {
        $p['startDate'] = $p['start_date'];
        $p['endDate'] = $p['end_date'];
        unset($p['start_date'], $p['end_date']);
    }

    // 3. Multiplicadores
    $stmt = $pdo->query("SELECT * FROM multipliers");
    $multipliers = $stmt->fetchAll();
    foreach ($multipliers as &$m) {
        $m['value'] = (float)$m['value'];
    }

    // 4. Registros de trabajo
    $stmt = $pdo->query("SELECT * FROM work_entries");
    $workEntries = $stmt->fetchAll();
    foreach ($workEntries as &$e) {
        $e['brickTypeId'] = $e['brick_type_id'];
        $e['supplementIds'] = $e['supplement_ids'] ? json_decode($e['supplement_ids'], true) : [];
        $e['linearMeters'] = isset($e['linear_meters']) ? (float)$e['linear_meters'] : null;
        $e['height'] = isset($e['height']) ? (float)$e['height'] : null;
        $e['squareMeters'] = isset($e['square_meters']) ? (float)$e['square_meters'] : null;
        $e['quantity'] = isset($e['quantity']) ? (float)$e['quantity'] : null;
        $e['pricePerUnit'] = isset($e['price_per_unit']) ? (float)$e['price_per_unit'] : null;
        $e['baseEarnings'] = (float)$e['base_earnings'];
        $e['supplementEarnings'] = (float)$e['supplement_earnings'];
        $e['totalEarnings'] = (float)$e['total_earnings'];
        $e['periodId'] = $e['period_id'];
        
        unset($e['brick_type_id'], $e['supplement_ids'], $e['linear_meters'], $e['height'], $e['square_meters'], $e['quantity'], $e['price_per_unit'], $e['base_earnings'], $e['supplement_earnings'], $e['total_earnings'], $e['period_id']);
    }

    // 5. Mediciones globales
    $stmt = $pdo->query("SELECT * FROM global_measurements");
    $gMeasurements = $stmt->fetchAll();
    foreach ($gMeasurements as &$gm) {
        $gm['periodId'] = $gm['period_id'];
        $gm['createdAt'] = $gm['created_at'];
        
        $stmtRec = $pdo->prepare("SELECT brick_type_id as brickTypeId, square_meters as squareMeters, earnings FROM global_measurement_records WHERE measurement_id = ?");
        $stmtRec->execute([$gm['id']]);
        $gm['records'] = $stmtRec->fetchAll();
        foreach ($gm['records'] as &$rec) {
            $rec['squareMeters'] = (float)$rec['squareMeters'];
            $rec['earnings'] = (float)$rec['earnings'];
        }
        unset($gm['period_id'], $gm['created_at']);
    }

    jsonResponse([
        'brickTypes' => $brickTypes,
        'periods' => $periods,
        'multipliers' => $multipliers,
        'workEntries' => $workEntries,
        'globalMeasurements' => $gMeasurements
    ]);

} catch (Exception $e) {
    jsonResponse(['error' => $e->getMessage()], 500);
}
