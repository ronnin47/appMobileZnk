const express = require('express');
const cors = require('cors');

const http = require('http');
const { Server } = require('socket.io');

const bodyParser = require('body-parser');
const { Pool } = require('pg');

//ACA LAS NUEVAS IMPORTACIONES
const fs = require('fs');
const path = require('path');

//para la carpeta de imagene sy sus urls
const cloudinary = require('cloudinary').v2;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json({ limit: '50mb' })); // para parsear JSON
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


// Servir la carpeta uploads como pública
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
/*
app.use(bodyParser.json({ limit: '50mb' }));  
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); 
*/





const server = http.createServer(app);
// Inicializa el servidor de Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // Cambiar por dominio exacto en producción
    methods: ['GET', 'POST'],
  },
});


const connectedUsers = new Map();
// Escucha cuando un cliente se conecta
io.on('connection', (socket) => {
  console.log(`Socket conectado: ${socket.id}`);

  socket.on('user-connected', (userData) => {
    const { usuarioId, sesion } = userData;
    if (usuarioId && sesion) {
      connectedUsers.set(socket.id, usuarioId);
      console.log(`Usuario ${usuarioId} conectado.`);
      io.emit('connected-users', Array.from(connectedUsers.values()));
    }
  });

  socket.on('tirada', (mensaje) => {
    console.log('Tirada recibida:', mensaje);
    io.emit('tirada', mensaje);
  });

  socket.on('chat-message', (mensaje) => {
    console.log('Mensaje de chat recibido:', mensaje);
    io.emit('chat-message', mensaje);
  });

  socket.on('disconnect', () => {
    const usuarioDesconectado = connectedUsers.get(socket.id);
    if (usuarioDesconectado) {
      console.log(`Usuario ${usuarioDesconectado} desconectado.`);
      connectedUsers.delete(socket.id);
      io.emit('connected-users', Array.from(connectedUsers.values()));
    }
  });
});













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



