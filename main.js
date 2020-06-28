const maxLines = 1000;
const maxCircles = 1000;

let threshold = 60;
let input, src, dst, dst2;
let width, height;

let imgElement = document.getElementById('image')
imgElement.onload = () => {
  input = cv.imread('image');
  cv.imshow('input', input);

  width = Math.min(input.cols, 800);
  height = Math.min(input.rows, width * input.rows / input.cols);
  cv.resize(input, input, new cv.Size(width, height), 0, 0, cv.INTER_AREA);

  src = input.clone();
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
    let rho = Math.round(lines.data32F[i * 2] / 10) * 10;
    let theta = Math.round(lines.data32F[i * 2 + 1] * 10) / 10;
    let a = Math.cos(theta);
    let b = Math.sin(theta);
    let x0 = a * rho;
    let y0 = b * rho;
    let startPoint = {x: x0 - 1000 * b, y: y0 + 1000 * a};
    let endPoint = {x: x0 + 1000 * b, y: y0 - 1000 * a};
    cv.line(dst, startPoint, endPoint, [100, 100, 100, 100]);
    cv.line(dst2, startPoint, endPoint, [255, 255, 255, 255]);
  }
  lines.delete();
}
function findCircles(threshold) {
  let circles = new cv.Mat();
  cv.HoughCircles(src, circles, cv.HOUGH_GRADIENT, 1, 1, threshold, threshold, 1, 100000);
  for (let i = 0; i < Math.min(maxCircles, circles.cols); ++i) {
    let x = Math.round(circles.data32F[i * 3] / 10) * 10;
    let y = Math.round(circles.data32F[i * 3 + 1] / 10) * 10;
    let radius = Math.round(circles.data32F[i * 3 + 2]);
    let center = new cv.Point(x, y);
    cv.circle(dst, center, radius, [100, 100, 100, 100]);
    cv.circle(dst2, center, radius, [255, 255, 255, 255]);
  }
  circles.delete();
}