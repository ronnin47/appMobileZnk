const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

/*
//para la carpeta de imagene sy sus urls
const cloudinary = require('cloudinary').v2;

//PARA GAURDADO DE IMAGENES Y OBTENER URLS
cloudinary.config({
  cloud_name: 'dzul1hatw',
  api_key: '687946621544217',
  api_secret: '09DUepXU-FApoUrHnc8h6sJb25I',
});

*/


/*
//CREDENCIALES DE LA NUEVA CUENTA DE CLOUDINARY
cloudinary.config({
  cloud_name: 'ucoamrxg',
  api_key: '975696536842629',
  api_secret: 'm6m_AmX0mlMxAXRBJrpFxCwE5Io',
});
*/

// ==========================================
// CLOUDINARY
// ==========================================

const { v2: cloudinary } = require('cloudinary');


// ==========================================
// CUENTA CLOUDINARY PRINCIPAL / ANTIGUA
// ==========================================

cloudinary.config({
  cloud_name: 'dzul1hatw',
  api_key: '687946621544217',
  api_secret: '09DUepXU-FApoUrHnc8h6sJb25I'
});


// ==========================================
// CUENTA CLOUDINARY ESCRITORIO / NUEVA
// ==========================================

const cloudinaryEscritorio = require('cloudinary').v2;

cloudinaryEscritorio.config({
  cloud_name: 'ucoamrxg',
  api_key: '975696536842629',
  api_secret: 'm6m_AmX0mlMxAXRBJrpFxCwE5Io'
});


async function subirImagenCloudinaryEscritorio(imagen, opciones) {

  const configuracionOriginal = cloudinary.config();

  try {

    cloudinary.config(cloudinaryEscritorio);

    return await cloudinary.uploader.upload(
      imagen,
      opciones
    );

  } finally {

    cloudinary.config(configuracionOriginal);

  }
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json({ limit: '50mb' })); // para parsear JSON
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


// Servir la carpeta uploads como pública
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



//SOCKETIO esta es la prueba para construir
const server = http.createServer(app);
// Inicializa el servidor de Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // Cambiar por dominio exacto en producción
    methods: ['GET', 'POST'],
  },
});


console.trace("🚨 server.js ejecutado");


const connectedUsers = new Map();
const mensajesChat = [];

function normalizarMensaje(mensaje) {
  return {
    usuarioId: mensaje.usuarioId?.toString() ?? '',
    idpersonaje: mensaje.idpersonaje?.toString() ?? '',
    nombre: mensaje.nombre?.toString() ?? '',
    mensaje: mensaje.mensaje?.toString() ?? '',
    estatus: mensaje.estatus?.toString() ?? '',
    imagenurl: mensaje.imagenurl?.toString() ?? '',
    imagenPjUrl: mensaje.imagenPjUrl?.toString() ?? '',
    nick: mensaje.nick?.toString() ?? '',
    kenActual: mensaje.kenActual?.toString() ?? '',
    ken: mensaje.ken?.toString() ?? '',
    kiActual: mensaje.kiActual?.toString() ?? '',
    ki: mensaje.ki?.toString() ?? '',
    vidaActual: mensaje.vidaActual?.toString() ?? '',
    vidaTotal: mensaje.vidaTotal?.toString() ?? '',
    timestamp: Date.now(),
    tipo: mensaje.tipo?.toString() ?? '',
    idpersonajeReceptor:mensaje.idpersonajeReceptor?.toString() ?? '',
    idusuarioReceptor:mensaje.idusuarioReceptor?.toString() ?? '',
    nombreReceptor:mensaje.nombreReceptor?.toString() ?? '',
    puntajeKen:mensaje.puntajeKen?.toString() ?? '',
  };
}

io.on('connection', (socket) => {
  console.log(`Socket conectado: ${socket.id}`);

  // Eventos que ya tienes para la app móvil
  socket.on('user-connected', (userData) => {
    const { usuarioId, sesion } = userData;
    if (usuarioId && sesion) {
      connectedUsers.set(socket.id, usuarioId);
      console.log(`Usuario ${usuarioId} conectado.`);
      io.emit('connected-users', Array.from(connectedUsers.values()));
    }
  });

  socket.on('solicitar-historial', async () => {
    try {
      const resultado = await pool.query(
        `SELECT * FROM mensajes ORDER BY timestamp DESC LIMIT 80`
      );
      socket.emit('historial-chat', resultado.rows.reverse());
    } catch (error) {
      console.error('Error al cargar historial:', error);
      socket.emit('historial-chat', []);
    }
  });

  socket.on('chat-chat', async (mensaje) => {
    if (mensaje.imagenBase64) {
      try {
        const resultado = await cloudinary.uploader.upload(mensaje.imagenBase64, {
          folder: 'chat-imagenes',
        });
        mensaje.mensaje = resultado.secure_url;
        delete mensaje.imagenBase64;
        console.log('✅ Imagen subida a Cloudinary:', resultado.secure_url);
      } catch (error) {
        console.error('❌ Error al subir imagen:', error);
        return; // No emitir si falla la subida
      }
    }

    const msgNormalizado = normalizarMensaje(mensaje);

    try {
      const insertQuery = `
        INSERT INTO mensajes (
          "usuarioId", idpersonaje, nombre, mensaje, estatus,
          imagenurl, "imagenPjUrl", nick,
          "kenActual", ken, "kiActual", ki,
          "vidaActual", "vidaTotal", timestamp, tipo, "idpersonajeReceptor", "idusuarioReceptor", "nombreReceptor","puntajeKen"
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16, $17,$18,$19,$20)
        RETURNING id
      `;

      const { rows } = await pool.query(insertQuery, [
        msgNormalizado.usuarioId,
        msgNormalizado.idpersonaje,
        msgNormalizado.nombre,
        msgNormalizado.mensaje,
        msgNormalizado.estatus,
        msgNormalizado.imagenurl,
        msgNormalizado.imagenPjUrl,
        msgNormalizado.nick,
        msgNormalizado.kenActual,
        msgNormalizado.ken,
        msgNormalizado.kiActual,
        msgNormalizado.ki,
        msgNormalizado.vidaActual,
        msgNormalizado.vidaTotal,
        msgNormalizado.timestamp,
        msgNormalizado.tipo,

        msgNormalizado.idpersonajeReceptor,
        msgNormalizado.idusuarioReceptor,
        msgNormalizado.nombreReceptor,
        msgNormalizado.puntajeKen,

      ]);

      msgNormalizado.id = rows[0].id;

    } catch (error) {
      console.error('❌ Error al guardar mensaje en DB:', error);
      msgNormalizado.id = Date.now().toString() + Math.random().toString(36).substring(2);
    }

    mensajesChat.push(msgNormalizado);
    if (mensajesChat.length > 80) mensajesChat.shift();

    io.emit('chat-chat', msgNormalizado);

    
  });

  // Eventos que usa la web
  socket.on('message', async (mensaje) => {
    const msgNormalizado = normalizarMensaje(mensaje);

    try {
      const insertQuery = `
        INSERT INTO mensajes (
          "usuarioId", idpersonaje, nombre, mensaje, estatus,
          imagenurl, "imagenPjUrl", nick,
          "kenActual", ken, "kiActual", ki,
          "vidaActual", "vidaTotal", timestamp, tipo
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
        RETURNING id
      `;

      const { rows } = await pool.query(insertQuery, [
        msgNormalizado.usuarioId,
        msgNormalizado.idpersonaje,
        msgNormalizado.nombre,
        msgNormalizado.mensaje,
        msgNormalizado.estatus,
        msgNormalizado.imagenurl,
        msgNormalizado.imagenPjUrl,
        msgNormalizado.nick,
        msgNormalizado.kenActual,
        msgNormalizado.ken,
        msgNormalizado.kiActual,
        msgNormalizado.ki,
        msgNormalizado.vidaActual,
        msgNormalizado.vidaTotal,
        msgNormalizado.timestamp,
        msgNormalizado.tipo,
      ]);

      msgNormalizado.id = rows[0].id;
    } catch (error) {
      console.error('Error al guardar mensaje en DB:', error);
      msgNormalizado.id = Date.now().toString() + Math.random().toString(36).substring(2);
    }

    io.emit('message', msgNormalizado);
  });

  socket.on('image', (imageData) => {
    io.emit('image', imageData);
  });

  socket.on('removeImage', (idpersonaje) => {
    console.log(`Eliminando personaje con id: ${idpersonaje}`);
    io.emit('removeImage', idpersonaje);
  });

  socket.on('user-disconnect', (data) => {
    const { usuarioId } = data;
    const socketId = [...connectedUsers.entries()].find(([key, value]) => value === usuarioId)?.[0];
    if (socketId) {
      connectedUsers.delete(socketId);
      console.log(`Usuario ${usuarioId} se desconectó por cierre de sesión.`);
      io.emit('connected-users', Array.from(connectedUsers.values()));
    }
  });

  socket.on('disconnect', () => {
    const usuarioId = connectedUsers.get(socket.id);
    if (usuarioId) {
      connectedUsers.delete(socket.id);
      console.log(`Usuario ${usuarioId} se desconectó.`);
      io.emit('user-disconnect', { usuarioId });
      io.emit('connected-users', Array.from(connectedUsers.values()));
    }
  });
});

/*
//LOCAL HOST bbdd
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'baseLocalZnk',
  password: '041183',
  port: 5432,
});
*/


