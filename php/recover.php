<?php
/**
 * recover.php
 * Genera un token de recuperación y lo envía por email.
 */

require_once 'auth_utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Método no permitido'], 405);
}

$body = json_decode(file_get_contents('php://input'), true);
$email = filter_var($body['email'] ?? '', FILTER_VALIDATE_EMAIL);

if (!$email) {
    jsonResponse(['error' => 'Email inválido'], 400);
}

$pdo = getConnection();

try {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user) {
        $resetToken = generateToken();
        $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

        $update = $pdo->prepare("UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?");
        $update->execute([$resetToken, $expires, $user['id']]);

        // Enviar email
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
        $host = $_SERVER['HTTP_HOST'];
        $resetUrl = "$protocol://$host/#/reset-password?token=$resetToken"; // El frontend manejará esta ruta

        $subject = "Recuperación de contraseña - TabSystem";
        $message = "
            <h2>Recuperación de contraseña</h2>
            <p>Has solicitado restablecer tu contraseña. Haz clic en el enlace de abajo (válido por 1 hora):</p>
            <p><a href='$resetUrl'>$resetUrl</a></p>
            <p>Si no has solicitado esto, puedes ignorar este correo.</p>
        ";
        sendAuthEmail($email, $subject, $message);
    }

    // Siempre devolvemos éxito para evitar enumeración de cuentas
    jsonResponse(['success' => true, 'message' => 'Si el email está registrado, se ha enviado un código de recuperación.']);

}
catch (Exception $e) {
    jsonResponse(['error' => 'Error al procesar recuperación: ' . $e->getMessage()], 500);
}
