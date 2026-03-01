<?php
/**
 * register.php
 * Registra un nuevo usuario con acceso directo (sin verificación).
 */

require_once 'auth_utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Método no permitido'], 405);
}

$body = json_decode(file_get_contents('php://input'), true);
$email = filter_var($body['email'] ?? '', FILTER_VALIDATE_EMAIL);
$password = $body['password'] ?? '';

if (!$email || strlen($password) < 6) {
    jsonResponse(['error' => 'Email inválido o contraseña demasiado corta (mínimo 6 caracteres)'], 400);
}

$pdo = getConnection();

// Verificar si el email ya existe
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    jsonResponse(['error' => 'El email ya está registrado'], 409);
}

$passwordHash = password_hash($password, PASSWORD_BCRYPT);

try {
    // Marcamos como verificado directamente (is_verified = 1)
    $stmt = $pdo->prepare("INSERT INTO users (email, password_hash, is_verified) VALUES (?, ?, 1)");
    $stmt->execute([$email, $passwordHash]);

    jsonResponse([
        'success' => true,
        'message' => 'Registro completado con éxito. Ya puedes iniciar sesión.'
    ]);

}
catch (Exception $e) {
    jsonResponse(['error' => 'Error al registrar usuario: ' . $e->getMessage()], 500);
}
