<?php
/**
 * reset.php
 * Cambia la contraseña usando el token de recuperación.
 */

require_once 'auth_utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Método no permitido'], 405);
}

$body = json_decode(file_get_contents('php://input'), true);
$token = $body['token'] ?? '';
$newPassword = $body['password'] ?? '';

if (empty($token) || strlen($newPassword) < 6) {
    jsonResponse(['error' => 'Token inválido o contraseña demasiado corta'], 400);
}

$pdo = getConnection();

try {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE reset_token = ? AND reset_expires > NOW()");
    $stmt->execute([$token]);
    $user = $stmt->fetch();

    if (!$user) {
        jsonResponse(['error' => 'El enlace ha expirado o es inválido'], 400);
    }

    $passwordHash = password_hash($newPassword, PASSWORD_BCRYPT);
    $update = $pdo->prepare("UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?");
    $update->execute([$passwordHash, $user['id']]);

    jsonResponse(['success' => true, 'message' => 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.']);

}
catch (Exception $e) {
    jsonResponse(['error' => 'Error al restablecer contraseña: ' . $e->getMessage()], 500);
}
