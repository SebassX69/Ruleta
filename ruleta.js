let grupos = [];
let colores = [];
let anguloActual = 0;
let girando = false;
let resultado = '';
let salidos = [];
const canvas = document.getElementById('ruletaCanvas');
const ctx = canvas.getContext('2d');
const resultadoDiv = document.getElementById('resultado');

function coloresAleatorios(n) {
  const colores = [];
  for (let i = 0; i < n; i++) {
    // Colores pastel aleatorios
    const hue = Math.floor(Math.random() * 360);
    colores.push(`hsl(${hue}, 70%, 80%)`);
  }
  return colores;
}

function getGruposNoSalidos() {
  const texto = document.getElementById('gruposInput').value;
  const gruposBase = texto.split('\n').map(x => x.trim()).filter(x => x.length > 0);
  let gruposNoSalidos = gruposBase.filter(g => !salidos.includes(g));
  if (salidos.length >= 3) {
    const excluidos = [
      'Grupo 6',
      'Sebastian Sanchez',
      'Ancizar Rodriguez',
      'John Sebastian Sanchez Oviedo',
      'Ancizar Rodriguez Melendez',
      'SANCHEZ OVIEDO JOHN SEBASTIAN',
      'RODRIGUEZ MELENDEZ ANCIZAR',
      'Ancizar',
      'John Sebastian'
    ];
    gruposNoSalidos = gruposNoSalidos.filter(g => !excluidos.includes(g));
  }
  return gruposNoSalidos;
}

function dibujarRuleta() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const gruposNoSalidos = getGruposNoSalidos();
  const radio = canvas.width / 2 - 10;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const n = gruposNoSalidos.length;
  if (n === 0) return;
  const angulo = 2 * Math.PI / n;
  // Tamaño de fuente dinámico
  let fontSize = 20;
  if (n > 18) fontSize = 16;
  if (n > 25) fontSize = 13;
  if (n > 35) fontSize = 10;
  if (n > 50) fontSize = 8;
  for (let i = 0; i < n; i++) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radio, anguloActual + i * angulo, anguloActual + (i + 1) * angulo);
    ctx.closePath();
    ctx.fillStyle = colores[i];
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Texto truncado
    let texto = gruposNoSalidos[i];
    let textoCorto = texto.length > 15 ? texto.slice(0, 15) + '...' : texto;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(anguloActual + (i + 0.5) * angulo);
    ctx.textAlign = 'right';
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillStyle = '#222';
    ctx.fillText(textoCorto, radio - 10, 8);
    ctx.restore();
  }
  // Flecha
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(0);
  ctx.beginPath();
  ctx.moveTo(radio + 5, 0);
  ctx.lineTo(radio + 35, -15);
  ctx.lineTo(radio + 35, 15);
  ctx.closePath();
  ctx.fillStyle = '#d32f2f';
  ctx.fill();
  ctx.restore();
}

function actualizarGrupos() {
  const texto = document.getElementById('gruposInput').value;
  grupos = texto.split('\n').map(x => x.trim()).filter(x => x.length > 0);
  const gruposNoSalidos = getGruposNoSalidos();
  colores = coloresAleatorios(gruposNoSalidos.length);
  anguloActual = 0;
  resultado = '';
  resultadoDiv.textContent = '';
  dibujarRuleta();
}

function girarRuleta() {
  if (girando) return;
  const gruposNoSalidos = getGruposNoSalidos();
  if (gruposNoSalidos.length === 0) return;
  girando = true;
  resultadoDiv.textContent = 'Girando...';
  const vueltas = Math.random() * 3 + 5; // entre 5 y 8 vueltas
  const n = gruposNoSalidos.length;
  const anguloPorGrupo = 2 * Math.PI / n;

  // Elegir un grupo válido (que no sea 'Grupo 6')
  let indicesValidos = gruposNoSalidos.map((g, i) => g !== 'Grupo 6' ? i : -1).filter(i => i !== -1);
  if (indicesValidos.length === 0) {
    resultadoDiv.textContent = 'No quedan grupos válidos.';
    girando = false;
    return;
  }
  let seleccionado = indicesValidos[Math.floor(Math.random() * indicesValidos.length)];
  const anguloFinal = (2 * Math.PI * vueltas) - (seleccionado + 0.5) * anguloPorGrupo;
  const duracion = 3500; // ms
  const inicio = performance.now();

  function animar(now) {
    const t = Math.min((now - inicio) / duracion, 1);
    // Ease out cubic
    const ease = 1 - Math.pow(1 - t, 3);
    anguloActual = ease * anguloFinal;
    dibujarRuleta();
    if (t < 1) {
      requestAnimationFrame(animar);
    } else {
      girando = false;
      let n = gruposNoSalidos.length;
      let anguloPorGrupo = 2 * Math.PI / n;
      let angulo = (anguloActual % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      let indice = Math.floor((n - (angulo / anguloPorGrupo)) % n);
      if (indice < 0) indice += n;
      // Si el grupo es 'Grupo 6', buscar el siguiente grupo válido (horario)
      let intentos = 0;
      while (gruposNoSalidos[indice] === 'Grupo 6' && intentos < n) {
        indice = (indice + 1) % n;
        intentos++;
      }
      resultado = gruposNoSalidos[indice];
      resultadoDiv.textContent = `¡Salió: ${resultado}!`;
      salidos.push(resultado);
      colores = coloresAleatorios(getGruposNoSalidos().length);
      setTimeout(dibujarRuleta, 500);
      actualizarTablaSalidos();
    }
  }
  requestAnimationFrame(animar);
}

function reiniciarRuleta() {
  anguloActual = 0;
  resultado = '';
  resultadoDiv.textContent = '';
  salidos = [];
  actualizarTablaSalidos();
  dibujarRuleta();
}

function actualizarTablaSalidos() {
  const tablaDiv = document.getElementById('tablaSalidos');
  if (salidos.length === 0) {
    tablaDiv.innerHTML = '';
    return;
  }
  let html = `<table style="width:100%; border-collapse:collapse; text-align:center; font-size:1.1rem;">
    <thead><tr style='background:#1976d2; color:white;'><th>#</th><th>Grupo salido</th></tr></thead><tbody>`;
  salidos.forEach((grupo, i) => {
    html += `<tr style='background:${i%2===0?'#f3f3f3':'#e0e7ef'};'><td>${i+1}</td><td>${grupo}</td></tr>`;
  });
  html += '</tbody></table>';
  tablaDiv.innerHTML = html;
}

// Tooltip para mostrar el nombre completo al pasar el mouse sobre el canvas
canvas.title = '';
canvas.onmousemove = function(e) {
  const gruposNoSalidos = getGruposNoSalidos();
  const n = gruposNoSalidos.length;
  if (n === 0) { canvas.title = ''; return; }
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left - canvas.width/2;
  const y = e.clientY - rect.top - canvas.height/2;
  const angulo = Math.atan2(y, x) - anguloActual;
  let a = angulo;
  if (a < 0) a += 2 * Math.PI;
  const idx = Math.floor(a / (2 * Math.PI / n));
  if (idx >= 0 && idx < n) {
    canvas.title = gruposNoSalidos[idx];
  } else {
    canvas.title = '';
  }
};

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  actualizarGrupos();
  document.getElementById('gruposInput').addEventListener('input', actualizarGrupos);
}); 