//base de datos en RENDER
const pool = new Pool({
  user: 'gorda',
  host: 'dpg-d1s01g7diees73akbt00-a.oregon-postgres.render.com',
  database: 'appbasenative',
  password: '7p1AkuNrAUkPQpM0i75VCA5Ljx71WLRC',
  port: 5432,
   ssl: {
    rejectUnauthorized: false, // Esto es clave en conexiones con Render
  },
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



//REGISTRO DE USUARIO -insert de usuario 
app.post('/insert-usuario', async (req, res) => {
  const { email, contrasenia,username } = req.body;
    const estatus="jugador"
    console.log("REQ: ",req.body)
  
  try {
    const query = `
      INSERT INTO usuarios (email, contrasenia, estatus, nick)
      VALUES ($1, $2, $3, $4)
      RETURNING idusuario
    `;

    const values = [email, contrasenia, estatus,username];
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

//login 
app.post('/loginUsuario', async (req, res) => {
  const { email, contrasenia } = req.body;
  
  //console.log("",req.body)

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
      user:user,
    });

  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});


//Consumir personajes Usuario 
app.get('/consumirPersonajesUsuario', async (req, res) => {
  try {
    
    const { usuarioId } = req.query;
   // console.log("el id del usuario es: ",usuarioId)
    const userQuery = `
      SELECT 
        p.idpersonaje, p.nombre, p.dominio, p.raza, p.naturaleza, p.edad, p.ken, p.ki, p.destino, p."pDestino",
        p.fuerza, p.fortaleza, p.destreza, p.agilidad, p.sabiduria, p.presencia, p.principio,
        p.sentidos, p.academisismo, p.alerta, p.atletismo, p."conBakemono", p.mentir, p.pilotear,
        p."artesMarciales", p.medicina, p."conObjMagicos", p.sigilo, p."conEsferas", p."conLeyendas",
        p.forja, p."conDemonio", p."conEspiritual", p."manejoBlaster", p."manejoSombras", p."tratoBakemono",
        p."conHechiceria", p."medVital", p."medEspiritual", p.rayo, p.fuego, p.frio, p.veneno, p.corte,
        p.energia, p.ventajas, p."apCombate", p."valCombate", p."apCombate2", p."valCombate2",
        p.add1, p."valAdd1", p.add2, p."valAdd2", p.add3, p."valAdd3", p.add4, p."valAdd4",
        p.inventario, p.dominios, p."kenActual", p."kiActual", p.positiva, p.negativa, p."vidaActual",
        p.hechizos, p.consumision, p.iniciativa, p.historia, p."tecEspecial", p.conviccion, p.cicatriz,
        p.notasaga, p.resistencia, p."pjPnj", p.imagenurl, p.imagencloudid,p."imagenSeleccionada",p."coleccionImagenes",p.notas, p."usuarioId",
        
    a.spriteurl,
    a.filas,
    a.columnas,
    a.fps,
    a.scalesize,
    a.public_id 

  FROM personajes p
  LEFT JOIN animaciones a
    ON a.idpersonaje = p.idpersonaje

  WHERE p."usuarioId" = $1
  ORDER BY p.idpersonaje ASC
    `;
    const userResult = await pool.query(userQuery,[usuarioId]);

   
   if (userResult.rows.length === 0) {
  return res.status(200).json({
    message: 'Usuario sin personajes aún',
    coleccionPersonajes: [],  // ← importante
  });
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


//Insert personaje
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
    tecEspecial, conviccion, cicatriz, notasaga, resistencia, pjPnj,notas
  } = req.body;

  console.log(`
===== INSERT PERSONAJE =====
Usuario: ${usuarioId}
Nombre: ${nombre}
`);

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
        notasaga, resistencia, "pjPnj",notas, "usuarioId"
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
        $74, $75, $76
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
      notasaga, resistencia, pjPnj, notas, usuarioId
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


/*
//OK!!
app.put('/update-personaje/:id', async (req, res) => {
  const idpersonaje = req.params.id;
  //console.log("se disparo")
  

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
    let imagencloudid = null;

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
      imagencloudid = uploadResult.public_id;

      // Actualizar imagenurl e imagencloudid en la base
      await pool.query(
        'UPDATE personajes SET imagenurl = $1, imagencloudid = $2 WHERE idpersonaje = $3',
        [imagenurl, imagencloudid, idpersonaje]
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

    res.status(201).json({ message: 'Personaje modificado exitosamente.', idpersonaje, imagenurl, imagencloudid });

  } catch (err) {
    console.error('Error al modificar el personaje:', err.message);
    res.status(500).json({ error: 'Error al modificar el personaje.' });
  }
});
*/

//Update personaje
app.put('/update-personaje/:id', async (req, res) => {
  const idpersonaje = req.params.id;

  let {
    nombre, dominio, raza, naturaleza, edad, ken, ki, destino, pDestino,
    fuerza, fortaleza, destreza, agilidad, sabiduria, presencia, principio,
    sentidos, academisismo, alerta, atletismo, conBakemono, mentir, pilotear,
    artesMarciales, medicina, conObjMagicos, sigilo, conEsferas, conLeyendas,
    forja, conDemonio, conEspiritual, manejoBlaster, manejoSombras, tratoBakemono,
    conHechiceria, medVital, medEspiritual, rayo, fuego, frio, veneno, corte,
    energia, ventajas, apCombate, valCombate, apCombate2, valCombate2,
    add1, valAdd1, add2, valAdd2, add3, valAdd3, add4, valAdd4,
    imagen, imagenurl, inventario, dominios, kenActual, kiActual,
    positiva, negativa, vidaActual, hechizos, consumision, iniciativa,
    historia, usuarioId, tecEspecial, conviccion, cicatriz, resistencia, imagenSeleccionada, pjPnj, notas
  } = req.body;

 console.log("=================================");
  console.log("ACTUALIZANDO PERSONAJE");
  console.log("ID personaje:", idpersonaje);
  console.log("Nombre:", nombre);
  console.log("=================================");

  console.log("Imagen selecionada en el backend: ", imagenSeleccionada)
  try {
    let imagencloudid = null; // solo se usa si subimos a Cloudinary

    // Si envían base64, lo subimos a Cloudinary y reemplazamos imagenurl
    if (imagen && imagen.startsWith('data:image/')) {
      const matches = imagen.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) return res.status(400).json({ error: 'Imagen base64 inválida.' });

      const ext = matches[1];
      const data = matches[2];

      const uploadResult = await cloudinary.uploader.upload(`data:image/${ext};base64,${data}`, {
        folder: 'personajes',
        public_id: `personaje_${idpersonaje}`,
        overwrite: true,
      });

      imagenurl = uploadResult.secure_url;      // reemplaza la URL que venga del frontend
      imagencloudid = uploadResult.public_id;
    }

    // UPDATE completo incluyendo imagenurl
    const query = `
      UPDATE personajes SET
        nombre=$1, dominio=$2, raza=$3, naturaleza=$4, edad=$5,
        ken=$6, ki=$7, destino=$8, "pDestino"=$9, fuerza=$10,
        fortaleza=$11, destreza=$12, agilidad=$13, sabiduria=$14,
        presencia=$15, principio=$16, sentidos=$17, academisismo=$18,
        alerta=$19, atletismo=$20, "conBakemono"=$21, mentir=$22, pilotear=$23,
        "artesMarciales"=$24, medicina=$25, "conObjMagicos"=$26, sigilo=$27,
        "conEsferas"=$28, "conLeyendas"=$29, forja=$30, "conDemonio"=$31,
        "conEspiritual"=$32, "manejoBlaster"=$33, "manejoSombras"=$34,
        "tratoBakemono"=$35, "conHechiceria"=$36, "medVital"=$37, "medEspiritual"=$38,
        rayo=$39, fuego=$40, frio=$41, veneno=$42, corte=$43, energia=$44, ventajas=$45,
        "apCombate"=$46, "valCombate"=$47, "apCombate2"=$48, "valCombate2"=$49,
        add1=$50, "valAdd1"=$51, add2=$52, "valAdd2"=$53, add3=$54, "valAdd3"=$55,
        add4=$56, "valAdd4"=$57, inventario=$58, dominios=$59, "kenActual"=$60,
        "kiActual"=$61, positiva=$62, negativa=$63, "vidaActual"=$64,
        hechizos=$65, consumision=$66, iniciativa=$67, historia=$68,
        "usuarioId"=$69, "tecEspecial"=$70, conviccion=$71, cicatriz=$72,
        resistencia=$73, "pjPnj"=$74, imagenurl=$75, "imagenSeleccionada"=$76 , notas=$77
      WHERE idpersonaje=$78
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
      hechizos, consumision, iniciativa, historia, usuarioId,
      tecEspecial, conviccion, cicatriz, resistencia, pjPnj, imagenurl,imagenSeleccionada, notas, idpersonaje
    ];



    const nombresCampos = [
  "nombre", "dominio", "raza", "naturaleza", "edad",
  "ken", "ki", "destino", "pDestino", "fuerza",
  "fortaleza", "destreza", "agilidad", "sabiduria",
  "presencia", "principio", "sentidos", "academisismo",
  "alerta", "atletismo", "conBakemono", "mentir",
  "pilotear", "artesMarciales", "medicina",
  "conObjMagicos", "sigilo", "conEsferas",
  "conLeyendas", "forja", "conDemonio",
  "conEspiritual", "manejoBlaster",
  "manejoSombras", "tratoBakemono",
  "conHechiceria", "medVital", "medEspiritual",
  "rayo", "fuego", "frio", "veneno", "corte",
  "energia", "ventajas", "apCombate",
  "valCombate", "apCombate2", "valCombate2",
  "add1", "valAdd1", "add2", "valAdd2",
  "add3", "valAdd3", "add4", "valAdd4",
  "inventario", "dominios", "kenActual",
  "kiActual", "positiva", "negativa",
  "vidaActual", "hechizos", "consumision",
  "iniciativa", "historia", "usuarioId",
  "tecEspecial", "conviccion", "cicatriz",
  "resistencia", "pjPnj", "imagenurl",
  "imagenSeleccionada", "notas", "idpersonaje"
];

values.forEach((valor, index) => {
  if (valor === "") {
    console.log("=================================");
    console.log("CAMPO VACIO DETECTADO:");
    console.log("Campo:", nombresCampos[index]);
    console.log("Posicion SQL:", index + 1);
    console.log("=================================");
  }
});

    await pool.query(query, values);

    res.status(201).json({
      message: 'Personaje modificado exitosamente.',
      idpersonaje,
      imagenurl,
      imagencloudid
    });

  } catch (err) {
    console.error('Error al modificar el personaje:', err.message);
    res.status(500).json({ error: 'Error al modificar el personaje.' });
  }
});


//Delete personaje
app.delete('/deletePersonaje/:id', async (req, res) => {
  const idpersonaje = parseInt(req.params.id, 10);

  try {
    // 1) Obtener el imagencloudid (nombre público en Cloudinary)
    const { rows } = await pool.query(
      'SELECT imagencloudid FROM personajes WHERE idpersonaje = $1',
      [idpersonaje]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Personaje no encontrado.' });
    }

    const imagencloudid = rows[0].imagencloudid;

    // 2) Eliminar el personaje de la base de datos
    const result = await pool.query(
      'DELETE FROM personajes WHERE idpersonaje = $1 RETURNING *',
      [idpersonaje]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'No se pudo eliminar el personaje.' });
    }

    // 3) Si había imagencloudid, eliminar imagen de Cloudinary
    if (imagencloudid) {
      try {
        await cloudinary.uploader.destroy(imagencloudid);
        console.log(`🗑️ Imagen ${imagencloudid} eliminada de Cloudinary`);
      } catch (cloudErr) {
        console.error('❌ Error al eliminar imagen en Cloudinary:', cloudErr.message);
        // No cancelamos la respuesta por error en imagen, pero lo informamos
      }
    }

    res.status(200).json({
      message: 'Personaje y su imagen eliminados correctamente.',
      deletedPersonaje: result.rows[0]
    });

  } catch (error) {
    console.error('🚨 Error al eliminar personaje:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

//consumir los todos los personajes
app.get('/consumirPersonajesTodos', async (req, res) => {
  try {
    const userQuery = `
      SELECT 
        p.idpersonaje, p.nombre, p.dominio, p.raza, p.naturaleza, p.edad, p.ken, p.ki, p.destino, p."pDestino",
        p.fuerza, p.fortaleza, p.destreza, p.agilidad, p.sabiduria, p.presencia, p.principio,
        p.sentidos, p.academisismo, p.alerta, p.atletismo, p."conBakemono", p.mentir, p.pilotear,
        p."artesMarciales", p.medicina, p."conObjMagicos", p.sigilo, p."conEsferas", p."conLeyendas",
        p.forja, p."conDemonio", p."conEspiritual", p."manejoBlaster", p."manejoSombras", p."tratoBakemono",
        p."conHechiceria", p."medVital", p."medEspiritual", p.rayo, p.fuego, p.frio, p.veneno, p.corte,
        p.energia, p.ventajas, p."apCombate", p."valCombate", p."apCombate2", p."valCombate2",
        p.add1, p."valAdd1", p.add2, p."valAdd2",	p.add3,	p."valAdd3",	p.add4,	p."valAdd4",
        p.inventario, p.dominios, p."kenActual", p."kiActual", p.positiva, p.negativa, p."vidaActual",
        p.hechizos, p.consumision, p.iniciativa, p.historia, p."tecEspecial", p.conviccion, p.cicatriz,
        p.notasaga, p.resistencia, p."pjPnj", p.imagenurl,p.imagencloudid,p."imagenSeleccionada",p."coleccionImagenes", p."usuarioId", p.notas, a.spriteurl,
    a.filas,
    a.columnas,
    a.fps,
    a.scalesize,
    a.public_id 
        FROM personajes p
  LEFT JOIN animaciones a
    ON a.idpersonaje = p.idpersonaje
    `;



    const userResult = await pool.query(userQuery);

    if (userResult.rows.length === 0) {
  return res.status(404).json({ message: 'No se encontraron personajes en la base de datos' });
}

    const coleccionPersonajes = userResult.rows;
    res.json({
      message: 'Se consumiron todos los personajes',
      coleccionPersonajes: coleccionPersonajes,   
    });

  } catch (error) {
    console.error('Error al obtener coleccion todos los persoanjes de la base de datos:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});



// SAGAS
// INSERT SAGA OK ✅
app.post('/insert-saga', async (req, res) => {
  const {
    titulo,
    presentacion,
    imagensaga,
    personajes,
  } = req.body;

  try {
    // 1. Insertar saga base (sin imagenurl todavía)
    const insertQuery = `
      INSERT INTO sagas (titulo, presentacion, imagensaga, personajes)
      VALUES ($1, $2, $3, $4)
      RETURNING idsaga
    `;

    const insertValues = [titulo, presentacion, imagensaga, personajes];
    const insertResult = await pool.query(insertQuery, insertValues);

    const newSagaId = insertResult.rows[0].idsaga;

    // 🔥 Imagen por defecto SIEMPRE
    let imagenUrl = "https://res.cloudinary.com/dzul1hatw/image/upload/v1774459888/imagenBase_whvcot.jpg";
    let imagenCloudId = null;

    // 2. Si viene imagen base64 válida → subir a Cloudinary
    if (imagensaga && typeof imagensaga === 'string' && imagensaga.startsWith('data:image/')) {
      const matches = imagensaga.match(/^data:image\/(\w+);base64,(.+)$/);

      if (matches) {
        const ext = matches[1];
        const data = matches[2];

        try {
          const uploadResult = await cloudinary.uploader.upload(
            `data:image/${ext};base64,${data}`,
            {
              folder: 'sagas',
              public_id: `saga_${newSagaId}`,
              overwrite: true,
            }
          );

          imagenUrl = uploadResult.secure_url;
          imagenCloudId = uploadResult.public_id;

        } catch (uploadError) {
          console.warn("⚠️ Error subiendo a Cloudinary, se usa imagen default:", uploadError.message);
        }

      } else {
        console.warn("⚠️ Imagen base64 inválida, se usa imagen default");
      }
    }

    // 3. 🔥 SIEMPRE guardar imagen (default o subida)
    await pool.query(
      `UPDATE sagas SET imagenurl = $1, imagencloudid = $2 WHERE idsaga = $3`,
      [imagenUrl, imagenCloudId, newSagaId]
    );

    // 4. Respuesta final
    res.status(201).json({
      message: 'Saga creada exitosamente.',
      idsaga: newSagaId,
      imagenurl: imagenUrl,
      imagencloudid: imagenCloudId,
    });

  } catch (error) {
    console.error('❌ Error al insertar la saga:', error);
    res.status(500).json({ error: 'Error al insertar la saga.' });
  }
});

//consmumir sagas ok!!
app.get('/consumirSagas', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT idsaga, titulo, presentacion, personajes, imagenurl, imagencloudid
     FROM sagas ORDER BY idsaga DESC
    `);

    res.status(200).json({ coleccionSagas: result.rows });
  } catch (error) {
    console.error('Error al obtener sagas:', error);
    res.status(500).json({ error: 'Error interno al obtener sagas' });
  }
});

//update sagas y secciones ok!!
app.put('/updateSagaCompleta/:idsaga', async (req, res) => {
  const { idsaga } = req.params;
  const { titulo, presentacion, imagensaga, secciones } = req.body;

  if (!presentacion || !titulo) {
    return res.status(400).json({ error: 'Título y presentación son requeridos' });
  }

  try {
    let imagenurl = null;
    let imagencloudid = null;

    // Actualizar imagen saga si viene base64
    if (imagensaga && imagensaga.startsWith('data:image/')) {
      const matches = imagensaga.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ error: 'Formato de imagen base64 inválido para saga' });
      }

      const ext = matches[1];
      const data = matches[2];

      const uploadResult = await cloudinary.uploader.upload(`data:image/${ext};base64,${data}`, {
        folder: 'sagas',
        public_id: `saga_${idsaga}`,
        overwrite: true,
      });

      imagenurl = uploadResult.secure_url;
      imagencloudid = uploadResult.public_id;

      await pool.query(
        'UPDATE sagas SET imagenurl = $1, imagencloudid = $2 WHERE idsaga = $3',
        [imagenurl, imagencloudid, idsaga]
      );
    }

    // Actualizar datos de la saga (título y presentación)
    const resultSaga = await pool.query(
      'UPDATE sagas SET titulo = $1, presentacion = $2 WHERE idsaga = $3 RETURNING *',
      [titulo, presentacion, idsaga]
    );

    if (resultSaga.rowCount === 0) {
      return res.status(404).json({ error: 'Saga no encontrada' });
    }

    // Array para acumular las secciones ya guardadas (con id)
    const seccionesActualizadas = [];

    // Actualizar o insertar las secciones
    if (Array.isArray(secciones)) {
      for (const seccion of secciones) {
        const { idseccion, titulo, presentacion, imagen } = seccion;

        let idsec = idseccion;
        let imagenurlSeccion = null;
        let imagencloudidSeccion = null;

        // Subir imagen si es base64
        if (imagen && imagen.startsWith('data:image/')) {
          const matchesSeccion = imagen.match(/^data:image\/(\w+);base64,(.+)$/);
          if (!matchesSeccion) {
            return res.status(400).json({ error: `Formato de imagen base64 inválido para sección ${idseccion || 'nueva'}` });
          }

          const ext = matchesSeccion[1];
          const data = matchesSeccion[2];

          const uploadResultSeccion = await cloudinary.uploader.upload(`data:image/${ext};base64,${data}`, {
            folder: 'secciones',
            public_id: idseccion ? `seccion_${idseccion}` : undefined,
            overwrite: true,
          });

          imagenurlSeccion = uploadResultSeccion.secure_url;
          imagencloudidSeccion = uploadResultSeccion.public_id;
        }

        if (!idsec) {
          // Nueva sección: insertar
          const insertResult = await pool.query(
            `INSERT INTO secciones (idsaga, titulo, presentacion, imagenurl, imagencloudid)
             VALUES ($1, $2, $3, $4, $5) RETURNING idseccion`,
            [idsaga, titulo, presentacion, imagenurlSeccion, imagencloudidSeccion]
          );
          idsec = insertResult.rows[0].idseccion;
        } else {
          // Sección existente: actualizar
          await pool.query(
            `UPDATE secciones SET titulo = $1, presentacion = $2,
             imagenurl = COALESCE($3, imagenurl),
             imagencloudid = COALESCE($4, imagencloudid)
             WHERE idseccion = $5`,
            [titulo, presentacion, imagenurlSeccion, imagencloudidSeccion, idsec]
          );
        }

        seccionesActualizadas.push({
          idseccion: idsec,
          titulo,
          presentacion,
          imagenurl: imagenurlSeccion,
          imagencloudid: imagencloudidSeccion,
        });
      }
    }

    res.json({
      message: 'Saga y secciones actualizadas correctamente',
      saga: resultSaga.rows[0],
      imagenurl,
      imagencloudid,
      secciones: seccionesActualizadas,
    });
  } catch (error) {
    console.error('Error al actualizar saga y secciones:', error.message);
    res.status(500).json({ error: 'Error interno al actualizar saga y secciones' });
  }
});

// Endpoint para agregar personaje a una saga
app.put('/agregarPersonajeSaga/:idsaga', async (req, res) => {
  const { idsaga } = req.params;
  const { personajes } = req.body;

  if (!personajes || !Array.isArray(personajes)) {
    return res.status(400).json({ error: 'El campo personajes es requerido y debe ser un array' });
  }

  try {
    const result = await pool.query(
      `UPDATE sagas SET personajes = $1 WHERE idsaga = $2 RETURNING *`,
      [personajes, idsaga]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Saga no encontrada' });
    }

    res.json({ message: 'Personaje agregado correctamente', sagaActualizada: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar saga:', error.message);
    res.status(500).json({ error: 'Error del servidor al actualizar la saga' });
  }
});

app.put("/eliminarPersonajeSaga/:idsaga", async (req, res) => {
  const { idsaga } = req.params;
  const { personajes } = req.body;

  //console.log("🟡 [DELETE PERSONAJE] idsaga:", idsaga);
  //console.log("🟡 [DELETE PERSONAJE] personajes recibidos:", personajes);

  if (!personajes || !Array.isArray(personajes)) {
    return res
      .status(400)
      .json({ message: "El campo 'personajes' debe ser un array válido" });
  }

  try {
    // Filtramos nulls, undefined o vacíos
    const personajesFiltrados = personajes.filter((id) => Number.isInteger(id));

    // ✅ Convertimos el array JS a un literal válido para PostgreSQL: {1,2,3}
    const personajesArrayLiteral = `{${personajesFiltrados.join(",")}}`;

    // ✅ Ejecutamos la query
    const result = await pool.query(
      "UPDATE sagas SET personajes = $1 WHERE idsaga = $2",
      [personajesArrayLiteral, idsaga]
    );

    console.log("🟢 Filas afectadas:", result.rowCount);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Saga no encontrada" });
    }

    res.status(200).json({
      message: "Personaje eliminado de la saga correctamente",
      personajesActualizados: personajesFiltrados,
    });
  } catch (error) {
    console.error("🔥 Error al eliminar personaje de saga:", error);
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
});



//PARA LA SECCION DE LA SAGA  ok!!
app.get('/consumirSecciones', async (req, res) => {
  const { idsaga } = req.query;

  try {
    const result = await pool.query(
      'SELECT * FROM secciones WHERE idsaga = $1',
      [idsaga]
    );
    res.status(200).json({ coleccionSecciones: result.rows });
  } catch (error) {
    console.error('Error al obtener secciones:', error);
    res.status(500).json({ error: 'Error interno al obtener secciones' });
  }
});




//notas 
app.put('/personajes/:idpersonaje/notasaga', async (req, res) => {
  const { idpersonaje } = req.params;
  const { notasaga } = req.body;

  //console.log(" id personaje ",idpersonaje)
 // console.log("notasaga  ", notasaga)

  if (!notasaga) {
    return res.status(400).json({ error: 'Faltan datos de notasaga' });
  }

  try {
    const result = await pool.query(
      `UPDATE personajes SET notasaga = $1 WHERE idpersonaje = $2`,
      [JSON.stringify(notasaga), idpersonaje]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Personaje no encontrado' });
    }

    res.status(200).json({ message: 'Notasaga actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar notasaga:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.put('/updateUsuarios/:usuarioId', async (req, res) => {
  const usuarioId = req.params.usuarioId;
  const { nick, email, contrasenia, imagenurl } = req.body;

  if (!usuarioId) {
    return res.status(400).json({ error: 'ID de usuario es obligatorio' });
  }

  if (
    typeof nick !== 'string' ||
    typeof email !== 'string' ||
    typeof contrasenia !== 'string'
  ) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  let imagenUrlFinal = null;
  let imagenCloudIdFinal = null;

  try {
    // 1. Si la imagen viene en base64, subir a Cloudinary
    if (imagenurl && imagenurl.startsWith('data:image/')) {
      const matches = imagenurl.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ error: 'Imagen base64 inválida.' });
      }

      const ext = matches[1];
      const data = matches[2];

      const uploadResult = await cloudinary.uploader.upload(`data:image/${ext};base64,${data}`, {
        folder: 'usuarios',
        public_id: `usuario_${usuarioId}`,
        overwrite: true,
      });

      imagenUrlFinal = uploadResult.secure_url;
      imagenCloudIdFinal = uploadResult.public_id;
    }

    // 2. Armar consulta de actualización
    let updateQuery = `
      UPDATE usuarios
      SET nick = $1,
          email = $2,
          contrasenia = $3
    `;

    const values = [nick, email, contrasenia];
    let paramIndex = 4;

    if (imagenUrlFinal && imagenCloudIdFinal) {
      updateQuery += `, imagenurl = $${paramIndex}, imagencloudid = $${paramIndex + 1}`;
      values.push(imagenUrlFinal, imagenCloudIdFinal);
      paramIndex += 2;
    }

    updateQuery += ` WHERE idusuario = $${paramIndex} RETURNING *`;
    values.push(usuarioId);

    const result = await pool.query(updateQuery, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // 3. Asegurar consistencia en los datos retornados
    const usuarioActualizado = result.rows[0];

    res.status(200).json({
      mensaje: 'Usuario actualizado',
      nick: usuarioActualizado.nick,
      email: usuarioActualizado.email,
      contrasenia: usuarioActualizado.contrasenia,
      imagenurl: usuarioActualizado.imagenurl || "",
      imagencloudid: usuarioActualizado.imagencloudid || "",
    });

  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});





//*************************Sprite ***********************************
app.post("/upload-sprite", async (req, res) => {
  const { idpersonaje, imagen, filas, columnas, fps, scalesize } = req.body;

  try {
    if (!idpersonaje) {
      return res.status(400).json({ error: "idpersonaje requerido" });
    }

    const f = Number(filas);
    const c = Number(columnas);
    const velocidad = Number(fps);
    const scale = Number(scalesize) || 0.8; // estoy metiendo este nuevo campo para que el frontend me diga a qué escala mostrar el sprite, porque algunos vienen gigantes y otros chiquitos. No es obligatorio, si no viene asumo 0.8 que es un buen tamaño intermedio.

    if ([f, c, velocidad].some(v => Number.isNaN(v))) {
      return res.status(400).json({ error: "Datos de animación inválidos" });
    }

    let imageUrl = null;
    let publicId = null;

    // SOLO SI VIENE IMAGEN NUEVA
    if (imagen) {
      const matches = imagen.match(/^data:(image\/\w+);base64,(.+)$/);

      if (!matches) {
        return res.status(400).json({ error: "Imagen base64 inválida" });
      }

      const mimeType = matches[1];
      const data = matches[2];

      const uploadResult = await cloudinary.uploader.upload(
        `data:${mimeType};base64,${data}`,
        {
          folder: "sprites",
          public_id: `sprite_${idpersonaje}`,
          overwrite: true,
        }
      );

      imageUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
    }

    // UPSERT
   const query = `
  INSERT INTO animaciones (
    idpersonaje,
    spriteurl,
    filas,
    columnas,
    fps,
    scalesize,
    public_id
  )
  VALUES (
    $1,
    COALESCE($2, (SELECT spriteurl FROM animaciones WHERE idpersonaje=$1)),
    $3,
    $4,
    $5,
    $6,
    COALESCE($7, (SELECT public_id FROM animaciones WHERE idpersonaje=$1))
  )
  ON CONFLICT (idpersonaje)
  DO UPDATE SET
    spriteurl = COALESCE(EXCLUDED.spriteurl, animaciones.spriteurl),
    filas = EXCLUDED.filas,
    columnas = EXCLUDED.columnas,
    fps = EXCLUDED.fps,
    scalesize = EXCLUDED.scalesize,
    public_id = COALESCE(EXCLUDED.public_id, animaciones.public_id)
  RETURNING *;
`;

    const result = await pool.query(query, [
      idpersonaje,
      imageUrl,
      f,
      c,
      velocidad,
      scale,
      publicId,
    ]);

    return res.status(200).json({
      message: "Sprite actualizado correctamente",
      animacion: result.rows[0],
    });

  } catch (err) {
    console.error("Error upload sprite:", err);
    return res.status(500).json({
      error: "Error al subir sprite",
    });
  }
});


app.put("/eliminarSprite", async (req, res) => {
  const { idpersonaje, public_id } = req.body;

  //console.log("Eliminar sprite:", idpersonaje, public_id);

  try {
    if (!idpersonaje) {
      return res.status(400).json({
        error: "Falta idpersonaje",
      });
    }

    // Borra la imagen en Cloudinary
    if (public_id) {
      const resultadoCloudinary = await cloudinary.uploader.destroy(public_id);

      console.log("Cloudinary destroy:", resultadoCloudinary);
    }

    // Limpia la animación en la base
    const result = await pool.query(
      `
      UPDATE animaciones
      SET
        spriteurl = NULL,
        public_id = NULL,
        filas = 3,
        columnas = 4,
        fps = 6
      WHERE idpersonaje = $1
      RETURNING spriteurl, filas, columnas, fps, public_id
      `,
      [idpersonaje]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Animación no encontrada",
      });
    }

    res.json({
      ok: true,
      animacion: result.rows[0],
    });
  } catch (err) {
    console.log("ERROR eliminarSprite:", err);

    res.status(500).json({
      error: "No se pudo eliminar el sprite",
    });
  }
});
//*********************************************** 








//consmumir objetos ok!!
app.get('/consumirObjetosMagicos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM tesoros
    `);

    res.status(200).json({ objetosMagicos: result.rows });
  } catch (error) {
    console.error('Error al consumir objetos magicos:', error);
    res.status(500).json({ error: 'Error interno al obtener objetos magicos' });
  }
});

//OK
app.post('/insertObjetoMagico', async (req, res) => {
  const {
    nombre, rareza, nivel, costeVentaja, precio, descripcion, sistema, imagen
  } = req.body;

  try {
    // 1. Insertar personaje sin imagenurl
    const query = `
      INSERT INTO tesoros (
        nombre, rareza, nivel, "costeVentaja", precio, descripcion, sistema
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7
      )
      RETURNING idobjeto
    `;

    const values = [
      nombre, rareza, nivel, costeVentaja, precio, descripcion, sistema
    ];

    const result = await pool.query(query, values);
    const newId = result.rows[0].idobjeto;

    let imageUrl = null;

    if (imagen) {
      const matches = imagen.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) return res.status(400).json({ error: 'Imagen base64 inválida.' });

      const ext = matches[1];
      const data = matches[2];

      // 2. Subir la imagen a Cloudinary
      const uploadResult = await cloudinary.uploader.upload(`data:image/${ext};base64,${data}`, {
        folder: 'tesoros',
        public_id: `tesoro_${newId}`,
        overwrite: true,
      });

      imageUrl = uploadResult.secure_url;
      const imageCloudId = uploadResult.public_id;

      // 3. Actualizar la URL y el ID cloud en la base de datos
      await pool.query(
        'UPDATE tesoros SET imagenurl = $1, imagencloudid = $2 WHERE idobjeto = $3',
        [imageUrl, imageCloudId, newId]
      );
    }

    // 4. Responder con éxito y URL
    res.status(201).json({
      message: 'tesoro creado exitosamente.',
      idobjeto: newId,
      imagenurl: imageUrl,
    });

  } catch (err) {
    console.error('Error al insertar objeto magico nuevo:', err);
    res.status(500).json({ error: 'Error al insertar objeto magico nuevo.' });
  }
});

//ok!!
app.put('/updateObjetoMagico/:id', async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    rareza,
    nivel,
    costeVentaja,
    precio,
    descripcion,
    sistema,
    imagen,
  } = req.body;

  try {
    let imageUrl = null;
    let imageCloudId = null;

    // Si viene una nueva imagen en base64, subirla a Cloudinary
    if (imagen && imagen.startsWith('data:image/')) {
      const matches = imagen.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) return res.status(400).json({ error: 'Imagen base64 inválida.' });

      const ext = matches[1];
      const data = matches[2];

      const uploadResult = await cloudinary.uploader.upload(`data:image/${ext};base64,${data}`, {
        folder: 'tesoros',
        public_id: `tesoro_${id}`,
        overwrite: true,
      });

      imageUrl = uploadResult.secure_url;
      imageCloudId = uploadResult.public_id;
    }

    // Armar la query de actualización (incluye imagen si se subió)
    let updateQuery = `
      UPDATE tesoros SET
        nombre = $1,
        rareza = $2,
        nivel = $3,
        "costeVentaja" = $4,
        precio = $5,
        descripcion = $6,
        sistema = $7
    `;
    const updateValues = [
      nombre,
      rareza,
      nivel,
      costeVentaja,
      precio,
      descripcion,
      sistema,
    ];

    if (imageUrl) {
      updateQuery += `, imagenurl = $8, imagencloudid = $9`;
      updateValues.push(imageUrl, imageCloudId);
    }

    updateQuery += ` WHERE idobjeto = $${updateValues.length + 1}`;
    updateValues.push(id);

    await pool.query(updateQuery, updateValues);

    res.json({ message: 'Objeto mágico actualizado exitosamente.' });

  } catch (err) {
    console.error('Error al actualizar objeto mágico:', err);
    res.status(500).json({ error: 'Error al actualizar objeto mágico.' });
  }
});

//ok!!
app.delete('/deleteObjetoMagico/:idobjeto', async (req, res) => {
  const { idobjeto } = req.params;
    //console.log('Intentando eliminar objeto con id:', idobjeto);

  try {
    // Opcional: verificar que el objeto exista antes de eliminar

    const deleteQuery = 'DELETE FROM tesoros WHERE idobjeto = $1';
    const result = await pool.query(deleteQuery, [idobjeto]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Objeto mágico no encontrado.' });
    }

    res.json({ message: 'Objeto mágico eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar objeto mágico:', error);
    res.status(500).json({ error: 'Error al eliminar objeto mágico.' });
  }
});






//************************LOGROS APP MOBILE *****************************
app.get('/consumirLogros', async (req, res) => {
  try {
    
    //const { usuarioId } = req.query;
   // console.log("el id del usuario es: ",usuarioId)
    const userQuery = `
      SELECT *
      FROM logros;
    `;




    const userResult = await pool.query(userQuery);

   
   if (userResult.rows.length === 0) {
  return res.status(200).json({
    message: 'Usuario sin personajes aún',
    logrosConsumidos: [],  // ← importante
  });
}

    const logrosConsumidos = userResult.rows;


  
   

    
    res.json({
      message: 'Peticion de logros exitosa!',
      logrosConsumidos: logrosConsumidos,   
    });

  } catch (error) {
    console.error('Error al obtener logros consumidos de la base de datos:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});



app.post('/insertarLogro', async (req, res) => {
  try {
    const { nombre, descripcion, categoria, nivel, imagen, personajesids } = req.body;

    console.log("",personajesids)

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El campo nombre es obligatorio' });
    }

    // 1. Insertar el logro sin la imagen aún
    const query = `
      INSERT INTO logros (nombre, descripcion, categoria, nivel, personajesids)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [nombre, descripcion, categoria, nivel, personajesids];
    const result = await pool.query(query, values);
    const newId = result.rows[0].id;

    let imageUrl = null;

    // 2. Subir la imagen si existe
    if (imagen) {
      const matches = imagen.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) return res.status(400).json({ error: 'Imagen base64 inválida.' });

      const ext = matches[1];
      const data = matches[2];

      const uploadResult = await cloudinary.uploader.upload(
        `data:image/${ext};base64,${data}`,
        {
          folder: 'logros',
          public_id: `logros_${newId}`,
          overwrite: true,
        }
      );

      imageUrl = uploadResult.secure_url;
      const imageCloudId = uploadResult.public_id;

      // 3. Actualizar la fila con la URL y el Cloud ID
      await pool.query(
        'UPDATE logros SET imagenurl = $1, imagencloudid = $2 WHERE id = $3',
        [imageUrl, imageCloudId, newId]
      );
    }

    // 4. Recuperar el logro completo ya con la URL actualizada
    const updatedResult = await pool.query('SELECT * FROM logros WHERE id = $1', [newId]);
    const logroCompleto = updatedResult.rows[0];

    // 5. Responder con el logro completo
    return res.status(201).json({
      message: 'Logro insertado correctamente',
      logro: logroCompleto,
    });

  } catch (error) {
    console.error('Error en /insertarLogro:', error);
    return res.status(500).json({ error: 'Error del servidor al insertar logro' });
  }
});


