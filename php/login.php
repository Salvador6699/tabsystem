<?php
/**
 * login.php
 * Valida credenciales y crea una sesión de usuario.
 */

require_once 'auth_utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Método no permitido'], 405);
}

$body = json_decode(file_get_contents('php://input'), true);
$email = $body['email'] ?? '';
$password = $body['password'] ?? '';

if (empty($email) || empty($password)) {
    jsonResponse(['error' => 'Email y contraseña requeridos'], 400);
}

$pdo = getConnection();

try {
    $stmt = $pdo->prepare("SELECT id, email, password_hash, is_verified FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        jsonResponse(['error' => 'Credenciales incorrectas'], 401);
    }

    if (!$user['is_verified']) {
        jsonResponse(['error' => 'La cuenta no ha sido verificada. Revisa tu email.'], 403);
    }

    // Iniciar sesión
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_email'] = $user['email'];

    jsonResponse([
        'success' => true,
        'user' => [
            'id' => $user['id'],
            'email' => $user['email']
        ]
    ]);

}
catch (Exception $e) {
    jsonResponse(['error' => 'Error en el servidor: ' . $e->getMessage()], 500);
}
