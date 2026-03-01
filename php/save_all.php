<?php
/**
 * save_all.php
 * Recibe el estado completo del frontend y sobreescribe la base de datos de forma atómica.
 * Es el método más seguro contra inconsistencias.
 */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Método no permitido'], 405);
}

$body = json_decode(file_get_contents('php://input'), true);
if (!$body) {
    jsonResponse(['error' => 'JSON inválido'], 400);
}

$pdo = getConnection();
$pdo->beginTransaction();

try {
    // 1. Limpiar todas las tablas antes de reinsertar el estado actual
    // El orden es importante por las posibles claves foráneas o dependencias lógicas
    $pdo->exec("DELETE FROM global_measurement_records");
    $pdo->exec("DELETE FROM global_measurements");
    $pdo->exec("DELETE FROM work_entries");
    $pdo->exec("DELETE FROM multipliers");
    $pdo->exec("DELETE FROM periods");
    $pdo->exec("DELETE FROM brick_types");

    // 2. Insertar Ladrillos
    if (!empty($body['brickTypes'])) {
        $stmt = $pdo->prepare("INSERT INTO brick_types (id, name, price_per_square_meter, type) VALUES (?, ?, ?, ?)");
        foreach ($body['brickTypes'] as $b) {
            $stmt->execute([$b['id'], $b['name'], $b['pricePerSquareMeter'], $b['type']]);
        }
    }

    // 3. Insertar Períodos
    if (!empty($body['periods'])) {
        $stmt = $pdo->prepare("INSERT INTO periods (id, name, start_date, end_date) VALUES (?, ?, ?, ?)");
        foreach ($body['periods'] as $p) {
            $stmt->execute([$p['id'], $p['name'], $p['startDate'], $p['endDate'] ?? null]);
        }
    }

    // 4. Insertar Multiplicadores
    if (!empty($body['multipliers'])) {
        $stmt = $pdo->prepare("INSERT INTO multipliers (id, name, value, description) VALUES (?, ?, ?, ?)");
        foreach ($body['multipliers'] as $m) {
            $stmt->execute([$m['id'], $m['name'], $m['value'], $m['description'] ?? null]);
        }
    }

    // 5. Insertar Trabajos
    if (!empty($body['workEntries'])) {
        $stmt = $pdo->prepare("INSERT INTO work_entries 
            (id, date, brick_type_id, supplement_ids, linear_meters, height, square_meters, quantity, price_per_unit, description, base_earnings, supplement_earnings, total_earnings, period_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        foreach ($body['workEntries'] as $e) {
            $stmt->execute([
                $e['id'], $e['date'], $e['brickTypeId'],
                isset($e['supplementIds']) ? json_encode($e['supplementIds']) : null,
                $e['linearMeters'] ?? null, $e['height'] ?? null, $e['squareMeters'] ?? null,
                $e['quantity'] ?? null, $e['pricePerUnit'] ?? null, $e['description'] ?? null,
                $e['baseEarnings'], $e['supplementEarnings'], $e['totalEarnings'], $e['periodId'] ?? null
            ]);
        }
    }

    // 6. Insertar Mediciones Globales
    if (!empty($body['globalMeasurements'])) {
        $stmtGm = $pdo->prepare("INSERT INTO global_measurements (id, period_id, description, created_at) VALUES (?, ?, ?, ?)");
        $stmtRec = $pdo->prepare("INSERT INTO global_measurement_records (measurement_id, brick_type_id, square_meters, earnings) VALUES (?, ?, ?, ?)");

        foreach ($body['globalMeasurements'] as $gm) {
            $stmtGm->execute([$gm['id'], $gm['periodId'], $gm['description'] ?? null, $gm['createdAt']]);
            foreach ($gm['records'] as $rec) {
                $stmtRec->execute([$gm['id'], $rec['brickTypeId'], $rec['squareMeters'], $rec['earnings']]);
            }
        }
    }

    $pdo->commit();
    jsonResponse(['success' => true, 'message' => 'Todo guardado correctamente en MySQL']);

}
catch (Exception $e) {
    if ($pdo->inTransaction())
        $pdo->rollBack();
    jsonResponse(['error' => $e->getMessage()], 500);
}
