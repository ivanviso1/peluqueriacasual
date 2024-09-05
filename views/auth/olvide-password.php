<h1 class="nombre-pagina"> Olvidé Mi Password </h1>
<p class="descripcion-pagina">Restablece tu password escribiendo tu email a continuación </p>

<?php
    include_once __DIR__ ."/../templates/alertas.php";
?>

<form class="formulario" method="POST" action="/olvide">

<div class="campo">
    <label for="email"> Email </label>
    <input
    
    type="email"
    id="email"
    name="email"
    placeholder="Tu Email"

    />
</div>

<input type="submit" value="Enviar" class="boton">

</form>

<div class="acciones">
    <a href="/">¿Ya tienes una cuenta? Inicia sesión</a>
    <a href="/crear-cuenta">Regístrate</a>

</div>