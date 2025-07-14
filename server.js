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



//SOCKETIO
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

   socket.on('chat-chat', async (mensaje) => {
    console.log('📥 Mensaje de chat-chat recibido:', mensaje);

    if (mensaje.imagenBase64) {
      try {
        // Subir a Cloudinary
        const resultado = await cloudinary.uploader.upload(mensaje.imagenBase64, {
          folder: 'chat-imagenes',
        });

        // Reemplazamos el contenido del mensaje con la URL
        mensaje.mensaje = resultado.secure_url;

        // Ya no necesitamos la imagen base64
        delete mensaje.imagenBase64;

        console.log('✅ Imagen subida a Cloudinary:', resultado.secure_url);
      } catch (error) {
        console.error('❌ Error al subir imagen:', error);
        return; // No emitimos si falló
      }
    }

    // Emitimos el mensaje (texto o con imagen)
    io.emit('chat-chat', mensaje);
    console.log('📤 Mensaje emitido a clientes:', mensaje);
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
    console.log("el id del usuario es: ",usuarioId)
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


  console.log(" los cambios de vida actual: ",vidaActual)
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

  console.log("esto viene del cliente: ",req.body)
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

  console.log(" id personaje ",idpersonaje)
  console.log("notasaga  ", notasaga)

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




/*
//ESTO ES PARA TODAS LAS SECCIONES
app.get('/consumirSecciones', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT idseccion, titulo, presentacion, idsaga, imagenurl, imagencloudid
      FROM secciones
    `);

    res.status(200).json({ coleccionSecciones: result.rows });
  } catch (error) {
    console.error('Error al obtener secciones:', error);
    res.status(500).json({ error: 'Error interno al obtener secciones' });
  }
});
*/



/*

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
/* PARA MIGRAR LAS IMAGENES Y OBTENER URL Y ID DE CLUDNARY
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










// Actualizar presentación saga
app.put('/updateSaga/:idsaga', async (req, res) => {
  const { idsaga } = req.params;
  const { presentacion } = req.body;

  if (!presentacion) {
    return res.status(400).json({ error: 'Presentacion es requerida' });
  }

  try {
    const result = await pool.query(
      'UPDATE sagas SET presentacion = $1 WHERE idsaga = $2 RETURNING *',
      [presentacion, idsaga]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Saga no encontrada' });
    }
    res.json({ message: 'Saga actualizada correctamente', saga: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar saga:', error);
    res.status(500).json({ error: 'Error interno al actualizar saga' });
  }
});

// Eliminar saga y sus secciones relacionadas
app.delete('/deleteSaga/:idsaga', async (req, res) => {
  const { idsaga } = req.params;

  try {
    await pool.query('BEGIN');

    await pool.query('DELETE FROM secciones WHERE idsaga = $1', [idsaga]);
    const result = await pool.query('DELETE FROM sagas WHERE idsaga = $1 RETURNING *', [idsaga]);

    if (result.rowCount === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Saga no encontrada' });
    }

    await pool.query('COMMIT');
    res.json({ message: 'Saga eliminada correctamente' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error al eliminar saga:', error);
    res.status(500).json({ error: 'Error interno al eliminar saga' });
  }
});


// SECCIONES

// Obtener todas las secciones
app.get('/consumirSecciones', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM secciones');
    res.status(200).json({ coleccionSecciones: result.rows });
  } catch (error) {
    console.error('Error al obtener secciones:', error);
    res.status(500).json({ error: 'Error interno al obtener secciones' });
  }
});

// Insertar sección
app.post('/insertSeccion', async (req, res) => {
  const { titulo, presentacion, imagen, idsaga } = req.body;

  if (!titulo || !presentacion || !imagen || !idsaga) {
    return res.status(400).json({ error: 'Faltan campos obligatorios: titulo, presentacion, imagen o idsaga' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO secciones (titulo, presentacion, imagen, idsaga) VALUES ($1, $2, $3, $4) RETURNING *',
      [titulo, presentacion, imagen, idsaga]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al insertar sección:', error);
    res.status(500).json({ error: 'Error interno al crear sección' });
  }
});

// Actualizar sección
app.put('/updateSeccion/:idseccion', async (req, res) => {
  const { idseccion } = req.params;
  const { titulo, presentacion, imagen } = req.body;

  if (!titulo || !presentacion || !imagen) {
    return res.status(400).json({ error: 'Faltan campos obligatorios: titulo, presentacion o imagen' });
  }

  try {
    const result = await pool.query(
      'UPDATE secciones SET titulo = $1, presentacion = $2, imagen = $3 WHERE idseccion = $4 RETURNING *',
      [titulo, presentacion, imagen, idseccion]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Sección no encontrada' });
    }
    res.json({ message: 'Sección actualizada correctamente', seccion: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar sección:', error);
    res.status(500).json({ error: 'Error interno al actualizar sección' });
  }
});

// Eliminar sección
app.delete('/deleteSeccion/:idseccion', async (req, res) => {
  const { idseccion } = req.params;

  try {
    const result = await pool.query('DELETE FROM secciones WHERE idseccion = $1 RETURNING *', [idseccion]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Sección no encontrada' });
    }
    res.json({ message: 'Sección eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar sección:', error);
    res.status(500).json({ error: 'Error interno al eliminar sección' });
  }
});


// Añadir personaje a saga
app.post('/insertPjSaga', async (req, res) => {
  const { idpersonaje, idsaga } = req.body;

  if (!idpersonaje || !idsaga) {
    return res.status(400).json({ error: 'Faltan campos obligatorios: idpersonaje o idsaga' });
  }

  try {
    // Verificar que la saga exista y que el personaje no esté ya incluido puede ser buena idea

    const query = `
      UPDATE sagas
      SET personajes = array_append(personajes, $1)
      WHERE idsaga = $2 AND NOT personajes @> ARRAY[$1]
      RETURNING *;
    `;
    const result = await pool.query(query, [idpersonaje, idsaga]);

    if (result.rowCount === 0) {
      return res.status(400).json({ message: 'Personaje ya está en la saga o saga no encontrada' });
    }

    res.json({ message: 'Personaje añadido correctamente' });
  } catch (error) {
    console.error('Error al añadir personaje a saga:', error);
    res.status(500).json({ error: 'Error interno al añadir personaje a saga' });
  }
});


// NOTAS

app.put('/update-notas/:idpersonaje', async (req, res) => {
  const { idpersonaje } = req.params;
  const { nota, idsaga } = req.body;

  if (!nota || !idsaga) {
    return res.status(400).json({ error: 'Faltan campos obligatorios: nota o idsaga' });
  }

  try {
    const result = await pool.query('SELECT notasaga FROM personajes WHERE idpersonaje = $1', [idpersonaje]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Personaje no encontrado' });
    }

    let notasaga = result.rows[0].notasaga;

    if (notasaga) {
      if (typeof notasaga === 'string') {
        notasaga = JSON.parse(notasaga);
      }
      if (!Array.isArray(notasaga)) {
        notasaga = [notasaga];
      }

      const index = notasaga.findIndex(n => n.idsaga === idsaga);
      if (index !== -1) {
        notasaga[index].nota = nota;
      } else {
        notasaga.push({ nota, idsaga });
      }
    } else {
      notasaga = [{ nota, idsaga }];
    }

    await pool.query('UPDATE personajes SET notasaga = $1 WHERE idpersonaje = $2', [
      JSON.stringify(notasaga),
      idpersonaje,
    ]);

    res.json({ message: 'Nota actualizada correctamente', data: notasaga });
  } catch (error) {
    console.error('Error al actualizar nota:', error);
    res.status(500).json({ error: 'Error interno al actualizar nota' });
  }
});
*/

//Script PARA MIGRAR PERSONAJES A CLOUDNARY y traerme la url y cludid a la base de datos OK!!
/*
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









// esto es para llenar los cloudnary id 
async function rellenarImagenCloudId() {
  try {
    // 1. Traer personajes sin imagencloudid pero con imagenurl
    const { rows: personajes } = await pool.query(`
      SELECT idpersonaje, imagenurl
      FROM personajes
      WHERE imagenurl IS NOT NULL
      AND (imagencloudid IS NULL OR imagencloudid = '')
    `);

    for (const pj of personajes) {
      const { idpersonaje, imagenurl } = pj;

      // 2. Extraer public_id de la URL
      const publicId = getPublicIdFromUrl(imagenurl);

      if (publicId) {
        // 3. Actualizar en la base
        await pool.query(
          'UPDATE personajes SET imagencloudid = $1 WHERE idpersonaje = $2',
          [publicId, idpersonaje]
        );
        console.log(`Actualizado personaje ${idpersonaje} con imagencloudid: ${publicId}`);
      } else {
        console.log(`No se pudo extraer public_id para personaje ${idpersonaje}`);
      }
    }

    console.log('Proceso terminado.');
  } catch (error) {
    console.error('Error en rellenarImagenCloudId:', error);
  }
}

// Función para extraer public_id de URL de Cloudinary
function getPublicIdFromUrl(url) {
  try {
    const parts = url.split('/');
    const uploadIndex = parts.findIndex(part => part === 'upload');
    if (uploadIndex === -1) return null;

    // Obtenemos la parte después de 'upload' y la versión
    const publicIdWithExt = parts.slice(uploadIndex + 2).join('/');

    // Quitamos la extensión (ejemplo .jpg)
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");

    return publicId;
  } catch {
    return null;
  }
}


rellenarImagenCloudId()
*/

server.listen(PORT, () => {
  console.log(`🟢 Servidor Socket.IO corriendo en http://localhost:${PORT}`);
});