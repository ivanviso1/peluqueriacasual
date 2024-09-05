<?php

namespace Controllers;

use Classes\email;
use Model\Usuario;
use MVC\Router;

class LoginController {

    public static function login(Router $router) {

        $alertas = [];

        

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $auth = new Usuario($_POST);
            $alertas = $auth->validarLogin();

            if(empty($alertas)){
                $usuario = Usuario::where('email', $auth->email);

                if($usuario){

                   if( $usuario->comprobarPasswordandVerificado($auth->password) ){

                    session_start();

                    $_SESSION['id'] = $usuario->id;
                    $_SESSION['nombre'] = $usuario->nombre . " " . $usuario->apellido;
                    $_SESSION['email'] = $usuario->email;
                    $_SESSION['login'] = true;

                    //Redireccionamiento

                    if($usuario->admin === "1"){

                        $_SESSION['admin'] = $usuario-> admin ?? null;

                        header('Location:/admin');

                    }else{
                        header('Location:/cita');

                    }

                   }

                } else {

                    Usuario::setAlerta('error', 'Usuario o Password incorrectos');

                }
            }
            
        }

        $alertas = Usuario::getAlertas();
        
        $router->render('auth/login', [
            'alertas' => $alertas 
           // CORREGIDO
        ]);
    }

    public static function logout() {
        session_start();
        $_SESSION = [];
        header('Location: /');
    }

    public static function olvide(Router $router) {

        $alertas = [];

        if($_SERVER['REQUEST_METHOD'] === 'POST'){
            $auth = new Usuario($_POST);
            $alertas = $auth->validarEmail();

            if(empty($alertas)){
                $usuario = Usuario::where('email', $auth->email);

                if ($usuario && $usuario->confirmado ==="1"){

                    //Generar un token

                    $usuario->crearToken();
                    $usuario->guardar();

                    //Enviar el email

                    $email = new Email($usuario->email, $usuario->nombre, $usuario->token, );
                    $email->enviarInstrucciones();


                    Usuario::setAlerta('exito', 'Revisa tu email para cambiar la contraseña');
                    $alertas = Usuario::getAlertas();

                }else{ Usuario::setAlerta('error', 'El Usuario no existe o no está confirmado');
                    

                }
            }
        }

        $alertas = Usuario::getAlertas();

        $router->render('auth/olvide-password', [
        'alertas' => $alertas
        ]);
    }

    public static function recuperar(Router $router) {
        $alertas = [];
        $error = false;


        $token = s($_GET['token']);
        $usuario = Usuario::where('token', $token);

        if(empty($usuario)){

            Usuario::setAlerta('error', 'Token No Valido');
            $error = true;

        }
            
        if($_SERVER['REQUEST_METHOD'] === 'POST'){

            $password= new Usuario($_POST);
            $alertas = $password-> validarPassword();

            if(empty($alertas)){

                $usuario->password = null;

                $usuario-> password = $password->password;
                $usuario->hashPassword();
                $usuario->token = null;

                $resultado = $usuario->guardar();

                if($resultado){
                    header('Location: /');
                }


            }
        }


        $alertas= Usuario::getAlertas();
        $router->render('auth/recuperar-password', [

            'alertas'=> $alertas,
            'error' => $error

        ]);
    }

    public static function crear(Router $router) {
        $usuario = new Usuario; 

        // Alertas vacías
        $alertas = [];
    
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $usuario->sincronizar($_POST);
            $alertas = $usuario->validarNuevaCuenta();

            // Revisar que $alertas esté vacío
            if (empty($alertas)) {
                // Verificar que el usuario no esté registrado
                $resultado = $usuario->existeUsuario();

                if ($resultado->num_rows) {
                    $alertas = Usuario::getAlertas();
                } else {
                    // Hashear el Password
                    $usuario->hashPassword();

                    // Generar un token único
                    $usuario->crearToken();

                    // Enviar email
                    $email = new Email($usuario->nombre, $usuario->email, $usuario->token);
                    $email->enviarConfirmacion();

                    // Crear el usuario
                    $resultado = $usuario->guardar();

                    if ($resultado) {
                        header('Location: /mensaje');
                    }
                }
            }
        }
    
        $router->render('auth/crear-cuenta', [
            'usuario' => $usuario,
            'alertas' => $alertas
        ]);
    }

    public static function mensaje(Router $router) {
        $router->render('auth/mensaje');
    }

    public static function confirmar(Router $router) {
        $alertas = [];
        $token = s($_GET['token']);
        $usuario = Usuario::where('token', $token);

        if (empty($usuario)) {
            Usuario::setAlerta('error', 'Token no válido');
        } else {
            $usuario->confirmado = "1";
            $usuario->token = null; // Opcional: Limpiar el token una vez que ha sido usado
            $usuario->guardar(); // Asegúrate de que el usuario se guarde en la base de datos
            Usuario::setAlerta('exito', 'Cuenta confirmada con éxito');
        }

        $alertas = Usuario::getAlertas();
        $router->render('auth/confirmar-cuenta', [
            'alertas' => $alertas
        ]);
    }

} // Esta llave cierra la clase LoginController
