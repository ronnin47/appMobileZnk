const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json({ limit: '50mb' })); // para parsear JSON
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/*
app.use(bodyParser.json({ limit: '50mb' }));  
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); 
*/
//LOCAL HOST bbdd
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'baseLocalZnk',
  password: '041183',
  port: 5432,
});

app.get('/', (req, res) => {
  res.send('Servidor funcionando y conectado a PostgreSQL');
});


// Probar conexión al iniciar el servidor
pool.connect()
  .then(client => {
    return client
      .query('SELECT NOW()')
      .then(res => {
        console.log('✅ Conexión a la base de datos exitosa. Fecha actual:', res.rows[0].now);
        client.release();
      })
      .catch(err => {
        client.release();
        console.error('❌ Error al hacer la consulta inicial:', err.stack);
      });
  })
  .catch(err => {
    console.error('❌ No se pudo conectar a la base de datos:', err.stack);
  });

// Prueba conexión a la base de datos
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()'); // Consulta simple
    res.json({ now: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});







//insert de usuario OK!!

app.post('/insert-usuario', async (req, res) => {
  const { email, contrasenia } = req.body;
    const estatus="jugador"
    console.log("REQ: ",req.body)
  
  try {
    const query = `
      INSERT INTO usuarios (email, contrasenia, estatus)
      VALUES ($1, $2, $3)
      RETURNING idusuario
    `;

    const values = [email, contrasenia, estatus];
    const result = await pool.query(query, values);

    const newId = result.rows[0].idusuario;
    const newEstatus = result.rows[0].estatus;

    res.status(201).json({ message: `Bienvenido ${email}.`, idusuario: newId, estatus: newEstatus });
  } catch (err) {

    if (err.code === '23505') { 
      res.json({ message: 'El mail ya se encuentra registrado.' });
    } else {
      console.error('Error al insertar el usuario:', err.message);
      res.status(500).json({ error: 'Error al insertar el usuario.' });
    }

    
  }
});


//login OK!
app.post('/loginUsuario', async (req, res) => {
  const { email, contrasenia } = req.body;
  
  console.log("",req.body)

  try {
    const userQuery = 'SELECT * FROM usuarios WHERE email = $1';
    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      console.log("No se encontró el usuario con el email proporcionado.");
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }
 
    const user = userResult.rows[0];
    const idusuario = userResult.rows[0].idusuario;
    const estatus = userResult.rows[0].estatus;

    if (user.contrasenia !== contrasenia) {
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }
    res.json({
      message: 'Inicio de sesión exitoso',
      //personajes: personajesResult.rows, 
      idusuario: idusuario,
      estatus: estatus,
    });

  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});


