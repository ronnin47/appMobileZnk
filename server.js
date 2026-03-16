const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
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
          "vidaActual", "vidaTotal", timestamp, tipo, "idpersonajeReceptor", "idusuarioReceptor", "nombreReceptor",puntajeKen
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16, $17,$18,$19, $20)
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


//PARA GAURDADO DE IMAGENES Y OBTENER URLS
cloudinary.config({
  cloud_name: 'dzul1hatw',
  api_key: '687946621544217',
  api_secret: '09DUepXU-FApoUrHnc8h6sJb25I',
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




//aca los enpoits
//REGISTRO DE USUARIO -insert de usuario OK!!
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

//login OK!
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


//Consumir personajes Usuario OK!
app.get('/consumirPersonajesUsuario', async (req, res) => {
  try {
    
    const { usuarioId } = req.query;
   // console.log("el id del usuario es: ",usuarioId)
    const userQuery = `
      SELECT 
        idpersonaje, nombre, dominio, raza, naturaleza, edad, ken, ki, destino, "pDestino",
        fuerza, fortaleza, destreza, agilidad, sabiduria, presencia, principio,
        sentidos, academisismo, alerta, atletismo, "conBakemono", mentir, pilotear,
        "artesMarciales", medicina, "conObjMagicos", sigilo, "conEsferas", "conLeyendas",
        forja, "conDemonio", "conEspiritual", "manejoBlaster", "manejoSombras", "tratoBakemono",
        "conHechiceria", "medVital", "medEspiritual", rayo, fuego, frio, veneno, corte,
        energia, ventajas, "apCombate", "valCombate", "apCombate2", "valCombate2",
        add1, "valAdd1", add2, "valAdd2", add3, "valAdd3", add4, "valAdd4",
        inventario, dominios, "kenActual", "kiActual", positiva, negativa, "vidaActual",
        hechizos, consumision, iniciativa, historia, "tecEspecial", conviccion, cicatriz,
        notasaga, resistencia, "pjPnj", imagenurl, imagencloudid, "usuarioId"
      FROM personajes
      WHERE "usuarioId" = $1
      ORDER BY "idpersonaje" ASC
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


//OK
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
    tecEspecial, conviccion, cicatriz, notasaga, resistencia, pjPnj
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
      notasaga, resistencia, pjPnj, usuarioId
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

//aca vamos a probar el delete
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
        idpersonaje, nombre, dominio, raza, naturaleza, edad, ken, ki, destino, "pDestino",
        fuerza, fortaleza, destreza, agilidad, sabiduria, presencia, principio,
        sentidos, academisismo, alerta, atletismo, "conBakemono", mentir, pilotear,
        "artesMarciales", medicina, "conObjMagicos", sigilo, "conEsferas", "conLeyendas",
        forja, "conDemonio", "conEspiritual", "manejoBlaster", "manejoSombras", "tratoBakemono",
        "conHechiceria", "medVital", "medEspiritual", rayo, fuego, frio, veneno, corte,
        energia, ventajas, "apCombate", "valCombate", "apCombate2", "valCombate2",
        add1, "valAdd1", add2, "valAdd2", add3, "valAdd3", add4, "valAdd4",
        inventario, dominios, "kenActual", "kiActual", positiva, negativa, "vidaActual",
        hechizos, consumision, iniciativa, historia, "tecEspecial", conviccion, cicatriz,
        notasaga, resistencia, "pjPnj", imagenurl,imagencloudid, "usuarioId"
      FROM personajes
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
//insert saga ok!!
app.post('/insert-saga', async (req, res) => {

 // console.log("esto viene del cliente: ",req.body)
  const {
    titulo,
    presentacion,
    imagensaga, // si tenés otro campo aparte de imagen
    personajes,
  } = req.body;

  try {
    // 1. Insertar saga sin imagenurl ni imagencloudid
    const insertQuery = `
      INSERT INTO sagas (titulo, presentacion, imagensaga, personajes)
      VALUES ($1, $2, $3, $4)
      RETURNING idsaga
    `;

    const insertValues = [titulo, presentacion, imagensaga, personajes];
    const insertResult = await pool.query(insertQuery, insertValues);

    const newSagaId = insertResult.rows[0].idsaga;

    let imagenUrl = null;
    let imagenCloudId = null;

    // 2. Si recibís imagen base64, subir a Cloudinary
    if (imagensaga) {
      const matches = imagensaga.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) return res.status(400).json({ error: 'Imagen base64 inválida.' });

      const ext = matches[1];
      const data = matches[2];

      const uploadResult = await cloudinary.uploader.upload(`data:image/${ext};base64,${data}`, {
        folder: 'sagas',
        public_id: `saga_${newSagaId}`,
        overwrite: true,
      });

      imagenUrl = uploadResult.secure_url;
      imagenCloudId = uploadResult.public_id;

      // 3. Actualizar saga con URL e id Cloudinary
      const updateQuery = `
        UPDATE sagas SET imagenurl = $1, imagencloudid = $2 WHERE idsaga = $3
      `;

      await pool.query(updateQuery, [imagenUrl, imagenCloudId, newSagaId]);
    }

    // 4. Retornar resultado con el idsaga y url de imagen
    res.status(201).json({
      message: 'Saga creada exitosamente.',
      idsaga: newSagaId,
      imagenurl: imagenUrl,
      imagencloudid: imagenCloudId,
    });

  } catch (error) {
    console.error('Error al insertar la saga:', error);
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







//consmumir dispositivos Neo 
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









//consmumir elementos Herbolaria
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