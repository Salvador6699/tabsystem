<?php
/**
 * verify.php
 * Verifica el token enviado por email y activa la cuenta.
 */

require_once 'auth_utils.php';

$token = $_GET['token'] ?? '';

if (empty($token)) {
    die("Token inválido");
}

$pdo = getConnection();

try {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE verify_token = ? AND is_verified = 0");
    $stmt->execute([$token]);
    $user = $stmt->fetch();

    if (!$user) {
        die("Token inválido o cuenta ya verificada.");
    }

    $update = $pdo->prepare("UPDATE users SET is_verified = 1, verify_token = NULL WHERE id = ?");
    $update->execute([$user['id']]);

    // Redirigir al frontend (opcional) o mostrar mensaje
    echo "<h1>¡Cuenta verificada con éxito!</h1>";
    echo "<p>Ya puedes iniciar sesión en la aplicación.</p>";
    echo "<p><a href='/'>Volver al inicio</a></p>";

}
catch (Exception $e) {
    die("Error al verificar cuenta: " . $e->getMessage());
}
