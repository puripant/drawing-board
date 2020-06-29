const maxLines = 500;
const maxCircles = 1000;
const maxWidth = 800;

let threshold = 60;
let input, src, dst, dst2;
let width, height;

let imgElement = document.getElementById('image')
imgElement.onload = () => {
  input = cv.imread('image');
  cv.imshow('input', input);

  width = Math.min(input.cols, maxWidth);
  height = Math.min(input.rows, width * input.rows / input.cols);
  cv.resize(input, input, new cv.Size(width, height), 0, 0, cv.INTER_AREA);

  src = input.clone();
  cv.resize(src, src, new cv.Size(width/2, height/2), 0, 0, cv.INTER_AREA);
  cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
  cv.medianBlur(src, src, 5);
  cv.Canny(src, src, 50, 200, 3);
  cv.imshow('canny', src);

  update(threshold);
}

let inputElement = document.getElementById('file');
inputElement.addEventListener('change', (e) => {
  imgElement.src = URL.createObjectURL(e.target.files[0]);
}, false);

function update(threshold) {
  dst = input.clone()
  dst2 = cv.Mat.ones(src.rows, src.cols, cv.CV_8UC3);

  findLines(threshold);
  findCircles(threshold/2);

  cv.imshow('output', dst);
  cv.imshow('lines', dst2);
  dst.delete();
  dst2.delete();
}
function findLines(threshold) {
  let lines = new cv.Mat();
  cv.HoughLines(src, lines, 1, Math.PI / 180, threshold, 0, 0, 0, Math.PI);
  for (let i = 0; i < Math.min(maxLines, lines.rows); ++i) {
    let rho = lines.data32F[i * 2];
    let theta = lines.data32F[i * 2 + 1];
    let a = Math.cos(theta);
    let b = Math.sin(theta);
    let x0 = a * rho;
    let y0 = b * rho;
    let start = { x: Math.round(x0 - 1000 * b), y: Math.round(y0 + 1000 * a) };
    let end = { x: Math.round(x0 + 1000 * b), y: Math.round(y0 - 1000 * a) };
    cv.line(dst, { x: start.x*2, y: start.y*2 }, { x: end.x*2, y: end.y*2 }, [100, 100, 100, 100]);
    cv.line(dst2, start, end, [255, 255, 255, 255]);
  }
  lines.delete();
}
function findCircles(threshold) {
  let circles = new cv.Mat();
  cv.HoughCircles(src, circles, cv.HOUGH_GRADIENT, 1, 1, threshold, threshold, 1, 100000);
  for (let i = 0; i < Math.min(maxCircles, circles.cols); ++i) {
    let x = circles.data32F[i * 3];
    let y = circles.data32F[i * 3 + 1];
    let radius = Math.round(circles.data32F[i * 3 + 2]);
    cv.circle(dst, new cv.Point(x*2, y*2), radius*2, [100, 100, 100, 100]);
    cv.circle(dst2, new cv.Point(x, y), radius, [255, 255, 255, 255]);
  }
  circles.delete();
}

function onOpenCvReady() {
  inputElement.disabled = false;
}