# 🐾 Little Black Cat

Un gatito negro en pixel art para regalar por WhatsApp. Se dibuja por código (sin imágenes externas ni dependencias), sigue el dedo, salta, rueda, duerme y habla.

## Probar en local (Visual Studio Code)

1. Abre la carpeta `LittleBlackCat` en VS Code (*Archivo → Abrir carpeta*).
2. Instala la extensión **Live Server** (Ritwick Dey).
3. Clic derecho en `index.html` → **Open with Live Server**.
4. Para probarlo en tu celular: con el PC y el celular en la misma red Wi‑Fi, abre `http://IP-DE-TU-PC:5500`.

También funciona abriendo `index.html` con doble clic.

## Publicar gratis y obtener un enlace

**Opción A: Netlify (la más rápida)**
1. Entra a https://app.netlify.com/drop (crea una cuenta gratis).
2. Arrastra la carpeta `LittleBlackCat` a la página.
3. Copia el enlace (`https://algo.netlify.app`). Puedes cambiar el nombre en *Site settings → Change site name*.

**Opción B: GitHub Pages**
1. Crea un repositorio público en GitHub y sube todos los archivos (`index.html` en la raíz).
2. *Settings → Pages → Branch: main / (root) → Save*.
3. En un minuto tendrás `https://TU-USUARIO.github.io/NOMBRE-REPO/`.

## Compartir por WhatsApp
Pega el enlace en el chat. La persona lo toca, se abre en su navegador y listo: sin instalar nada ni dar permisos.

## Cómo se juega
- **Deslizar el dedo**: el gatito te sigue.
- **Tocar el suelo**: va hacia allí (salta si está cerca, camina o corre si está lejos).
- **Tocar al gatito**: reacciona distinto cada vez.
- **Botones**: 🔊 sonido · ♡ acariciar · ↺ reiniciar.
- Si lo dejas quieto, habla y luego se duerme. Tócalo para despertarlo.

Los sonidos se generan con Web Audio y solo se activan tras tocar el botón inicial.

## Archivos
`index.html` · `style.css` · `script.js` (todo el sprite, animaciones y lógica, comentado) · `assets/` (carpetas reservadas para tus archivos propios).
