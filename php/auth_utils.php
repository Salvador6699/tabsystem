<?php
/**
 * auth_utils.php
 * Funciones comunes para el sistema de autenticación.
 */

require_once 'config.php';

/**
 * Genera un token aleatorio seguro.
 */
function generateToken($length = 32)
{
    return bin2hex(random_bytes($length));
}

/**
 * Envío de correo. 
 * En hosting compartido, mail() usa la configuración del servidor. 
 * Para SMTP externo (como smtp.plantrabajo.com con auth), se recomienda PHPMailer.
 */
function sendAuthEmail($to, $subject, $message)
{
    $headers = "From: " . FROM_NAME . " <" . FROM_EMAIL . ">\r\n";
    $headers .= "Reply-To: " . FROM_EMAIL . "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    // Nota: mail() en Windows/Hosting requiere que el servidor SMTP esté configurado en php.ini
    // o que el hosting permita el envío directo.
    return mail($to, $subject, $message, $headers);
}

/**
 * Verifica si el usuario está logueado por sesión.
 */
function requireAuth()
{
    if (!isset($_SESSION['user_id'])) {
        jsonResponse(['error' => 'No autorizado'], 401);
    }
    return $_SESSION['user_id'];
}
