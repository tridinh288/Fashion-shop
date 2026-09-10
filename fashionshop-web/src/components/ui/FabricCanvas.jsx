import { useEffect, useRef } from "react";

/**
 * Nền chuyển động cho hero: mô phỏng nếp vải lụa trôi chậm dưới ánh sáng.
 *
 * Viết bằng WebGL thuần thay vì Three.js — cả hiệu ứng chỉ là một shader
 * chạy trên một hình chữ nhật phủ kín màn hình, nên nặng vài KB thay vì
 * vài trăm KB, và không cần file mô hình hay video nào.
 */

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

uniform vec2  u_res;
uniform float u_time;

// Nhiễu giả ngẫu nhiên, dùng làm cơ sở cho nếp gấp
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i),                 hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

// Chồng nhiều lớp nhiễu để nếp vải có độ sâu
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  vec2 p  = uv;
  p.x *= u_res.x / u_res.y;

  float t = u_time * 0.075;

  // Lớp nếp thứ nhất: sóng dọc bị bẻ cong bởi nhiễu
  float warpA = fbm(p * 2.0 + vec2(t, t * 0.6));
  float foldA = sin(p.x * 5.5 + warpA * 3.2 + t * 1.8) * 0.5 + 0.5;
  foldA = pow(foldA, 2.6);

  // Lớp thứ hai chạy ngược chiều, tạo cảm giác vải chồng lớp
  float warpB = fbm(p * 3.4 - vec2(t * 0.8, t * 0.35));
  float foldB = sin(p.y * 3.8 - warpB * 4.0 - t * 1.3) * 0.5 + 0.5;
  foldB = pow(foldB, 3.2);

  float light = foldA * 0.62 + foldB * 0.38;

  // Tối dần ở rìa để chữ phía trên luôn đọc được
  float vignette = smoothstep(1.15, 0.25, length(uv - vec2(0.5)));
  light *= vignette;

  // Nền sáng: vải trắng ngà, nếp gấp hiện ra bằng sắc xám ấm rất nhạt
  vec3 base = vec3(0.980, 0.978, 0.973);   // #fafaf8
  vec3 fold = vec3(0.886, 0.878, 0.867);   // #e2e0dd

  vec3 col = mix(base, fold, light * 0.85);

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function FabricCanvas({ className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
    });

    // Máy không hỗ trợ WebGL thì để nguyên nền tối, không có gì vỡ
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    // Hai tam giác phủ kín khung nhìn
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_res");
    const uTime = gl.getUniformLocation(program, "u_time");

    const resize = () => {
      // Giới hạn tỉ lệ điểm ảnh: màn retina không cần vẽ gấp 3 lần cho nền mờ
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    const start = performance.now();

    const draw = (now) => {
      resize();
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(draw);
    };

    if (reduceMotion) {
      // Người dùng tắt hiệu ứng: vẽ đúng một khung tĩnh
      resize();
      gl.uniform1f(uTime, 12.0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    } else {
      raf = requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`h-full w-full ${className}`}
    />
  );
}
