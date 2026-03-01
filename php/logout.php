<?php
/**
 * logout.php
 * Cierra la sesión del usuario.
 */

require_once 'config.php';

session_unset();
session_destroy();

jsonResponse(['success' => true, 'message' => 'Sesión cerrada']);
