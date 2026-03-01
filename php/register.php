<?php
/**
 * register.php
 * Registra un nuevo usuario y envía email de verificación.
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
$verifyToken = generateToken();

try {
    $stmt = $pdo->prepare("INSERT INTO users (email, password_hash, verify_token) VALUES (?, ?, ?)");
    $stmt->execute([$email, $passwordHash, $verifyToken]);

    // Enviar email de verificación
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
    $host = $_SERVER['HTTP_HOST'];
    $verifyUrl = "$protocol://$host/php/verify.php?token=$verifyToken";

    $subject = "Verifica tu cuenta en TabSystem";
    $message = "
        <h2>¡Bienvenido a TabSystem!</h2>
        <p>Haz clic en el siguiente enlace para activar tu cuenta:</p>
        <p><a href='$verifyUrl'>$verifyUrl</a></p>
        <p>Si no has creado esta cuenta, puedes ignorar este correo.</p>
    ";

    $sent = sendAuthEmail($email, $subject, $message);

    jsonResponse([
        'success' => true,
        'message' => 'Registro completado. Revisa tu email para activar la cuenta.',
        'email_sent' => $sent // Útil para depurar en hosting
    ]);

}
catch (Exception $e) {
    jsonResponse(['error' => 'Error al registrar usuario: ' . $e->getMessage()], 500);
}
