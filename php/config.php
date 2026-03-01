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

/*  // Configuración local opcional (XAMPP) define('DB_HOST', 'localhost'); define('DB_NAME', 'tabsystem'); define('DB_USER', 'ganbaru'); define('DB_PASS', 'Ganbaru@6699'); define('DB_CHARSET', 'utf8mb4'); */

// Cabeceras CORS y JSON
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
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
