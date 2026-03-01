<?php
/**
 * config.php - Configuración simplificada y robusta.
 */

// Evitar cualquier salida accidental que rompa el JSON
ob_start();

// Configuración de la base de datos
define('DB_HOST', 'localhost');
define('DB_NAME', 'tabsystem');
define('DB_USER', 'myplantrabb3');
define('DB_PASS', 'Ganbaru@6699');
define('DB_CHARSET', 'utf8mb4');

// Configuración de Correo (SMTP)
define('SMTP_HOST', 'smtp.plantrabajo.com');
define('SMTP_USER', 'info@plantrabajo.com'); // Cambiar por la cuenta real
define('SMTP_PASS', 'tu-contraseña'); // Cambiar por la contraseña real
define('SMTP_PORT', 465); // SSL/TLS: 465, STARTTLS: 587
define('SMTP_SECURE', 'ssl'); // 'ssl' o 'tls'
define('FROM_EMAIL', 'info@plantrabajo.com');
define('FROM_NAME', 'TabSystem Auth');

// Configuración de Sesiones / Seguridad
define('AUTH_SECRET', 'cambia-esto-por-algo-seguro-y-largo'); // Para firmar tokens si fuera necesario
session_start([
    'cookie_httponly' => true,
    'cookie_secure' => false, // Cambiar a true si usas HTTPS
    'cookie_samesite' => 'Lax',
]);

/*  // Configuración local opcional (XAMPP) define('DB_HOST', 'localhost'); define('DB_NAME', 'tabsystem'); define('DB_USER', 'ganbaru'); define('DB_PASS', 'Ganbaru@6699'); define('DB_CHARSET', 'utf8mb4'); */

// Cabeceras CORS y JSON
header('Access-Control-Allow-Origin: http://localhost:5173'); // Ajustar a tu dominio de producción si es necesario
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/**
 * Conexión PDO centralizada.
 */
function getConnection(): PDO
{
    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
    try {
        return new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }
    catch (PDOException $e) {
        if (ob_get_level())
            ob_clean();
        http_response_code(500);
        echo json_encode(['error' => 'Error de conexión: ' . $e->getMessage()]);
        exit;
    }
}

/**
 * Finaliza enviando JSON limpio.
 */
function jsonResponse($data, int $code = 200): void
{
    if (ob_get_level())
        ob_clean();
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
