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
 * Verifica si el usuario está logueado por sesión.
 */
function requireAuth()
{
    if (!isset($_SESSION['user_id'])) {
        jsonResponse(['error' => 'No autorizado'], 401);
    }
    return $_SESSION['user_id'];
}