app.delete('/eliminarLogro/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Verifica que el logro exista
    const { rowCount: existe } = await pool.query(
      'SELECT 1 FROM logros WHERE id = $1',
      [id]
    );

    if (!existe) {
      return res.status(404).json({ message: 'Logro no encontrado' });
    }

    // Elimina el logro
    await pool.query('DELETE FROM logros WHERE id = $1', [id]);

    return res.json({ message: 'Logro eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar logro:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});



app.put('/editarLogro/:id', async (req, res) => {
  const logroId = req.params.id;
  const { nombre, descripcion, categoria, nivel, imagen, personajesids } = req.body;


  //console.log("Imagen del logro: ",imagen);

  if (!nombre || !descripcion) {
    return res.status(400).json({ error: 'Nombre y descripción son requeridos' });
  }

  try {
    // 1️⃣ Actualizar datos básicos
    const queryUpdate = `
      UPDATE logros
      SET nombre = $1,
          descripcion = $2,
          categoria = $3,
          nivel = $4,
          personajesids = $5
      WHERE id = $6
      RETURNING *;
    `;
    const values = [nombre, descripcion, categoria, nivel, personajesids, logroId];
    let result = await pool.query(queryUpdate, values);
    let logroActualizado = result.rows[0];

    // 2️⃣ Si viene una imagen en base64, actualizarla en Cloudinary
    if (imagen && imagen.startsWith('data:image')) {
      const matches = imagen.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) return res.status(400).json({ error: 'Imagen base64 inválida.' });

      const ext = matches[1];
      const data = matches[2];

      const uploadResult = await cloudinary.uploader.upload(
        `data:image/${ext};base64,${data}`,
        {
          folder: 'logros',
          public_id: `logros_${logroId}`,
          overwrite: true,
        }
      );

      const imageUrl = uploadResult.secure_url;
      const imageCloudId = uploadResult.public_id;

      // Actualizar solo los campos de imagen
      const updateImageQuery = `
        UPDATE logros
        SET imagenurl = $1,
            imagencloudid = $2
        WHERE id = $3
        RETURNING *;
      `;
      result = await pool.query(updateImageQuery, [imageUrl, imageCloudId, logroId]);
      logroActualizado = result.rows[0];
    }

    // 3️⃣ Devolver el logro actualizado (con imagen vieja o nueva)
    res.json({ message: 'Logro actualizado correctamente', logro: logroActualizado });

  } catch (err) {
    console.error('Error al editar logro:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

//**************************************************************************** 





//****************************Dispositivos Neo App MOBILE************************************
app.get('/consumirObjetosNeo', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM dispositivos
    `);

    res.status(200).json({ objetosNeo: result.rows });
  } catch (error) {
    console.error('Error al consumir dispositivos Neotecnicos:', error);
    res.status(500).json({ error: 'Error interno al obtener dispositivos Neotecnicos' });
  }
});

//OK
app.post('/insertObjetoNeo', async (req, res) => {

  console.log(" red : ",req.body)
  const {
    nombre, rareza, nivel, costeVentaja, precio, descripcion, sistema, imagen
  } = req.body;

  try {
    // 1. Insertar personaje sin imagenurl
    const query = `
      INSERT INTO dispositivos (
        nombre, rareza, nivel, "costeVentaja", precio, descripcion, sistema
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7
      )
      RETURNING idobjeto
    `;

    const values = [
      nombre, rareza, nivel, costeVentaja, precio, descripcion, sistema
    ];

    const result = await pool.query(query, values);
    const newId = result.rows[0].idobjeto;

    let imageUrl = null;

    if (imagen) {
      const matches = imagen.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) return res.status(400).json({ error: 'Imagen base64 inválida.' });

      const ext = matches[1];
      const data = matches[2];

      // 2. Subir la imagen a Cloudinary
      const uploadResult = await cloudinary.uploader.upload(`data:image/${ext};base64,${data}`, {
        folder: 'dispositivos',
        public_id: `dispositivo_${newId}`,
        overwrite: true,
      });

      imageUrl = uploadResult.secure_url;
      const imageCloudId = uploadResult.public_id;

      // 3. Actualizar la URL y el ID cloud en la base de datos
      await pool.query(
        'UPDATE dispositivos SET imagenurl = $1, imagencloudid = $2 WHERE idobjeto = $3',
        [imageUrl, imageCloudId, newId]
      );
    }

    // 4. Responder con éxito y URL
    res.status(201).json({
      message: 'dispositivo creado exitosamente.',
      idobjeto: newId,
      imagenurl: imageUrl,
    });

  } catch (err) {
    console.error('Error al insertar dispositivo Neotecnico nuevo:', err);
    res.status(500).json({ error: 'Error al insertar dispositivo Neotecnico nuevo.' });
  }
});

//ok!!
app.put('/updateObjetoNeo/:id', async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    rareza,
    nivel,
    costeVentaja,
    precio,
    descripcion,
    sistema,
    imagen,
  } = req.body;

  try {
    let imageUrl = null;
    let imageCloudId = null;

    // Si viene una nueva imagen en base64, subirla a Cloudinary
    if (imagen && imagen.startsWith('data:image/')) {
      const matches = imagen.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) return res.status(400).json({ error: 'Imagen base64 inválida.' });

      const ext = matches[1];
      const data = matches[2];

      const uploadResult = await cloudinary.uploader.upload(`data:image/${ext};base64,${data}`, {
        folder: 'dispositivos',
        public_id: `dispositivo_${id}`,
        overwrite: true,
      });

      imageUrl = uploadResult.secure_url;
      imageCloudId = uploadResult.public_id;
    }

    // Armar la query de actualización (incluye imagen si se subió)
    let updateQuery = `
      UPDATE dispositivos SET
        nombre = $1,
        rareza = $2,
        nivel = $3,
        "costeVentaja" = $4,
        precio = $5,
        descripcion = $6,
        sistema = $7
    `;
    const updateValues = [
      nombre,
      rareza,
      nivel,
      costeVentaja,
      precio,
      descripcion,
      sistema,
    ];

    if (imageUrl) {
      updateQuery += `, imagenurl = $8, imagencloudid = $9`;
      updateValues.push(imageUrl, imageCloudId);
    }

    updateQuery += ` WHERE idobjeto = $${updateValues.length + 1}`;
    updateValues.push(id);

    await pool.query(updateQuery, updateValues);

    res.json({ message: 'Dispositivo Neotecnico actualizado exitosamente.' });

  } catch (err) {
    console.error('Error al actualizar dispositivo Neotecnico:', err);
    res.status(500).json({ error: 'Error al actualizar Dispositivo Neotecnico.' });
  }
});

//ok!!
app.delete('/deleteObjetoNeo/:idobjeto', async (req, res) => {
  const { idobjeto } = req.params;
    //console.log('Intentando eliminar objeto con id:', idobjeto);

  try {
    // Opcional: verificar que el objeto exista antes de eliminar

    const deleteQuery = 'DELETE FROM dispositivos WHERE idobjeto = $1';
    const result = await pool.query(deleteQuery, [idobjeto]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Dispositivo Neotecnico no encontrado.' });
    }

    res.json({ message: 'Dispositivo Neotecnico eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar Dispositivo Neotecnico:', error);
    res.status(500).json({ error: 'Error al eliminar Dispositivo Neotecnico.' });
  }
});

//******************************************************************************** 







//****************************** Herbolaria App MOBILE  ************************************
app.get('/consumirObjetosH', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM elementos
    `);

    res.status(200).json({ objetosH: result.rows });
  } catch (error) {
    console.error('Error al consumir elementos de Herbolaria:', error);
    res.status(500).json({ error: 'Error interno al obtener elementos de Herbolaria' });
  }
});


app.post('/insertObjetoH', async (req, res) => {

  console.log(" red : ",req.body)
  const {
    nombre, rareza, nivel, costeVentaja, precio, descripcion, sistema, imagen
  } = req.body;

  try {
    // 1. Insertar personaje sin imagenurl
    const query = `
      INSERT INTO elementos (
        nombre, rareza, nivel, "costeVentaja", precio, descripcion, sistema
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7
      )
      RETURNING idobjeto
    `;

    const values = [
      nombre, rareza, nivel, costeVentaja, precio, descripcion, sistema
    ];

    const result = await pool.query(query, values);
    const newId = result.rows[0].idobjeto;

    let imageUrl = null;

    if (imagen) {
      const matches = imagen.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) return res.status(400).json({ error: 'Imagen base64 inválida.' });

      const ext = matches[1];
      const data = matches[2];

      // 2. Subir la imagen a Cloudinary
      const uploadResult = await cloudinary.uploader.upload(`data:image/${ext};base64,${data}`, {
        folder: 'elementos',
        public_id: `elemento_${newId}`,
        overwrite: true,
      });

      imageUrl = uploadResult.secure_url;
      const imageCloudId = uploadResult.public_id;

      // 3. Actualizar la URL y el ID cloud en la base de datos
      await pool.query(
        'UPDATE elementos SET imagenurl = $1, imagencloudid = $2 WHERE idobjeto = $3',
        [imageUrl, imageCloudId, newId]
      );
    }

    // 4. Responder con éxito y URL
    res.status(201).json({
      message: 'elemento de Herbolaria creado exitosamente.',
      idobjeto: newId,
      imagenurl: imageUrl,
    });

  } catch (err) {
    console.error('Error al insertar elemento de Herbolaria nuevo:', err);
    res.status(500).json({ error: 'Error al insertar elemento de Herbolaria nuevo.' });
  }
});

//ok!!
app.put('/updateObjetoH/:id', async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    rareza,
    nivel,
    costeVentaja,
    precio,
    descripcion,
    sistema,
    imagen,
  } = req.body;

  try {
    let imageUrl = null;
    let imageCloudId = null;

    // Si viene una nueva imagen en base64, subirla a Cloudinary
    if (imagen && imagen.startsWith('data:image/')) {
      const matches = imagen.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) return res.status(400).json({ error: 'Imagen base64 inválida.' });

      const ext = matches[1];
      const data = matches[2];

      const uploadResult = await cloudinary.uploader.upload(`data:image/${ext};base64,${data}`, {
        folder: 'elementos',
        public_id: `elemento_${id}`,
        overwrite: true,
      });

      imageUrl = uploadResult.secure_url;
      imageCloudId = uploadResult.public_id;
    }

    // Armar la query de actualización (incluye imagen si se subió)
    let updateQuery = `
      UPDATE elementos SET
        nombre = $1,
        rareza = $2,
        nivel = $3,
        "costeVentaja" = $4,
        precio = $5,
        descripcion = $6,
        sistema = $7
    `;
    const updateValues = [
      nombre,
      rareza,
      nivel,
      costeVentaja,
      precio,
      descripcion,
      sistema,
    ];

    if (imageUrl) {
      updateQuery += `, imagenurl = $8, imagencloudid = $9`;
      updateValues.push(imageUrl, imageCloudId);
    }

    updateQuery += ` WHERE idobjeto = $${updateValues.length + 1}`;
    updateValues.push(id);

    await pool.query(updateQuery, updateValues);

    res.json({ message: 'Elemento de Herbolaria actualizado exitosamente.' });

  } catch (err) {
    console.error('Error al actualizar elemento de Herbolaria:', err);
    res.status(500).json({ error: 'Error al actualizar elemento de Herbolaria.' });
  }
});

