<?php
/**
 * verify_session.php
 * Comprueba si hay una sesión activa de PHP y devuelve los datos del usuario.
 */

require_once 'auth_utils.php';

try {
    $userId = requireAuth();
    $pdo = getConnection();

    $stmt = $pdo->prepare("SELECT id, email, username FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if ($user) {
        jsonResponse(['user' => $user]);
    }
    else {
        jsonResponse(['error' => 'Usuario no encontrado'], 401);
    }
}
catch (Exception $e) {
    jsonResponse(['error' => 'No autorizado'], 401);
}