cloudinary.config({
  cloud_name: 'dzul1hatw',
  api_key: '687946621544217',
  api_secret: '09DUepXU-FApoUrHnc8h6sJb25I',
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









//***********************ACA ESTAMSO TRABAJANDO************* */
/*
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
*/

/*esta es la de la carpeta local 
app.post('/insert-personaje', async (req, res) => {
  // Desestructurás TODO lo que recibís del personaje, incluyendo imagen
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

      console.log('Datos recibidos para insertar personaje:', {
      nombre, dominio, raza, usuarioId,
      // No es necesario loguear todo si es muy grande, solo lo relevante
    });
    // Insertás todo excepto imagenurl (lo agregamos después)
    const query = `
      INSERT INTO personajes (
        nombre, dominio, raza, naturaleza, edad, ken, ki, destino, "pDestino",
        fuerza, fortaleza, destreza, agilidad, sabiduria, presencia, principio,
        sentidos, academisismo, alerta, atletismo, "conBakemono", mentir, pilotear,
        "artesMarciales", medicina, "conObjMagicos", sigilo, "conEsferas", "conLeyendas",
        forja, "conDemonio", "conEspiritual", "manejoBlaster", "manejoSombras", "tratoBakemono",
        "conHechiceria", "medVital", "medEspiritual", rayo, fuego, frio, veneno, corte,
        energia, ventajas, "apCombate", "valCombate", "apCombate2", "valCombate2",
        add1, "valAdd1", add2, "valAdd2", add3, "valAdd3", add4, "valAdd4", inventario, 
        dominios, "kenActual", "kiActual", positiva, negativa, "vidaActual",
        hechizos, consumision, iniciativa, historia, "tecEspecial", conviccion, cicatriz,
        notasaga, resistencia, "pjPnj", "usuarioId"
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23,
        $24, $25, $26, $27, $28, $29,
        $30, $31, $32, $33, $34, $35,
        $36, $37, $38, $39, $40, $41, $42, $43,
        $44, $45, $46, $47, $48, $49,
        $50, $51, $52, $53, $54, $55,
        $56, $57, $58, $59, $60, $61,
        $62, $63, $64, $65, $66, $67,
        $68, $69, $70, $71, $72, $73,
        $74, $75
      )
      RETURNING idpersonaje
    `;

    const values = [
      nombre, dominio, raza, naturaleza, edad, ken, ki, destino, pDestino,
      fuerza, fortaleza, destreza, agilidad, sabiduria, presencia, principio,
      sentidos, academisismo, alerta, atletismo, conBakemono, mentir, pilotear,
      artesMarciales, medicina, conObjMagicos, sigilo, conEsferas, conLeyendas,
      forja, conDemonio, conEspiritual, manejoBlaster, manejoSombras, tratoBakemono,
      conHechiceria, medVital, medEspiritual, rayo, fuego, frio, veneno, corte,
      energia, ventajas, apCombate, valCombate, apCombate2, valCombate2,
      add1, valAdd1, add2, valAdd2, add3, valAdd3, add4, valAdd4,
      inventario, dominios, kenActual, kiActual, positiva, negativa, vidaActual,
      hechizos, consumision, iniciativa, historia, tecEspecial, conviccion, cicatriz,
      notaSaga, resistencia, pjPnj, usuarioId
    ];
     console.log('Valores para la inserción:', values);
    const result = await pool.query(query, values);
    const newId = result.rows[0].idpersonaje;


     console.log('*******Nuevo idpersonaje insertado:', newId);
    // Si llegó la imagen, la procesás y guardás en carpeta uploads
    if (imagen) {
      const matches = imagen.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ error: 'Imagen base64 inválida.' });
      }
      const ext = matches[1];
      const data = matches[2];
      const buffer = Buffer.from(data, 'base64');

      const filename = `personaje_${newId}.${ext}`;
      const filepath = path.join(__dirname, 'uploads', filename);

      fs.writeFileSync(filepath, buffer);

      // Formás URL pública para la imagen guardada
      const baseUrl = 'http://192.168.0.38:3000'; // Cambiar a tu IP o dominio real
      const url = `${baseUrl}/uploads/${filename}`;

      // Actualizás el registro con la URL de la imagen
      await pool.query(
        'UPDATE personajes SET imagenurl = $1 WHERE idpersonaje = $2',
        [url, newId]
      );
    }



    res.status(201).json({ message: 'Nueva ficha creada exitosamente.', idpersonaje: newId });
  } catch (err) {
    console.error('Error al insertar el personaje:', err.message);
    res.status(500).json({ error: 'Error al insertar el personaje.' });
  }
});
*/

app.post('/insert-personaje', async (req, res) => {
  const {
    nombre, dominio, raza, naturaleza, edad, ken, ki, destino, pDestino,
    fuerza, fortaleza, destreza, agilidad, sabiduria, presencia, principio,
    sentidos, academisismo, alerta, atletismo, conBakemono, mentir, pilotear,
    artesMarciales, medicina, conObjMagicos, sigilo, conEsferas, conLeyendas,
    forja, conDemonio, conEspiritual, manejoBlaster, manejoSombras, tratoBakemono,
    conHechiceria, medVital, medEspiritual, rayo, fuego, frio, veneno, corte,
    energia, ventajas, apCombate, valCombate, apCombate2, valCombate2,
    add1, valAdd1, add2, valAdd2, add3, valAdd3, add4, valAdd4,
    imagen, inventario, dominios, kenActual, kiActual, positiva, negativa, vidaActual,
    hechizos, consumision, iniciativa, historia, usuarioId,
    tecEspecial, conviccion, cicatriz, notaSaga, resistencia, pjPnj
  } = req.body;

  try {
    // 1. Insertar personaje sin imagenurl
    const query = `
      INSERT INTO personajes (
        nombre, dominio, raza, naturaleza, edad, ken, ki, destino, "pDestino",
        fuerza, fortaleza, destreza, agilidad, sabiduria, presencia, principio,
        sentidos, academisismo, alerta, atletismo, "conBakemono", mentir, pilotear,
        "artesMarciales", medicina, "conObjMagicos", sigilo, "conEsferas", "conLeyendas",
        forja, "conDemonio", "conEspiritual", "manejoBlaster", "manejoSombras", "tratoBakemono",
        "conHechiceria", "medVital", "medEspiritual", rayo, fuego, frio, veneno, corte,
        energia, ventajas, "apCombate", "valCombate", "apCombate2", "valCombate2",
        add1, "valAdd1", add2, "valAdd2", add3, "valAdd3", add4, "valAdd4",
        inventario, dominios, "kenActual", "kiActual", positiva, negativa, "vidaActual",
        hechizos, consumision, iniciativa, historia, "tecEspecial", conviccion, cicatriz,
        notasaga, resistencia, "pjPnj", "usuarioId"
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23,
        $24, $25, $26, $27, $28, $29,
        $30, $31, $32, $33, $34, $35,
        $36, $37, $38, $39, $40, $41, $42, $43,
        $44, $45, $46, $47, $48, $49,
        $50, $51, $52, $53, $54, $55,
        $56, $57, $58, $59, $60, $61,
        $62, $63, $64, $65, $66, $67,
        $68, $69, $70, $71, $72, $73,
        $74, $75
      )
      RETURNING idpersonaje
    `;

    const values = [
      nombre, dominio, raza, naturaleza, edad, ken, ki, destino, pDestino,
      fuerza, fortaleza, destreza, agilidad, sabiduria, presencia, principio,
      sentidos, academisismo, alerta, atletismo, conBakemono, mentir, pilotear,
      artesMarciales, medicina, conObjMagicos, sigilo, conEsferas, conLeyendas,
      forja, conDemonio, conEspiritual, manejoBlaster, manejoSombras, tratoBakemono,
      conHechiceria, medVital, medEspiritual, rayo, fuego, frio, veneno, corte,
      energia, ventajas, apCombate, valCombate, apCombate2, valCombate2,
      add1, valAdd1, add2, valAdd2, add3, valAdd3, add4, valAdd4,
      inventario, dominios, kenActual, kiActual, positiva, negativa, vidaActual,
      hechizos, consumision, iniciativa, historia, tecEspecial, conviccion, cicatriz,
      notaSaga, resistencia, pjPnj, usuarioId
    ];

    const result = await pool.query(query, values);
    const newId = result.rows[0].idpersonaje;

    let imageUrl = null;

    if (imagen) {
      const matches = imagen.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) return res.status(400).json({ error: 'Imagen base64 inválida.' });

      const ext = matches[1];
      const data = matches[2];

      // 2. Subir la imagen a Cloudinary
      const uploadResult = await cloudinary.uploader.upload(`data:image/${ext};base64,${data}`, {
        folder: 'personajes',
        public_id: `personaje_${newId}`,
        overwrite: true,
      });

      imageUrl = uploadResult.secure_url;

      // 3. Actualizar la URL en la base de datos
      await pool.query(
        'UPDATE personajes SET imagenurl = $1 WHERE idpersonaje = $2',
        [imageUrl, newId]
      );
    }

    // 4. Responder con éxito y URL
    res.status(201).json({
      message: 'Personaje creado exitosamente.',
      idpersonaje: newId,
      imagenurl: imageUrl,
    });

  } catch (err) {
    console.error('Error al insertar el personaje:', err);
    res.status(500).json({ error: 'Error al insertar el personaje.' });
  }
});












//*********************************ahora estamso aca************************** */

//UPdate personaje OK!
/*
app.put('/update-personaje/:id', async (req, res) => {

//console.log("esto es lo que trae el req",req.body)
  const idpersonaje = req.params.id;

//  console.log("***********ID: ",idpersonaje)

  //console.log('REQ.BODY:', req.body);
  //if (!req.body) return res.status(400).json({ error: 'No se recibió body' });
   //if (!req.body) return res.status(400).send('No body');
  
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
*/

/*
const baseUrl = 'http://192.168.0.38:3000'; // Cambiar si usás otra IP o dominio

async function migrarImagenes() {
  try {
    const res = await pool.query('SELECT idpersonaje, imagen FROM personajes WHERE imagen IS NOT NULL');

    for (let row of res.rows) {
      const { idpersonaje, imagen } = row;

      const match = imagen.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!match) {
        console.log(`Imagen inválida para personaje ${idpersonaje}`);
        continue;
      }

      const ext = match[1];
      const base64Data = match[2];

      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `personaje_${idpersonaje}.${ext}`;
      const filepath = path.join(__dirname, 'uploads', filename);

      fs.writeFileSync(filepath, buffer);
      const url = `${baseUrl}/uploads/${filename}`;

      await pool.query(
        'UPDATE personajes SET imagenurl = $1 WHERE idpersonaje = $2',
        [url, idpersonaje]
      );

      console.log(`✅ Imagen migrada para personaje ${idpersonaje}`);
    }

    console.log('Migración completada.');
    pool.end();
  } catch (err) {
    console.error('Error durante la migración:', err);
  }
}

migrarImagenes();
*/



app.put('/update-personaje/:id', async (req, res) => {
  const idpersonaje = req.params.id;

  const {
    nombre, dominio, raza, naturaleza, edad, ken, ki, destino, pDestino,
    fuerza, fortaleza, destreza, agilidad, sabiduria, presencia, principio,
    sentidos, academisismo, alerta, atletismo, conBakemono, mentir, pilotear,
    artesMarciales, medicina, conObjMagicos, sigilo, conEsferas, conLeyendas,
    forja, conDemonio, conEspiritual, manejoBlaster, manejoSombras, tratoBakemono,
    conHechiceria, medVital, medEspiritual, rayo, fuego, frio, veneno, corte,
    energia, ventajas, apCombate, valCombate, apCombate2, valCombate2,
    add1, valAdd1, add2, valAdd2, add3, valAdd3, add4, valAdd4,
    imagen, inventario, dominios, kenActual, kiActual, positiva, negativa,
    vidaActual, hechizos, consumision, iniciativa, historia, usuarioId,
    tecEspecial, conviccion, cicatriz, resistencia, pjPnj
  } = req.body;

  try {
    let imagenurl = null;

    // Si hay imagen base64, la subimos a Cloudinary
    if (imagen && imagen.startsWith('data:image/')) {
      const matches = imagen.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ error: 'Imagen base64 inválida.' });
      }

      const ext = matches[1];
      const data = matches[2];

      const uploadResult = await cloudinary.uploader.upload(`data:image/${ext};base64,${data}`, {
        folder: 'personajes',
        public_id: `personaje_${idpersonaje}`,
        overwrite: true,
      });

      imagenurl = uploadResult.secure_url;

      // Actualizar imagenurl en la base
      await pool.query(
        'UPDATE personajes SET imagenurl = $1 WHERE idpersonaje = $2',
        [imagenurl, idpersonaje]
      );
    }

    // Actualizar los demás campos
    const query = `
      UPDATE personajes SET
        nombre=$1, dominio=$2, raza=$3, naturaleza=$4, edad=$5,
        ken=$6, ki=$7, destino=$8, "pDestino"=$9, fuerza=$10,
        fortaleza=$11, destreza=$12, agilidad=$13, sabiduria=$14,
        presencia=$15, principio=$16, sentidos=$17, academisismo=$18,
        alerta=$19, atletismo=$20, "conBakemono"=$21, mentir=$22,
        pilotear=$23, "artesMarciales"=$24, medicina=$25, "conObjMagicos"=$26,
        sigilo=$27, "conEsferas"=$28, "conLeyendas"=$29, forja=$30,
        "conDemonio"=$31, "conEspiritual"=$32, "manejoBlaster"=$33,
        "manejoSombras"=$34, "tratoBakemono"=$35, "conHechiceria"=$36,
        "medVital"=$37, "medEspiritual"=$38, rayo=$39, fuego=$40,
        frio=$41, veneno=$42, corte=$43, energia=$44, ventajas=$45,
        "apCombate"=$46, "valCombate"=$47, "apCombate2"=$48,
        "valCombate2"=$49, add1=$50, "valAdd1"=$51, add2=$52,
        "valAdd2"=$53, add3=$54, "valAdd3"=$55, add4=$56, "valAdd4"=$57,
        inventario=$58, dominios=$59, "kenActual"=$60,
        "kiActual"=$61, positiva=$62, negativa=$63, "vidaActual"=$64,
        hechizos=$65, consumision=$66, iniciativa=$67, historia=$68,
        "usuarioId"=$69, "tecEspecial"=$70, conviccion=$71, cicatriz=$72,
        resistencia=$73, "pjPnj"=$74
      WHERE idpersonaje=$75
    `;

    const values = [
      nombre, dominio, raza, naturaleza, edad, ken, ki, destino, pDestino,
      fuerza, fortaleza, destreza, agilidad, sabiduria, presencia, principio,
      sentidos, academisismo, alerta, atletismo, conBakemono, mentir, pilotear,
      artesMarciales, medicina, conObjMagicos, sigilo, conEsferas, conLeyendas,
      forja, conDemonio, conEspiritual, manejoBlaster, manejoSombras, tratoBakemono,
      conHechiceria, medVital, medEspiritual, rayo, fuego, frio, veneno, corte,
      energia, ventajas, apCombate, valCombate, apCombate2, valCombate2,
      add1, valAdd1, add2, valAdd2, add3, valAdd3, add4, valAdd4,
      inventario, dominios, kenActual, kiActual, positiva, negativa,
      vidaActual, hechizos, consumision, iniciativa, historia, usuarioId,
      tecEspecial, conviccion, cicatriz, resistencia, pjPnj, idpersonaje
    ];

    await pool.query(query, values);

    res.status(201).json({ message: 'Personaje modificado exitosamente.', idpersonaje, imagenurl });

  } catch (err) {
    console.error('Error al modificar el personaje:', err.message);
    res.status(500).json({ error: 'Error al modificar el personaje.' });
  }
});



/*
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

*/

server.listen(PORT, () => {
  console.log(`🟢 Servidor Socket.IO corriendo en http://localhost:${PORT}`);
});