//ok!!
app.delete('/deleteObjetoH/:idobjeto', async (req, res) => {
  const { idobjeto } = req.params;
    //console.log('Intentando eliminar objeto con id:', idobjeto);

  try {
    // Opcional: verificar que el objeto exista antes de eliminar

    const deleteQuery = 'DELETE FROM elementos WHERE idobjeto = $1';
    const result = await pool.query(deleteQuery, [idobjeto]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Elemento de Herbolaria no encontrado.' });
    }

    res.json({ message: 'Elemento de Herbolaria eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar elemento de Herbolaria:', error);
    res.status(500).json({ error: 'Error al eliminar elemento de Herbolaria.' });
  }
});
//***************************************************************** 




//************************Historial DEL CHAT ***************************** */
app.get('/buscarHistorialPj', async (req, res) => {
  const { nombre } = req.query; // o req.body si es POST
  //console.log("lo que viene ", req.query)

  try {
    const result = await pool.query(
      `SELECT * FROM (
         SELECT * FROM mensajes
         WHERE REPLACE(LOWER(nombre), ' ', '') = REPLACE(LOWER($1), ' ', '')
         ORDER BY id DESC
         LIMIT 100
       ) sub
       ORDER BY id ASC`,
      [nombre]
    );

    res.status(200).json({ historialPj: result.rows });
  } catch (error) {
    console.error('Error al consumir historial de personaje:', error);
    res.status(500).json({ error: 'Error interno al obtener historial de personaje' });
  }
});


app.get('/pedirHistorialKen', async (req, res) => {
  const { idpersonaje } = req.query; // viene del GET ?idpersonaje=123

  try {
    const result = await pool.query(
      `SELECT * FROM mensajes
       WHERE "idpersonajeReceptor" = $1  -- solo los mensajes donde este pj recibió Ken
         AND tipo = 'entregaKen'
       ORDER BY id DESC`, // ASC para orden cronológico
      [idpersonaje]
    );

    res.status(200).json({ historialKen: result.rows });
  
  } catch (error) {
    console.error('Error al consumir historial de ken del personaje:', error);
    res.status(500).json({ error: 'Error interno al obtener historial de ken del personaje' });
  }
});
//**************************************************************





//****************************** COLECCION DE IMAGENES ***************************** */
app.put('/agregarImagenColeccion/:id', async (req, res) => {
  const idpersonaje = req.params.id; // coincide con :id en la ruta
  const { imagen } = req.body;       // solo necesitamos la imagen base64

  console.log("ID del personaje para agregar imagen a coleccion: ", idpersonaje);
  console.log("Imagen recibida para agregar a coleccion: ", imagen ? "Sí" : "No");

  try {
    if (!imagen || !imagen.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Imagen base64 inválida.' });
    }

    // Subimos la imagen a Cloudinary
    const matches = imagen.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Formato de imagen inválido.' });
    }

    const ext = matches[1];
    const data = matches[2];

    const uploadResult = await cloudinary.uploader.upload(
      `data:image/${ext};base64,${data}`,
      {
        folder: 'personajes',
      }
    );

    const imagenurl = uploadResult.secure_url;
    const cloudid = uploadResult.public_id; // usamos cloudid como id

    // 🔥 Traemos la colección actual (CORREGIDO EL NOMBRE)
    const { rows } = await pool.query(
      'SELECT "coleccionImagenes" FROM personajes WHERE idpersonaje = $1',
      [idpersonaje]
    );

    let coleccion = [];

    if (rows[0] && rows[0].coleccionImagenes) {
      // 🔥 Soporta string o JSON
      coleccion = typeof rows[0].coleccionImagenes === 'string'
        ? JSON.parse(rows[0].coleccionImagenes)
        : rows[0].coleccionImagenes;
    }

    // Creamos el objeto de la nueva imagen
    const nuevaImagen = {
      id: cloudid,
      url: imagenurl,
    };

    // Agregamos la nueva imagen
    coleccion.push(nuevaImagen);

    // Guardamos la colección actualizada
    await pool.query(
      'UPDATE personajes SET "coleccionImagenes" = $1 WHERE idpersonaje = $2',
      [JSON.stringify(coleccion), idpersonaje]
    );

    // Respondemos con la colección completa
    res.status(201).json({
      message: 'Imagen agregada a la colección.',
      coleccion,
    });

  } catch (err) {
    console.error('Error al agregar imagen a la colección:', err.message);
    res.status(500).json({ error: 'Error al agregar imagen a la colección.' });
  }
});


