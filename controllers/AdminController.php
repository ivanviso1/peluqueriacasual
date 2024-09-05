<?php 

namespace Controllers;

use Model\AdminCita;
use MVC\Router;

class AdminController {
    public static function index(Router $router) {
        session_start();

        isAdmin();

        // Obtener la fecha desde GET o usar la fecha actual
        $fecha = $_GET['fecha'] ?? date('Y-m-d');

        // Detectar si la fecha está en formato dd/mm/yyyy
        if (strpos($fecha, '/') !== false) {
            // Convertir la fecha desde el formato dd/mm/yyyy al formato Y-m-d
            $fechas = explode('/', $fecha);
            if (count($fechas) === 3) {
                $fecha = $fechas[2] . '-' . $fechas[1] . '-' . $fechas[0];
            }
        }

        // Validar que la fecha sea correcta en formato Y-m-d
        $fechas = explode('-', $fecha);
        if (!checkdate($fechas[1], $fechas[2], $fechas[0])) {
            header('Location: /404');
            exit();
        }

        // Consultar la base de datos para citas en la fecha seleccionada
        $consulta = "SELECT citas.id, citas.hora, CONCAT(usuarios.nombre, ' ', usuarios.apellido) as cliente, ";
        $consulta .= "usuarios.email, usuarios.telefono, servicios.nombre as servicio, servicios.precio ";
        $consulta .= "FROM citas ";
        $consulta .= "LEFT OUTER JOIN usuarios ON citas.usuarioId=usuarios.id ";
        $consulta .= "LEFT OUTER JOIN citasServicios ON citasServicios.citaId=citas.id ";
        $consulta .= "LEFT OUTER JOIN servicios ON servicios.id=citasServicios.servicioId ";
        $consulta .= "WHERE DATE(citas.fecha) = '${fecha}'";  // Aquí usamos DATE() para asegurarnos de comparar solo la fecha

        $citas = AdminCita::SQL($consulta);

        // Renderizar la vista con las citas obtenidas
        $router->render('admin/index', [
            'nombre' => $_SESSION['nombre'],
            'citas' => $citas, 
            'fecha' => $fecha
        ]);
    }
}
