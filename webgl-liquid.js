/**
 * webgl-liquid.js — Gold Liquid Shader
 * Pure WebGL, no dependencies.
 * Domain-warped FBM noise → iridescent gold-on-black oil effect.
 */

const VS = `
  attribute vec2 a_pos;
  void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FS = `
  precision mediump float;

  uniform float u_time;
  uniform vec2  u_resolution;
  uniform vec2  u_mouse;

  float hash(vec2 p) {
    p  = fract(p * vec2(127.1, 311.7));
    p += dot(p, p + 19.19);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i),             hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p  = p * 2.1 + vec2(1.3, 1.7);
      a *= 0.5;
    }
    return v;
  }

  /* Cosine gold palette: near-black → dark amber → bright gold */
  vec3 goldPalette(float t) {
    vec3 a = vec3(0.5,  0.38, 0.05);
    vec3 b = vec3(0.5,  0.38, 0.05);
    vec3 c = vec3(1.0,  0.80, 0.50);
    vec3 d = vec3(0.00, 0.10, 0.15);
    return a + b * cos(6.2832 * (c * t + d));
  }

  void main() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv.x *= aspect;

    float t = u_time * 0.07;

    /* Mouse pull — creates a ripple where the cursor is */
    vec2 m = u_mouse / u_resolution;
    m.x *= aspect;
    float mDist = length(uv - m);
    float mPull = smoothstep(0.40, 0.0, mDist) * 0.28;

    /* Domain warping — two layers of FBM warp each other */
    vec2 q = vec2(
      fbm(uv + t),
      fbm(uv + vec2(5.2, 1.3) + t * 0.9)
    );

    /* Inject mouse distortion into the flow field */
    vec2 mDir = normalize(m - uv + vec2(0.001, 0.001));
    q += mPull * mDir;

    float f = fbm(uv + 3.0 * q + t * 0.5);

    /* Remap: pull the midrange toward edges for sharper gold veins */
    f = clamp(f * 1.65 - 0.30, 0.0, 1.0);

    /* High-frequency shimmer — glinting highlights */
    float glint = pow(noise(uv * 14.0 + t * 3.0), 4.0);
    f = mix(f, min(f + glint * 0.45, 1.0), 0.18);

    vec3 col = goldPalette(f);

    /* Radial vignette — darkens edges so hero text stays legible */
    vec2 vUv = gl_FragCoord.xy / u_resolution - 0.5;
    float vig = 1.0 - dot(vUv, vUv) * 2.0;
    col *= clamp(vig, 0.0, 1.0);

    /* Overall dim — luxury restraint; canvas is a whisper, not a shout */
    col *= 0.72;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function initLiquidShader() {
  const canvas = document.getElementById('liquidCanvas');
  if (!canvas) return null;

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    canvas.style.display = 'none';
    return null;
  }

  /* ── Compile shaders ── */
  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('Shader error:', gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  const vs = compile(gl.VERTEX_SHADER,   VS);
  const fs = compile(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) { canvas.style.display = 'none'; return null; }

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('Program link error:', gl.getProgramInfoLog(prog));
    canvas.style.display = 'none';
    return null;
  }
  gl.useProgram(prog);

  /* ── Full-screen quad ── */
  const quad = new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]);
  const buf  = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

  const posLoc = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  /* ── Uniforms ── */
  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes  = gl.getUniformLocation(prog, 'u_resolution');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');

  /* ── State ── */
  let mx = 0, my = 0, raf = null;
  const t0 = performance.now();

  const onMouse = e => {
    mx = e.clientX;
    my = canvas.height - e.clientY; // WebGL Y is flipped
  };

  const onTouch = e => {
    if (!e.touches.length) return;
    mx = e.touches[0].clientX;
    my = canvas.height - e.touches[0].clientY;
  };

  const resize = () => {
    const parent = canvas.parentElement;
    canvas.width  = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    mx = canvas.width  * 0.5;
    my = canvas.height * 0.5;
  };

  const tick = () => {
    const elapsed = (performance.now() - t0) / 1000;
    gl.uniform1f(uTime,  elapsed);
    gl.uniform2f(uRes,   canvas.width, canvas.height);
    gl.uniform2f(uMouse, mx, my);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    raf = requestAnimationFrame(tick);
  };

  window.addEventListener('mousemove', onMouse);
  window.addEventListener('touchmove', onTouch, { passive: true });
  window.addEventListener('resize',    resize);
  resize();
  tick();

  /* Return cleanup */
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('mousemove', onMouse);
    window.removeEventListener('touchmove', onTouch);
    window.removeEventListener('resize',    resize);
    gl.deleteProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    gl.deleteBuffer(buf);
  };
}