//Consumir personajes Usuario OK!
app.get('/consumirPersonajesUsuario', async (req, res) => {
  try {
    
    const { usuarioId } = req.query;
    console.log("el id del usuario es: ",usuarioId)
    const userQuery = 'SELECT * FROM personajes WHERE "usuarioId"=$1 ORDER BY "idpersonaje" ASC';
    const userResult = await pool.query(userQuery,[usuarioId]);

   
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'No se recupero personajes para Usuario' });
    }

    const coleccionPersonajes = userResult.rows;

   

    
    res.json({
      message: 'Peticion de personajes consumidos exitoso',
      coleccionPersonajes: coleccionPersonajes,   
    });

  } catch (error) {
    console.error('Error al obtener coleccion personajes del Usuario:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

//crear la ficha nueva de pj OK!
app.post('/insert-personaje', async (req, res) => {

  console.log("REQ CRAR FICHA: ",req.body)
  const { 
    nombre,
      dominio,
      raza,
      naturaleza,
      edad,
      ken,
      ki,
      destino,
      pDestino,
      fuerza,
      fortaleza,
      destreza,
      agilidad,
      sabiduria,
      presencia,
      principio,
      sentidos,
      academisismo,
      alerta,
      atletismo,
      conBakemono,
      mentir,
      pilotear,
      artesMarciales,
      medicina,
      conObjMagicos,
      sigilo,
      conEsferas,
      conLeyendas,
      forja,
      conDemonio,
      conEspiritual,
      manejoBlaster,
      manejoSombras,
      tratoBakemono,
      conHechiceria,
      medVital,
      medEspiritual,
      rayo,
      fuego,
      frio,
      veneno,
      corte,
      energia,
      ventajas,  
      apCombate,
      valCombate,
      apCombate2,
      valCombate2,
      add1,
      valAdd1,
      add2,
      valAdd2,
      add3,
      valAdd3,
      add4,
      valAdd4,
      imagen,
      inventario,
      dominios,
      kenActual,
      kiActual,
      positiva,
      negativa,
      vidaActual,
      hechizos,
      consumision,
      iniciativa,
      historia,
      usuarioId,
      tecEspecial,   
      conviccion,
      cicatriz, 
      notaSaga,  
      resistencia,  
      pjPnj,
   } = req.body;
   
  try {
    const query = `
      INSERT INTO personajes (
      nombre, 
      dominio, 
      raza, 
      naturaleza, 
      edad, 
      ken, 
      ki, 
      destino, 
      "pDestino", 
      fuerza, 
      fortaleza, 
      destreza, 
      agilidad, 
      sabiduria, 
      presencia, 
      principio, 
      sentidos, 
      academisismo, 
      alerta, 
      atletismo, 
      "conBakemono", 
      mentir,
      pilotear,
      "artesMarciales",
      medicina,
      "conObjMagicos",
      sigilo,
      "conEsferas",
      "conLeyendas",
      forja,
      "conDemonio",
      "conEspiritual",
      "manejoBlaster",
      "manejoSombras",
      "tratoBakemono",
      "conHechiceria",
      "medVital",
      "medEspiritual",
      rayo,
      fuego,
      frio,
      veneno,
      corte,
      energia,
      ventajas,
      "apCombate",
      "valCombate",
      "apCombate2",
      "valCombate2",
      add1,
      "valAdd1",
      add2,
      "valAdd2",
      add3,
      "valAdd3",
      add4,
      "valAdd4",
      imagen,
      inventario,
      dominios,
      "kenActual",
      "kiActual",
      positiva,
      negativa,
      "vidaActual",
      hechizos,
      consumision,
      iniciativa,
      historia,
      "tecEspecial",
      conviccion,
      cicatriz,
      notasaga,
      resistencia,
      "pjPnj",
      "usuarioId"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58, $59, $60, $61, $62, $63, $64, $65, $66, $67, $68, $69, $70, $71, $72, $73, $74, $75, $76)
      RETURNING idpersonaje
    `;

    const values = [
      nombre,
      dominio,
      raza,
      naturaleza,
      edad,
      ken,
      ki,
      destino,
      pDestino,
      fuerza,
      fortaleza,
      destreza,
      agilidad,
      sabiduria,
      presencia,
      principio,
      sentidos,
      academisismo,
      alerta,
      atletismo,
      conBakemono,
      mentir,
      pilotear,
      artesMarciales,
      medicina,
      conObjMagicos,
      sigilo,
      conEsferas,
      conLeyendas,
      forja,
      conDemonio,
      conEspiritual,
      manejoBlaster,
      manejoSombras,
      tratoBakemono,
      conHechiceria,
      medVital,
      medEspiritual,
      rayo,
      fuego,
      frio,
      veneno,
      corte,
      energia,
      ventajas,    
      apCombate,
      valCombate,
      apCombate2,
      valCombate2,
      add1,
      valAdd1,
      add2,
      valAdd2,
      add3,
      valAdd3,
      add4,
      valAdd4,
      imagen,
      inventario,
      dominios,
      kenActual,
      kiActual,
      positiva,
      negativa,
      vidaActual,
      hechizos,
      consumision,
      iniciativa,
      historia,
      tecEspecial,
      conviccion,
      cicatriz,
      notaSaga,
      resistencia,
      pjPnj,
      usuarioId,   
      ];
    const result = await pool.query(query, values);
    const newId = result.rows[0].idpersonaje;
    res.status(201).json({ message: 'Nueva ficha creada exitosamente.', idpersonaje: newId });
  } catch (err) {
    console.error('Error al insertar el personaje:', err.message);
    res.status(500).json({ error: 'Error al insertar el personaje.' });
  }
});

//UPdate personaje OK!
app.put('/update-personaje/:id', async (req, res) => {

//console.log("esto es lo que trae el req",req.body)
  const idpersonaje = req.params.id;
/*
  console.log("***********ID: ",idpersonaje)

  console.log('REQ.BODY:', req.body);
  if (!req.body) return res.status(400).json({ error: 'No se recibió body' });
   if (!req.body) return res.status(400).send('No body');
  */
  const { 
      nombre,
      dominio,
      raza,
      naturaleza,
      edad,
      ken,
      ki,
      destino,
      pDestino,
      fuerza,
      fortaleza,
      destreza,
      agilidad,
      sabiduria,
      presencia,
      principio,
      sentidos,
      academisismo,
      alerta,
      atletismo,
      conBakemono,
      mentir,
      pilotear,
      artesMarciales,
      medicina,
      conObjMagicos,
      sigilo,
      conEsferas,
      conLeyendas,
      forja,
      conDemonio,
      conEspiritual,
      manejoBlaster,
      manejoSombras,
      tratoBakemono,
      conHechiceria,
      medVital,
      medEspiritual,
      rayo,
      fuego,
      frio,
      veneno,
      corte,
      energia,
      ventajas,   
      apCombate,
      valCombate,
      apCombate2,
      valCombate2,
      add1,
      valAdd1,
      add2,
      valAdd2,
      add3,
      valAdd3,
      add4,
      valAdd4,
      imagen,
      inventario,
      dominios,
      kenActual,
      kiActual,
      positiva,
      negativa,
      vidaActual,
      hechizos,
      consumision,
      iniciativa,
      historia,
      usuarioId,
      tecEspecial,
      conviccion,
      cicatriz,
      resistencia,
      pjPnj,
      
   } = req.body;
 
  try {
    const query = `
    UPDATE personajes
    SET 
      nombre = $1,
      dominio = $2,
      raza = $3,
      naturaleza = $4,
      edad = $5,
      ken = $6,
      ki = $7,
      destino = $8,
      "pDestino" = $9,
      fuerza = $10,
      fortaleza = $11,
      destreza = $12,
      agilidad = $13,
      sabiduria = $14,
      presencia = $15,
      principio = $16,
      sentidos = $17,
      academisismo = $18,
      alerta = $19,
      atletismo = $20,
      "conBakemono" = $21,
      mentir = $22,
      pilotear = $23,
      "artesMarciales" = $24,
      medicina = $25,
      "conObjMagicos" = $26,
      sigilo = $27,
      "conEsferas" = $28,
      "conLeyendas" = $29,
      forja = $30,
      "conDemonio" = $31,
      "conEspiritual" = $32,
      "manejoBlaster" = $33,
      "manejoSombras" = $34,
      "tratoBakemono" = $35,
      "conHechiceria" = $36,
      "medVital" = $37,
      "medEspiritual" = $38,
      rayo = $39,
      fuego = $40,
      frio = $41,
      veneno = $42,
      corte = $43,
      energia = $44,
      ventajas = $45,
      "apCombate" = $46,
      "valCombate" = $47,
      "apCombate2" = $48,
      "valCombate2" = $49,
      add1 = $50,
      "valAdd1" = $51,
      add2 = $52,
      "valAdd2" = $53,
      add3 = $54,
      "valAdd3" = $55,
      add4 = $56,
      "valAdd4" = $57,
      imagen = $58,
      inventario = $59,
      dominios = $60,
      "kenActual" = $61,
      "kiActual" = $62,
      positiva = $63,
      negativa = $64,
      "vidaActual" = $65,
      hechizos = $66,
      consumision = $67,
      iniciativa = $68,
      historia = $69,
      "usuarioId" = $70,
      "tecEspecial" = $71,
      conviccion= $72,
      cicatriz= $73,
      resistencia= $74,
      "pjPnj"= $75
    WHERE idpersonaje = $76
  `;
    const values = [
      nombre,
      dominio,
      raza,
      naturaleza,
      edad,
      ken,
      ki,
      destino,
      pDestino,
      fuerza,
      fortaleza,
      destreza,
      agilidad,
      sabiduria,
      presencia,
      principio,
      sentidos,


      academisismo,
      alerta,
      atletismo,
      conBakemono,
      mentir,
      pilotear,
      artesMarciales,
      medicina,
      conObjMagicos,
      sigilo,
      conEsferas,
      conLeyendas,
      forja,
      conDemonio,
      conEspiritual,
      manejoBlaster,
      manejoSombras,
      tratoBakemono,
      conHechiceria,
      medVital,
      medEspiritual,
      rayo,
      fuego,
      frio,
      veneno,
      corte,
      energia,
      ventajas,      
      apCombate,
      valCombate,
      apCombate2,
      valCombate2,
      add1,
      valAdd1,
      add2,
      valAdd2,
      add3,
      valAdd3,
      add4,
      valAdd4,
      imagen,
      inventario,
      dominios,
      kenActual,
      kiActual,
      positiva,
      negativa,
      vidaActual,
      hechizos,
      consumision,
      iniciativa,
      historia,
      usuarioId,
      tecEspecial,    
      conviccion,
      cicatriz,
      resistencia,
      pjPnj,
      idpersonaje
      ];
    const result = await pool.query(query, values);
 
    res.status(201).json({ message: 'Personaje modificado exitosamente.', idpersonaje});
  } catch (err) {
    console.error('Error al modificar el personaje:', err.message);
    res.status(500).json({ error: 'Error al modificar el personaje.' });
  }
  
});











app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});