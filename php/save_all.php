<?php
/**
 * save_all.php
 * Recibe el estado completo del frontend y sobreescribe la base de datos del usuario de forma atómica.
 */

require_once 'config.php';
require_once 'auth_utils.php';

// Asegurar que el usuario está autenticado
$userId = requireAuth();

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
    // 1. Limpiar solo los datos del usuario actual

    // global_measurement_records depende de global_measurements
    $pdo->prepare("DELETE FROM global_measurement_records WHERE measurement_id IN (SELECT id FROM global_measurements WHERE user_id = ?)")->execute([$userId]);

    $pdo->prepare("DELETE FROM global_measurements WHERE user_id = ?")->execute([$userId]);
    $pdo->prepare("DELETE FROM work_entries WHERE user_id = ?")->execute([$userId]);
    $pdo->prepare("DELETE FROM multipliers WHERE user_id = ?")->execute([$userId]);
    $pdo->prepare("DELETE FROM periods WHERE user_id = ?")->execute([$userId]);
    $pdo->prepare("DELETE FROM brick_types WHERE user_id = ?")->execute([$userId]);
    $pdo->prepare("DELETE FROM supplements WHERE user_id = ?")->execute([$userId]);

    // 2. Insertar Ladrillos
    if (!empty($body['brickTypes'])) {
        $stmt = $pdo->prepare("INSERT INTO brick_types (id, name, price_per_square_meter, type, user_id) VALUES (?, ?, ?, ?, ?)");
        foreach ($body['brickTypes'] as $b) {
            $stmt->execute([$b['id'], $b['name'], $b['pricePerSquareMeter'], $b['type'], $userId]);
        }
    }

    // 3. Insertar Períodos
    if (!empty($body['periods'])) {
        $stmt = $pdo->prepare("INSERT INTO periods (id, name, start_date, end_date, user_id) VALUES (?, ?, ?, ?, ?)");
        foreach ($body['periods'] as $p) {
            $stmt->execute([$p['id'], $p['name'], $p['startDate'], $p['endDate'] ?? null, $userId]);
        }
    }

    // 4. Insertar Multiplicadores
    if (!empty($body['multipliers'])) {
        $stmt = $pdo->prepare("INSERT INTO multipliers (id, name, value, description, user_id) VALUES (?, ?, ?, ?, ?)");
        foreach ($body['multipliers'] as $m) {
            $stmt->execute([$m['id'], $m['name'], $m['value'], $m['description'] ?? null, $userId]);
        }
    }

    // 5. Insertar Trabajos
    if (!empty($body['workEntries'])) {
        $stmt = $pdo->prepare("INSERT INTO work_entries 
            (id, date, brick_type_id, supplement_ids, linear_meters, height, square_meters, quantity, price_per_unit, description, base_earnings, supplement_earnings, total_earnings, period_id, user_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        foreach ($body['workEntries'] as $e) {
            $stmt->execute([
                $e['id'], $e['date'], $e['brickTypeId'],
                isset($e['supplementIds']) ? json_encode($e['supplementIds']) : null,
                $e['linearMeters'] ?? null, $e['height'] ?? null, $e['squareMeters'] ?? null,
                $e['quantity'] ?? null, $e['pricePerUnit'] ?? null, $e['description'] ?? null,
                $e['baseEarnings'], $e['supplementEarnings'], $e['totalEarnings'], $e['periodId'] ?? null,
                $userId
            ]);
        }
    }

    // 6. Insertar Mediciones Globales
    if (!empty($body['globalMeasurements'])) {
        $stmtGm = $pdo->prepare("INSERT INTO global_measurements (id, period_id, description, created_at, user_id) VALUES (?, ?, ?, ?, ?)");
        $stmtRec = $pdo->prepare("INSERT INTO global_measurement_records (measurement_id, brick_type_id, square_meters, earnings) VALUES (?, ?, ?, ?)");

        foreach ($body['globalMeasurements'] as $gm) {
            $stmtGm->execute([$gm['id'], $gm['periodId'], $gm['description'] ?? null, $gm['createdAt'], $userId]);
            foreach ($gm['records'] as $rec) {
                $stmtRec->execute([$gm['id'], $rec['brickTypeId'], $rec['squareMeters'], $rec['earnings']]);
            }
        }
    }

    // 7. Insertar Suplementos
    if (!empty($body['supplements'])) {
        $stmt = $pdo->prepare("INSERT INTO supplements (id, name, price, user_id) VALUES (?, ?, ?, ?)");
        foreach ($body['supplements'] as $s) {
            $stmt->execute([$s['id'], $s['name'], $s['price'], $userId]);
        }
    }

    $pdo->commit();
    jsonResponse(['success' => true, 'message' => 'Todo guardado correctamente en tu cuenta']);

}
catch (Exception $e) {
    if ($pdo->inTransaction())
        $pdo->rollBack();
    jsonResponse(['error' => $e->getMessage()], 500);
}