app.put('/cambiarImagenColeccion/:id', async (req, res) => {
  const idpersonaje = req.params.id;
  const { imagenId, nuevaImagen } = req.body; // <-- recibimos id de la imagen a reemplazar y Base64

  console.log("ID personaje:", idpersonaje);
  console.log("Imagen recibida:", nuevaImagen ? "Sí" : "No", "Imagen a reemplazar ID:", imagenId);

  try {
    if (!nuevaImagen || !nuevaImagen.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Imagen base64 inválida.' });
    }

    if (!imagenId) {
      return res.status(400).json({ error: 'Debe enviarse el ID de la imagen a reemplazar.' });
    }

    // 🔹 Subimos la nueva imagen a Cloudinary
    const matches = nuevaImagen.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Formato de imagen inválido.' });
    }

    const ext = matches[1];
    const data = matches[2];

    const uploadResult = await cloudinary.uploader.upload(
      `data:image/${ext};base64,${data}`,
      { folder: 'personajes' }
    );

    const imagenurl = uploadResult.secure_url;
    const cloudid = uploadResult.public_id;

    // 🔹 Traemos la colección actual
    const { rows } = await pool.query(
      'SELECT "coleccionImagenes" FROM personajes WHERE idpersonaje = $1',
      [idpersonaje]
    );

    if (!rows[0]) return res.status(404).json({ error: 'Personaje no encontrado.' });

    let coleccion = rows[0].coleccionImagenes || [];
    coleccion = typeof coleccion === 'string' ? JSON.parse(coleccion) : coleccion;

    // 🔹 Buscar y reemplazar la imagen vieja
    const index = coleccion.findIndex(img => img.id === imagenId);
    if (index === -1) return res.status(404).json({ error: 'Imagen no encontrada en la colección.' });

    // 🔹 Opcional: borrar la imagen vieja de Cloudinary
    try {
      await cloudinary.uploader.destroy(coleccion[index].id);
    } catch (err) {
      console.warn('No se pudo borrar la imagen vieja de Cloudinary:', err.message);
    }

    // 🔹 Reemplazamos la imagen
    coleccion[index] = { id: cloudid, url: imagenurl };

   

    await pool.query(
  `UPDATE personajes 
   SET "coleccionImagenes" = $1,
       imagenurl = $2,
       imagencloudid = $3,
       "imagenSeleccionada" = $3
   WHERE idpersonaje = $4`,
  [JSON.stringify(coleccion), imagenurl, cloudid, idpersonaje]
);

   res.status(200).json({ 
  message: 'Imagen reemplazada correctamente.', 
  coleccion, 
  nuevaImagenId: cloudid  // <-- agregamos el id de la nueva imagen
});

  } catch (err) {
    console.error('Error al reemplazar imagen en la colección:', err.message);
    res.status(500).json({ error: 'Error al reemplazar imagen en la colección.' });
  }
});


app.put('/eliminarImagenColeccion/:id', async (req, res) => {
  const idpersonaje = req.params.id;
  const { imagenId } = req.body;

  console.log("ID personaje:", idpersonaje);
  console.log("Imagen a eliminar:", imagenId);

  try {
    if (!imagenId) {
      return res.status(400).json({ error: 'Debe enviarse el ID de la imagen.' });
    }

    // 🔹 Traer datos actuales
    const { rows } = await pool.query(
      'SELECT "coleccionImagenes", "imagenSeleccionada" FROM personajes WHERE idpersonaje = $1',
      [idpersonaje]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'Personaje no encontrado.' });
    }

    let coleccion = rows[0].coleccionImagenes || [];
    const imagenSeleccionada = rows[0].imagenSeleccionada;

    coleccion = typeof coleccion === 'string' ? JSON.parse(coleccion) : coleccion;

    // 🔹 Buscar imagen a eliminar
    const index = coleccion.findIndex(img => img.id === imagenId);
    if (index === -1) {
      return res.status(404).json({ error: 'Imagen no encontrada en la colección.' });
    }

    // 🔹 Borrar de Cloudinary
    try {
      await cloudinary.uploader.destroy(coleccion[index].id);
    } catch (err) {
      console.warn('No se pudo borrar de Cloudinary:', err.message);
    }

    // 🔹 Eliminar de la colección
    coleccion.splice(index, 1);

    // 🔥 LÓGICA CLAVE: nueva imagen seleccionada
    let nuevaSeleccion = null;

    if (coleccion.length > 0) {
      // si borraste la seleccionada → elegir otra
      if (imagenSeleccionada === imagenId) {
        nuevaSeleccion = coleccion[0]; // simple y efectivo
      } else {
        // mantener la misma seleccionada
        nuevaSeleccion = coleccion.find(img => img.id === imagenSeleccionada) || coleccion[0];
      }
    }

    // 🔹 Guardar en DB
    await pool.query(
      `UPDATE personajes 
       SET "coleccionImagenes" = $1,
           imagenurl = $2,
           imagencloudid = $3,
           "imagenSeleccionada" = $3
       WHERE idpersonaje = $4`,
      [
        JSON.stringify(coleccion),
        nuevaSeleccion ? nuevaSeleccion.url : null,
        nuevaSeleccion ? nuevaSeleccion.id : null,
        idpersonaje
      ]
    );

    // 🔹 Respuesta
    res.status(200).json({
      message: 'Imagen eliminada correctamente.',
      coleccion,
      imagenSeleccionada: nuevaSeleccion ? nuevaSeleccion.id : null,
      imagenurl: nuevaSeleccion ? nuevaSeleccion.url : null
    });

  } catch (err) {
    console.error('Error al eliminar imagen:', err.message);
    res.status(500).json({ error: 'Error al eliminar imagen.' });
  }
});

app.put('/seleccionarImagen/:id', async (req, res) => {

    const idpersonaje = req.params.id;

    const { imagenSeleccionada, imagenurl } = req.body;


    console.log("====== SELECCIONAR IMAGEN ======");
    console.log("ID personaje:", idpersonaje);
    console.log("imagenSeleccionada:", imagenSeleccionada);
    console.log("imagenurl:", imagenurl);
    console.log("Body completo:", req.body);


    try {

        const resultado = await pool.query(
            `UPDATE personajes
             SET "imagenSeleccionada" = $1,
                 imagenurl = $2
             WHERE idpersonaje = $3`,
            [
                imagenSeleccionada,
                imagenurl,
                idpersonaje
            ]
        );


        console.log("Filas modificadas:", resultado.rowCount);


        res.json({ 
            mensaje: "Imagen seleccionada actualizada",
            filas: resultado.rowCount
        });


    } catch (error) {

        console.error("ERROR seleccionando imagen:", error.message);

        res.status(500).json({
            error: error.message
        });
    }
});

//*********************************************************************************** */





//***************************************************************************** */
//******************************APLICACION DE ESCRITORIO ********************** */


//**********************************ITEMS******************************************* */
app.get('/ConsumirItemsInventario/:idPersonaje', async (req, res) => {
    const idPersonaje = req.params.idPersonaje;

    try {
        const result = await pool.query(
            `SELECT *
             FROM items
             WHERE idpersonaje = $1`,
            [idPersonaje]
        );

        return res.json(result.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
});

app.get('/ConsumirItemsManual', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT *
            FROM tesoros
        `);

        return res.json(result.rows);


    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
});

app.post('/insertItem', async (req, res) => {

  const nombre = req.body.Nombre || req.body.nombre || "Ítem sin nombre";
  const tipo = req.body.Tipo || req.body.tipo || "";
  const rareza = req.body.Rareza || req.body.rareza || "";
  const cantidad = req.body.Cantidad || req.body.cantidad || 1;

  const idpersonaje = req.body.PersonajeId || req.body.idpersonaje;

  const descripcion = req.body.descripcion || req.body.Descripcion || "";
  const sistema = req.body.Sistema || req.body.sistema || "";
  const precio = req.body.precio || req.body.Precio || 0;
  const imagen = req.body.Imagen_url || null;
  const posicion = req.body.Posicion ?? req.body.posicion ?? null;
    
  const contenedor = req.body.Contenedor ?? req.body.contenedor ?? null;
  const efecto = req.body.Efecto ?? req.body.efecto ?? null;


  if (!idpersonaje) {
    return res.status(400).json({ error: 'Falta idpersonaje' });
  }

  const clientDb = await pool.connect();

  try {
    await clientDb.query('BEGIN');

    const queryItem = `
      INSERT INTO items (
        nombre, tipo, descripcion, sistema,
        precio, rareza, cantidad,
        posicion, contenedor, efecto, idpersonaje
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING id
    `;

    const resultItem = await clientDb.query(queryItem, [
      nombre,
      tipo,
      descripcion,
      sistema,
      precio,
      rareza,
      cantidad,
      posicion,
      contenedor,
      efecto,
      idpersonaje
    ]);

    const newId = resultItem.rows[0].id;

    let imageUrl = null;

    if (imagen) {
      if (imagen.startsWith('http')) {
        imageUrl = imagen;

        await clientDb.query(
          'UPDATE items SET imagen_url = $1 WHERE id = $2',
          [imageUrl, newId]
        );

      } else {
        const matches = imagen.match(/^data:image\/(\w+);base64,(.+)$/);

        if (matches) {
          const ext = matches[1];
          const data = matches[2];

          const uploadResult = await subirImagenCloudinaryEscritorio(
            `data:image/${ext};base64,${data}`,
            {
              folder: 'items',
              public_id: `item_${newId}`,
              overwrite: true,
            }
          );

          imageUrl = uploadResult.secure_url;

          await clientDb.query(
            'UPDATE items SET imagen_url = $1, imagen_cloud_id = $2 WHERE id = $3',
            [imageUrl, uploadResult.public_id, newId]
          );
        }
      }
    }

    await clientDb.query('COMMIT');

    res.status(201).json({
      message: 'Item creado correctamente',
      iditem: newId,
      idpersonaje,
      imagen_url: imageUrl
    });

  } catch (err) {
    await clientDb.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error interno al insertar item' });
  } finally {
    clientDb.release();
  }
});


app.put('/ActualizarPosicionItem', async (req, res) => {
    try {
        const { ItemId, Posicion, Contenedor } = req.body;

        if (!ItemId) {
            return res.status(400).json({ error: 'ItemId requerido' });
        }

        await pool.query(
            `
            UPDATE items
            SET posicion = $1,
                contenedor = $2
            WHERE id = $3
            `,
            [Posicion, Contenedor, ItemId]
        );

        return res.status(200).json({ message: 'OK' });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
});


app.delete('/deleteItem', async (req, res) => {

  const iditem = req.body.iditem || req.body.IdItem;

  console.log("ID del item a eliminar: ", iditem);

  if (!iditem) {
    return res.status(400).json({
      error: 'Falta iditem'
    });
  }

  const clientDb = await pool.connect();

  try {

    await clientDb.query('BEGIN');

    // 1. Obtener imagen del item
    const result = await clientDb.query(
      `
      SELECT imagen_cloud_id, imagen_url
      FROM items
      WHERE id = $1
      `,
      [iditem]
    );

    if (result.rows.length === 0) {

      await clientDb.query('ROLLBACK');

      return res.status(404).json({
        error: 'Item no encontrado'
      });
    }

    const {
      imagen_cloud_id,
      imagen_url
    } = result.rows[0];


    // 2. Eliminar imagen de Cloudinary
    if (imagen_cloud_id) {

      try {

        // Determinar en qué cuenta está la imagen
        if (
          imagen_url &&
          imagen_url.includes('res.cloudinary.com/ucoamrxg/')
        ) {

          console.log(
            `🟢 Item ${iditem}: imagen pertenece a Cloudinary Escritorio`
          );

          await eliminarImagenCloudinaryEscritorio(
            imagen_cloud_id
          );

        } else {

          console.log(
            `🟡 Item ${iditem}: imagen pertenece a Cloudinary principal`
          );

          await cloudinary.uploader.destroy(
            imagen_cloud_id
          );
        }

      } catch (cloudErr) {

        console.error(
          `⚠️ Error eliminando imagen Cloudinary del item ${iditem}:`,
          cloudErr
        );

        // No detenemos el borrado del item.
      }
    }


    // 3. Eliminar item de PostgreSQL
    await clientDb.query(
      `
      DELETE FROM items
      WHERE id = $1
      `,
      [iditem]
    );


    await clientDb.query('COMMIT');


    res.status(200).json({
      message: 'Item eliminado correctamente',
      iditem
    });


  } catch (err) {

    await clientDb.query('ROLLBACK');

    console.error(
      'Error interno al eliminar item:',
      err
    );

    res.status(500).json({
      error: 'Error interno al eliminar item'
    });

  } finally {

    clientDb.release();
  }
});


async function eliminarImagenCloudinaryEscritorio(publicId) {

  const cloudinaryEscritorio = require('cloudinary').v2;

  const resultado = await new Promise((resolve, reject) => {

    cloudinaryEscritorio.uploader.destroy(
      publicId,
      {
        cloud_name: 'ucoamrxg',
        api_key: '975696536842629',
        api_secret: 'm6m_AmX0mlMxAXRBJrpFxCwE5Io'
      },
      (error, result) => {

        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

  });

  return resultado;
}

app.put('/ActualizarCantidadItem', async (req, res) => {

    try {

        const { ItemId, Cantidad } = req.body;

       


        if (!ItemId) {
            return res.status(400).json({ error: 'ItemId requerido' });
        }


        if (Cantidad === undefined || Cantidad === null) {
            return res.status(400).json({ error: 'Cantidad requerida' });
        }


        await pool.query(
            `
            UPDATE items
            SET cantidad = $1
            WHERE id = $2
            `,
            [
                Cantidad,
                ItemId
            ]
        );


        return res.status(200).json({
            message: 'Cantidad actualizada correctamente'
        });


    } catch (error) {

        console.log(error);

        return res.status(500).json({
            error: error.message
        });
    }
});

app.get('/ConsumirItemsBiblioteca', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT *
            FROM items_biblioteca
        `);

        return res.json(result.rows);


    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
});

app.post('/insertItemBiblioteca', async (req, res) => {

  const nombre = req.body.Nombre || req.body.nombre || "Ítem sin nombre";
  const tipo = req.body.Tipo || req.body.tipo || "";
  const rareza = req.body.Rareza || req.body.rareza || "";
  const nivel = req.body.Nivel || req.body.nivel || "";
  const descripcion = req.body.Descripcion || req.body.descripcion || "";
  const sistema = req.body.Sistema || req.body.sistema || "";
  const precio = req.body.Precio || req.body.precio || "";
  const costeVentaja = req.body.CosteVentaja || req.body.costeVentaja || "";
  const imagen = req.body.Imagen_url || req.body.imagen_url || null;
  const efecto = req.body.Efecto ?? req.body.efecto ?? "";



  const clientDb = await pool.connect();

  try {

    await clientDb.query('BEGIN');

    const queryItem = `
      INSERT INTO items_biblioteca (
        nombre,
        tipo,
        rareza,
        nivel,
        descripcion,
        sistema,
        precio,
        "costeVentaja",
        efecto
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING idobjeto
    `;

    const resultItem = await clientDb.query(queryItem, [
      nombre,
      tipo,
      rareza,
      nivel,
      descripcion,
      sistema,
      precio,
      costeVentaja,
      efecto
    ]);

    const newId = resultItem.rows[0].idobjeto;

    let imageUrl = null;
    let imageCloudId = null;

    if (imagen) {

      if (imagen.startsWith('http')) {

        imageUrl = imagen;

        await clientDb.query(
          `
          UPDATE items_biblioteca
          SET imagenurl = $1
          WHERE idobjeto = $2
          `,
          [imageUrl, newId]
        );

      } else {

        const matches = imagen.match(
          /^data:image\/(\w+);base64,(.+)$/
        );

        if (matches) {

          const ext = matches[1];
          const data = matches[2];

          const uploadResult =
            await subirImagenCloudinaryEscritorio(
              `data:image/${ext};base64,${data}`,
              {
                folder: 'items',
                public_id: `item_biblioteca_${newId}`,
                overwrite: true
              }
            );

          imageUrl = uploadResult.secure_url;
          imageCloudId = uploadResult.public_id;

          await clientDb.query(
            `
            UPDATE items_biblioteca
            SET imagenurl = $1,
                imagencloudid = $2
            WHERE idobjeto = $3
            `,
            [
              imageUrl,
              imageCloudId,
              newId
            ]
          );
        }
      }
    }

    await clientDb.query('COMMIT');

    res.status(201).json({
      message: 'Item creado correctamente en la biblioteca',
      idobjeto: newId,
      imagenurl: imageUrl,
      imagencloudid: imageCloudId
    });

  } catch (err) {

    await clientDb.query('ROLLBACK');

    console.error(
      'Error al insertar item en biblioteca:',
      err
    );

    res.status(500).json({
      error: 'Error interno al insertar item en biblioteca'
    });

  } finally {

    clientDb.release();
  }
});

//****************************************************************************** */





//************************* ACIONES ************************************

app.get('/ConsumirListaAcciones/:idPersonaje', async (req, res) => {
    const idPersonaje = req.params.idPersonaje;

    //console.log(`[CONSUMIR LISTA ACCIONES SE DISPARO] Request recibida para personaje: ${idPersonaje}`);

    try {
        const result = await pool.query(
            `SELECT *
             FROM acciones
             WHERE idpersonaje = $1`,
            [idPersonaje]
        );

       // console.log(`[CONSUMIR LISTA ACCIONES] OK personaje ${idPersonaje} - acciones encontradas: ${result.rows.length}`);

        return res.json(result.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
});



//INSERT DE ACCIONES INICALES DE UN PERSONAJE NUEVO
app.post('/crearAccionesIniciales', async (req, res) => {

    const idPersonaje = req.body.idPersonaje;
    const idsAcciones = req.body.idsAcciones;

    if (!idPersonaje) {
        return res.status(400).json({
            error: 'Falta idPersonaje'
        });
    }

    if (!Array.isArray(idsAcciones) || idsAcciones.length === 0) {
        return res.status(400).json({
            error: 'Faltan idsAcciones'
        });
    }

    const clientDb = await pool.connect();

    try {

        await clientDb.query('BEGIN');

        const query = `
            INSERT INTO acciones (
                nombre,
                tipo,
                descripcion,
                sistema,
                rareza,
                posicion,
                contenedor,
                efecto,
                idpersonaje,
                prioridad,
                dominio,
                arte,
                ryu,
                tiempo_invocacion,
                nivel_ki,
                coste_ki,
                imagen_url
            )
            SELECT
                ab.nombre,
                ab.tipo,
                ab.descripcion,
                ab.sistema,
                ab.rareza,
                ROW_NUMBER() OVER (ORDER BY ab.id) - 1,
                'ACCIONES',
                ab.efecto,
                $1,
                ab.prioridad,
                ab.dominio,
                ab.arte,
                ab.ryu,
                ab.tiempo_invocacion,
                ab.nivel_ki,
                ab.coste_ki,
                ab.imagen_url
            FROM acciones_biblioteca ab
            WHERE ab.id = ANY($2::int[])
            ORDER BY ab.id
            RETURNING id;
        `;

        const resultado = await clientDb.query(
            query,
            [
                idPersonaje,
                idsAcciones
            ]
        );

        await clientDb.query('COMMIT');

        res.status(201).json({
            message: 'Acciones iniciales creadas correctamente',
            idPersonaje: idPersonaje,
            cantidad: resultado.rows.length,
            idsAccionesCreadas: resultado.rows.map(row => row.id)
        });

    } catch (err) {

        await clientDb.query('ROLLBACK');

        console.error(err);

        res.status(500).json({
            error: 'Error interno al crear las acciones iniciales'
        });

    } finally {

        clientDb.release();
    }
});

app.post('/insertAccion', async (req, res) => {

  const nombre = req.body.Nombre || req.body.nombre || "Accion sin nombre";
  const tipo = req.body.Tipo || req.body.tipo || "";
  const rareza = req.body.Rareza || req.body.rareza || "";
  //const cantidad = req.body.Cantidad || req.body.cantidad || 1;

  const idpersonaje = req.body.PersonajeId || req.body.idpersonaje;

  const descripcion = req.body.descripcion || req.body.Descripcion || "";
  const sistema = req.body.Sistema || req.body.sistema || "";
  //const precio = req.body.precio || req.body.Precio || 0;
  const imagen = req.body.Imagen_url || null;
  const posicion = req.body.Posicion ?? req.body.posicion ?? null;
  const contenedor = req.body.Contenedor || req.body.contenedor || null;

  const efecto = req.body.Efecto || req.body.efecto || null;


    // Campos específicos de tipo de acción
  const prioridad = req.body.Prioridad || "";
  const dominio = req.body.Dominio || "";
  const arte = req.body.Arte || "";
  const ryu = req.body.Ryu || "";
  const tiempo_invocacion = req.body.Tiempo_invocacion || "";
  const nivel_ki = req.body.Nivel_ki ?? 0;
  const coste_ki = req.body.Coste_ki ?? 0;


 

  if (!idpersonaje) {
    return res.status(400).json({ error: 'Falta idpersonaje' });
  }

  const clientDb = await pool.connect();

  try {
    await clientDb.query('BEGIN');

   const queryItem = `
      INSERT INTO acciones (
        nombre,
        tipo,
        descripcion,
        sistema,
        rareza,
        posicion,
        contenedor,
        efecto,
        idpersonaje,

        prioridad,
        dominio,
        arte,
        ryu,
        tiempo_invocacion,
        nivel_ki,
        coste_ki
      )
      VALUES (
        $1,$2,$3,$4,$5,
        $6,$7,$8,$9,
        $10,$11,$12,$13,$14,$15,$16
      )
      RETURNING id
    `;


    const resultItem = await clientDb.query(queryItem, [
      nombre,
      tipo,
      descripcion,
      sistema,
      rareza,
      posicion,
      contenedor,
      efecto,
      idpersonaje,
      prioridad,
      dominio,
      arte,
      ryu,
      tiempo_invocacion,
      nivel_ki,
      coste_ki
    ]);

    const newId = resultItem.rows[0].id;

    let imageUrl = null;

    if (imagen) {
      if (imagen.startsWith('http')) {
        imageUrl = imagen;

        await clientDb.query(
          'UPDATE acciones SET imagen_url = $1 WHERE id = $2',
          [imageUrl, newId]
        );

      } else {
        const matches = imagen.match(/^data:image\/(\w+);base64,(.+)$/);

        if (matches) {
          const ext = matches[1];
          const data = matches[2];

          const uploadResult = await subirImagenCloudinaryEscritorio(
            `data:image/${ext};base64,${data}`,
            {
              folder: 'acciones',
              public_id: `accion_${newId}`,
              overwrite: true,
            }
          );

          imageUrl = uploadResult.secure_url;

          await clientDb.query(
            'UPDATE acciones SET imagen_url = $1, imagen_cloud_id = $2 WHERE id = $3',
            [imageUrl, uploadResult.public_id, newId]
          );
        }
      }
    }

    await clientDb.query('COMMIT');

    res.status(201).json({
      message: 'Accion creada correctamente',
      iditem: newId,
      idpersonaje,
      imagen_url: imageUrl
    });

  } catch (err) {
    await clientDb.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error interno al insertar accion' });
  } finally {
    clientDb.release();
  }
});

app.post('/insertAccionBiblioteca', async (req, res) => {

  const nombre = req.body.Nombre || req.body.nombre || "Accion sin nombre";
  const tipo = req.body.Tipo || req.body.tipo || "";
  const rareza = req.body.Rareza || req.body.rareza || "";

  const descripcion = req.body.descripcion || req.body.Descripcion || "";
  const sistema = req.body.Sistema || req.body.sistema || "";

  const imagen = req.body.Imagen_url || null;
  const efecto = req.body.Efecto || req.body.efecto || null;


  const prioridad = req.body.Prioridad || "";
const dominio = req.body.Dominio || "";
const arte = req.body.Arte || "";
const ryu = req.body.Ryu || "";
const tiempo_invocacion = req.body.Tiempo_invocacion || "";
const nivel_ki = req.body.Nivel_ki ?? 0;
const coste_ki = req.body.Coste_ki ?? 0;




  const clientDb = await pool.connect();

  try {

    await clientDb.query('BEGIN');


    const queryAccion = `
     INSERT INTO acciones_biblioteca (
    nombre,
    tipo,
    descripcion,
    sistema,
    rareza,
    efecto,
    prioridad,
    dominio,
    arte,
    ryu,
    tiempo_invocacion,
    nivel_ki,
    coste_ki
)
VALUES (
    $1,$2,$3,$4,$5,$6,
    $7,$8,$9,$10,$11,$12,$13
)
RETURNING id
    `;


    const resultAccion = await clientDb.query(queryAccion, [
      nombre,
      tipo,
      descripcion,
      sistema,
      rareza,
      efecto,
      prioridad,
    dominio,
    arte,
    ryu,
    tiempo_invocacion,
    nivel_ki,
    coste_ki
    ]);


    const newId = resultAccion.rows[0].id;


    let imageUrl = null;


    if (imagen) {

      if (imagen.startsWith('http')) {

        imageUrl = imagen;

        await clientDb.query(
          'UPDATE acciones_biblioteca SET imagen_url = $1 WHERE id = $2',
          [imageUrl, newId]
        );

      } 
      else {

        const matches = imagen.match(/^data:image\/(\w+);base64,(.+)$/);


        if (matches) {

          const ext = matches[1];
          const data = matches[2];


          const uploadResult = await subirImagenCloudinaryEscritorio(
            `data:image/${ext};base64,${data}`,
            {
              folder: 'acciones_biblioteca',
              public_id: `accion_biblioteca_${newId}`,
              overwrite: true,
            }
          );


          imageUrl = uploadResult.secure_url;


          await clientDb.query(
            `
            UPDATE acciones_biblioteca
            SET imagen_url = $1,
                imagen_cloud_id = $2
            WHERE id = $3
            `,
            [
              imageUrl,
              uploadResult.public_id,
              newId
            ]
          );

        }
      }
    }


    await clientDb.query('COMMIT');


    res.status(201).json({
      message: 'Accion guardada en biblioteca correctamente',
      idaccion: newId,
      imagen_url: imageUrl
    });


  } catch (err) {

    await clientDb.query('ROLLBACK');

    console.error(err);

    res.status(500).json({
      error: 'Error interno al insertar accion en biblioteca'
    });

  } finally {

    clientDb.release();

  }

});

app.get('/ConsumirAccionesBiblioteca', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT *
            FROM acciones_biblioteca
        `);


      
        return res.json(result.rows);


    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
});

app.put('/ActualizarPosicionAccion', async (req, res) => {
    try {
        const { ItemId, Posicion, Contenedor } = req.body;

      

        if (!ItemId) {
            return res.status(400).json({ error: 'ItemId requerido' });
        }

        await pool.query(
            `
            UPDATE acciones
            SET posicion = $1,
                contenedor = $2
            WHERE id = $3
            `,
            [Posicion, Contenedor, ItemId]
        );

        return res.status(200).json({ message: 'OK' });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
});

app.delete('/deleteAccion', async (req, res) => {

  const idaccion = req.body.idaccion || req.body.IdAccion;

  if (!idaccion) {
    return res.status(400).json({
      error: 'Falta idaccion'
    });
  }

  const clientDb = await pool.connect();

  try {

    await clientDb.query('BEGIN');

    // 1. Obtener imagen de la acción
    const result = await clientDb.query(
      `
      SELECT imagen_cloud_id, imagen_url
      FROM acciones
      WHERE id = $1
      `,
      [idaccion]
    );

    if (result.rows.length === 0) {

      await clientDb.query('ROLLBACK');

      return res.status(404).json({
        error: 'Accion no encontrada'
      });
    }

    const {
      imagen_cloud_id,
      imagen_url
    } = result.rows[0];


    // 2. Eliminar imagen de Cloudinary
    if (imagen_cloud_id) {

      try {

        // Determinar en qué cuenta está la imagen
        if (
          imagen_url &&
          imagen_url.includes('res.cloudinary.com/ucoamrxg/')
        ) {

          console.log(
            `🟢 Acción ${idaccion}: imagen pertenece a Cloudinary Escritorio`
          );

          await eliminarImagenCloudinaryEscritorio(
            imagen_cloud_id
          );

        } else {

          console.log(
            `🟡 Acción ${idaccion}: imagen pertenece a Cloudinary principal`
          );

          await cloudinary.uploader.destroy(
            imagen_cloud_id
          );
        }

      } catch (cloudErr) {

        console.error(
          `⚠️ Error eliminando imagen Cloudinary de acción ${idaccion}:`,
          cloudErr
        );

        // No detenemos el borrado de la acción.
      }
    }


    // 3. Eliminar acción de PostgreSQL
    await clientDb.query(
      `
      DELETE FROM acciones
      WHERE id = $1
      `,
      [idaccion]
    );


    await clientDb.query('COMMIT');


    res.status(200).json({
      message: 'Accion eliminada correctamente',
      idaccion
    });


  } catch (err) {

    await clientDb.query('ROLLBACK');

    console.error(
      'Error interno al eliminar accion:',
      err
    );

    res.status(500).json({
      error: 'Error interno al eliminar accion'
    });

  } finally {

    clientDb.release();

  }
});


async function eliminarImagenCloudinaryEscritorio(publicId) {
  const cloudinaryEscritorio = require('cloudinary').v2;

  const resultado = await new Promise((resolve, reject) => {

    cloudinaryEscritorio.uploader.destroy(
      publicId,
      {
        cloud_name: 'ucoamrxg',
        api_key: '975696536842629',
        api_secret: 'm6m_AmX0mlMxAXRBJrpFxCwE5Io'
      },
      (error, result) => {

        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

  });

  return resultado;
}
//*************************************************************************** */





//*********************VENTAJAS*****************************************


app.get('/ConsumirVentajasDesventajasTodas', async (req, res) => {

    try {

        const result = await pool.query(
            `SELECT *
             FROM ventajas`
        );

        //console.log("Cantidad de ventajas:", result.rows.length);

        return res.json({
            message: "Consulta exitosa",
            cantidad: result.rows.length,
            coleccionVentajas: result.rows
        });

    } catch (error) {

        console.log(error);
        return res.status(500).json({ error: error.message });
    }
});

app.get('/ConsumirIdsVentajasPersonaje/:idPersonaje', async (req, res) => {
    const idPersonaje = req.params.idPersonaje;

    

    try {
        const result = await pool.query(
            `SELECT idventaja_fk
             FROM personajes_ventajas
             WHERE idpersonaje_fk = $1`,
            [idPersonaje]
        );

        const idsVentajas = result.rows.map(v => v.idventaja_fk);

       // console.log("Ventajas encontradas:", idsVentajas);

        return res.json(idsVentajas);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
});

app.post('/AgregarVentajaPersonaje', async (req, res) => {

  const idPersonaje = req.body.idPersonaje || req.body.idpersonaje;
  const idVentaja = req.body.idVentaja || req.body.idventaja;

  if (!idPersonaje || !idVentaja) {
    return res.status(400).json({
      error: "Faltan datos."
    });
  }

  const clientDb = await pool.connect();

  try {

    await clientDb.query("BEGIN");

    const query = `
      INSERT INTO personajes_ventajas
      (
        idpersonaje_fk,
        idventaja_fk
      )
      VALUES
      (
        $1,
        $2
      )
      RETURNING idpersonajes_ventajas
    `;

    const resultado = await clientDb.query(query, [
      idPersonaje,
      idVentaja
    ]);

    await clientDb.query("COMMIT");

    res.status(201).json({
      message: "Ventaja agregada correctamente.",
      id: resultado.rows[0].id
    });

  }
  catch (err) {

    await clientDb.query("ROLLBACK");

    console.error(err);

    res.status(500).json({
      error: "Error al agregar la ventaja."
    });

  }
  finally {

    clientDb.release();

  }

});

app.post('/EliminarVentajaPersonaje', async (req, res) => {

  const idPersonaje = req.body.idPersonaje || req.body.idpersonaje;
  const idVentaja = req.body.idVentaja || req.body.idventaja;

  if (!idPersonaje || !idVentaja) {
    return res.status(400).json({
      error: 'Faltan idPersonaje o idVentaja'
    });
  }

  try {

    const resultado = await pool.query(
      `DELETE FROM personajes_ventajas
       WHERE idpersonaje_fk = $1
       AND idventaja_fk = $2`,
      [idPersonaje, idVentaja]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({
        error: 'La ventaja no estaba asignada al personaje'
      });
    }

    res.status(200).json({
      message: 'Ventaja eliminada correctamente'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Error interno al eliminar la ventaja'
    });
  }

});


//.................INCREMENTOS PENDIENTES***********************

app.get('/ConsumirIncrementosPendientes/:idPersonaje', async (req, res) => {
    const idPersonaje = req.params.idPersonaje;

    

    try {
        const result = await pool.query(
            `SELECT *
             FROM incrementos_pendientes
             WHERE idpersonaje = $1`,
            [idPersonaje]
        );

        return res.json(result.rows);

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            error: error.message
        });
    }
});

app.post('/GuardarIncremento', async (req, res) => {
    const incremento = req.body;

    // console.log("Incremento recibido:", incremento);

    try {

        await pool.query(
            `INSERT INTO incrementos_pendientes (
                idpersonaje,
                fuerza,
                fortaleza,
                destreza,
                agilidad,
                sabiduria,
                principio,
                presencia,
                sentidos,
                academisismo,
                alerta,
                atletismo,
                conbakemono,
                mentir,
                pilotear,
                artesmarciales,
                medicina,
                conobjmagicos,
                sigilo,
                conesferas,
                conleyendas,
                forja,
                condemonio,
                conespiritual,
                manejoblaster,
                manejosombras,
                tratobakemono,
                conhechiceria,
                medvital,
                medespiritual,
                rayo,
                fuego,
                frio,
                veneno,
                corte,
                energia,
                valcombate,
                valcombate2,
                valadd1,
                valadd2,
                valadd3,
                valadd4,
                ki
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
                $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
                $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
                $41, $42, $43
            )
            ON CONFLICT (idpersonaje)
            DO UPDATE SET
                fuerza = incrementos_pendientes.fuerza + EXCLUDED.fuerza,
                fortaleza = incrementos_pendientes.fortaleza + EXCLUDED.fortaleza,
                destreza = incrementos_pendientes.destreza + EXCLUDED.destreza,
                agilidad = incrementos_pendientes.agilidad + EXCLUDED.agilidad,
                sabiduria = incrementos_pendientes.sabiduria + EXCLUDED.sabiduria,
                principio = incrementos_pendientes.principio + EXCLUDED.principio,
                presencia = incrementos_pendientes.presencia + EXCLUDED.presencia,
                sentidos = incrementos_pendientes.sentidos + EXCLUDED.sentidos,

                academisismo = incrementos_pendientes.academisismo + EXCLUDED.academisismo,
                alerta = incrementos_pendientes.alerta + EXCLUDED.alerta,
                atletismo = incrementos_pendientes.atletismo + EXCLUDED.atletismo,
                conbakemono = incrementos_pendientes.conbakemono + EXCLUDED.conbakemono,
                mentir = incrementos_pendientes.mentir + EXCLUDED.mentir,
                pilotear = incrementos_pendientes.pilotear + EXCLUDED.pilotear,
                artesmarciales = incrementos_pendientes.artesmarciales + EXCLUDED.artesmarciales,
                medicina = incrementos_pendientes.medicina + EXCLUDED.medicina,
                conobjmagicos = incrementos_pendientes.conobjmagicos + EXCLUDED.conobjmagicos,
                sigilo = incrementos_pendientes.sigilo + EXCLUDED.sigilo,
                conesferas = incrementos_pendientes.conesferas + EXCLUDED.conesferas,
                conleyendas = incrementos_pendientes.conleyendas + EXCLUDED.conleyendas,
                forja = incrementos_pendientes.forja + EXCLUDED.forja,
                condemonio = incrementos_pendientes.condemonio + EXCLUDED.condemonio,
                conespiritual = incrementos_pendientes.conespiritual + EXCLUDED.conespiritual,
                manejoblaster = incrementos_pendientes.manejoblaster + EXCLUDED.manejoblaster,
                manejosombras = incrementos_pendientes.manejosombras + EXCLUDED.manejosombras,
                tratobakemono = incrementos_pendientes.tratobakemono + EXCLUDED.tratobakemono,
                conhechiceria = incrementos_pendientes.conhechiceria + EXCLUDED.conhechiceria,

                medvital = incrementos_pendientes.medvital + EXCLUDED.medvital,
                medespiritual = incrementos_pendientes.medespiritual + EXCLUDED.medespiritual,
                rayo = incrementos_pendientes.rayo + EXCLUDED.rayo,
                fuego = incrementos_pendientes.fuego + EXCLUDED.fuego,
                frio = incrementos_pendientes.frio + EXCLUDED.frio,
                veneno = incrementos_pendientes.veneno + EXCLUDED.veneno,
                corte = incrementos_pendientes.corte + EXCLUDED.corte,
                energia = incrementos_pendientes.energia + EXCLUDED.energia,

                valcombate = incrementos_pendientes.valcombate + EXCLUDED.valcombate,
                valcombate2 = incrementos_pendientes.valcombate2 + EXCLUDED.valcombate2,

                valadd1 = incrementos_pendientes.valadd1 + EXCLUDED.valadd1,
                valadd2 = incrementos_pendientes.valadd2 + EXCLUDED.valadd2,
                valadd3 = incrementos_pendientes.valadd3 + EXCLUDED.valadd3,
                valadd4 = incrementos_pendientes.valadd4 + EXCLUDED.valadd4,
                ki = incrementos_pendientes.ki + EXCLUDED.ki
            `,
            [
                incremento.idpersonaje,

                incremento.fuerza,
                incremento.fortaleza,
                incremento.destreza,
                incremento.agilidad,
                incremento.sabiduria,
                incremento.principio,
                incremento.presencia,
                incremento.sentidos,

                incremento.academisismo,
                incremento.alerta,
                incremento.atletismo,
                incremento.conbakemono,
                incremento.mentir,
                incremento.pilotear,
                incremento.artesmarciales,
                incremento.medicina,
                incremento.conobjmagicos,
                incremento.sigilo,
                incremento.conesferas,
                incremento.conleyendas,
                incremento.forja,
                incremento.condemonio,
                incremento.conespiritual,
                incremento.manejoblaster,
                incremento.manejosombras,
                incremento.tratobakemono,
                incremento.conhechiceria,

                incremento.medvital,
                incremento.medespiritual,
                incremento.rayo,
                incremento.fuego,
                incremento.frio,
                incremento.veneno,
                incremento.corte,
                incremento.energia,

                incremento.valcombate,
                incremento.valcombate2,

                incremento.valadd1,
                incremento.valadd2,
                incremento.valadd3,
                incremento.valadd4,
                incremento.ki
            ]
        );


        
        return res.json({
            ok: true,
            mensaje: "Incremento guardado correctamente"
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});

app.post('/GuardarIncrementoNarrador', async (req, res) => {
    const incremento = req.body;

    //console.log("Incremento recibido del narrador:", incremento);

    try {

        await pool.query(
            `INSERT INTO incrementos_pendientes (
                idpersonaje,
                fuerza,
                fortaleza,
                destreza,
                agilidad,
                sabiduria,
                principio,
                presencia,
                sentidos,
                academisismo,
                alerta,
                atletismo,
                conbakemono,
                mentir,
                pilotear,
                artesmarciales,
                medicina,
                conobjmagicos,
                sigilo,
                conesferas,
                conleyendas,
                forja,
                condemonio,
                conespiritual,
                manejoblaster,
                manejosombras,
                tratobakemono,
                conhechiceria,
                medvital,
                medespiritual,
                rayo,
                fuego,
                frio,
                veneno,
                corte,
                energia,
                valcombate,
                valcombate2,
                valadd1,
                valadd2,
                valadd3,
                valadd4
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
                $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
                $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
                $41, $42
            )
            ON CONFLICT (idpersonaje)
            DO UPDATE SET
                fuerza = incrementos_pendientes.fuerza + EXCLUDED.fuerza,
                fortaleza = incrementos_pendientes.fortaleza + EXCLUDED.fortaleza,
                destreza = incrementos_pendientes.destreza + EXCLUDED.destreza,
                agilidad = incrementos_pendientes.agilidad + EXCLUDED.agilidad,
                sabiduria = incrementos_pendientes.sabiduria + EXCLUDED.sabiduria,
                principio = incrementos_pendientes.principio + EXCLUDED.principio,
                presencia = incrementos_pendientes.presencia + EXCLUDED.presencia,
                sentidos = incrementos_pendientes.sentidos + EXCLUDED.sentidos,

                academisismo = incrementos_pendientes.academisismo + EXCLUDED.academisismo,
                alerta = incrementos_pendientes.alerta + EXCLUDED.alerta,
                atletismo = incrementos_pendientes.atletismo + EXCLUDED.atletismo,
                conbakemono = incrementos_pendientes.conbakemono + EXCLUDED.conbakemono,
                mentir = incrementos_pendientes.mentir + EXCLUDED.mentir,
                pilotear = incrementos_pendientes.pilotear + EXCLUDED.pilotear,
                artesmarciales = incrementos_pendientes.artesmarciales + EXCLUDED.artesmarciales,
                medicina = incrementos_pendientes.medicina + EXCLUDED.medicina,
                conobjmagicos = incrementos_pendientes.conobjmagicos + EXCLUDED.conobjmagicos,
                sigilo = incrementos_pendientes.sigilo + EXCLUDED.sigilo,
                conesferas = incrementos_pendientes.conesferas + EXCLUDED.conesferas,
                conleyendas = incrementos_pendientes.conleyendas + EXCLUDED.conleyendas,
                forja = incrementos_pendientes.forja + EXCLUDED.forja,
                condemonio = incrementos_pendientes.condemonio + EXCLUDED.condemonio,
                conespiritual = incrementos_pendientes.conespiritual + EXCLUDED.conespiritual,
                manejoblaster = incrementos_pendientes.manejoblaster + EXCLUDED.manejoblaster,
                manejosombras = incrementos_pendientes.manejosombras + EXCLUDED.manejosombras,
                tratobakemono = incrementos_pendientes.tratobakemono + EXCLUDED.tratobakemono,
                conhechiceria = incrementos_pendientes.conhechiceria + EXCLUDED.conhechiceria,

                medvital = incrementos_pendientes.medvital + EXCLUDED.medvital,
                medespiritual = incrementos_pendientes.medespiritual + EXCLUDED.medespiritual,
                rayo = incrementos_pendientes.rayo + EXCLUDED.rayo,
                fuego = incrementos_pendientes.fuego + EXCLUDED.fuego,
                frio = incrementos_pendientes.frio + EXCLUDED.frio,
                veneno = incrementos_pendientes.veneno + EXCLUDED.veneno,
                corte = incrementos_pendientes.corte + EXCLUDED.corte,
                energia = incrementos_pendientes.energia + EXCLUDED.energia,

                valcombate = incrementos_pendientes.valcombate + EXCLUDED.valcombate,
                valcombate2 = incrementos_pendientes.valcombate2 + EXCLUDED.valcombate2,

                valadd1 = incrementos_pendientes.valadd1 + EXCLUDED.valadd1,
                valadd2 = incrementos_pendientes.valadd2 + EXCLUDED.valadd2,
                valadd3 = incrementos_pendientes.valadd3 + EXCLUDED.valadd3,
                valadd4 = incrementos_pendientes.valadd4 + EXCLUDED.valadd4
            `,
            [
                incremento.idpersonaje,

                incremento.fuerza,
                incremento.fortaleza,
                incremento.destreza,
                incremento.agilidad,
                incremento.sabiduria,
                incremento.principio,
                incremento.presencia,
                incremento.sentidos,

                incremento.academisismo,
                incremento.alerta,
                incremento.atletismo,
                incremento.conbakemono,
                incremento.mentir,
                incremento.pilotear,
                incremento.artesmarciales,
                incremento.medicina,
                incremento.conobjmagicos,
                incremento.sigilo,
                incremento.conesferas,
                incremento.conleyendas,
                incremento.forja,
                incremento.condemonio,
                incremento.conespiritual,
                incremento.manejoblaster,
                incremento.manejosombras,
                incremento.tratobakemono,
                incremento.conhechiceria,

                incremento.medvital,
                incremento.medespiritual,
                incremento.rayo,
                incremento.fuego,
                incremento.frio,
                incremento.veneno,
                incremento.corte,
                incremento.energia,

                incremento.valcombate,
                incremento.valcombate2,

                incremento.valadd1,
                incremento.valadd2,
                incremento.valadd3,
                incremento.valadd4
            ]
        );

     // Avisar al jugador si está conectado
console.log(
    "EMITIENDO incrementos-pendientes para personaje:",
    incremento.idpersonaje
);

console.log("SOCKETS CONECTADOS:", io.engine.clientsCount);

io.emit("incrementos_pendientes", {
    idpersonaje: incremento.idpersonaje
});
console.log(
    "EMIT incrementos-pendientes EJECUTADO para personaje:",
    incremento.idpersonaje
);

        return res.json({
            ok: true,
            mensaje: "Incremento del narrador guardado correctamente"
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});

app.post('/ConsumirIncremento', async (req, res) => {
    const { idpersonaje, campo, cantidad } = req.body;

  

    const camposPermitidos = [
        "fuerza",
        "fortaleza",
        "destreza",
        "agilidad",
        "sabiduria",
        "principio",
        "presencia",
        "sentidos",

        "academisismo",
        "alerta",
        "atletismo",
        "conbakemono",
        "mentir",
        "pilotear",
        "artesmarciales",
        "medicina",
        "conobjmagicos",
        "sigilo",
        "conesferas",
        "conleyendas",
        "forja",
        "condemonio",
        "conespiritual",
        "manejoblaster",
        "manejosombras",
        "tratobakemono",
        "conhechiceria",

        "medvital",
        "medespiritual",
        "rayo",
        "fuego",
        "frio",
        "veneno",
        "corte",
        "energia",

        "valcombate",
        "valcombate2",

        "valadd1",
        "valadd2",
        "valadd3",
        "valadd4",

        // KI
        "ki"
    ];

    try {

        if (!camposPermitidos.includes(campo)) {
            return res.status(400).json({
                ok: false,
                error: "Campo de incremento no válido"
            });
        }

        if (!Number.isInteger(idpersonaje) ||
            !Number.isInteger(cantidad) ||
            cantidad <= 0) {

            return res.status(400).json({
                ok: false,
                error: "Datos inválidos"
            });
        }

        const result = await pool.query(
            `
            UPDATE incrementos_pendientes
            SET ${campo} = ${campo} - $1
            WHERE idpersonaje = $2
              AND ${campo} >= $1
            RETURNING idpersonaje, ${campo}
            `,
            [
                cantidad,
                idpersonaje
            ]
        );

        if (result.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                error: "No hay suficientes puntos de incremento para consumir"
            });
        }

        return res.json({
            ok: true,
            mensaje: "Incremento consumido correctamente",
            valor_restante: result.rows[0][campo]
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});


/* esto funciona para migrar imagenes de personajes a cloudinary y traerme la url y el cloudid a la base de datos
async function migrarImagenPersonaje(idpersonaje) {
  const resultado = await pool.query(
    `SELECT idpersonaje, nombre, imagen
     FROM personajes
     WHERE idpersonaje = $1`,
    [idpersonaje]
  );

  if (resultado.rows.length === 0) {
    throw new Error(`Personaje ${idpersonaje} no encontrado.`);
  }

  const personaje = resultado.rows[0];

  if (!personaje.imagen) {
    throw new Error(`El personaje ${idpersonaje} no tiene imagen Base64.`);
  }

  let imagenBase64 = personaje.imagen;

  if (!imagenBase64.startsWith('data:image/')) {
    imagenBase64 = `data:image/jpeg;base64,${imagenBase64}`;
  }

  const uploadResult = await cloudinary.uploader.upload(
    imagenBase64,
    {
      folder: 'personajes',
      public_id: `personaje_${idpersonaje}`,
      overwrite: true
    }
  );

  console.log('=================================');
  console.log('IMAGEN MIGRADA');
  console.log('Personaje:', personaje.nombre);
  console.log('ID:', idpersonaje);
  console.log('Nueva URL:', uploadResult.secure_url);
  console.log('Nuevo Cloud ID:', uploadResult.public_id);
  console.log('=================================');

  return {
    idpersonaje: personaje.idpersonaje,
    nombre: personaje.nombre,
    imagenurl: uploadResult.secure_url,
    imagencloudid: uploadResult.public_id
  };
}
*/

//descarga la imagen usando la url de cloudinary y la mete en la base de datos postgresql en base64
/* funciono descargar imagen de cloudinary y guardarla en base64 en la base de datos
async function recuperarYGuardarBase64(idpersonaje) {
  try {
    const resultado = await pool.query(
      `SELECT idpersonaje, nombre, imagenurl, imagen
       FROM personajes
       WHERE idpersonaje = $1`,
      [idpersonaje]
    );

    if (resultado.rows.length === 0) {
      throw new Error(`Personaje ${idpersonaje} no encontrado.`);
    }

    const personaje = resultado.rows[0];

    if (!personaje.imagenurl) {
      throw new Error(`El personaje ${idpersonaje} no tiene imagenurl.`);
    }

    if (personaje.imagen) {
      throw new Error(`El personaje ${idpersonaje} ya tiene imagen Base64.`);
    }

    console.log('=================================');
    console.log('RECUPERANDO IMAGEN');
    console.log('Personaje:', personaje.nombre);
    console.log('ID:', personaje.idpersonaje);
    console.log('URL:', personaje.imagenurl);

    const respuesta = await fetch(personaje.imagenurl);

    if (!respuesta.ok) {
      throw new Error(
        `Cloudinary respondió con HTTP ${respuesta.status}`
      );
    }

    const arrayBuffer = await respuesta.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const contentType =
      respuesta.headers.get('content-type') || 'image/jpeg';

    const base64 = buffer.toString('base64');

    const imagenBase64 = `data:${contentType};base64,${base64}`;

    console.log('Tamaño original:', buffer.length, 'bytes');
    console.log('Content-Type:', contentType);
    console.log('Longitud Base64:', imagenBase64.length);

    // GUARDAR BASE64 EN POSTGRESQL
    await pool.query(
      `UPDATE personajes
       SET imagen = $1
       WHERE idpersonaje = $2`,
      [imagenBase64, idpersonaje]
    );

    console.log('✅ Base64 guardado correctamente en PostgreSQL.');
    console.log('=================================');

    return imagenBase64;

  } catch (error) {
    console.error('❌ Error recuperando y guardando imagen:', error);
    throw error;
  }
}
*/

// guarda la imagen en cloudinary y trae la url y el cloudid a la base de datos
/*
async function subirBase64ACloudinary(idpersonaje) {
  try {
    const resultado = await pool.query(
      `SELECT idpersonaje, nombre, imagen
       FROM personajes
       WHERE idpersonaje = $1`,
      [idpersonaje]
    );

    if (resultado.rows.length === 0) {
      throw new Error(`Personaje ${idpersonaje} no encontrado.`);
    }

    const personaje = resultado.rows[0];

    if (!personaje.imagen) {
      throw new Error(`El personaje ${idpersonaje} no tiene imagen Base64.`);
    }

    console.log('=================================');
    console.log('SUBIENDO IMAGEN A CLOUDINARY');
    console.log('Personaje:', personaje.nombre);
    console.log('ID:', personaje.idpersonaje);

    const uploadResult = await cloudinary.uploader.upload(
      personaje.imagen,
      {
        folder: 'personajes',
        public_id: `personaje_${idpersonaje}`,
        overwrite: true
      }
    );

    const imagenUrl = uploadResult.secure_url;
    const imagenCloudId = uploadResult.public_id;

    console.log('Nueva URL:', imagenUrl);
    console.log('Nuevo Cloud ID:', imagenCloudId);

    await pool.query(
      `UPDATE personajes
       SET imagenurl = $1,
           imagencloudid = $2
       WHERE idpersonaje = $3`,
      [imagenUrl, imagenCloudId, idpersonaje]
    );

    console.log('✅ imagenurl guardado.');
    console.log('✅ imagencloudid guardado.');
    console.log('=================================');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}
*/


/* me ayudo a recuperar todas las que tenai url y ponerles base 64
async function recuperarYGuardarBase64() {
  try {
    const resultado = await pool.query(`
      SELECT idpersonaje, nombre, imagenurl, imagen
      FROM personajes
      WHERE imagenurl IS NOT NULL
        AND imagenurl LIKE '%res.cloudinary.com%'
        AND (imagen IS NULL OR imagen = '')
      ORDER BY idpersonaje
    `);

    const personajes = resultado.rows;

    console.log(`=================================`);
    console.log(`PERSONAJES A RECUPERAR: ${personajes.length}`);
    console.log(`=================================`);

    for (const personaje of personajes) {

      try {
        const {
          idpersonaje,
          nombre,
          imagenurl
        } = personaje;

        console.log('=================================');
        console.log('RECUPERANDO IMAGEN');
        console.log('Personaje:', nombre);
        console.log('ID:', idpersonaje);
        console.log('URL:', imagenurl);

        const respuesta = await fetch(imagenurl);

        if (!respuesta.ok) {
          throw new Error(
            `Cloudinary respondió con HTTP ${respuesta.status}`
          );
        }

        const arrayBuffer = await respuesta.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const contentType =
          respuesta.headers.get('content-type') || 'image/jpeg';

        const base64 = buffer.toString('base64');

        const imagenBase64 =
          `data:${contentType};base64,${base64}`;

        console.log(
          'Tamaño original:',
          buffer.length,
          'bytes'
        );

        console.log(
          'Content-Type:',
          contentType
        );

        console.log(
          'Longitud Base64:',
          imagenBase64.length
        );

        await pool.query(
          `UPDATE personajes
           SET imagen = $1
           WHERE idpersonaje = $2`,
          [imagenBase64, idpersonaje]
        );

        console.log(
          `✅ Base64 guardado correctamente para ${nombre} (${idpersonaje}).`
        );

      } catch (error) {

        console.error(
          `❌ Error con personaje ${personaje.idpersonaje} (${personaje.nombre}):`,
          error.message
        );

      }
    }

    console.log('=================================');
    console.log('🎉 RECUPERACIÓN DE BASE64 TERMINADA');
    console.log('=================================');

  } catch (error) {
    console.error(
      '🚨 Error general recuperando imágenes:',
      error.message
    );
  }
}
*/

//***************************************************** 


/*
//******************PRIMER PASO 1*******************************
//Script PARA MIGRAR PERSONAJES A CLOUDNARY y traerme la url y cludid a la base de datos OK!!
//ESTE ES EL PRIMER PASO PARA EL TRATAMIENTO DE LA BASE DE DATOS
async function migrarImagenesPersonajes() {
  try {
    const resultado = await pool.query(`
      SELECT idpersonaje, imagen, imagenurl
      FROM personajes
      WHERE imagen IS NOT NULL
      AND (imagenurl IS NULL OR imagenurl NOT LIKE '%res.cloudinary.com%')
    `);

    const personajes = resultado.rows;

    for (const personaje of personajes) {
      const { idpersonaje, imagen } = personaje;

      if (!imagen) {
        console.log(`⚠️ Personaje ${idpersonaje} no tiene imagen. Saltando...`);
        continue;
      }

      // Verificar si es una ruta local de dispositivo móvil (que no se puede subir desde backend)
      if (imagen.startsWith('file://')) {
        console.log(`⛔ Imagen de personaje ${idpersonaje} es una ruta local (file://...) y no es accesible desde el backend. Saltando...`);
        continue;
      }

      try {
        // Subir imagen a Cloudinary (se asume que 'imagen' es base64 sin prefijo data:image/...)
        // Si tiene prefijo, hay que limpiarlo antes, aquí asumo que es base64 limpio
        let base64data = imagen;
        // Si tiene prefijo "data:image/xxx;base64,", removerlo
        const base64PrefixMatch = imagen.match(/^data:image\/\w+;base64,/);
        if (base64PrefixMatch) {
          base64data = imagen.replace(/^data:image\/\w+;base64,/, '');
        }

        const res = await cloudinary.uploader.upload(
          `data:image/jpeg;base64,${base64data}`,
          {
            folder: 'personajes',
            public_id: `personaje_${idpersonaje}`,
            overwrite: true,
          }
        );

        const url = res.secure_url;
        const publicId = res.public_id;

        await pool.query(
          `UPDATE personajes SET imagenurl = $1, imagencloudid = $2 WHERE idpersonaje = $3`,
          [url, publicId, idpersonaje]
        );

        console.log(`✅ Imagen del personaje ${idpersonaje} migrada con éxito.`);
      } catch (error) {
        console.error(`❌ Error subiendo imagen del personaje ${idpersonaje}:`, error.message);
      }
    }

    console.log('🎉 Migración de imágenes completada.');
  } catch (error) {
    console.error('🚨 Error general al migrar:', error.message);
  }
}

migrarImagenesPersonajes();
*/

/*
//*********************** SEGUNDO PASO 2 *******************************
//PARA MIGRAR LAS IMAGENES de SAGAS Y OBTENER URL Y ID DE CLUDNARY OK!!
async function migrarImagenesSagas() {
  try {
    console.log('🔄 Iniciando migración de imágenes de sagas...');

    const resultado = await pool.query(`
      SELECT idsaga, imagensaga, imagenurl
      FROM sagas
      WHERE imagensaga IS NOT NULL
      AND (imagenurl IS NULL OR imagenurl NOT LIKE '%res.cloudinary.com%')
    `);

    const sagas = resultado.rows;
    console.log(`📝 Se encontraron ${sagas.length} sagas para migrar.`);

    for (const saga of sagas) {
      const { idsaga, imagensaga } = saga;

      console.log(`➡️ Procesando saga ID: ${idsaga}...`);

      if (!imagensaga) {
        console.log(`⚠️ Saga ${idsaga} no tiene imagen base64, se omite.`);
        continue;
      }

      if (imagensaga.startsWith('file://')) {
        console.log(`⛔ Imagen de saga ${idsaga} es ruta local (file://...), no accesible para backend, se omite.`);
        continue;
      }

      try {
        let base64data = imagensaga;
        const base64PrefixMatch = imagensaga.match(/^data:image\/\w+;base64,/);
        if (base64PrefixMatch) {
          base64data = imagensaga.replace(/^data:image\/\w+;base64,/, '');
          console.log(`🔍 Se removió prefijo base64 de saga ${idsaga}`);
        }

        console.log(`🚀 Subiendo imagen de saga ${idsaga} a Cloudinary...`);

        const res = await cloudinary.uploader.upload(
          `data:image/jpeg;base64,${base64data}`,
          {
            folder: 'sagas',
            public_id: `saga_${idsaga}`,
            overwrite: true,
          }
        );

        const url = res.secure_url;
        const publicId = res.public_id;

        console.log(`✅ Imagen subida con URL: ${url}`);

        await pool.query(
          `UPDATE sagas SET imagenurl = $1, imagencloudid = $2 WHERE idsaga = $3`,
          [url, publicId, idsaga]
        );

        console.log(`🎉 Actualización DB saga ${idsaga} completada.`);
      } catch (error) {
        console.error(`❌ Error subiendo imagen de saga ${idsaga}:`, error.message);
      }
    }

    console.log('🎉 Migración de imágenes de sagas finalizada exitosamente.');
  } catch (error) {
    console.error('🚨 Error general al migrar sagas:', error.message);
  } finally {
    await pool.end();
  }
}

migrarImagenesSagas();
*/


/*
//*************************TERCER PASO*********************
//PARA HACER LA MIGRACION DE LAS SECCIONES HACEMSO ESTO 
async function migrarImagenesSecciones() {
  try {
    console.log('🔄 Iniciando migración de imágenes de secciones...');

    const resultado = await pool.query(`
      SELECT idseccion, imagen, imagenurl
      FROM secciones
      WHERE imagen IS NOT NULL
      AND (imagenurl IS NULL OR imagenurl NOT LIKE '%res.cloudinary.com%')
    `);

    const secciones = resultado.rows;
    console.log(`📝 Se encontraron ${secciones.length} secciones para migrar.`);

    for (const seccion of secciones) {
      const { idseccion, imagen } = seccion;

      console.log(`➡️ Procesando sección ID: ${idseccion}...`);

      if (!imagen) {
        console.log(`⚠️ Sección ${idseccion} no tiene imagen base64, se omite.`);
        continue;
      }

      if (imagen.startsWith('file://')) {
        console.log(`⛔ Imagen de sección ${idseccion} es ruta local (file://...), no accesible para backend, se omite.`);
        continue;
      }

      try {
        let base64data = imagen;
        const base64PrefixMatch = imagen.match(/^data:image\/\w+;base64,/);
        if (base64PrefixMatch) {
          base64data = imagen.replace(/^data:image\/\w+;base64,/, '');
          console.log(`🔍 Se removió prefijo base64 de sección ${idseccion}`);
        }

        console.log(`🚀 Subiendo imagen de sección ${idseccion} a Cloudinary...`);

        const res = await cloudinary.uploader.upload(
          `data:image/jpeg;base64,${base64data}`,
          {
            folder: 'secciones',
            public_id: `seccion_${idseccion}`,
            overwrite: true,
          }
        );

        const url = res.secure_url;
        const publicId = res.public_id;

        console.log(`✅ Imagen subida con URL: ${url}`);

        await pool.query(
          `UPDATE secciones SET imagenurl = $1, imagencloudid = $2 WHERE idseccion = $3`,
          [url, publicId, idseccion]
        );

        console.log(`🎉 Actualización DB sección ${idseccion} completada.`);
      } catch (error) {
        console.error(`❌ Error subiendo imagen de sección ${idseccion}:`, error.message);
      }
    }

    console.log('🎉 Migración de imágenes de secciones finalizada exitosamente.');
  } catch (error) {
    console.error('🚨 Error general al migrar secciones:', error.message);
  } finally {
    await pool.end();
  }
}

migrarImagenesSecciones();
*/

/*
server.listen(PORT, () => {
  console.log(`🟢 Servidor Socket.IO corriendo en http://localhost:${PORT}`);
});
*/



server.listen(PORT, () => {
  console.log(`🟢 Servidor Socket.IO corriendo en puerto ${PORT}`);
});





